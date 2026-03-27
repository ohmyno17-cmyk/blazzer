import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const TURBOVIPLAY_API_BASE = 'https://api.turboviplay.com';
const API_KEY = process.env.TURBOVIPLAY_API_KEY || '0iHhFGzTW4';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page') || '1';
    const perPage = searchParams.get('perPage') || '20';
    const folder = searchParams.get('folder') || '';
    
    // Build URL for TurboVIPlay API
    let apiUrl = `${TURBOVIPLAY_API_BASE}/listFile?keyApi=${API_KEY}&page=${page}&perPage=${perPage}`;
    if (folder) {
      apiUrl += `&folder=${encodeURIComponent(folder)}`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch videos from TurboVIPlay' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, folder, title } = body;
    
    // Build URL for remote upload
    let uploadUrl = `https://api.turboviplay.com/uploadUrl?keyApi=${API_KEY}&url=${encodeURIComponent(url)}`;
    if (folder) {
      uploadUrl += `&nameFolder=${encodeURIComponent(folder)}`;
    }
    if (title) {
      uploadUrl += `&newTitle=${encodeURIComponent(title)}`;
    }

    const response = await fetch(uploadUrl);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error uploading video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
