// src/pages/api/delete-school.js

import { openDatabase, getAllTables, getTableColumns } from "./db-utils";

export async function POST({ request }) {
  let db;
  try {
    // Parse the incoming JSON data
    const { tableName, schoolNum, deletedBy } = await request.json();

    // Validate required fields
    if (!tableName || !schoolNum) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Table name and school number are required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Open the database connection
    db = openDatabase();

    // Validate if the table exists
    const tables = getAllTables(db);
    if (!tables.includes(tableName)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid table name provided.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get column names for the table
    const columns = getTableColumns(db, tableName);

    // Check if 'SCHOOL_NUM' is a valid column
    if (!columns.includes("SCHOOL_NUM")) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "'SCHOOL_NUM' column does not exist in the table.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Begin a transaction to ensure atomicity
    const deleteTransaction = db.transaction(
      (tableName, schoolNum, deletedBy) => {
        // Delete the school record
        const deleteStmt = db.prepare(
          `DELETE FROM "${tableName}" WHERE "SCHOOL_NUM" = ?`
        );
        const deleteInfo = deleteStmt.run(schoolNum);

        if (deleteInfo.changes === 0) {
          throw new Error("No school found with the provided SCHOOL_NUM.");
        }

        // Log the deletion in the change log, including ACTIVE_TABLE_AT_CHANGE
        // Log the deletion in the change log, including ACTIVE_TABLE_AT_CHANGE
        // Log the deletion in the change log, including ACTIVE_TABLE_AT_CHANGE
        const logStmt = db.prepare(`
  INSERT INTO "school_change_log" 
    ("SCHOOL_NUM", "ACTION", "TIMESTAMP", "USER_ID", "FIELD_CHANGED", "ACTIVE_TABLE_AT_CHANGE")
  VALUES 
    (?, 'DELETE', datetime('now'), ?, 'ALL', ?)
`);
        logStmt.run(schoolNum, deletedBy || "system", tableName);
      }
    );

    // Execute the transaction
    deleteTransaction(tableName, schoolNum, deletedBy);

    // Respond with success
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting school:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    if (db && db.open) {
      db.close();
    }
  }
}
