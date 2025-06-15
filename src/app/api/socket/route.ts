import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Socket.IO endpoint for compatibility
  // In production, WebRTC will work directly between peers
  console.log('Socket.IO endpoint accessed');
  return NextResponse.json({ 
    status: 'ok', 
    message: 'Socket.IO endpoint active',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  return NextResponse.json({ status: 'ok' });
} 