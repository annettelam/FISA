// src/pages/api/accept.js

import Database from "better-sqlite3";
import { openDatabase } from "./db-utils";

/**
 * Logs changes to the change log.
 * @param {Database} db - The SQLite database connection.
 * @param {string} schoolNum - The school number.
 * @param {string} fieldChanged - The field that was changed.
 * @param {string|null} oldValue - The original value.
 * @param {string|null} newValue - The new value.
 * @param {string} updatedBy - Identifier for who made the update.
 */
function logChange(
  db,
  schoolNum,
  fieldChanged,
  oldValue,
  newValue,
  updatedBy,
  activeTable
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
  const sanitizedActiveTable =
    activeTable === undefined || activeTable === null
      ? "unknown"
      : String(activeTable);

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
    sanitizedActiveTable // Ensure activeTable is a string
  );
}

export async function POST({ request }) {
  let db;
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return new Response(JSON.stringify({ error: "No ID provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    db = openDatabase();

    // Fetch the proposed update, including active_table_at_submission
    const updateStmt = db.prepare(`
      SELECT school_number, proposed_data, active_table_at_submission
      FROM proposed_updates
      WHERE id = ? AND status = 'pending'
    `);
    const update = updateStmt.get(id);

    if (!update) {
      db.close();
      return new Response(
        JSON.stringify({ error: "Update not found or already processed" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { school_number, proposed_data, active_table_at_submission } = update;

    const activeTable = active_table_at_submission;

    if (!activeTable) {
      db.close();
      return new Response(
        JSON.stringify({
          error: "Active table at submission is not specified",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse proposed_data
    let proposedDataParsed;
    try {
      proposedDataParsed = JSON.parse(proposed_data);
    } catch (e) {
      db.close();
      return new Response(
        JSON.stringify({ error: "Failed to parse proposed data" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Map proposed data keys to database field names
    const fieldMap = {
      founded: "FOUNDED",
      school: "SCHOOL",
      authority: "AUTHORITY",
      address: "ADDRESS",
      saddress: "SADDRESS",
      city: "CITY",
      postal: "POSTAL",
      phone: "PHONE",
      fax: "FAX",
      website: "Website",
      email: "Email",
      firstName: "FIRST",
      lastName: "LAST",
      degree: "DEGREE",
      prekAge4: "PrekAge4",
      halfdayK: "Halfday_k",
      fulldayK: "Fullday_k",
      grade1_7: "1_7",
      ungradedElem: "UNE",
      grade8: "8",
      grade9: "9",
      grade10: "10",
      grade11: "11",
      grade12: "12",
      ungradedSec: "UNS",
      funding: "FUNDING",
      specialty: "SPECIALTY",
      assoc: "ASSOC",
      sdnum: "SDNUM",
      sd: "SD",
      electoral: "ElectoralNew",
      fisa: "FISA",
    };

    // Fetch existing data for comparison
    const existingDataQuery = `
      SELECT 
        FOUNDED, SCHOOL, AUTHORITY, ADDRESS, SADDRESS, CITY, POSTAL, PHONE, FAX, Website, Email, FIRST, LAST, DEGREE,
        PrekAge4, Halfday_k, Fullday_k, "1_7", UNE, "8", "9", "10", "11", "12", UNS,
        FUNDING, SPECIALTY, ASSOC, SDNUM, SD, ElectoralNew, FISA
      FROM "${activeTable}"
      WHERE SCHOOL_NUM = ?
    `;
    const existingDataStmt = db.prepare(existingDataQuery);
    const existingData = existingDataStmt.get(school_number);

    if (!existingData) {
      db.close();
      return new Response(
        JSON.stringify({
          error: "Current data not found for this school_number",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const updatedBy = "admin"; // Replace with actual user identifier if available

    // Begin a transaction
    const transaction = db.transaction(() => {
      // Build the SET clause for the update query and log changes
      const setClauses = [];
      const values = [];

      for (const [proposedKey, dbField] of Object.entries(fieldMap)) {
        if (proposedDataParsed.hasOwnProperty(proposedKey)) {
          const newValue = proposedDataParsed[proposedKey];
          const oldValue = existingData[dbField];

          // Compare and log if the values are different
          if (
            (newValue !== null && newValue !== undefined
              ? String(newValue).trim()
              : "") !==
            (oldValue !== null && oldValue !== undefined
              ? String(oldValue).trim()
              : "")
          ) {
            logChange(
              db,
              school_number,
              dbField,
              oldValue,
              newValue,
              updatedBy,
              activeTable // Pass the active table to the logChange function
            );
          }

          // Properly quote the column name
          setClauses.push(`"${dbField}" = ?`);
          values.push(newValue);
        }
      }

      if (setClauses.length === 0) {
        throw new Error("No valid fields to update");
      }

      // Perform the update
      const updateQuery = `
        UPDATE "${activeTable}"
        SET ${setClauses.join(", ")}
        WHERE SCHOOL_NUM = ?
      `;
      const updateStmt2 = db.prepare(updateQuery);
      updateStmt2.run(...values, school_number);

      // Mark the proposed update as accepted
      const markAcceptedStmt = db.prepare(`
        UPDATE proposed_updates
        SET status = 'accepted'
        WHERE id = ?
      `);
      markAcceptedStmt.run(id);
    });

    // Execute the transaction
    try {
      transaction();
    } catch (transactionError) {
      console.error("Transaction Error:", transactionError);
      throw transactionError;
    }

    db.close();

    return new Response(
      JSON.stringify({ message: "Update accepted and applied" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (db && db.open) db.close();
    console.error("Error in accept endpoint:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
