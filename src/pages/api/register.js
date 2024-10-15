import prisma from '../../lib/db';
import { hashPassword } from '../../lib/hash';
import { validateCsrfToken } from '../../lib/csrf';

export async function POST({ request, cookies }) {
  try {
    const data = await request.json();
    const { csrfToken, email, password, isAdmin } = data;

    console.log('Received registration data:', { email, isAdmin, csrfToken });

    // Validate CSRF Token
    const isValidCsrf = validateCsrfToken(cookies, csrfToken);
    if (!isValidCsrf) {
      console.error('Invalid CSRF token.');
      return new Response('Invalid CSRF token', { status: 403 });
    }

    if (!email || !password) {
      console.error('Missing email or password.');
      return new Response('Missing email or password', { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.error('User already exists.');
      return new Response('User already exists', { status: 409 });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Set admin status (for testing purposes)
    const adminStatus = isAdmin || false;

    // Create the user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        isAdmin: adminStatus,
      },
    });

    console.log('User registered successfully:', email);
    return new Response('User registered successfully', { status: 201 });
  } catch (error) {
    console.error('Error in /api/register:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
