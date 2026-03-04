import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { extractTextFromFile } from '@/lib/resume-parser';
import { uploadToBlob, validateFile } from '@/lib/blob';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for file processing

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to upload resumes.' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please select a file to upload.' },
        { status: 400 }
      );
    }

    // Validate file (5MB max, PDF/DOCX only)
    const validation = validateFile(file, {
      maxSizeInMB: 5,
      allowedTypes: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    });

    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload to Vercel Blob Storage
    const uploadResult = await uploadToBlob(file, {
      folder: 'resumes',
      maxSizeInMB: 5,
    });

    // Extract text from file for AI analysis
    let extractedText = '';
    try {
      extractedText = await extractTextFromFile(file);
    } catch (parseError) {
      console.error('Text extraction error:', parseError);
      // Continue even if text extraction fails
      extractedText = 'Text extraction failed. Please ensure the file is not corrupted.';
    }

    // Save resume metadata to database
    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        fileUrl: uploadResult.url,
        extractedText,
      },
    });

    return NextResponse.json(
      {
        success: true,
        resume: {
          id: resume.id,
          fileName: resume.fileName,
          fileUrl: resume.fileUrl,
          createdAt: resume.createdAt,
        },
        message: 'Resume uploaded successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    
    // Return user-friendly error message
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred during upload. Please try again.';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
