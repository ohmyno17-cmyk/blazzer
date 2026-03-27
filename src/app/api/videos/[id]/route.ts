import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TURBOVIPLAY_API_BASE = 'https://api.turboviplay.com';
const API_KEY = process.env.TURBOVIPLAY_API_KEY || '0iHhFGzTW4';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch video info from TurboVIPlay API
    const apiUrl = `${TURBOVIPLAY_API_BASE}/infoFile?keyApi=${API_KEY}&videoID=${id}`;
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch video info' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching video info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Delete video from TurboVIPlay
    const apiUrl = `https://api.turboviplay.com/removeVideo?keyApi=${API_KEY}&videoID=${id}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
