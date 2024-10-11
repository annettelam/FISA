// src/pages/api/get-active-table.ts

import Database from "better-sqlite3";
import path from "path";

export async function GET() {
  console.log("Received GET request to /api/get-active-table");

  try {
    const dbPath = path.resolve("./data", "FISA.db");
    console.log("Connecting to database at:", dbPath);
    const db = new Database(dbPath, { verbose: console.log });

    try {
      // Fetch the active table from the 'config' table
      const result = db
        .prepare("SELECT value FROM config WHERE key = 'active_table'")
        .get();

      // If no active table is set, return an appropriate message
      if (result && result.value) {
        return new Response(JSON.stringify({ activeTable: result.value }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } else {
        return new Response(
          JSON.stringify({ message: "No active table set" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } finally {
      db.close();
      console.log("Database connection closed.");
    }
  } catch (error) {
    console.error("Error fetching active table:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
