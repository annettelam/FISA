import prisma from '../../lib/db';
import { verifyPassword } from '../../lib/hash';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export async function POST({ request }) {
  const data = await request.json();
  const { email, password } = data;

  if (!email || !password) {
    return new Response('Missing email or password', { status: 400 });
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new Response('Invalid email or password', { status: 401 });
    }

    // Verify the password
    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return new Response('Invalid email or password', { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/dashboard',
        'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600; Secure; SameSite=Strict`,
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
