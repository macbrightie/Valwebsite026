import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get('file_id');

  if (!fileId) {
    return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    // 1. Get the file path from Telegram API
    // https://api.telegram.org/bot<token>/getFile?file_id=<file_id>
    const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);

    if (!fileResponse.ok) {
      throw new Error('Failed to fetch file info from Telegram');
    }

    const fileData = await fileResponse.json();

    if (!fileData.ok || !fileData.result || !fileData.result.file_path) {
      return NextResponse.json({ error: 'Invalid file data received from Telegram' }, { status: 404 });
    }

    const filePath = fileData.result.file_path;

    // 2. Construct the direct download URL
    // https://api.telegram.org/file/bot<token>/<file_path>
    const publicUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;

    // 3. Redirect to it
    return NextResponse.redirect(publicUrl);

  } catch (error) {
    console.error('Telegram API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
