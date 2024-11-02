  // src/pages/api/reset-password.js

  import { PrismaClient } from '@prisma/client';
  import { hashPassword } from '../../lib/hash.js';
  import crypto from 'crypto';
  import dotenv from 'dotenv';

  dotenv.config();

  const prisma = new PrismaClient();

  export async function POST({ request }) {
    try {
      const formData = await request.formData();
      const token = formData.get('token');
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');

      if (password !== confirmPassword) {
        return new Response('Passwords do not match', { status: 400 });
      }

      // Hash the received token
      const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Find the user with the matching hashed reset token and check if it's still valid
      const user = await prisma.user.findFirst({
        where: {
          resetTokenHash,
          resetTokenExpires: {
            gte: new Date(),
          },
        },
      });

      if (!user) {
        // Invalid or expired token
        return new Response('Invalid or expired token', { status: 400 });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(password);

      // Update the user's password and remove the reset token fields
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetTokenHash: null,
          resetTokenExpires: null,
        },
      });

      // Redirect to login page with a success message
      return new Response(null, {
        status: 302,
        headers: { Location: '/login?reset=success' },
      });
    } catch (error) {
      console.error('Error in /api/reset-password:', error);
      return new Response('Internal Server Error', { status: 500 });
    } finally {
      await prisma.$disconnect();
    }
  }
