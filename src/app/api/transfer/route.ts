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

        const { amount, recipientEmail } = await req.json();

        if (!amount || amount <= 0 || !recipientEmail) {
            return NextResponse.json({ message: 'Invalid transfer details' }, { status: 400 });
        }

        if (recipientEmail === userSession.email) {
            return NextResponse.json({ message: 'Cannot transfer to yourself' }, { status: 400 });
        }

        const senderRecords = await client.query('SELECT balance FROM users WHERE id = $1', [userSession.id]);
        if (senderRecords.rows.length === 0) {
            return NextResponse.json({ message: 'Sender not found' }, { status: 404 });
        }

        const senderBalance = senderRecords.rows[0].balance;
        if (senderBalance < amount) {
            return NextResponse.json({ message: 'Insufficient balance' }, { status: 400 });
        }

        const recipientRecords = await client.query('SELECT id FROM users WHERE email = $1', [recipientEmail]);
        if (recipientRecords.rows.length === 0) {
            return NextResponse.json({ message: 'Recipient not found' }, { status: 404 });
        }

        const recipientId = recipientRecords.rows[0].id;

        await client.query('BEGIN');

        // Update balances
        await client.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, userSession.id]);
        await client.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, recipientId]);

        // Record transactions
        await client.query(
            'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
            [userSession.id, 'TRANSFER', amount, `Transfer to ${recipientEmail}`]
        );
        await client.query(
            'INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, $2, $3, $4)',
            [recipientId, 'TRANSFER', amount, `Transfer from ${userSession.email}`]
        );

        await client.query('COMMIT');

        return NextResponse.json({ message: 'Transfer successful', amount }, { status: 200 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Transfer error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    } finally {
        client.release();
    }
}
