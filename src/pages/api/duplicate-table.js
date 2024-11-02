// src/pages/api/duplicate-table.ts

import Database from "better-sqlite3";
import path from "path";

export async function POST({ request }) {
  console.log("Received POST request to /api/duplicate-table");

  try {
    const body = await request.json();
    const { sourceTable, newTable } = body;

    console.log("Request body:", body);

    // Validate input presence
    if (!sourceTable || !newTable) {
      console.log("Missing sourceTable or newTable");
      return new Response(
        JSON.stringify({
          message: "sourceTable and newTable names are required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate table names to prevent SQL injection
    // Updated regex to include hyphens
    const tableNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!tableNameRegex.test(sourceTable) || !tableNameRegex.test(newTable)) {
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
      // Check if source table exists
      const tableExists = db
        .prepare(
          `
        SELECT name FROM sqlite_master WHERE type='table' AND name=?
      `
        )
        .get(sourceTable);

      if (!tableExists) {
        console.log(`Source table "${sourceTable}" does not exist.`);
        return new Response(
          JSON.stringify({ message: "Source table does not exist." }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Check if new table already exists
      const newTableExists = db
        .prepare(
          `
        SELECT name FROM sqlite_master WHERE type='table' AND name=?
      `
        )
        .get(newTable);

      if (newTableExists) {
        console.log(`New table name "${newTable}" already exists.`);
        return new Response(
          JSON.stringify({ message: "New table name already exists." }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Duplicate the table structure and data
      const duplicateTableSQL = `CREATE TABLE "${newTable}" AS SELECT * FROM "${sourceTable}";`;
      db.exec(duplicateTableSQL);
      console.log(`Table "${sourceTable}" duplicated to "${newTable}".`);

      return new Response(
        JSON.stringify({ message: `Table duplicated to "${newTable}".` }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } finally {
      db.close();
      console.log("Database connection closed.");
    }
  } catch (error) {
    console.error("Error duplicating table:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Optional: Implement GET for testing purposes
export async function GET() {
  return new Response(
    JSON.stringify({ message: "Duplicate table API is working." }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
