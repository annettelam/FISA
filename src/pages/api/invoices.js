// src/pages/api/invoices.js
import { openDatabase } from "./db-utils";

export async function GET({ url }) {
    const tableName = url.searchParams.get("table");

    try {
        const db = openDatabase();

        const query = `
            SELECT 
                SCHOOL AS schoolName, 
                SCHOOL_NUM AS schoolId, 
                ASSOC AS assoc, 
                CITY AS city, 
                EMAIL AS email
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
        console.error("Error fetching data:", error);
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
