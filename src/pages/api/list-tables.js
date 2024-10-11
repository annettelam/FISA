// src/pages/api/list-tables.ts

import Database from "better-sqlite3";
import path from "path";

export async function GET() {
  console.log("Received GET request to /api/list-tables");

  try {
    const dbPath = path.resolve("./data", "FISA.db");
    console.log("Connecting to database at:", dbPath);
    const db = new Database(dbPath, { verbose: console.log });

    try {
      const tables = db
        .prepare(
          `
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `
        )
        .all()
        .map((row) => row.name);

      return new Response(JSON.stringify({ tables }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } finally {
      db.close();
      console.log("Database connection closed.");
    }
  } catch (error) {
    console.error("Error listing tables:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
