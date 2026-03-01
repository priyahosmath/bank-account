import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { amount, description } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ message: 'Invalid deposit amount' }, { status: 400 });
        }

        const db = await initDb();

        await db.exec('BEGIN TRANSACTION');

        // Update balance
        await db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userSession.id]);

        // Record transaction
        await db.run(
            'INSERT INTO transactions (user_id, type, amount, description) VALUES (?, ?, ?, ?)',
            [userSession.id, 'DEPOSIT', amount, description || 'Funds Deposit']
        );

        await db.exec('COMMIT');

        return NextResponse.json({ message: 'Deposit successful', newBalance: (await db.get('SELECT balance FROM users WHERE id = ?', [userSession.id])).balance }, { status: 200 });
    } catch (error) {
        console.error('Deposit error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
