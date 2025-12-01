import fs from "fs/promises";
import path from "path";
import { auth } from "@clerk/nextjs/server";

const votingJsonPath = path.join(process.cwd(), "src", "app", "voting.json");
const votesFilePath = path.join(
  process.cwd(),
  "src",
  "app",
  "voting-votes.json"
);

async function readVotingJson() {
  try {
    const raw = await fs.readFile(votingJsonPath, "utf-8");
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

type VotingData = Record<
  string,
  {
    title?: string;
    running?: boolean;
    data: Array<{ id: number; value: number; label: string }>;
  }
>;

async function writeVotingJson(data: VotingData) {
  await fs.writeFile(votingJsonPath, JSON.stringify(data, null, 2), "utf-8");
}

async function readRecordedVotes() {
  try {
    const raw = await fs.readFile(votesFilePath, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

async function requireAdmin() {
  const { userId, sessionClaims } = await auth();
  if (!userId) throw new Error("Unauthorized");
  interface SessionClaims {
    role?: string;
  }
  const role = (sessionClaims as SessionClaims)?.role;
  if (role !== "admin") throw new Error("Forbidden");
  return { userId };
}

export async function GET() {
  try {
    await requireAdmin();
    const voting = await readVotingJson();
    const recorded = await readRecordedVotes();

    // for admin view, attach current counts to each option (base value + recorded votes)
    type VoteEntry = {
      title?: string;
      running?: boolean;
      data: Array<{ id: number; value: number; label: string }>;
    };
    type RecordedVote = {
      voteId?: string | number;
      optionId?: string | number;
    };
    type OptionData = { id: number; value: number; label: string };

    const result: Record<
      string,
      VoteEntry & { data: Array<OptionData & { count: number }> }
    > = {};
    for (const [id, vote] of Object.entries(voting)) {
      const voteEntry = vote as VoteEntry;
      const baseData = voteEntry.data || [];
      const counts: Record<string, number> = {};
      baseData.forEach((o: OptionData) => {
        counts[String(o.id)] = Number(o.value || 0);
      });
      recorded.forEach((r: RecordedVote) => {
        if (String(r.voteId) === String(id)) {
          const k = String(r.optionId);
          counts[k] = (counts[k] || 0) + 1;
        }
      });
      // merge count into data for admin convenience
      const merged = baseData.map((o: OptionData) => ({
        ...o,
        count: counts[String(o.id)] || 0,
      }));
      result[id] = { ...voteEntry, data: merged };
    }

    return new Response(JSON.stringify({ success: true, voting: result }), {
      status: 200,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message === "Forbidden"
        ? 403
        : 500;
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status }
    );
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { options, title, running } = body; // options: string[] labels
    if (!Array.isArray(options) || options.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "options required" }),
        { status: 400 }
      );
    }
    const cleanTitle = String(title || "").trim();
    if (!cleanTitle) {
      return new Response(
        JSON.stringify({ success: false, message: "title required" }),
        { status: 400 }
      );
    }
    const voting = await readVotingJson();
    // create slug id from title and ensure uniqueness
    const slugify = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    let baseId = slugify(cleanTitle);
    if (!baseId) baseId = `vote-${Date.now()}`;
    let id = baseId;
    let attempt = 1;
    while (voting[String(id)]) {
      id = `${baseId}-${attempt}`;
      attempt += 1;
    }
    const data = options.map((label: string, idx: number) => ({
      id: idx,
      value: 0,
      label,
    }));
    voting[String(id)] = { title: cleanTitle, running: running ?? true, data };
    await writeVotingJson(voting);
    return new Response(JSON.stringify({ success: true, id }), { status: 201 });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message === "Forbidden"
        ? 403
        : 500;
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status }
    );
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, data, title, running } = body;
    if (!id || !Array.isArray(data)) {
      return new Response(
        JSON.stringify({ success: false, message: "id and data required" }),
        { status: 400 }
      );
    }
    const cleanTitle = title !== undefined ? String(title).trim() : undefined;
    if (cleanTitle !== undefined && cleanTitle === "") {
      return new Response(
        JSON.stringify({ success: false, message: "title cannot be empty" }),
        { status: 400 }
      );
    }
    const voting = await readVotingJson();
    const existing = voting[String(id)] || {};
    voting[String(id)] = {
      ...(existing || {}),
      title: cleanTitle ?? existing.title,
      running: running ?? existing.running ?? true,
      data,
    };
    await writeVotingJson(voting);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message === "Forbidden"
        ? 403
        : 500;
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id } = body;
    if (!id)
      return new Response(
        JSON.stringify({ success: false, message: "id required" }),
        { status: 400 }
      );
    const voting = await readVotingJson();
    if (voting[String(id)]) delete voting[String(id)];
    await writeVotingJson(voting);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    const status =
      error.message === "Unauthorized"
        ? 401
        : error.message === "Forbidden"
        ? 403
        : 500;
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status }
    );
  }
}
