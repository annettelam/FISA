// src/pages/api/changelog.js

import { openDatabase } from "./db-utils.js";
import { DateTime } from "luxon";

// Fetch logs for a single school
export function getLogsBySchool(schoolNum) {
  let db;
  try {
    // Open the SQLite database using utility function
    db = openDatabase();

    // Fetch logs for a single school, ordered by timestamp (most recent first)
    const logsQuery = `
      SELECT 
        "SCHOOL_NUM" AS school_num, 
        "ACTION" AS action, 
        "FIELD_CHANGED" AS field_changed, 
        "OLD_VALUE" AS old_value, 
        "NEW_VALUE" AS new_value, 
        "USER_ID" AS updated_by, 
        "TIMESTAMP" AS timestamp, 
        "ACTIVE_TABLE_AT_CHANGE" AS active_table_at_change 
      FROM 
        "school_change_log"
      WHERE 
        "SCHOOL_NUM" = ?
      ORDER BY 
        "TIMESTAMP" DESC;
    `;

    const logs = db.prepare(logsQuery).all(schoolNum);

    // Convert timestamps to Vancouver time
    logs.forEach((log) => {
      log.timestamp = DateTime.fromSQL(log.timestamp, { zone: "utc" })
        .setZone("America/Vancouver")
        .toLocaleString(DateTime.DATETIME_MED);
    });

    return logs;
  } catch (error) {
    console.error("Error fetching logs by school:", error);
    throw error;
  } finally {
    if (db && db.open) {
      db.close();
      console.log("Database connection closed.");
    }
  }
}

// Fetch all school numbers ordered by the most recent change
export function getAllSchoolNumbersOrderedByRecentChange() {
  let db;
  try {
    // Open the SQLite database using utility function
    db = openDatabase();

    // Query to get unique school numbers, ordered by the most recent timestamp of any change
    const schoolNumbersQuery = `
      SELECT "SCHOOL_NUM" AS school_num
      FROM "school_change_log"
      GROUP BY "SCHOOL_NUM"
      ORDER BY MAX("TIMESTAMP") DESC;
    `;

    const schoolNumbers = db.prepare(schoolNumbersQuery).all();

    return schoolNumbers.map((school) => school.school_num);
  } catch (error) {
    console.error("Error fetching school numbers:", error);
    throw error;
  } finally {
    if (db && db.open) {
      db.close();
      console.log("Database connection closed.");
    }
  }
}
