// src/pages/api/change-password.js

import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../../lib/hash.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export async function POST({ request }) {
  try {
    // Get the token from cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((c) => c.split('='))
    );

    const token = cookies.token;

    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }

    let user;
    try {
      user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.error('JWT Verification Failed:', err);
      return new Response('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const oldPassword = formData.get('oldPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (newPassword !== confirmPassword) {
      const error = encodeURIComponent('New passwords do not match');
      return new Response(null, {
        status: 302,
        headers: { Location: `/change-password?error=${error}` },
      });
    }

    // Retrieve the user's current hashed password from the database
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

    if (!dbUser) {
      return new Response('User not found', { status: 404 });
    }

    // Verify the old password
    const isValidPassword = await verifyPassword(oldPassword, dbUser.password);

    if (!isValidPassword) {
      const error = encodeURIComponent('Incorrect current password');
      return new Response(null, {
        status: 302,
        headers: { Location: `/change-password?error=${error}` },
      });
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update the user's password in the database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Redirect to change password page with success message
    return new Response(null, {
      status: 302,
      headers: { Location: '/change-password?success=true' },
    });
  } catch (error) {
    console.error('Error in /api/change-password:', error);
    return new Response('Internal Server Error', { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
