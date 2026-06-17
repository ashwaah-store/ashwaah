import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET all events for public display
export async function GET() {
  try {
    const data = await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt));
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Fetch Public Events Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
