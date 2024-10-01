import Database from "better-sqlite3";
import { DateTime } from "luxon";

export async function POST({ request }) {
  // Parse the request body
  const bodyText = await request.text();
  const formData = JSON.parse(bodyText); // Convert the request body to JSON

  const schoolNum = formData.schoolNum;

  // Remove 'schoolNum' from formData if you don't want it included in 'proposed_data'
  delete formData.schoolNum;

  // Convert the rest of the formData to a JSON string
  const proposedData = JSON.stringify(formData);

  // Get the current time in Vancouver timezone
  const vancouverTime = DateTime.now()
    .setZone("America/Vancouver")
    .toISO({ includeOffset: false });

  // Open the SQLite database
  const db = new Database("./data/FISA.db");

  // Insert into 'proposed_updates' table with Vancouver time
  const insertStmt = db.prepare(`
    INSERT INTO proposed_updates (school_number, proposed_data, status, submitted_at)
    VALUES (?, ?, 'pending', ?)
  `);
  insertStmt.run(schoolNum, proposedData, vancouverTime);

  // Close the database connection
  db.close();

  return new Response(
    JSON.stringify({ message: "Your changes have been submitted for review." }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
