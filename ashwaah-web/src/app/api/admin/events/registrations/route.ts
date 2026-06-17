import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { eventRegistrations, events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

// GET event registrations
export async function GET(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const eventIdStr = searchParams.get("eventId");

    if (eventIdStr) {
      const eventId = Number(eventIdStr);
      const data = await db
        .select()
        .from(eventRegistrations)
        .where(eq(eventRegistrations.eventId, eventId))
        .orderBy(desc(eventRegistrations.createdAt));
      return NextResponse.json({ success: true, data });
    } else {
      // Get all registrations with event titles
      const data = await db
        .select({
          id: eventRegistrations.id,
          eventId: eventRegistrations.eventId,
          name: eventRegistrations.name,
          email: eventRegistrations.email,
          phone: eventRegistrations.phone,
          ticketsCount: eventRegistrations.ticketsCount,
          additionalNotes: eventRegistrations.additionalNotes,
          createdAt: eventRegistrations.createdAt,
          eventTitle: events.title,
        })
        .from(eventRegistrations)
        .leftJoin(events, eq(eventRegistrations.eventId, events.id))
        .orderBy(desc(eventRegistrations.createdAt));
      return NextResponse.json({ success: true, data });
    }
  } catch (error: any) {
    console.error("Fetch Event Registrations Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch event registrations" },
      { status: 500 }
    );
  }
}
