import { NextResponse } from 'next/server';
import { initDb } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
        }

        const db = await initDb();

        // Check if user already exists
        const existingUsers = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUsers.rows.length > 0) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user with initial $5,000 balance
        const result = await db.query(
            'INSERT INTO users (name, email, password, balance) VALUES ($1, $2, $3, 5000) RETURNING id',
            [name, email, hashedPassword]
        );

        return NextResponse.json({
            message: 'User registered successfully',
            user: { id: result.rows[0].id, name, email }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
