import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export async function authMiddleware(
  request,
  {
    requireAuth = false,
    requireAdmin = false,
    authRedirect = '/login',
    adminRedirect = '/unauthorized',
  } = {}
) {
  const { headers } = request;
  const cookieHeader = headers.get('cookie');

  let user = null;

  if (cookieHeader) {
    const tokenCookie = cookieHeader
      .split('; ')
      .find((c) => c.startsWith('token='));
    if (tokenCookie) {
      const jwtToken = tokenCookie.split('=')[1];
      try {
        user = jwt.verify(jwtToken, process.env.JWT_SECRET);
      } catch (err) {
        console.error('JWT Verification Failed:', err);
      }
    }
  }

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;

  // Handle authentication requirement
  if (requireAuth && !isAuthenticated) {
    return { authenticated: false, redirectTo: authRedirect };
  }

  // Handle admin requirement
  if (requireAdmin && !isAdmin) {
    return { authenticated: false, redirectTo: adminRedirect };
  }

  return { authenticated: true, user };
}
