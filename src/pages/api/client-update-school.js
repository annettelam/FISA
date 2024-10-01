import Database from "better-sqlite3";

export async function POST({ request }) {
  // Parse the request body
  const bodyText = await request.text();
  const formData = JSON.parse(bodyText); // Convert the request body to JSON

  const schoolNum = formData.schoolNum;

  // Remove 'schoolNum' from formData if you don't want it included in 'proposed_data'
  delete formData.schoolNum;

  // Convert the rest of the formData to a JSON string
  const proposedData = JSON.stringify(formData);

  // Open the SQLite database
  const db = new Database("./data/FISA.db");

  // Insert into 'proposed_updates' table
  const insertStmt = db.prepare(`
    INSERT INTO proposed_updates (school_number, proposed_data, status, submitted_at)
    VALUES (?, ?, 'pending', datetime('now'))
  `);
  insertStmt.run(schoolNum, proposedData);

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
