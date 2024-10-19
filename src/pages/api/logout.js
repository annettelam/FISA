export async function GET() {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/login',
        'Set-Cookie': `token=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict`,
      },
    });
  }
  