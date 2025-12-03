import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@clerk/nextjs/server";

const LOG_FILE = path.join(process.cwd(), "src", "app", "senate", "logs.json");

function readLogs() {
  try {
    if (!fs.existsSync(LOG_FILE)) {
      fs.writeFileSync(LOG_FILE, "[]", "utf8");
    }
    const raw = fs.readFileSync(LOG_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    console.error("Failed to read logs", e);
    return [];
  }
}

type LogEntry = {
  id?: string | number;
  userId?: string;
  senatorName?: string;
  date?: string;
  hours?: number;
  activity?: string;
  notes?: string;
  createdAt?: string;
  [key: string]: unknown;
};

function writeLogs(logs: LogEntry[]) {
  try {
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write logs", e);
  }
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    const logs = readLogs();
    const userLogs = logs.filter(
      (l: LogEntry) => String(l.userId) === String(userId)
    );
    return NextResponse.json({ success: true, logs: userLogs });
  } catch (e) {
    console.error("Auth error", e);
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );

    const body = await req.json();
    const { senatorName, date, hours, activity, notes } = body;

    if (!date || !hours) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const logs = readLogs();
    const newEntry = {
      id: Date.now().toString(),
      userId,
      senatorName: senatorName || "Unknown",
      date,
      hours: Number(hours),
      activity: activity || "",
      notes: notes || "",
      createdAt: new Date().toISOString(),
    };

    logs.unshift(newEntry);
    writeLogs(logs);

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Invalid request" },
      { status: 500 }
    );
  }
}
