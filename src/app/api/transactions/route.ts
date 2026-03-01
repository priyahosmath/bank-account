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
        const result = await db.query(
            'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC LIMIT 50',
            [userSession.id]
        );

        return NextResponse.json({ transactions: result.rows }, { status: 200 });
    } catch (error) {
        console.error('Transactions fetch error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
