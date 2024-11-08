// src/pages/api/reject.js

import Database from "better-sqlite3";
import { openDatabase } from "./db-utils";

export async function POST({ request }) {
  let db;
  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      return new Response(JSON.stringify({ error: "No ID provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    db = openDatabase();

    // Check if the proposed update exists and is pending
    const updateStmt = db.prepare(`
      SELECT id
      FROM proposed_updates
      WHERE id = ? AND status = 'pending'
    `);
    const update = updateStmt.get(id);

    if (!update) {
      db.close();
      return new Response(
        JSON.stringify({ error: "Update not found or already processed" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Mark the proposed update as rejected
    const markRejectedStmt = db.prepare(`
      UPDATE proposed_updates
      SET status = 'rejected'
      WHERE id = ?
    `);
    markRejectedStmt.run(id);

    db.close();

    return new Response(JSON.stringify({ message: "Update rejected" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (db && db.open) db.close();
    console.error("Error in reject endpoint:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
