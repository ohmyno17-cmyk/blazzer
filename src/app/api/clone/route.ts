import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const API_KEY = process.env.TURBOVIPLAY_API_KEY || '0iHhFGzTW4';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { embedLink, folderId, title } = body;

    if (!embedLink) {
      return NextResponse.json(
        { error: 'Embed link is required' },
        { status: 400 }
      );
    }
    
    // Build clone URL
    let cloneUrl = `https://api.turboviplay.com/cloneVideo?keyApi=${API_KEY}&url=${encodeURIComponent(embedLink)}`;
    if (folderId) {
      cloneUrl += `&folder_id=${encodeURIComponent(folderId)}`;
    }
    if (title) {
      cloneUrl += `&newTitle=${encodeURIComponent(title)}`;
    }

    const response = await fetch(cloneUrl);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error cloning video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
