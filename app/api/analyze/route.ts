import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { analyzeResumeWithJob } from '@/lib/groq';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resumeId, jobId } = body;

    if (!resumeId || !jobId) {
      return NextResponse.json(
        { error: 'Resume ID and Job ID are required' },
        { status: 400 }
      );
    }

    // Get resume and job
    const [resume, job] = await Promise.all([
      prisma.resume.findFirst({
        where: { id: resumeId, userId: session.user.id },
      }),
      prisma.job.findFirst({
        where: { id: jobId, userId: session.user.id },
      }),
    ]);

    if (!resume || !job) {
      return NextResponse.json(
        { error: 'Resume or Job not found' },
        { status: 404 }
      );
    }

    // Analyze with AI
    const analysis = await analyzeResumeWithJob(
      resume.extractedText,
      job.jobDescription
    );

    // Update job with analysis results
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        matchScore: analysis.matchScore,
        matchingSkills: analysis.matchingSkills,
        missingSkills: analysis.missingSkills,
        suggestions: analysis.suggestions,
        atsScore: analysis.atsScore,
      },
    });

    return NextResponse.json({ job: updatedJob, analysis });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Analysis failed' },
      { status: 500 }
    );
  }
}
