import { NextResponse } from 'next/server';

export const runtime = 'edge';

const API_KEY = process.env.TURBOVIPLAY_API_KEY || '0iHhFGzTW4';

export async function GET() {
  try {
    // Get upload server from TurboVIPlay
    const apiUrl = `https://api.turboviplay.com/uploadserver?keyApi=${API_KEY}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting upload server:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
