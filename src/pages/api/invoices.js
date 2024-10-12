// src/pages/api/invoices.js
import { openDatabase } from "./db-utils"; // Ensure the import path is correct

export async function GET({ url }) {
    const tableName = url.searchParams.get("table") || "all_schools_2024-2025"; // Default table

    try {
        const db = openDatabase();

        // Fetch school data for the given table
        const rows = db.prepare(`
            SELECT 
                SCHOOL AS schoolName, 
                SCHOOL_NUM AS schoolId, 
                ASSOC AS assoc, 
                CITY AS city, 
                Email AS email 
            FROM "${tableName}"
        `).all();

        if (!rows || rows.length === 0) {
            return new Response(JSON.stringify({ error: "No schools found" }), {
                status: 404,
                headers: {
                    "Content-Type": "application/json",
                },
            });
        }

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
