// src/pages/api/protected-data.js

import { authMiddleware } from '../../middleware/auth.js';

export async function GET({ request }) {
  const { authenticated, user, redirectTo } = await authMiddleware(request, { requireAuth: true });

  if (!authenticated) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Proceed with handling the request
  return new Response(JSON.stringify({ data: 'This is protected data', user }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
