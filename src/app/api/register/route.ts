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
        const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user with initial $5,000 balance
        const result = await db.run(
            'INSERT INTO users (name, email, password, balance) VALUES (?, ?, ?, 5000)',
            [name, email, hashedPassword]
        );

        return NextResponse.json({
            message: 'User registered successfully',
            user: { id: result.lastID, name, email }
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
