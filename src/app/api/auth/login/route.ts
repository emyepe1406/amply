import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authManager } from '@/lib/auth';
import { UserService } from '@/lib/dynamodb-service';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Try to find user by email first, then by username
    let user = await UserService.getUserByEmail(username);
    
    if (!user) {
      // If not found by email, try to find by username
      const allUsers = await UserService.getAllUsers();
      const userWithPassword = allUsers.find(u => u.username === username);
      if (userWithPassword) {
        user = await UserService.getUserByEmail(userWithPassword.email || '');
      }
    }

    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    
    // Set HTTP cookie for backend API authentication
    const cookieStore = await cookies();
    cookieStore.set('user', JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Clear the user cookie for logout
    const cookieStore = await cookies();
    cookieStore.delete('user');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}