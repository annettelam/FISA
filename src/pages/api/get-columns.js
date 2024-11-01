// src/pages/api/get-columns.js

import { openDatabase, getAllTables } from "./db-utils";

export async function GET({ url }) {
  let db;
  try {
    const tableName = url.searchParams.get("table");

    if (!tableName) {
      return new Response(
        JSON.stringify({ error: "Missing 'table' query parameter." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Open the SQLite database using db-utils
    db = openDatabase();

    // Fetch all table names to validate the provided tableName
    const tables = getAllTables(db);

    if (!tables.includes(tableName)) {
      return new Response(
        JSON.stringify({ error: "Invalid table name provided." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Fetch column names for the selected table
    const columnsQuery = `PRAGMA table_info("${tableName}")`;
    const columns = db.prepare(columnsQuery).all();
    const columnNames = columns.map((col) => col.name);

    return new Response(JSON.stringify({ columns: columnNames }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching columns:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch columns." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    if (db && db.open) {
      db.close();
    }
  }
}
