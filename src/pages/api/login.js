import prisma from '../../lib/db';
import { verifyPassword } from '../../lib/hash';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { validateCsrfToken } from '../../lib/csrf';
dotenv.config();

export async function POST({ request, cookies }) {
  const data = await request.json();
  const { csrfToken, email, password } = data;

  console.log('Login attempt:', { email, csrfToken });

  if (!email || !password) {
    console.error('Missing email or password.');
    return new Response(JSON.stringify({ success: false, message: 'Missing email or password' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Validate CSRF Token
    const isValidCsrf = validateCsrfToken(cookies, csrfToken);
    console.log('CSRF validation:', isValidCsrf);
    if (!isValidCsrf) {
      console.error('Invalid CSRF token.');
      return new Response(JSON.stringify({ success: false, message: 'Invalid CSRF token' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log('User found:', user);

    if (!user) {
      console.error('User not found:', email);
      return new Response(JSON.stringify({ success: false, message: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify the password
    const isValid = await verifyPassword(password, user.password);
    console.log('Password valid:', isValid);

    if (!isValid) {
      console.error('Password verification failed for:', email);
      return new Response(JSON.stringify({ success: false, message: 'Invalid email or password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('JWT token created:', token);

    // Set the token in HttpOnly cookie
    cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600, // 1 hour
    });
    console.log('JWT token set in cookie.');

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/login:', error);
    return new Response(JSON.stringify({ success: false, message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
