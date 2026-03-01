import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { getUserFromSession } from '@/lib/auth';

export async function POST(req: Request) {
    const db = await initDb();
    const client = await db.connect();

    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { amount, description } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ message: 'Invalid deposit amount' }, { status: 400 });
        }

        await client.query('BEGIN');

        // Update balance
        await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, userSession.id]);

        // Record transaction
        await client.query(
            'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
            [userSession.id, 'DEPOSIT', amount, description || 'Funds Deposit']
        );

        const res = await client.query('SELECT balance FROM users WHERE id = $1', [userSession.id]);
        const finalBalance = res.rows[0].balance;

        await client.query('COMMIT');

        return NextResponse.json({ message: 'Deposit successful', newBalance: finalBalance }, { status: 200 });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Deposit error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    } finally {
        client.release();
    }
}
