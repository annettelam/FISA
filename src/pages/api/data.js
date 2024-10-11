import { openDatabase } from "./db-utils";

export async function GET({ request }) {
  const url = new URL(request.url); // Extract URL object from request
  const tableName = url.searchParams.get("table") || "all_schools_2024-2025"; // Get table name from query param, with default fallback

  const db = openDatabase();
  try {
    const rows = db.prepare(`SELECT * FROM "${tableName}"`).all();
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
