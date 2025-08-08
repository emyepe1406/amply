import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '@/lib/dynamodb-service';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching courses from database...');
    
    // Get all courses from DynamoDB
    const courses = await CourseService.getAllCourses();
    
    console.log(`Found ${courses.length} courses in database`);
    
    return NextResponse.json({
      success: true,
      courses: courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch courses',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}