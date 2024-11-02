// src/pages/api/get-user-role.js

import { authMiddleware } from "../../middleware/auth.js"; // Adjust the path as needed

export async function GET({ request }) {
  // Use your existing authMiddleware to authenticate the user
  const authResult = await authMiddleware(request, { requireAuth: true });

  if (!authResult.authenticated) {
    // Return 401 Unauthorized response
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const { user } = authResult;
  const isAdmin = user.isAdmin || false;

  // Return the isAdmin status
  return new Response(JSON.stringify({ isAdmin }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
