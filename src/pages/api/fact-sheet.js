import Database from "better-sqlite3";

export async function GET(req) {
  // Extract the school number from the query string or URL params
  const url = new URL(req.url);
  const schoolNum = url.searchParams.get("schoolNum");

  // Open the SQLite database
  const db = new Database("./data/FISA.db");

  // Prepare the query with the specific columns you need for both general information and enrollment
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
    ASSOC,     -- Provincial Association
    SDNUM,     -- Public School District #
    SD,        -- Name
    ElectoralNew  -- Provincial Electoral District
  FROM 
    "all_schools_2024-2025"
  WHERE 
    SCHOOL_NUM = ?;
`;

  // Execute the query with the provided school number
  const row = db.prepare(query).get(schoolNum);

  // Close the database connection
  db.close();

  // Return the result as JSON
  return new Response(JSON.stringify(row), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
