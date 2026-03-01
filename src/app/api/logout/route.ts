import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (token) {
            const db = await initDb();
            // Delete token from database
            await db.query('DELETE FROM tokens WHERE token = $1', [token]);
        }

        // Clear cookie
        cookieStore.delete('token');

        return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
