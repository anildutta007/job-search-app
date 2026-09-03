import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { connectDB } from '@/lib/mongodb';
import { CV } from '@/models/CV';
import { extractPdfText, validatePdf } from '@/lib/pdf-parser';
import { extractCVBasics } from '@/lib/cv-extractor';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

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

    // Create upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Save file temporarily
    const fileName = `${userId}-${Date.now()}-${file.name}`;
    const filePath = join(UPLOAD_DIR, fileName);
    const buffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(buffer));

    // Validate PDF
    const isValidPdf = await validatePdf(filePath);
    if (!isValidPdf) {
      return NextResponse.json(
        { error: 'Invalid PDF file' },
        { status: 400 }
      );
    }

    // Extract text from PDF
    const pdfText = await extractPdfText(filePath);

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
