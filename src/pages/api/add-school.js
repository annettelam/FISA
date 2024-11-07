// src/pages/api/add-school.js

import { openDatabase, getAllTables, getTableColumns } from "./db-utils";

export async function POST({ request }) {
  let db;
  try {
    // Parse the incoming JSON data
    const { tableName, addedBy, ...fields } = await request.json();

    // Validate the presence of tableName
    if (!tableName) {
      return new Response(
        JSON.stringify({ success: false, error: "Table name is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Ensure that SCHOOL_NUM is provided
    if (!fields.SCHOOL_NUM) {
      return new Response(
        JSON.stringify({ success: false, error: "SCHOOL_NUM is required." }),
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

    // Ensure that the fields provided match the table columns
    const providedColumns = Object.keys(fields);
    const invalidColumns = providedColumns.filter(
      (col) => !columns.includes(col)
    );

    if (invalidColumns.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid columns: ${invalidColumns.join(", ")}`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if SCHOOL_NUM is unique
    const checkStmt = db.prepare(
      `SELECT COUNT(*) as count FROM "${tableName}" WHERE "SCHOOL_NUM" = ?`
    );
    const checkResult = checkStmt.get(fields.SCHOOL_NUM);
    if (checkResult.count > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `SCHOOL_NUM ${fields.SCHOOL_NUM} already exists.`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Dynamically construct column names and placeholders, properly escaped
    const escapedColumns = providedColumns.map((col) => `"${col}"`).join(", ");
    const placeholders = providedColumns.map(() => "?").join(", ");
    const values = providedColumns.map((col) => fields[col]);

    // Log the insert operation for debugging
    console.log(
      `Inserting into "${tableName}": Columns [${escapedColumns}], Values [${values.join(
        ", "
      )}]`
    );

    // Prepare and execute the INSERT statement with escaped identifiers
    const insertStmt = db.prepare(
      `INSERT INTO "${tableName}" (${escapedColumns}) VALUES (${placeholders})`
    );
    insertStmt.run(...values);

    // Capture the provided SCHOOL_NUM
    const schoolNum = fields.SCHOOL_NUM;

    // Log the addition in the change log, including ACTIVE_TABLE_AT_CHANGE
const logStmt = db.prepare(`
  INSERT INTO "school_change_log" 
    ("SCHOOL_NUM", "ACTION", "TIMESTAMP", "USER_ID", "FIELD_CHANGED", "ACTIVE_TABLE_AT_CHANGE")
  VALUES 
    (?, 'ADD', datetime('now'), ?, 'ALL', ?)
`);
logStmt.run(schoolNum, addedBy || "system", tableName);


    // Respond with success and the provided school's number
    return new Response(JSON.stringify({ success: true, schoolNum }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error adding school:", error);
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
