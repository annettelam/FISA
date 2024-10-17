// src/pages/api/invoices.js
import { openDatabase } from "./db-utils";

export async function GET({ url }) {
    const tableName = url.searchParams.get("table") || "all_schools_2024-2025";

    try {
        const db = openDatabase();

        const query = `
      SELECT 
        SCHOOL AS schoolName, 
        SCHOOL_NUM AS schoolId, 
        ASSOC AS assoc, 
        CITY AS city, 
        Email AS email,
        Principal AS contactName -- Add this line
      FROM "${tableName}"
    `;

        const stmt = db.prepare(query);
        const data = stmt.all();

        db.close();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error fetching data from table:", error);
        return new Response(
            JSON.stringify({ error: "Failed to fetch data from table" }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
