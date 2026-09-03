import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CV } from '@/models/CV';
import { extractPdfText } from '@/lib/pdf-parser';
import { extractCVBasics } from '@/lib/cv-extractor';

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

// Validate if buffer is a valid PDF
function validatePdfBuffer(buffer: Buffer): boolean {
  try {
    // Check PDF magic number
    const pdfMagic = buffer.toString('ascii', 0, 4);
    return pdfMagic === '%PDF';
  } catch {
    return false;
  }
}

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

    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate PDF
    const isValidPdf = validatePdfBuffer(buffer);
    if (!isValidPdf) {
      return NextResponse.json(
        { error: 'Invalid PDF file' },
        { status: 400 }
      );
    }

    // Extract text from PDF buffer (no disk I/O needed)
    const pdfText = await extractPdfText(buffer);

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No text content found in PDF' },
        { status: 400 }
      );
    }

    // Parse CV basics
    const parsedData = extractCVBasics(pdfText);

    // Save to database
    const cvDoc = new CV({
      userId,
      originalText: pdfText,
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
