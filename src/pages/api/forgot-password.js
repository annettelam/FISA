import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

export async function POST({ request }) {
  try {
    // Check Content-Type to make sure the form is sending the correct type
    const contentType = request.headers.get('content-type');
    
    let email;

    // Handle form submissions with content-type: application/x-www-form-urlencoded
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = new URLSearchParams(await request.text());
      email = formData.get('email');
    } else if (contentType.includes('multipart/form-data')) {
      // For multipart/form-data, the form data needs to be parsed differently (not handled here)
      return new Response('Unsupported content type', { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // If user doesn't exist, don't reveal this to avoid email enumeration attacks
    if (!user) {
      return new Response(null, { status: 200 });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // Token valid for 1 hour

    // Store the hashed token and expiry time in the database
    await prisma.user.update({
      where: { email },
      data: {
        resetTokenHash,
        resetTokenExpires,
      },
    });

    // Configure the email transporter using nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Define the reset password link
    const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

    // Send the reset email
    await transporter.sendMail({
      from: `"FISA Website" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You have requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    // Return a 200 status, even if the email does not exist, for security purposes
    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Error in /api/forgot-password:', error);
    return new Response('Internal Server Error', { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
