import { NextResponse } from "next/server";
import { db } from "@/db";
import { eventRegistrations, events } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST registration for an event
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, name, email, phone, ticketsCount, additionalNotes } = body;

    if (!eventId || !name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: eventId, name, email, phone" },
        { status: 400 }
      );
    }

    // Verify event exists
    const eventList = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (eventList.length === 0) {
      return NextResponse.json(
        { success: false, error: "Event not found" },
        { status: 404 }
      );
    }

    // Insert registration record
    const result = await db.insert(eventRegistrations).values({
      eventId: Number(eventId),
      name,
      email,
      phone,
      ticketsCount: Number(ticketsCount) || 1,
      additionalNotes: additionalNotes || "",
    }).returning({ id: eventRegistrations.id });

    return NextResponse.json({ 
      success: true, 
      data: {
        registrationId: result[0]?.id,
        eventTitle: eventList[0].title
      }
    });
  } catch (error: any) {
    console.error("Event Registration Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to register for the event. Please try again." },
      { status: 500 }
    );
  }
}
