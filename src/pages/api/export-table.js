// src/pages/api/export-table.ts

import Database from "better-sqlite3";
import path from "path";

// Export the handler as POST (uppercase to match Astro's expectations)
export async function POST({ request }) {
  console.log("Received POST request to /api/export-table");

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

    // Prevent exporting critical or sensitive tables
    const protectedTables = ["config", "sqlite_sequence"]; // Add more if necessary
    if (protectedTables.includes(tableName)) {
      console.warn(`Attempt to export protected table: ${tableName}`);
      return new Response(
        JSON.stringify({ message: "Cannot export this table." }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate table name (updated to allow hyphens)
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

      // Fetch all data from the table, properly quoting the table name
      const dataQuery = `SELECT * FROM "${tableName}"`;
      const rows = db.prepare(dataQuery).all();

      if (rows.length === 0) {
        console.warn(`No data found in table: ${tableName}`);
        return new Response(JSON.stringify({ message: "Table is empty." }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Get column names
      const columns = Object.keys(rows[0]);

      // Convert data to CSV
      const csvContent = [
        columns.join(","), // Header row
        ...rows.map((row) =>
          columns
            .map((col) => `"${String(row[col]).replace(/"/g, '""')}"`)
            .join(",")
        ),
      ].join("\n");

      // Set response headers to prompt file download
      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${tableName}.csv"`,
        },
      });
    } finally {
      db.close();
      console.log("Database connection closed.");
    }
  } catch (error) {
    console.error("Error exporting table:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
