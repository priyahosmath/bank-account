import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initDb } from '@/lib/db';

export async function POST() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (token) {
        const db = await initDb();
        await db.run('DELETE FROM tokens WHERE token = ?', [token]);
    }

    cookieStore.delete('token');

    return NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
}
