// src/pages/api/update-school.js

import { openDatabase, getAllTables } from "./db-utils";

// Helper function to log changes to the change log
function logChange(
  db,
  schoolNum,
  fieldChanged,
  oldValue,
  newValue,
  updatedBy,
  tableName
) {
  // Ensure values are strings or null before binding
  const sanitizedOldValue =
    oldValue === undefined || oldValue === null ? null : String(oldValue);
  const sanitizedNewValue =
    newValue === undefined || newValue === null ? null : String(newValue);
  const sanitizedUpdatedBy =
    updatedBy === undefined || updatedBy === null
      ? "unknown"
      : String(updatedBy);
  const sanitizedTableName =
    tableName === undefined || tableName === null
      ? "unknown"
      : String(tableName);

  const insertLog = db.prepare(`
    INSERT INTO school_change_log (school_num, field_changed, old_value, new_value, updated_by, active_table_at_change) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertLog.run(
    String(schoolNum), // Ensure schoolNum is a string
    String(fieldChanged), // Ensure fieldChanged is a string
    sanitizedOldValue, // Convert oldValue to a string or null
    sanitizedNewValue, // Convert newValue to a string or null
    sanitizedUpdatedBy, // Ensure updatedBy is a string
    sanitizedTableName // Ensure tableName is a string
  );
}

export async function POST({ request }) {
  let db;
  try {
    // Parse the request body
    const bodyText = await request.text();
    const formData = JSON.parse(bodyText); // Convert the request body to JSON

    const { tableName, schoolNum, updatedBy, ...fieldsToUpdate } = formData;

    if (!tableName) {
      return new Response(
        JSON.stringify({ error: "Missing 'tableName' in request." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!schoolNum) {
      return new Response(
        JSON.stringify({ error: "Missing 'schoolNum' in request." }),
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
    const tables = getAllTables(db); // Now correctly importing getAllTables

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

    // Fetch the existing data for comparison from the selected table
    const existingDataQuery = `SELECT * FROM "${tableName}" WHERE SCHOOL_NUM = ?`;
    const existingData = db.prepare(existingDataQuery).get(schoolNum);

    if (!existingData) {
      return new Response(JSON.stringify({ error: "School not found." }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Dynamically build the UPDATE query based on fields to update
    const setClauses = [];
    const values = [];

    for (const [field, value] of Object.entries(fieldsToUpdate)) {
      // Properly quote the field name
      setClauses.push(`"${field}" = ?`);
      values.push(value);
    }

    if (setClauses.length === 0) {
      return new Response(
        JSON.stringify({ error: "No fields provided to update." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const updateQuery = `
      UPDATE "${tableName}"
      SET ${setClauses.join(", ")}
      WHERE SCHOOL_NUM = ?
    `;

    values.push(schoolNum); // Add schoolNum for the WHERE clause

    // Compare existing data with new data and log changes
    for (const [field, newValue] of Object.entries(fieldsToUpdate)) {
      const oldValue = existingData[field];
      if (oldValue !== newValue) {
        logChange(
          db,
          schoolNum,
          field,
          oldValue,
          newValue,
          updatedBy || "admin", // Replace with actual user if available
          tableName
        );
      }
    }

    // Execute the update query
    const updateStmt = db.prepare(updateQuery);
    const info = updateStmt.run(...values);

    if (info.changes === 0) {
      return new Response(JSON.stringify({ error: "No records updated." }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Data updated successfully." }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error during update:", error);
    return new Response(JSON.stringify({ error: "Failed to update data." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    if (db && db.open) {
      db.close();
    }
  }
}
