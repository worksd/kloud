import crypto from 'crypto';

const DISCORD_WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_ERROR_WEB_HOOK ?? '';

const WEBHOOK_SECRET = process.env.VERCEL_WEBHOOK_SECRET ?? '';

export const runtime = 'nodejs'; // Node 런타임에서 crypto 사용

async function verifySignature(req: Request) {
  const payload = await req.text(); // raw body

  const expectedSignature = crypto
      .createHmac('sha1', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

  const receivedSignature = req.headers.get('x-vercel-signature') ?? '';

  // 길이 다르면 바로 false
  if (!receivedSignature || receivedSignature.length !== expectedSignature.length) {
    return { isValid: false, payload };
  }

  const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
  );

  return { isValid, payload };
}

async function sendErrorToDiscord(body: any, rawPayload: string) {
  // 에러 메시지 추출 (Vercel payload 구조에 맞게 나중에 커스터마이징 가능)
  const errorMessage =
      body?.error?.message ||
      body?.error?.name ||
      body?.message ||
      body?.payload?.text ||
      '알 수 없는 에러';

  const projectName =
      body?.project?.name ||
      body?.name ||
      body?.deployment?.name ||
      'Unknown Project';

  const env =
      body?.deployment?.meta?.VERCEL_ENV ||
      body?.deployment?.target ||
      body?.env ||
      'unknown';

  const deploymentUrl = body?.deployment?.url
      ? `https://${body.deployment.url}`
      : body?.url || '—';

  const functionName =
      body?.function?.name ||
      body?.entryPoint ||
      body?.path ||
      '—';

  const region = body?.region || body?.deployment?.region || '—';

  const timestamp =
      body?.timestamp ||
      body?.createdAt ||
      new Date().toISOString();

  const shortErrorTitle =
      errorMessage.length > 80 ? `${errorMessage.slice(0, 77)}...` : errorMessage;

  // raw payload를 코드블럭으로, 너무 길면 자르기 (Discord 한계 고려)
  const prettyJson = (() => {
    try {
      const obj = JSON.parse(rawPayload);
      return JSON.stringify(obj, null, 2);
    } catch {
      return rawPayload;
    }
  })();

  const truncatedJson =
      prettyJson.length > 1800 ? `${prettyJson.slice(0, 1800)}\n... (truncated)` : prettyJson;

  const discordPayload = {
    username: 'Vercel Error Bot',
    content: '@here Vercel에서 에러 웹훅이 도착했습니다.', // mention 빼고 싶으면 이 줄 수정
    embeds: [
      {
        title: `🚨 [${projectName}] 에러 발생`,
        description: shortErrorTitle || '에러 내용 없음',
        color: 0xff0000, // 빨간색
        timestamp, // ISO8601 string
        fields: [
          {
            name: 'Project',
            value: `\`${projectName}\``,
            inline: true,
          },
          {
            name: 'Environment',
            value: `\`${env}\``,
            inline: true,
          },
          {
            name: 'Region',
            value: `\`${region}\``,
            inline: true,
          },
          {
            name: 'Function / Route',
            value: `\`${functionName}\``,
            inline: false,
          },
          {
            name: 'Deployment URL',
            value: deploymentUrl !== '—' ? deploymentUrl : '—',
            inline: false,
          },
          {
            name: '원본 에러 메시지',
            value:
                errorMessage.length > 1024
                    ? `\`\`\`\n${errorMessage.slice(0, 1000)}\n... (truncated)\n\`\`\``
                    : `\`\`\`\n${errorMessage}\n\`\`\``,
            inline: false,
          },
          {
            name: 'Raw Payload',
            value: `\`\`\`json\n${truncatedJson}\n\`\`\``,
            inline: false,
          },
        ],
        footer: {
          text: 'Vercel → Discord error relay',
        },
      },
    ],
  };

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
}

export async function POST(req: Request) {
  // 시그니처 검증 + raw payload 확보
  const { isValid, payload } = await verifySignature(req);

  if (!isValid) {
    return new Response('Invalid signature', { status: 401 });
  }

  let body: any = null;
  try {
    body = JSON.parse(payload);
  } catch (e) {
    console.error('Failed to parse JSON body from Vercel webhook', e);
  }

  // 디스코드로 전송 (파싱 실패해도 rawPayload 기반으로 보냄)
  await sendErrorToDiscord(body, payload);

  return new Response('OK', { status: 200 });
}