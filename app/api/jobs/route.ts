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

    const jobs = await prisma.job.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { company, role, jobDescription, status } = body;

    if (!company || !role || !jobDescription) {
      return NextResponse.json(
        { error: 'Company, role, and job description are required' },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
        company,
        role,
        jobDescription,
        status: status || 'applied',
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}
