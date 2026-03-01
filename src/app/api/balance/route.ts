import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function GET() {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const db = await initDb();
        const users = await db.query('SELECT balance FROM users WHERE id = $1', [userSession.id]);

        if (users.rows.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ balance: users.rows[0].balance });
    } catch (error) {
        console.error('Balance error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
