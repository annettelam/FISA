/* src/pages/api/fact-sheet.js */

import Database from "better-sqlite3";

export async function GET(req) {
  try {
    // Extract the school number from the query string
    const url = new URL(req.url);
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

    // Remove leading/trailing whitespaces without altering the original number
    const normalizedSchoolNum = schoolNum.trim();

    // Open the SQLite database
    const db = new Database("./data/FISA.db", { verbose: console.log });

    // Prepare the query with the correct column name
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
        SCHOOL_NUM,  -- Updated column name
        SD,
        SDNUM,        
        ElectoralNew,
        FISA       
      FROM 
        "all_schools_2024-2025"
      WHERE 
        SCHOOL_NUM = ?;  -- Updated WHERE clause
    `;

    // Execute the query with the provided school number
    const row = db.prepare(query).get(normalizedSchoolNum);

    console.log(`Query Result: ${JSON.stringify(row)}`); // Server-side log

    // Close the database connection
    db.close();

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
    console.error("Server Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error." }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
