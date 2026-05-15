import { createClient } from "@libsql/client";

const url = "libsql://ashwaah-ashwaah.aws-ap-south-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzg4MjUyODIsImlkIjoiMDE5ZTJhM2YtN2YwMS03ZDMyLThlYWQtYjA3ZTcxNGI3YTAyIiwicmlkIjoiYTllYjhhMWQtZTIyYy00MTAzLTgyYjctMzg2NGUyNzdkZTFkIn0.C1naQm67dOYArGf-brlzoS_poX_A48T_8tsfTgGWQVg6Z8RvyzXrbJXevyUjYI34O4Wp5qPGNsqwhyUWNoV3Dg";

async function test() {
  const client = createClient({ url, authToken });
  try {
    const rs = await client.execute("SELECT 1");
    console.log("Success:", rs);
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
