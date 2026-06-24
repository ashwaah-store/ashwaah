import { verifyAdminRequest } from "@/utils/auth";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function isAdmin(request?: Request) {
  return !!(await verifyAdminRequest(request));
}

// GET all events for admin dashboard
export async function GET(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt));
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Fetch Admin Events Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// POST a new event
export async function POST(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      category,
      description,
      imageUrl,
      date,
      time,
      duration,
      ageLimit,
      language,
      genre,
      location,
      cost,
      bookingUrl,
      disclaimer
    } = body;

    if (!title || !category || !date || !time || !location) {
      return NextResponse.json(
        { success: false, error: "Title, Category, Date, Time, and Location are required" },
        { status: 400 }
      );
    }

    const result = await db
      .insert(events)
      .values({
        title,
        category,
        description: description || null,
        imageUrl: imageUrl || null,
        date,
        time,
        duration: duration || null,
        ageLimit: ageLimit || null,
        language: language || null,
        genre: genre || null,
        location,
        cost: cost || "",
        bookingUrl: bookingUrl || null,
        disclaimer: disclaimer || null,
      })
      .returning();

    return NextResponse.json({ success: true, data: result[0] });
  } catch (error: any) {
    console.error("Create Event Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create event" },
      { status: 500 }
    );
  }
}

// PUT (update) an event
export async function PUT(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      title,
      category,
      description,
      imageUrl,
      date,
      time,
      duration,
      ageLimit,
      language,
      genre,
      location,
      cost,
      bookingUrl,
      disclaimer
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description || null;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl || null;
    if (date !== undefined) updates.date = date;
    if (time !== undefined) updates.time = time;
    if (duration !== undefined) updates.duration = duration || null;
    if (ageLimit !== undefined) updates.ageLimit = ageLimit || null;
    if (language !== undefined) updates.language = language || null;
    if (genre !== undefined) updates.genre = genre || null;
    if (location !== undefined) updates.location = location;
    if (cost !== undefined) updates.cost = cost;
    if (bookingUrl !== undefined) updates.bookingUrl = bookingUrl || null;
    if (disclaimer !== undefined) updates.disclaimer = disclaimer || null;

    const result = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, id))
      .returning();

    if (result.length > 0) {
      return NextResponse.json({ success: true, data: result[0] });
    }
    return NextResponse.json(
      { success: false, error: "Event not found" },
      { status: 404 }
    );
  } catch (error: any) {
    console.error("Update Event Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update event" },
      { status: 500 }
    );
  }
}

// DELETE an event
export async function DELETE(request: Request) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get("id") || "0");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Event ID is required" },
        { status: 400 }
      );
    }

    await db.delete(events).where(eq(events.id, id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Event Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete event" },
      { status: 500 }
    );
  }
}
