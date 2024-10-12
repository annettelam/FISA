import Database from "better-sqlite3";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Opens a connection to the SQLite database.
 * @returns {Database} The SQLite database connection.
 */
export function openDatabase() {
  const dbPath = path.resolve(process.env.DB_PATH || "./data/FISA.db");
  return new Database(dbPath, { verbose: console.log });
}

/**
 * Fetches the current active table name from the config table.
 * @param {Database} db - The SQLite database connection.
 * @returns {string} The active table name.
 * @throws Will throw an error if the active table is not set or invalid.
 */
export function getActiveTable(db) {
  const activeTableQuery = `
    SELECT value 
    FROM config 
    WHERE key = 'active_table'
  `;
  const activeTableResult = db.prepare(activeTableQuery).get();
  const activeTable = activeTableResult ? activeTableResult.value : null;

  if (!activeTable) {
    throw new Error("Active table is not set.");
  }

  // Validate the active table name (allow letters, numbers, underscores, hyphens)
  const tableNameRegex = /^[A-Za-z0-9_-]+$/;
  if (!tableNameRegex.test(activeTable)) {
    throw new Error("Invalid active table name.");
  }

  return activeTable;
}

/**
 * Fetches the school data based on the school ID.
 * @param {string} schoolId - The school ID.
 * @returns {object} School data including school name, enrollment, and other relevant details.
 */
export function getSchoolDataFromDB(schoolId) {
  const db = openDatabase();
  const tableName = getActiveTable(db);

  // Prepare SQL query to fetch school data
  const query = `
    SELECT schoolName, schoolId, fullDayKindergarten, grades1To12, halfDayKindergarten 
    FROM ${tableName} 
    WHERE schoolId = ?
  `;

  const schoolData = db.prepare(query).get(schoolId);

  if (!schoolData) {
    throw new Error(`School data not found for schoolId: ${schoolId}`);
  }

  // Optionally calculate totalFTE and membershipFees here if required
  const totalFTE = schoolData.fullDayKindergarten + schoolData.grades1To12 + schoolData.halfDayKindergarten / 2;
  const membershipFees = totalFTE * 7;

  return {
    ...schoolData,
    totalFTE,
    membershipFees,
  };
}
