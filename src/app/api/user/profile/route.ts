import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, getSession } from '@/lib/auth';

export async function PUT(request: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, email, password } = body;

        // Basic validation
        if (!name || !email) {
            return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
        }

        // Check if email is taken by another user
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
        if (existingUser.length > 0 && existingUser[0].id !== session.userId) {
             return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }

        const updateData: any = {
            name,
            email,
            updatedAt: new Date(),
        };

        if (password && password.trim() !== '') {
            updateData.passwordHash = await hashPassword(password);
        }

        const [updatedUser] = await db.update(users)
            .set(updateData)
            .where(eq(users.id, session.userId))
            .returning();

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isApproved: updatedUser.isApproved
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
