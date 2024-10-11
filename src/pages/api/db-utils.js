// src/utils/db-utils.js

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
