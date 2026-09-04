import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CV } from '@/models/CV';
import { ExtractedSkills } from '@/models/ExtractedSkills';
import { analyzeSkillsWithClaude } from '@/lib/skill-analyzer';
import { scrapeLinkedInProfile } from '@/lib/linkedin-scraper';

// Use mammoth for DOCX extraction
const mammoth = require('mammoth');

// DOCX extraction function
async function extractDocxText(docxBase64: string): Promise<string> {
  try {
    // Convert base64 to Buffer
    const docxBuffer = Buffer.from(docxBase64, 'base64');

    // Extract text from DOCX
    const result = await mammoth.extractRawText({ buffer: docxBuffer });
    return result.value.trim();
  } catch (error) {
    console.warn('Could not parse DOCX:', error);
    return '';
  }
}

// Fallback PDF extraction (simple text-based)
async function extractPdfText(pdfBase64: string): Promise<string> {
  try {
    // For now, return empty - DOCX is preferred
    // In future, can add pdf-parse or similar
    console.warn('PDF extraction not yet supported, please use DOCX format');
    return '';
  } catch (error) {
    console.warn('Could not parse PDF:', error);
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { cvId, userId, linkedinUrl } = body;

    if (!cvId || !userId) {
      return NextResponse.json(
        { error: 'CV ID and User ID are required' },
        { status: 400 }
      );
    }

    // Fetch CV from database
    const cv = await CV.findOne({ _id: cvId, userId });

    if (!cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    let cvText = cv.originalText;

    // If we only have placeholder text, extract from document
    if ((cvText.includes('[PDF Document:') || cvText.includes('[Document:')) && cv.pdfBase64) {
      console.log(`Extracting text from ${cv.fileName}...`);

      let extractedText = '';

      // Check file type
      if (cv.fileName.toLowerCase().endsWith('.docx')) {
        extractedText = await extractDocxText(cv.pdfBase64);
        console.log(`DOCX extraction result: ${extractedText.length} characters`);
      } else {
        extractedText = await extractPdfText(cv.pdfBase64);
        console.log(`PDF extraction result: ${extractedText.length} characters`);
      }

      console.log(`First 200 chars: ${extractedText.substring(0, 200)}`);

      if (extractedText.trim().length > 50) {
        cvText = extractedText;
        console.log('Using extracted document text');
      } else {
        console.log('Extracted text too short, using placeholder');
      }
    }

    let linkedinData: string | undefined;

    // If LinkedIn URL provided, scrape it
    if (linkedinUrl) {
      try {
        linkedinData = await scrapeLinkedInProfile(linkedinUrl);
        console.log(`LinkedIn data scraped: ${linkedinData?.length || 0} characters`);
      } catch (error) {
        console.warn('Could not scrape LinkedIn profile:', error);
        // Continue without LinkedIn data
      }
    }

    // Log extracted text length for debugging
    console.log(`CV text extracted: ${cvText.length} characters`);
    console.log(`LinkedIn data available: ${linkedinData ? 'yes' : 'no'}`);

    // Analyze skills with Claude
    const skills = await analyzeSkillsWithClaude(cvText, linkedinData);

    // Save extracted skills to database
    const extractedSkills = new ExtractedSkills({
      cvId,
      linkedinUrl: linkedinUrl || undefined,
      linkedinData,
      extractedSkills: skills,
      analyzedAt: new Date(),
    });

    const saved = await extractedSkills.save();

    return NextResponse.json({
      success: true,
      skillsId: saved._id,
      extractedSkills: skills,
      analyzedAt: saved.analyzedAt,
      debug: {
        cvTextLength: cvText.length,
        linkedinDataAvailable: !!linkedinData,
        hasExtractedText: !cvText.includes('[PDF Document:'),
      },
    });
  } catch (error) {
    console.error('Error extracting skills:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to extract skills',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const cvId = request.nextUrl.searchParams.get('cvId');

    if (!cvId) {
      return NextResponse.json(
        { error: 'CV ID is required' },
        { status: 400 }
      );
    }

    const extractedSkills = await ExtractedSkills.findOne({ cvId }).sort({
      analyzedAt: -1,
    });

    if (!extractedSkills) {
      return NextResponse.json(
        { error: 'Skills not found for this CV' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      skillsId: extractedSkills._id,
      extractedSkills: extractedSkills.extractedSkills,
      analyzedAt: extractedSkills.analyzedAt,
      seniority: extractedSkills.extractedSkills.seniority,
      yearsOfExperience: extractedSkills.extractedSkills.yearsOfExperience,
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch skills',
      },
      { status: 500 }
    );
  }
}
