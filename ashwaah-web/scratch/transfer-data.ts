import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { createClient } from "@libsql/client";
import Database from "better-sqlite3";
import * as schema from "../src/db/schema";

const url = "libsql://ashwaah-ashwaah.aws-ap-south-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg4MjUyODIsImlkIjoiMDE5ZTJhM2YtN2YwMS03ZDMyLThlYWQtYjA3ZTcxNGI3YTAyIiwicmlkIjoiYTllYjhhMWQtZTIyYy00MTAzLTgyYjctMzg2NGUyNzdkZTFkIn0.C1naQm67dOYArGf-brlzoS_poX_A48T_8tsfTgGWQVg6Z8RvyzXrbJXevyUjYI34O4Wp5qPGNsqwhyUWNoV3Dg";

async function transferData() {
  const localSqlite = new Database("sqlite.db");
  const localDb = drizzleSqlite(localSqlite, { schema });

  const remoteClient = createClient({ url, authToken });
  const remoteDb = drizzleLibsql(remoteClient, { schema });

  const tables = [
    { name: "users", table: schema.users },
    { name: "products", table: schema.products },
    { name: "productVariations", table: schema.productVariations },
    { name: "productCustomisationRules", table: schema.productCustomisationRules },
    { name: "navigationMenu", table: schema.navigationMenu },
    { name: "pageSections", table: schema.pageSections },
    { name: "orders", table: schema.orders },
    { name: "orderItems", table: schema.orderItems },
    { name: "cartItems", table: schema.cartItems },
    { name: "otpVerifications", table: schema.otpVerifications },
  ];

  console.log("Starting data transfer...");

  for (const { name, table } of tables) {
    console.log(`Transferring ${name}...`);
    const data = await localDb.select().from(table);
    if (data.length > 0) {
      // Chunking for large datasets if needed, but for 11 products it's fine
      await remoteDb.insert(table).values(data);
      console.log(`Transferred ${data.length} rows to ${name}.`);
    } else {
      console.log(`No data in ${name}.`);
    }
  }

  console.log("Data transfer complete!");
  localSqlite.close();
  remoteClient.close();
}

transferData().catch(console.error);
