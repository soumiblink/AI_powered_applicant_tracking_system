import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ resumes });
  } catch (error) {
    console.error('Get resumes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resumes' },
      { status: 500 }
    );
  }
}
