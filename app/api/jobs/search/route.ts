import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { ExtractedSkills } from '@/models/ExtractedSkills';
import { SkillMatch } from '@/models/SkillMatch';
import { generateMockJobs } from '@/lib/job-search';
import { calculateSkillMatch } from '@/lib/skill-matcher';
import { extractJobRequiredSkills } from '@/lib/skill-analyzer';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { cvId, userId, location } = body;

    if (!cvId || !userId) {
      return NextResponse.json(
        { error: 'CV ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get user's extracted skills
    const extractedSkills = await ExtractedSkills.findOne({ cvId }).sort({
      analyzedAt: -1,
    });

    if (!extractedSkills) {
      return NextResponse.json(
        { error: 'Skills not extracted yet. Please extract skills first.' },
        { status: 404 }
      );
    }

    // Generate mock jobs (in production, search from Indeed, LinkedIn, etc.)
    const jobs = generateMockJobs(20);

    // Extract required skills from each job and calculate matches
    const jobsWithMatches = await Promise.all(
      jobs.map(async (job) => {
        try {
          // Extract required skills from job description using Claude
          let requiredSkills = job.requiredSkills || [];

          if (
            !requiredSkills ||
            requiredSkills.length === 0 ||
            job.source === 'mock'
          ) {
            // For mock jobs, extract skills from description
            requiredSkills = await extractJobRequiredSkills(job.description);
          }

          // Calculate skill match
          const matchResult = calculateSkillMatch(
            extractedSkills.extractedSkills,
            requiredSkills
          );

          // Save match result to database
          const match = new SkillMatch({
            userId,
            jobId: `${job.externalId}`, // Use external ID for mock jobs
            matchScore: matchResult.matchScore,
            matchPercentage: matchResult.matchPercentage,
            matchedSkills: matchResult.matchedSkills,
            missingSkills: matchResult.missingSkills,
          });

          try {
            await match.save();
          } catch (error: any) {
            // Ignore duplicate key error (job already matched)
            if (error.code !== 11000) {
              console.warn('Error saving match:', error);
            }
          }

          return {
            ...job,
            requiredSkills,
            matchResult,
          };
        } catch (error) {
          console.error('Error processing job:', error);
          return {
            ...job,
            matchResult: {
              matchedSkills: [],
              missingSkills: job.requiredSkills || [],
              matchPercentage: 0,
              matchScore: 0,
            },
          };
        }
      })
    );

    // Sort by match score (descending)
    const sortedJobs = jobsWithMatches.sort(
      (a, b) => (b.matchResult?.matchScore || 0) - (a.matchResult?.matchScore || 0)
    );

    return NextResponse.json({
      success: true,
      jobs: sortedJobs,
      total: sortedJobs.length,
      userSkills: extractedSkills.extractedSkills,
    });
  } catch (error) {
    console.error('Error searching jobs:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to search jobs',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const cvId = request.nextUrl.searchParams.get('cvId');
    const userId = request.nextUrl.searchParams.get('userId');

    if (!cvId || !userId) {
      return NextRequest.json(
        { error: 'CV ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get all matched jobs for this user, sorted by score
    const matches = await SkillMatch.find({ userId })
      .sort({ matchScore: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch jobs',
      },
      { status: 500 }
    );
  }
}
