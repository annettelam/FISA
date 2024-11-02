// src/pages/api/drop-table.ts

import Database from "better-sqlite3";
import path from "path";

export async function POST({ request }) {
  // Changed from 'post' to 'POST'
  console.log("Received POST request to /api/drop-table");

  try {
    const { tableName } = await request.json();

    if (!tableName) {
      console.warn("No table name provided in the request body.");
      return new Response(
        JSON.stringify({ message: "Table name is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Prevent dropping critical tables
    const protectedTables = ["config", "sqlite_sequence"]; // Add more if necessary
    if (protectedTables.includes(tableName)) {
      console.warn(`Attempt to drop protected table: ${tableName}`);
      return new Response(
        JSON.stringify({ message: "Cannot drop this table." }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate table name (basic validation to prevent SQL injection)
    const tableNameRegex = /^[A-Za-z0-9_-]+$/;
    if (!tableNameRegex.test(tableName)) {
      console.warn(`Invalid table name format: ${tableName}`);
      return new Response(JSON.stringify({ message: "Invalid table name." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const dbPath = path.resolve("./data", "FISA.db");
    console.log("Connecting to database at:", dbPath);
    const db = new Database(dbPath, { verbose: console.log });

    try {
      // Check if the table exists
      const tableCheckQuery = `
        SELECT name 
        FROM sqlite_master 
        WHERE type='table' AND name = ?
      `;
      const tableExists = db.prepare(tableCheckQuery).get(tableName);

      if (!tableExists) {
        console.warn(`Table does not exist: ${tableName}`);
        return new Response(
          JSON.stringify({ message: "Table does not exist." }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // If the table to be dropped is the active table, reset the active table
      const activeTableQuery = `
        SELECT value 
        FROM config 
        WHERE key = 'active_table'
      `;
      const activeTableResult = db.prepare(activeTableQuery).get();
      const activeTable = activeTableResult ? activeTableResult.value : null;

      if (activeTable === tableName) {
        console.log(
          `Dropping the active table: ${tableName}. Resetting active table.`
        );
        const resetActiveTableQuery = `
          UPDATE config 
          SET value = NULL 
          WHERE key = 'active_table'
        `;
        db.prepare(resetActiveTableQuery).run();
      }

      // Drop the table
      const dropTableQuery = `DROP TABLE "${tableName}"`;
      db.prepare(dropTableQuery).run();
      console.log(`Table dropped successfully: ${tableName}`);

      return new Response(
        JSON.stringify({
          message: `Table '${tableName}' dropped successfully.`,
        }),
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
    console.error("Error dropping table:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
