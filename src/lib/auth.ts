import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { initDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production';

export function signToken(payload: { id: number; email: string }) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    } catch (error) {
        return null;
    }
}

export async function getUserFromSession() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) return null;

        const payload = verifyToken(token);
        if (!payload) return null;

        // Check if the token exists in the database
        const db = await initDb();
        const tokenRecords = await db.query('SELECT * FROM tokens WHERE token = $1', [token]);

        if (tokenRecords.rows.length === 0) {
            return null; // Token was invalidated
        }

        return payload;
    } catch (error) {
        console.error('Session verify error:', error);
        return null;
    }
}
