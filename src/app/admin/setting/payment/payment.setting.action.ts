'use server'

import { api } from '@/app/api.client';
import { CreateBillingRequest, GetBillingResponse } from '@/app/endpoint/billing.endpoint';
import { StudioSubscriptionResponse } from '@/app/endpoint/studio.endpoint';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import { updateStudioAction } from '@/app/admin/setting/studio.setting.action';

// 관리자 설정 > 요금제·결제수단 — 설정>결제 연동 가이드(2026-10-04) 기준.

/** GET /studios/me/subscription — 실패면 null */
export const getStudioSubscriptionAction = async (): Promise<StudioSubscriptionResponse | null> => {
  try {
    const res = await api.studio.getMySubscription({});
    if (isGuinnessErrorCase(res) || !('id' in res)) return null;
    return res;
  } catch {
    return null;
  }
};

export type BillingCard = Required<Pick<GetBillingResponse, 'billingKey'>> & Pick<GetBillingResponse, 'userId' | 'cardNumber' | 'cardName' | 'createdAt'>;

/** GET /billing — 토큰 유저가 등록한 카드. 서버가 정렬하지 않으므로 createdAt 내림차순으로 맞춘다. 실패면 null */
export const getBillingCardsAction = async (): Promise<BillingCard[] | null> => {
  try {
    const res = await api.billing.get({});
    if (isGuinnessErrorCase(res) || !('billings' in res)) return null;
    const cards = res.billings.filter((b): b is BillingCard => typeof b.billingKey === 'string' && b.billingKey.length > 0);
    return [...cards].sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  } catch {
    return null;
  }
};

export type AddBillingResult = { ok: true; billingKey: string } | { ok: false; message: string };

/**
 * POST /billing — HTTP 상태가 아니라 본문으로 분기한다.
 *  - { billingKey } → 성공 (카드 정보는 없으니 목록 재조회)
 *  - { success: false, pgMessage } → PG 거절/타임아웃. PortOne 원문을 그대로 보여준다
 *  - { code, message } → 서버 예외 (PAYMENT_METHOD_ALREADY_REGISTERED 등)
 *  - 그 외 → 고정 문구 + 본문 일부
 */
export const addBillingCardAction = async (req: CreateBillingRequest): Promise<AddBillingResult> => {
  try {
    const res: unknown = await api.billing.create(req);
    if (res && typeof res === 'object') {
      const r = res as GetBillingResponse & { code?: string; message?: string };
      if (typeof r.billingKey === 'string' && r.billingKey) return { ok: true, billingKey: r.billingKey };
      if (r.success === false) return { ok: false, message: r.pgMessage || '결제 수단 등록에 실패했습니다' };
      if (isGuinnessErrorCase(res)) return { ok: false, message: res.message || `등록하지 못했어요 (${res.code})` };
    }
    return { ok: false, message: `등록하지 못했어요. 서버 응답 형식이 예상과 다릅니다: ${JSON.stringify(res)?.slice(0, 200) ?? String(res)}` };
  } catch (e) {
    const reason = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `요청을 보내지 못했어요: ${reason}` };
  }
};

/** PATCH /studios { representativeBillingKey } — 원장 계정만. 서버는 키를 검증하지 않으므로 목록에 있는 키만 보낸다 */
export const setRepresentativeBillingAction = async (billingKey: string) => {
  return await updateStudioAction({ representativeBillingKey: billingKey });
};
