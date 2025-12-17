'use server'

export async function sendErrorToDiscord(error: Error, context?: {
  pathname?: string;
  userAgent?: string;
  timestamp?: string;
  stack?: string;
}) {
  const DISCORD_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_ERROR_WEB_HOOK;
  
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('Discord webhook URL not configured');
    return;
  }

  const errorMessage = error.message || '알 수 없는 에러';
  const errorName = error.name || 'Error';
  const stack = context?.stack || error.stack || '스택 정보 없음';
  const pathname = context?.pathname || '알 수 없음';
  const userAgent = context?.userAgent || '알 수 없음';
  const timestamp = context?.timestamp || new Date().toISOString();

  // 스택 트레이스가 너무 길면 자르기
  const truncatedStack = stack.length > 1000 ? `${stack.slice(0, 1000)}\n... (truncated)` : stack;
  const truncatedMessage = errorMessage.length > 1000 ? `${errorMessage.slice(0, 1000)}... (truncated)` : errorMessage;

  const discordPayload = {
    username: 'Web Error Bot',
    content: '@here 웹에서 에러가 발생했습니다.',
    embeds: [
      {
        title: `🚨 웹 에러 발생`,
        description: `**${errorName}**\n\`\`\`\n${truncatedMessage}\n\`\`\``,
        color: 0xff0000, // 빨간색
        timestamp,
        fields: [
          {
            name: '경로',
            value: `\`${pathname}\``,
            inline: true,
          },
          {
            name: 'User Agent',
            value: `\`${userAgent.length > 100 ? userAgent.slice(0, 100) + '...' : userAgent}\``,
            inline: false,
          },
          {
            name: '스택 트레이스',
            value: `\`\`\`\n${truncatedStack}\n\`\`\``,
            inline: false,
          },
        ],
        footer: {
          text: 'Web → Discord error relay',
        },
      },
    ],
  };

  try {
    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(discordPayload),
    });

    if (!res.ok) {
      console.error('Failed to send discord webhook', await res.text());
    }
  } catch (e) {
    console.error('Error sending to Discord webhook', e);
  }
}

