'use server';

/**
 * 키오스크 KIS 단말 응답 디버깅 채널.
 *  - GUINNESS_API_SERVER에 'staging' → 화면에 raw 응답 전부 노출 (KisDebugOverlay)
 *  - GUINNESS_API_SERVER에 'prod'    → Discord 웹훅으로 raw 응답 전송. 단, 실패 응답만.
 *
 * 성공 건은 Discord로 보내지 않는다(노이즈). 기기 화면 오버레이(staging)는 성공까지 전부 보여준다.
 *
 * 환경 판정은 discord.webhook.ts와 동일하게 서버 런타임 env로만 한다.
 * GUINNESS_API_SERVER는 NEXT_PUBLIC_이 아니라 클라 번들에 없으므로 서버 액션으로 내려준다.
 */

export type KisDebugEnv = 'staging' | 'prod' | 'unknown';

const resolveEnv = (): KisDebugEnv => {
  const apiServer = process.env.GUINNESS_API_SERVER ?? '';
  if (apiServer.includes('staging')) return 'staging';
  if (apiServer.includes('prod')) return 'prod';
  return 'unknown';
};

export const getKisDebugEnvAction = async (): Promise<KisDebugEnv> => resolveEnv();

export type KisDebugReport = {
  /** KIS 채널 — 'payment'(D1 결제 / D2 취소 응답) | 'query'(ST 거래상태조회 응답) */
  kind: string;
  /** paymentId 등 어떤 거래에 대한 응답인지 식별용 */
  note?: string;
  /** KIS 응답 raw 전체 */
  payload: Record<string, unknown>;
  kioskId?: number;
  kioskName?: string;
};

// Discord embed 제한: description 4096, field value 1024
const DESCRIPTION_LIMIT = 3600;

/**
 * 성공으로 확정할 수 있는 응답인지. 확정 가능한 성공만 걸러내고, 판정이 애매한 형태는
 * 실패로 취급해 전송한다 — 디버깅 채널이므로 노이즈보다 누락이 더 나쁘다.
 *  - success: true    → D1 결제 성공
 *  - canceled: true   → D2 취소 성공
 *  - outReplyCode 전부 0 ('0000') → KIS 정상 응답
 * (resultCode는 채널별로 미설정 0이 올 수 있어 성공 근거로 쓰지 않는다)
 */
const isSuccessResponse = (payload: Record<string, unknown>): boolean => {
  if (payload.success === true) return true;
  if (payload.canceled === true) return true;
  const reply = payload.outReplyCode;
  if (typeof reply === 'string' && reply.trim() !== '' && /^0+$/.test(reply.trim())) return true;
  return false;
};

export const reportKisResponseAction = async (report: KisDebugReport): Promise<void> => {
  // prod에서만 전송 — staging은 기기 화면 오버레이로 바로 확인한다.
  if (resolveEnv() !== 'prod') return;

  // 실패만 알림 — 성공 건은 채널을 채우기만 하고 볼 일이 없다.
  if (isSuccessResponse(report.payload)) return;

  const url = process.env.KIOSK_KIS_DISCORD_WEBHOOK ?? process.env.NEXT_PUBLIC_DISCORD_ERROR_WEB_HOOK;
  if (!url) {
    console.warn('[kis-debug] Discord webhook 미설정 — KIOSK_KIS_DISCORD_WEBHOOK 또는 NEXT_PUBLIC_DISCORD_ERROR_WEB_HOOK 필요');
    return;
  }

  let raw: string;
  try {
    raw = JSON.stringify(report.payload, null, 2);
  } catch {
    raw = String(report.payload);
  }
  const truncated = raw.length > DESCRIPTION_LIMIT ? `${raw.slice(0, DESCRIPTION_LIMIT)}\n... (truncated)` : raw;

  // 한눈에 볼 수 있게 핵심 코드만 별도 필드로 뽑음 (본문엔 raw 전체가 그대로 들어감)
  const pick = (key: string): string | undefined => {
    const v = report.payload?.[key];
    return typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? String(v) : undefined;
  };

  const fields: { name: string; value: string; inline: boolean }[] = [
    { name: '채널', value: `\`${report.kind}\``, inline: true },
    { name: '키오스크', value: `\`${report.kioskName ?? '-'}${report.kioskId ? ` (#${report.kioskId})` : ''}\``, inline: true },
  ];
  if (report.note) fields.push({ name: '대상', value: `\`${report.note}\``, inline: false });

  const summary = (['outTranCode', 'outReplyCode', 'success', 'canceled', 'outReplyMsg1', 'outCustomerUuid', 'outAuthNo', 'outTotAmt'] as const)
    .map((k) => {
      const v = pick(k);
      return v === undefined ? null : `${k}=${v}`;
    })
    .filter((v): v is string => v !== null)
    .join('\n');
  if (summary) fields.push({ name: '요약', value: `\`\`\`\n${summary.slice(0, 1000)}\n\`\`\``, inline: false });

  const payload = {
    username: '키오스크 KIS 응답',
    embeds: [
      {
        title: `🧾 KIS 응답 — ${report.kind}`,
        description: `\`\`\`json\n${truncated}\n\`\`\``,
        color: 0x5865f2,
        timestamp: new Date().toISOString(),
        fields,
        footer: { text: 'Kiosk → KIS raw relay (prod)' },
      },
    ],
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error('[kis-debug] Discord 전송 실패', await res.text());
  } catch (e) {
    console.error('[kis-debug] Discord 전송 예외', e);
  }
};
