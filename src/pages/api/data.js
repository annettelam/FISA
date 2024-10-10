import Database from "better-sqlite3";

export async function GET() {
  const db = new Database("./data/FISA.db");
  const rows = db.prepare('SELECT * FROM "all_schools_2024-2025"').all();
  return new Response(JSON.stringify(rows), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
