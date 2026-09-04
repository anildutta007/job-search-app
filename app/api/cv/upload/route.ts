import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CV } from '@/models/CV';
import { validatePdfBuffer, bufferToBase64 } from '@/lib/pdf-parser';
import { extractCVBasics } from '@/lib/cv-extractor';
import { callClaudeText } from '@/lib/anthropic-client';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    // Validation
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Accept PDF or DOCX files
    const isPdf = file.type === 'application/pdf';
    const isDocx =
      file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx');

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        { error: 'Only PDF and Word (.docx) files are supported' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate PDF (DOCX files are assumed valid)
    if (isPdf) {
      const isValidPdf = validatePdfBuffer(buffer);
      if (!isValidPdf) {
        return NextResponse.json(
          { error: 'Invalid PDF file' },
          { status: 400 }
        );
      }
    }

    // Store file as base64 and extract text during skill extraction phase
    // This is more efficient than trying to extract all text upfront
    const fileBase64 = bufferToBase64(buffer);

    // Create a simple CV record with file stored as base64
    // Claude will analyze the actual content during skill extraction
    const pdfText = `[Document: ${file.name}]
[Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB]
[Status: Ready for AI analysis]

Your CV has been uploaded successfully.
Click "Extract Skills with AI" on the dashboard to analyze your CV and extract skills.`;

    // Parse CV basics
    const parsedData = extractCVBasics(pdfText);

    // Save to database with file stored as base64
    const cvDoc = new CV({
      userId,
      originalText: pdfText,
      pdfBase64: fileBase64,
      fileName: file.name,
      uploadedAt: new Date(),
      parsedData,
    });

    const saved = await cvDoc.save();

    return NextResponse.json({
      success: true,
      cvId: saved._id,
      fileName: file.name,
      uploadedAt: saved.uploadedAt,
      parsedData: {
        fullName: parsedData.fullName || 'Not detected',
        email: parsedData.email || 'Not detected',
        phone: parsedData.phone || 'Not detected',
        skillsCount: parsedData.skills.length,
        experienceCount: parsedData.experience.length,
        educationCount: parsedData.education.length,
      },
    });
  } catch (error) {
    console.error('Error uploading CV:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to upload CV',
      },
      { status: 500 }
    );
  }
}
