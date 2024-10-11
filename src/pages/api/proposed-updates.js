import { openDatabase } from "./db-utils";

export async function GET() {
  let db;
  try {
    db = openDatabase();

    // Get all pending proposed updates including active_table_at_submission
    const updatesStmt = db.prepare(`
      SELECT id, school_number, proposed_data, submitted_at, active_table_at_submission
      FROM proposed_updates
      WHERE status = 'pending'
    `);
    const updates = updatesStmt.all();

    const result = [];

    for (const update of updates) {
      const {
        id,
        school_number,
        proposed_data,
        submitted_at,
        active_table_at_submission,
      } = update;

      if (!active_table_at_submission) {
        result.push({
          id,
          school_number,
          submitted_at,
          error: "No active table found for this update at submission time",
          diffs: {},
        });
        continue;
      }

      // Use active_table_at_submission for querying the relevant data
      const currentDataStmt = db.prepare(`
        SELECT 
          FOUNDED, SCHOOL, AUTHORITY, ADDRESS, SADDRESS, CITY, POSTAL, PHONE, FAX, Website, Email, FIRST, LAST, DEGREE,
          PrekAge4, Halfday_k, Fullday_k, "1_7", UNE, "8", "9", "10", "11", "12", UNS,
          FUNDING, SPECIALTY, ASSOC, SDNUM, SD, ElectoralNew, FISA
        FROM "${active_table_at_submission}"
        WHERE SCHOOL_NUM = ?
      `);

      let currentData;
      try {
        currentData = currentDataStmt.get(school_number);
      } catch (queryError) {
        console.error(
          `Error querying active_table_at_submission: ${active_table_at_submission}`,
          queryError
        );
        result.push({
          id,
          school_number,
          submitted_at,
          active_table_at_submission,
          error: `Error querying active table ${active_table_at_submission}: ${queryError.message}`,
          diffs: {},
        });
        continue;
      }

      if (!currentData) {
        result.push({
          id,
          school_number,
          submitted_at,
          active_table_at_submission,
          error: "Current data not found for this school_number",
          diffs: {},
        });
        continue;
      }

      // Parse proposed_data
      let proposedDataParsed;
      try {
        proposedDataParsed = JSON.parse(proposed_data);
      } catch (e) {
        result.push({
          id,
          school_number,
          submitted_at,
          active_table_at_submission,
          error: "Failed to parse proposed_data JSON",
          diffs: {},
        });
        continue;
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

      // Compute differences
      const diffs = {};

      for (const [proposedKey, dbField] of Object.entries(fieldMap)) {
        const proposedValue = proposedDataParsed[proposedKey];
        const currentValue = currentData[dbField];

        // Normalize values for comparison
        const normalizedProposedValue =
          proposedValue !== null && proposedValue !== undefined
            ? String(proposedValue).trim()
            : "";
        const normalizedCurrentValue =
          currentValue !== null && currentValue !== undefined
            ? String(currentValue).trim()
            : "";

        if (normalizedProposedValue !== normalizedCurrentValue) {
          diffs[proposedKey] = {
            field: proposedKey,
            current: normalizedCurrentValue,
            proposed: normalizedProposedValue,
          };
        }
      }

      // Only include the update if there are differences
      if (Object.keys(diffs).length > 0) {
        result.push({
          id,
          school_number,
          submitted_at,
          active_table_at_submission, // Include active_table_at_submission in the response
          diffs,
        });
      }
    }

    db.close();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (db && db.open) db.close();
    console.error("Error in proposed-updates endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
