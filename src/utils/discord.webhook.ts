'use server'

export async function sendErrorToDiscord(error: Error, context?: {
  pathname?: string;
  route?: string;
  userAgent?: string;
  timestamp?: string;
  stack?: string;
  statusCode?: number;
  filename?: string;
  lineno?: number;
  colno?: number;
  digest?: string;
  env?: string;
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
  const route = context?.route || pathname;
  const userAgent = context?.userAgent || '알 수 없음';
  const statusCode = context?.statusCode;
  const timestamp = context?.timestamp || new Date().toISOString();
  const env = context?.env || process.env.NEXT_PUBLIC_ENV || 'unknown';

  // 스택 트레이스가 너무 길면 자르기
  const truncatedStack = stack.length > 1000 ? `${stack.slice(0, 1000)}\n... (truncated)` : stack;
  const truncatedMessage = errorMessage.length > 1000 ? `${errorMessage.slice(0, 1000)}... (truncated)` : errorMessage;

  const fields = [
    {
      name: '환경',
      value: `\`${env}\``,
      inline: true,
    },
    {
      name: '에러 메시지',
      value: `\`\`\`\n${truncatedMessage}\n\`\`\``,
      inline: false,
    },
    {
      name: 'Route',
      value: `\`${route}\``,
      inline: true,
    },
  ];

  if (statusCode) {
    fields.push({
      name: '응답 코드',
      value: `\`${statusCode}\``,
      inline: true,
    });
  }

  if (context?.digest) {
    fields.push({
      name: 'Digest',
      value: `\`${context.digest}\``,
      inline: true,
    });
  }

  if (context?.filename) {
    fields.push({
      name: '파일',
      value: `\`${context.filename}${context.lineno ? `:${context.lineno}` : ''}${context.colno ? `:${context.colno}` : ''}\``,
      inline: true,
    });
  }

  fields.push(
    {
      name: '경로 (Pathname)',
      value: `\`${pathname}\``,
      inline: true,
    },
    {
      name: 'User Agent',
      value: `\`${userAgent.length > 200 ? userAgent.slice(0, 100) + '...' : userAgent}\``,
      inline: false,
    },
    {
      name: '스택 트레이스',
      value: `\`\`\`\n${truncatedStack}\n\`\`\``,
      inline: false,
    }
  );

  const discordPayload = {
    username: '로우그래피 앱 에러',
    embeds: [
      {
        title: `🚨 웹 에러 발생 - ${errorName}`,
        description: `**에러 타입**: \`${errorName}\``,
        color: 0xff0000, // 빨간색
        timestamp,
        fields,
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

