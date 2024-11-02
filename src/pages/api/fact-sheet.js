// src/pages/api/fact-sheet.js

import { openDatabase, getActiveTable } from "./db-utils.js";

export async function GET({ request }) {
  let db;
  try {
    // Extract the host from headers or use a default value
    const hostHeader = request.headers.get("host");
    const host = hostHeader || "localhost";
    console.log(`Host Header: ${hostHeader}`); // Debug log

    // Construct the URL with the provided request URL
    const url = new URL(request.url);
    console.log(`Constructed URL: ${url.toString()}`); // Debug log
    console.log(`Search Params: ${url.searchParams.toString()}`); // Debug log

    const schoolNum = url.searchParams.get("schoolNum");

    console.log(`Received schoolNum: ${schoolNum}`); // Server-side log

    // Validate the schoolNum parameter
    if (!schoolNum) {
      console.log("Missing 'schoolNum' parameter.");
      return new Response(
        JSON.stringify({ error: "Missing 'schoolNum' parameter." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Remove leading/trailing whitespaces
    const normalizedSchoolNum = schoolNum.trim();

    // **Updated regex to be more flexible**
    // Allows one or more digits with optional hyphen and alphanumerics
    const schoolNumRegex = /^\d+(-[a-zA-Z0-9]+)?$/;
    if (!schoolNumRegex.test(normalizedSchoolNum)) {
      console.log(`Invalid schoolNum format: ${normalizedSchoolNum}`);
      return new Response(
        JSON.stringify({ error: "Invalid 'schoolNum' format." }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Open the SQLite database using utility function
    db = openDatabase();
    console.log("Connected to the database.");

    // Retrieve the active table name using utility function
    let activeTable;
    try {
      activeTable = getActiveTable(db);
      console.log(`Active Table: ${activeTable}`);
    } catch (error) {
      console.error("Error fetching active table:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Prepare the query with the active table name, properly quoted
    const query = `
      SELECT 
        SCHOOL, 
        FOUNDED, 
        AUTHORITY, 
        PHONE, 
        ADDRESS, 
        SADDRESS, 
        Website, 
        FAX, 
        CITY, 
        POSTAL, 
        Email, 
        FIRST, 
        LAST, 
        DEGREE,
        PrekAge4, 
        Halfday_k, 
        Fullday_k, 
        "1_7", 
        UNE, 
        "8", 
        "9", 
        "10", 
        "11", 
        "12", 
        UNS,
        FUNDING,  
        SPECIALTY,  
        ASSOC,     
        SCHOOL_NUM,  
        SD,
        SDNUM,        
        ElectoralNew,
        FISA       
      FROM 
        "${activeTable}"
      WHERE 
        SCHOOL_NUM = ?;
    `;

    console.log(`Executing query: ${query}`); // Log the query

    // Execute the query with the provided school number
    const row = db.prepare(query).get(normalizedSchoolNum);

    console.log(`Query Result: ${JSON.stringify(row)}`); // Server-side log

    // Check if the school was found
    if (!row) {
      console.log(`School with SCHOOL_NUM ${normalizedSchoolNum} not found.`);
      return new Response(JSON.stringify({ error: "School not found." }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Return the result as JSON
    return new Response(JSON.stringify(row), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Server Error:", error.stack); // Log full stack trace
    return new Response(JSON.stringify({ error: "Internal Server Error." }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } finally {
    if (db && db.open) {
      db.close();
      console.log("Database connection closed.");
    }
  }
}
