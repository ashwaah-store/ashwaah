import { NextResponse } from "next/server";
import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";

// Parses year, month, day from standard date string formats without timezone shifts
function parseDateFields(dateStr: string): { year: number; month: number; day: number } | null {
  const s = dateStr.trim().toLowerCase();
  
  // Try to parse month by text name first
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  let foundMonthIdx = -1;
  for (let i = 0; i < months.length; i++) {
    if (s.includes(months[i])) {
      foundMonthIdx = i + 1; // 1-indexed
      break;
    }
  }
  
  let year = 0;
  let month = 0;
  let day = 0;
  
  if (foundMonthIdx !== -1) {
    month = foundMonthIdx;
    const nums = s.match(/\d+/g);
    if (nums && nums.length >= 2) {
      const yrStr = nums.find(n => n.length === 4);
      if (yrStr) {
        year = parseInt(yrStr, 10);
        const dayStr = nums.find(n => n !== yrStr);
        if (dayStr) {
          day = parseInt(dayStr, 10);
        }
      }
    }
  } else {
    // Treat as purely numerical dates (e.g. DD-MM-YYYY or YYYY-MM-DD)
    const numbers = s.match(/\d+/g);
    if (!numbers || numbers.length < 3) {
      return null;
    }
    
    const fourDigitIdx = numbers.findIndex(n => n.length === 4);
    if (fourDigitIdx !== -1) {
      year = parseInt(numbers[fourDigitIdx], 10);
      numbers.splice(fourDigitIdx, 1);
      
      const firstNum = parseInt(numbers[0], 10);
      const secondNum = parseInt(numbers[1], 10);
      
      if (firstNum > 12) {
        day = firstNum;
        month = secondNum;
      } else if (secondNum > 12) {
        day = secondNum;
        month = firstNum;
      } else {
        if (fourDigitIdx === 0) {
          // YYYY-MM-DD
          month = firstNum;
          day = secondNum;
        } else {
          // DD-MM-YYYY
          day = firstNum;
          month = secondNum;
        }
      }
    }
  }
  
  if (year > 0 && month > 0 && day > 0) {
    return { year, month, day };
  }
  
  return null;
}

// Determines if an event has already ended (based on IST +05:30 timezone)
function hasEventEnded(dateStr: string, timeStr: string, durationStr: string | null): boolean {
  try {
    // 1. Clean and parse date string
    let cleanDate = dateStr.trim();
    if (cleanDate.includes(" - ")) {
      cleanDate = cleanDate.split(" - ").pop()!.trim();
    } else if (/\s+to\s+/i.test(cleanDate)) {
      cleanDate = cleanDate.split(/\s+to\s+/i).pop()!.trim();
    }
    
    // Clean weekday prefixes
    cleanDate = cleanDate.replace(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)(day|sday|nesday|rsday|day)?[\s,.]+/i, "").trim();
    
    const dateFields = parseDateFields(cleanDate);
    if (!dateFields) {
      return false; // Safely keep event if date cannot be parsed
    }
    
    const { year, month, day } = dateFields;
    
    // 2. Parse time string (e.g. "7:00 PM")
    let cleanTime = timeStr.trim().toLowerCase();
    const isPM = cleanTime.includes("pm");
    const isAM = cleanTime.includes("am");
    cleanTime = cleanTime.replace(/(am|pm)/g, "").trim();
    
    let hours = 0;
    let minutes = 0;
    const timeParts = cleanTime.split(":");
    if (timeParts.length >= 1) {
      hours = parseInt(timeParts[0], 10) || 0;
      if (timeParts.length >= 2) {
        minutes = parseInt(timeParts[1], 10) || 0;
      }
    }
    
    if (isPM && hours < 12) {
      hours += 12;
    } else if (isAM && hours === 12) {
      hours = 0;
    }
    
    // 3. Parse duration string (e.g. "1 Hour")
    let durationMinutes = 0;
    if (durationStr) {
      const lowercaseDuration = durationStr.toLowerCase().trim();
      const hrRegex = /(\d+(?:\.\d+)?)\s*(?:hour|hr|hrs)/i;
      const minRegex = /(\d+)\s*(?:min|mins|minute|minutes)/i;
      
      const hrMatch = lowercaseDuration.match(hrRegex);
      const minMatch = lowercaseDuration.match(minRegex);
      
      if (hrMatch) {
        durationMinutes += parseFloat(hrMatch[1]) * 60;
      }
      if (minMatch) {
        durationMinutes += parseInt(minMatch[1], 10);
      }
      
      if (!hrMatch && !minMatch) {
        const numberMatch = lowercaseDuration.match(/^(\d+(?:\.\d+)?)$/);
        if (numberMatch) {
          const num = parseFloat(numberMatch[1]);
          if (num <= 12) {
            durationMinutes += num * 60;
          } else {
            durationMinutes += num;
          }
        }
      }
    }
    
    if (durationMinutes === 0) {
      durationMinutes = 60; // Default to 1 hour
    }
    
    // 4. Construct IST (+05:30) start date ISO string
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const hourStr = String(hours).padStart(2, '0');
    const minuteStr = String(minutes).padStart(2, '0');
    
    const isoStr = `${year}-${monthStr}-${dayStr}T${hourStr}:${minuteStr}:00+05:30`;
    const startDateTime = new Date(isoStr);
    
    if (isNaN(startDateTime.getTime())) {
      return false; // Keep event if ISO construct parsing fails
    }
    
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);
    const now = new Date();
    
    return now.getTime() > endDateTime.getTime();
  } catch (e) {
    console.error("Error checking if event ended:", e);
    return false;
  }
}

// GET all events for public display
export async function GET() {
  try {
    const data = await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt));
      
    // Filter out ended events
    const activeEvents = data.filter((event) => !hasEventEnded(event.date, event.time, event.duration));
    
    return NextResponse.json({ success: true, data: activeEvents });
  } catch (error: any) {
    console.error("Fetch Public Events Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
