import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import * as schema from "../src/db/schema";
import path from "path";

const url = "libsql://ashwaah-ashwaah.aws-ap-south-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg4MjUyODIsImlkIjoiMDE5ZTJhM2YtN2YwMS03ZDMyLThlYWQtYjA3ZTcxNGI3YTAyIiwicmlkIjoiYTllYjhhMWQtZTIyYy00MTAzLTgyYjctMzg2NGUyNzdkZTFkIn0.C1naQm67dOYArGf-brlzoS_poX_A48T_8tsfTgGWQVg6Z8RvyzXrbJXevyUjYI34O4Wp5qPGNsqwhyUWNoV3Dg";

async function runMigrate() {
  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  console.log("Running migrations...");
  try {
    await migrate(db, { migrationsFolder: path.resolve(__dirname, "../drizzle") });
    console.log("Migrations successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    client.close();
  }
}

runMigrate();
