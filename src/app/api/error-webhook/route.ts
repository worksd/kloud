import { NextRequest, NextResponse } from 'next/server';
import { sendErrorToDiscord } from '@/utils/discord.webhook';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { error, context } = body;

    const errorObj = new Error(error.message || 'Unknown error');
    errorObj.name = error.name || 'Error';
    errorObj.stack = error.stack;

    await sendErrorToDiscord(errorObj, {
      pathname: context?.pathname,
      userAgent: context?.userAgent,
      timestamp: context?.timestamp,
      stack: error.stack,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error('Error in error-webhook route', e);
    return NextResponse.json({ success: false, error: 'Failed to send error' }, { status: 500 });
  }
}

