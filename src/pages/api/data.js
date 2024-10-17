import { openDatabase } from "./db-utils";

export async function GET({ request }) {
  const url = new URL(request.url); // Extract URL object from request
  const tableName = url.searchParams.get("table") || "all_schools_2024-2025"; // Get table name from query param, with default fallback
  const schoolId = url.searchParams.get("schoolId"); // Get schoolId from query param if provided

  const db = openDatabase();

  try {
    let query;
    let rows;

    // If schoolId is provided, fetch data for a specific school
    if (schoolId) {
      query = `
        SELECT 
          SCHOOL AS schoolName, 
          SCHOOL_NUM AS schoolId, 
          ASSOC AS assoc, 
          CITY AS city, 
          Email AS email, 
          Halfday_k AS halfDayKindergarten, 
          Fullday_k AS fullDayKindergarten, 
          "1_7" AS grades1To12
        FROM "${tableName}" 
        WHERE SCHOOL_NUM = ?
      `;
      rows = db.prepare(query).get(schoolId);

      // Return 404 if the school is not found
      if (!rows) {
        return new Response(JSON.stringify({ error: "School not found" }), {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
    } else {
      // If no schoolId is provided, fetch all rows from the table
      query = `SELECT * FROM "${tableName}"`;
      rows = db.prepare(query).all();
    }

    // Return the fetched data
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Error fetching data from table:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch data from table" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
