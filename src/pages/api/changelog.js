import Database from "better-sqlite3";
import { DateTime } from "luxon";

// Fetch logs for a single school
export function getLogsBySchool(schoolNum) {
  const db = new Database("./data/FISA.db");

  // Fetch logs for a single school, ordered by timestamp (most recent first)
  const logsQuery = `
    SELECT school_num, field_changed, old_value, new_value, updated_by, timestamp 
    FROM school_change_log
    WHERE school_num = ?
    ORDER BY timestamp DESC
  `;

  const logs = db.prepare(logsQuery).all(schoolNum);

  db.close();

  // Convert timestamps to Vancouver time
  logs.forEach((log) => {
    log.timestamp = DateTime.fromSQL(log.timestamp, { zone: "utc" })
      .setZone("America/Vancouver")
      .toLocaleString(DateTime.DATETIME_MED);
  });

  return logs;
}

// Fetch all school numbers ordered by the most recent change
export function getAllSchoolNumbersOrderedByRecentChange() {
  const db = new Database("./data/FISA.db");

  // Query to get unique school numbers, ordered by the most recent timestamp of any change
  const schoolNumbersQuery = `
    SELECT school_num
    FROM school_change_log
    GROUP BY school_num
    ORDER BY MAX(timestamp) DESC
  `;

  const schoolNumbers = db.prepare(schoolNumbersQuery).all();

  db.close();

  return schoolNumbers.map((school) => school.school_num);
}
