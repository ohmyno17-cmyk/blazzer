import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const API_KEY = process.env.TURBOVIPLAY_API_KEY || '0iHhFGzTW4';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch video info from TurboVIPlay API
    const infoUrl = `https://api.turboviplay.com/infoFile?keyApi=${API_KEY}&videoID=${id}`;
    const infoResponse = await fetch(infoUrl);
    const infoData = await infoResponse.json();

    if (!infoData.file) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Get embed link from info
    const embedLink = infoData.file.embedLink;
    
    if (!embedLink) {
      return NextResponse.json({ error: 'No embed link found' }, { status: 404 });
    }

    // Fetch the embed page to extract stream URL
    const response = await fetch(embedLink);
    const html = await response.text();

    // Try to extract m3u8 URL from the page
    let streamUrl: string | null = null;
    let streamType: 'hls' | 'mp4' | null = null;

    // Try multiple patterns to find the stream URL
    const patterns = [
      /file_url\s*=\s*["']([^"']+)["']/i,
      /sources\s*:\s*\[?\s*\{[^}]*src\s*:\s*["']([^"']+)["']/i,
      /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/gi,
      /https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        streamUrl = match[1];
        streamType = streamUrl.includes('.m3u8') ? 'hls' : 'mp4';
        break;
      } else if (match && match[0]) {
        const url = match[0];
        streamUrl = url;
        streamType = url.includes('.m3u8') ? 'hls' : 'mp4';
        break;
      }
    }

    return NextResponse.json({
      videoId: id,
      title: infoData.file.title,
      poster: infoData.file.poster,
      embedLink: embedLink,
      streamUrl,
      streamType
    });
  } catch (error) {
    console.error('Error extracting stream URL:', error);
    return NextResponse.json(
      { error: 'Failed to extract stream URL' },
      { status: 500 }
    );
  }
}
