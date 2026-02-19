import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { getSession } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    
    // Map data to match frontend expectations
    const mappedUsers = allUsers.map(u => ({
        id: u.id,
        email: u.email,
        role: u.role,
        status: u.isApproved ? 'approved' : 'pending',
        createdAt: u.createdAt
    }));

    return NextResponse.json(mappedUsers);
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
