import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { CV } from '@/models/CV';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const cvs = await CV.find({ userId }).sort({ uploadedAt: -1 });

    const formattedCVs = cvs.map((cv) => ({
      id: cv._id,
      fileName: cv.fileName,
      uploadedAt: cv.uploadedAt,
      parsedData: {
        fullName: cv.parsedData.fullName,
        email: cv.parsedData.email,
        phone: cv.parsedData.phone,
        skillsCount: cv.parsedData.skills.length,
        experienceCount: cv.parsedData.experience.length,
        educationCount: cv.parsedData.education.length,
      },
    }));

    return NextResponse.json({
      success: true,
      count: formattedCVs.length,
      cvs: formattedCVs,
    });
  } catch (error) {
    console.error('Error fetching CVs:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch CVs',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const cvId = request.nextUrl.searchParams.get('id');
    const userId = request.nextUrl.searchParams.get('userId');

    if (!cvId || !userId) {
      return NextResponse.json(
        { error: 'CV ID and User ID are required' },
        { status: 400 }
      );
    }

    const cv = await CV.findOneAndDelete({ _id: cvId, userId });

    if (!cv) {
      return NextResponse.json(
        { error: 'CV not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'CV deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting CV:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to delete CV',
      },
      { status: 500 }
    );
  }
}
