import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { verifyPassword, createToken, setAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Find user
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check if user is approved (Admins are always allowed, or handled via role check if needed, but assuming admins are approved by default or this check applies to everyone)
        // If the user role is 'admin', we can skip this check if we want to ensure at least one admin can always login. 
        // However, usually admins are pre-seeded approved. Let's strictly follow the plan: "If user.role !== 'admin' AND !user.isApproved"
        if (user.role !== 'admin' && !user.isApproved) {
            return NextResponse.json(
                { error: 'Your account is pending Admin approval. Please wait for authorization.' },
                { status: 403 }
            );
        }

        // Create and set auth token
        const token = await createToken(user);
        await setAuthCookie(token);

        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isApproved: user.isApproved,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
