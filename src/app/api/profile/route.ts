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
        const user = await db.get('SELECT name, email, balance FROM users WHERE id = ?', [userSession.id]);

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
