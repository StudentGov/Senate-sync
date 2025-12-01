import fs from "fs/promises";
import path from "path";
import { auth } from "@clerk/nextjs/server";

const votesPath = path.join(process.cwd(), "src", "app", "voting-votes.json");
const votingJsonPath = path.join(process.cwd(), "src", "app", "voting.json");

type VoteRecord = {
  id?: number;
  voteId?: string | number;
  optionId?: string | number;
  userId?: string;
  createdAt?: string;
  [key: string]: unknown;
};

async function readVotesFile(): Promise<VoteRecord[]> {
  try {
    const raw = await fs.readFile(votesPath, "utf-8");
    return JSON.parse(raw) as VoteRecord[];
  } catch {
    return [];
  }
}

async function writeVotesFile(data: VoteRecord[]) {
  await fs.writeFile(votesPath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const voteId = params.id;
    const votingRaw = await fs.readFile(votingJsonPath, "utf-8");
    type VoteEntry = {
      title?: string;
      running?: boolean;
      data?: Array<{ id: number; label: string; value?: number }>;
    };
    type VotingData = Record<string, VoteEntry>;
    const voting = JSON.parse(votingRaw || "{}") as VotingData;
    const base = voting[voteId];
    if (!base)
      return new Response(JSON.stringify({ error: "Vote not found" }), {
        status: 404,
      });

    const votes = await readVotesFile();
    const optionCounts: Record<string, number> = {};
    // start with base counts if present
    (base.data || []).forEach((o) => {
      optionCounts[String(o.id)] = Number(o.value || 0);
    });

    // add recorded votes
    votes.forEach((v) => {
      if (String(v.voteId) === String(voteId)) {
        const key = String(v.optionId);
        optionCounts[key] = (optionCounts[key] || 0) + 1;
      }
    });

    const options = (base.data || []).map((o) => ({
      id: o.id,
      label: o.label,
      count: optionCounts[String(o.id)] || 0,
    }));
    return new Response(JSON.stringify({ id: voteId, options }), {
      status: 200,
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });

    const params = await context.params;
    const voteId = params.id;
    // ensure vote is open/running before accepting votes
    let votingRaw = "{}";
    try {
      votingRaw = await fs.readFile(votingJsonPath, "utf-8");
    } catch {
      votingRaw = "{}";
    }
    type VoteEntry = {
      title?: string;
      running?: boolean;
      data?: Array<{ id: number; label: string; value?: number }>;
    };
    type VotingData = Record<string, VoteEntry>;
    const voting = JSON.parse(votingRaw || "{}") as VotingData;
    const base = voting[voteId];
    if (!base)
      return new Response(JSON.stringify({ error: "Vote not found" }), {
        status: 404,
      });
    if (!base.running)
      return new Response(JSON.stringify({ error: "Vote is closed" }), {
        status: 403,
      });
    const body = (await req.json()) as { optionId?: string | number };
    const optionId = body.optionId;

    // prevent duplicate vote by same user for same voteId
    const existing = await readVotesFile();
    const already = existing.find(
      (v) => String(v.voteId) === String(voteId) && v.userId === userId
    );
    if (already) {
      return new Response(JSON.stringify({ error: "User has already voted" }), {
        status: 409,
      });
    }

    const entry: VoteRecord = {
      id: Date.now(),
      voteId,
      optionId,
      userId,
      createdAt: new Date().toISOString(),
    };
    existing.push(entry);
    await writeVotesFile(existing);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
