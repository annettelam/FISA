import Database from "better-sqlite3";
import { DateTime } from "luxon";

// Function to fetch logs from the database
export function getLogs() {
  // Open the SQLite database
  const db = new Database("./data/FISA.db");

  // Define the query to fetch logs
  const logsQuery = `
    SELECT school_num, field_changed, old_value, new_value, updated_by, timestamp 
    FROM school_change_log
    ORDER BY 
      MAX(timestamp) OVER (PARTITION BY school_num) DESC,
      school_num ASC,
      timestamp DESC
  `;

  // Execute the query and fetch logs
  const logs = db.prepare(logsQuery).all();

  // Close the database connection after fetching logs
  db.close();

  // Convert timestamps from UTC to Vancouver time
  logs.forEach((log) => {
    log.timestamp = DateTime.fromSQL(log.timestamp, { zone: "utc" })
      .setZone("America/Vancouver")
      .toLocaleString(DateTime.DATETIME_MED);
  });

  return logs;
}
