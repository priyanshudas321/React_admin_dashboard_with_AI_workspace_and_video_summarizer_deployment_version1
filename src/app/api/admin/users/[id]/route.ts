import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, role } = await req.json();
    const userId = parseInt(id); // Drizzle uses number for ID

    if (isNaN(userId)) {
         return NextResponse.json({ message: 'Invalid User ID' }, { status: 400 });
    }

    // Protection for Main Admin
    // We need to fetch the user being updated first to check their email
    const [targetUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (targetUser) {
        if (targetUser.email === 'test@test.com' && role) {
            return NextResponse.json({ message: 'Cannot modify Main Admin role' }, { status: 403 });
        }
    } else {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (status && !['pending', 'approved'].includes(status)) {
       return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    if (role && !['admin', 'user'].includes(role)) {
        return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    // Prepare update object
    const updateData: Partial<typeof users.$inferInsert> = {};
    if (status) {
        updateData.isApproved = status === 'approved';
    }
    if (role) {
        updateData.role = role;
    }
    updateData.updatedAt = new Date();

    const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.isApproved ? 'approved' : 'pending',
        createdAt: updatedUser.createdAt
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
