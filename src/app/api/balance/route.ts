import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const db = await initDb();
        const user = await db.get('SELECT balance FROM users WHERE id = ?', [userSession.id]);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ balance: user.balance }, { status: 200 });
    } catch (error) {
        console.error('Balance check error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
