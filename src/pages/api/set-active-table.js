// src/pages/api/admin/set-active-table.ts

import Database from "better-sqlite3";
import path from "path";

export async function POST({ request }) {
  console.log("Received POST request to /api/admin/set-active-table");

  try {
    const body = await request.json();
    const { tableName } = body;

    console.log("Request body:", body);

    // Validate input presence
    if (!tableName) {
      console.log("Missing tableName");
      return new Response(
        JSON.stringify({ message: "Table name is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate table name format to prevent SQL injection
    const tableNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!tableNameRegex.test(tableName)) {
      console.log("Invalid table name format.");
      return new Response(
        JSON.stringify({
          message:
            "Invalid table name format. Use only letters, numbers, underscores, and hyphens.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Define the database path
    const dbPath = path.resolve("./data", "FISA.db");
    console.log("Connecting to database at:", dbPath);
    const db = new Database(dbPath, { verbose: console.log });

    try {
      // Check if the table exists
      const tableExists = db
        .prepare(
          `
        SELECT name FROM sqlite_master WHERE type='table' AND name=?
      `
        )
        .get(tableName);

      if (!tableExists) {
        console.log(`Table "${tableName}" does not exist.`);
        return new Response(
          JSON.stringify({ message: "Specified table does not exist." }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Update or insert the active table in the config
      const upsert = db.prepare(`
        INSERT INTO config (key, value) VALUES ('active_table', ?)
        ON CONFLICT(key) DO UPDATE SET value=excluded.value
      `);
      upsert.run(tableName);

      console.log(`Active table set to "${tableName}".`);

      return new Response(
        JSON.stringify({ message: `Active table set to "${tableName}".` }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } finally {
      db.close();
      console.log("Database connection closed.");
    }
  } catch (error) {
    console.error("Error setting active table:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
