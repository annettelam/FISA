import Database from "better-sqlite3";
import { DateTime } from "luxon";

// Function to fetch logs with pagination
export function getLogs(page = 1, pageSize = 10) {
  const db = new Database("./data/FISA.db");

  // Calculate the offset
  const offset = (page - 1) * pageSize;

  // Modify the query to limit the results
  const logsQuery = `
    SELECT school_num, field_changed, old_value, new_value, updated_by, timestamp 
    FROM school_change_log
    ORDER BY 
      MAX(timestamp) OVER (PARTITION BY school_num) DESC,
      school_num ASC,
      timestamp DESC
    LIMIT ? OFFSET ?
  `;

  // Execute the query with pagination
  const logs = db.prepare(logsQuery).all(pageSize, offset);

  // Close the database
  db.close();

  // Convert timestamps from UTC to Vancouver time
  logs.forEach((log) => {
    log.timestamp = DateTime.fromSQL(log.timestamp, { zone: "utc" })
      .setZone("America/Vancouver")
      .toLocaleString(DateTime.DATETIME_MED);
  });

  return logs;
}

// Function to get total log count
export function getTotalLogCount() {
  const db = new Database("./data/FISA.db");

  // Query to get the total number of logs
  const totalLogsQuery = `
    SELECT COUNT(*) as totalLogs 
    FROM school_change_log
  `;

  const result = db.prepare(totalLogsQuery).get();

  // Close the database
  db.close();

  return result.totalLogs;
}
