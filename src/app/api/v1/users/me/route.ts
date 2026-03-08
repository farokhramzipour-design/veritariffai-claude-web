import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    // In a real application, you would:
    // 1. Verify the token
    // 2. Get the user ID from the token
    // 3. Update the user in the database
    // 4. Return the updated user

    // For now, we'll just mock the update by returning the received data merged with a mock user
    const mockUser = {
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'Mock User',
      plan: 'FREE',
      ...updates,
    };

    return NextResponse.json(mockUser);
  } catch (error) {
    console.error('Update User Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Mock GET request
        return NextResponse.json({
            id: 'mock-user-id',
            email: 'user@example.com',
            name: 'Mock User',
            plan: 'FREE',
            role: 'researcher' // Default or fetched from DB
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
