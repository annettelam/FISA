import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export async function authMiddleware(request) {
  const { headers } = request;
  const cookieHeader = headers.get('cookie');

  if (!cookieHeader) {
    return { authenticated: false };
  }

  const token = cookieHeader.split('; ').find(c => c.startsWith('token='));
  if (!token) {
    return { authenticated: false };
  }

  const jwtToken = token.split('=')[1];

  try {
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
    return { authenticated: true, user: decoded };
  } catch (err) {
    return { authenticated: false };
  }
}
