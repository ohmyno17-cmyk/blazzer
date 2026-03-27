import { NextResponse } from 'next/server';

export const runtime = 'edge';

const API_KEY = process.env.TURBOVIPLAY_API_KEY || '0iHhFGzTW4';

export async function GET() {
  // Return hardcoded API key status
  return NextResponse.json({
    turboviplay_api_key: API_KEY ? 'configured' : '',
  });
}
