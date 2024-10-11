import { openDatabase, getActiveTable } from "./db-utils";
import { DateTime } from "luxon";

export async function POST({ request }) {
  let db;
  try {
    // Parse the request body
    const body = await request.json();
    const schoolNum = body.schoolNum;

    if (!schoolNum) {
      return new Response(
        JSON.stringify({ error: "No school number provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Remove 'schoolNum' from the body if it shouldn't be part of the proposed data
    delete body.schoolNum;

    // Convert the remaining data into JSON string (proposed_data)
    const proposedData = JSON.stringify(body);

    // Get the current time in Vancouver timezone
    const vancouverTime = DateTime.now()
      .setZone("America/Vancouver")
      .toISO({ includeOffset: false });

    // Open the SQLite database
    db = openDatabase();

    // Fetch the active table name
    let activeTable;
    try {
      activeTable = getActiveTable(db);
    } catch (error) {
      console.error("Error fetching active table:", error);
      db.close();
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Insert into 'proposed_updates' table, including active table information
    const insertStmt = db.prepare(`
      INSERT INTO proposed_updates (school_number, proposed_data, status, submitted_at, active_table_at_submission)
      VALUES (?, ?, 'pending', ?, ?)
    `);
    insertStmt.run(schoolNum, proposedData, vancouverTime, activeTable);

    // Close the database
    db.close();

    return new Response(
      JSON.stringify({
        message: "Your changes have been submitted for review.",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (db && db.open) {
      db.close();
    }
    console.error("Error submitting proposed update:", error);
    return new Response(
      JSON.stringify({ error: "Failed to submit changes for review." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
