import { authMiddleware } from './middleware/auth.js';

export async function onRequest({ request, locals }, next) {
  // Define routes that require authentication
  const authRoutes = [
    // Admin-only routes
    { path: '/adminauthtest', options: { requireAuth: true, requireAdmin: true } },
    { path: '/admin', options: { requireAuth: true, requireAdmin: true } },
    { path: '/myedbc', options: { requireAuth: true, requireAdmin: true } },
    { path: '/analytics', options: { requireAuth: true, requireAdmin: true } },
    { path: '/changelog', options: { requireAuth: true, requireAdmin: true } },
    { path: '/database', options: { requireAuth: true, requireAdmin: true } },
    { path: '/fisa-admin', options: { requireAuth: true, requireAdmin: true } },
    { path: '/fisa-fee', options: { requireAuth: true, requireAdmin: true } },
    { path: '/generate-invoices', options: { requireAuth: true, requireAdmin: true } },
    { path: '/makeafuture', options: { requireAuth: true, requireAdmin: true } },
    { path: '/notifications', options: { requireAuth: true, requireAdmin: true } },
    { path: '/reminders', options: { requireAuth: true, requireAdmin: true } },
    { path: '/resources', options: { requireAuth: true, requireAdmin: true } },
    { path: '/review-client-changes', options: { requireAuth: true, requireAdmin: true } },
  
    // User-authenticated routes
    { path: '/dashboard', options: { requireAuth: true } },
    { path: '/fact-sheet', options: { requireAuth: true } },
    { path: '/fisa-client', options: { requireAuth: true } },

    // Public routes
    { path: '/conditional-testing', options: {} },
  ];
  

  const url = new URL(request.url);
  const pathname = url.pathname;

  // Find if the current path matches any of the auth routes
  const route = authRoutes.find((route) => pathname.startsWith(route.path));

  if (route) {
    const { authenticated, user, redirectTo } = await authMiddleware(request, route.options);

    if (!authenticated) {
      // Redirect the user if not authenticated or not authorized
      return new Response(null, {
        status: 302,
        headers: { Location: redirectTo },
      });
    }

    // Attach user info to locals, so it can be accessed in the page
    locals.user = user;
  }

  // Proceed to the next middleware or page
  const response = await next();
  return response;
}