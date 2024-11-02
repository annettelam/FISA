// src/pages/api/admin/active-table.js

const Database = require("better-sqlite3");
const path = require("path");

// Helper function to fetch tables from the database
function fetchTablesFromDatabase() {
  try {
    const dbPath = path.resolve("./data", "FISA.db");
    console.log(`Connecting to database at: ${dbPath}`);

    const db = new Database(dbPath, { verbose: console.log });

    try {
      const rows = db
        .prepare(
          `
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `
        )
        .all();

      const tables = rows.map((row) => row.name);
      console.log(`Retrieved tables: ${tables.join(", ")}`);
      return tables;
    } finally {
      db.close();
      console.log("Database connection closed.");
    }
  } catch (error) {
    console.error("Error fetching tables from database:", error);
    return [];
  }
}

// Helper function to get the active table from the config table
function getActiveTableFromConfig() {
  try {
    const dbPath = path.resolve("./data", "FISA.db");
    const db = new Database(dbPath, { verbose: console.log });

    try {
      const row = db
        .prepare(`SELECT value FROM config WHERE key = 'active_table'`)
        .get();
      return row ? row.value : null;
    } finally {
      db.close();
      console.log("Database connection closed.");
    }
  } catch (error) {
    console.error("Error fetching active table from config:", error);
    return null;
  }
}

// Helper function to set the active table in the config table
function setActiveTableInConfig(tableName) {
  try {
    const dbPath = path.resolve("./data", "FISA.db");
    const db = new Database(dbPath, { verbose: console.log });

    try {
      db.prepare(
        `
        INSERT INTO config (key, value) VALUES ('active_table', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `
      ).run(tableName);
      console.log(`Active table set to "${tableName}" in config.`);
    } finally {
      db.close();
      console.log("Database connection closed.");
    }
  } catch (error) {
    console.error("Error setting active table in config:", error);
  }
}

// Handler for GET requests
async function handleGetRequest(req, res) {
  console.log("Received GET request to /api/admin/active-table");

  const activeTable = getActiveTableFromConfig();

  if (activeTable) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ activeTable }));
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Active table not set." }));
  }
}

// Handler for POST requests
async function handlePostRequest(req, res) {
  console.log("Received POST request to /api/admin/active-table");

  try {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // Convert Buffer to string
    });

    req.on("end", () => {
      try {
        const parsedBody = JSON.parse(body);
        const { tableName } = parsedBody;

        console.log("Request body:", parsedBody);

        // Validate input presence
        if (!tableName) {
          console.log("Missing tableName");
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Table name is required." }));
          return;
        }

        // Validate table name format to prevent SQL injection
        const tableNameRegex = /^[a-zA-Z0-9_-]+$/;
        if (!tableNameRegex.test(tableName)) {
          console.log("Invalid table name format.");
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              message:
                "Invalid table name format. Use only letters, numbers, underscores, and hyphens.",
            })
          );
          return;
        }

        // Fetch actual tables from the database
        const tables = fetchTablesFromDatabase();
        if (!tables.includes(tableName)) {
          console.log(`Table "${tableName}" does not exist.`);
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ message: "Specified table does not exist." })
          );
          return;
        }

        // Set the active table in the config table
        setActiveTableInConfig(tableName);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ message: `Active table set to "${tableName}".` })
        );
      } catch (parseError) {
        console.error("Error parsing request body:", parseError);
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON format." }));
      }
    });
  } catch (error) {
    console.error("Error setting active table:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Internal Server Error" }));
  }
}

// Export the handler
module.exports = async (req, res) => {
  if (req.method === "GET") {
    await handleGetRequest(req, res);
  } else if (req.method === "POST") {
    await handlePostRequest(req, res);
  } else {
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Method Not Allowed" }));
  }
};
