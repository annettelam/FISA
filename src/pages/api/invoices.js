// src/pages/api/invoices.js
import { openDatabase } from "./db-utils";

export async function GET({ url }) {
    const schoolId = url.searchParams.get("schoolId"); // Get schoolId from URL

    try {
        const db = openDatabase();

        const query = `
            SELECT 
              SCHOOL AS schoolName, 
              SCHOOL_NUM AS schoolId, 
              ASSOC AS assoc, 
              CITY AS city, 
              Email AS email,
              Principal AS contactName, 
              ENROLMENT_K_FTE AS enrolmentK, 
              ENROLMENT_1_12_FTE AS enrolment1to12, 
              TOTAL_FTE AS totalFTE -- Assuming these columns exist
            FROM "all_schools_2024-2025"
            WHERE SCHOOL_NUM = ?
        `;

        const stmt = db.prepare(query);
        const schoolData = stmt.get(schoolId);

        // Logic for calculating invoice based on the school data
        const baseFee = 1000; // Example base fee
        const feePerFTE = 200; // Example fee per full-time equivalent (FTE)
        const totalAmountDue = baseFee + (schoolData.totalFTE * feePerFTE);

        db.close();

        return new Response(JSON.stringify({
            ...schoolData,
            totalAmountDue
        }), {
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
