import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/hash.js';

// TODO: HANDLE PASSWORD CREATION AND MAILING LOGIC 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  try {
    const dbPath = path.join(__dirname, '../data', 'FISA.db');

    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('Error opening data/FISA.db:', err.message);
        process.exit(1);
      }
    });

    const testEmails = await new Promise((resolve, reject) => {
      db.all('SELECT Email FROM test', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    for (const record of testEmails) {
      const email = record.Email;
      const password = email.slice(0, 3) + 'password';

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        console.log(`User with email ${email} already exists. Skipping...`);
        continue;
      }

      const hashedPassword = await hashPassword(password);

      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          isAdmin: false,
        },
      });

      console.log(`Created account for ${email}`);
    }

    db.close((err) => {
      if (err) {
        console.error('Error closing FISA.db:', err.message);
      }
    });

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin password';

    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(`Admin user already exists. Skipping admin creation...`);
    } else {
      const hashedAdminPassword = await hashPassword(adminPassword);

      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedAdminPassword,
          isAdmin: true,
        },
      });

      console.log(`Created admin account with email ${adminEmail}`);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
