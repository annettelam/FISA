import prisma from '../../lib/db';
import { hashPassword } from '../../lib/hash';

export async function POST({ request }) {
  try {
    const data = await request.json();
    const { email, password } = data;

    if (!email || !password) {
      return new Response('Missing email or password', { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new Response('User already exists', { status: 409 });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return new Response('User registered successfully', { status: 201 });
  } catch (error) {
    console.error('Error in /api/register:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
