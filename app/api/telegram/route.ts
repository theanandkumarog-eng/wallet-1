import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, chat_id } = await req.json();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const defaultChatId = process.env.CHAT_ID;

    if (!botToken) {
      console.error("TELEGRAM_BOT_TOKEN not set in environment variables");
      return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 500 });
    }

    const targetChatId = chat_id || defaultChatId;
    if (!targetChatId) {
      console.error("CHAT_ID not provided and not set in environment variables");
      return NextResponse.json({ error: "CHAT_ID not provided" }, { status: 400 });
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: message,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Telegram API error:", data);
      return NextResponse.json({ error: data.description || "Telegram API error" }, { status: response.status });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Error in telegram API handler:", err);
    return NextResponse.json({ error: (err as Error).message || "Internal server error" }, { status: 500 });
  }
}
