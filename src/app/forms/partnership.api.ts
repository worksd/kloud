// 제휴 신청 화면(form.rawgraphy.com)이 부르는 파트너 공개 API.
// BE(guinness)에 제휴가 아직 없어 파트너 관리자(worksd_partner_fe)의 목업 라우트가 계약이다.
// 호출은 전부 서버 컴포넌트/서버 액션에서만 한다 — 브라우저에서 직접 부르면 CORS에 걸린다.

export type PublicPartnershipQuestion = {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiSelect';
  options?: string[];
  required?: boolean;
};

export type PublicNextTier = { minCount: number; pricePerPerson: number; remaining: number } | null;

export type PublicPartnership = {
  code: string;
  title: string;
  description: string | null;
  lessons: {
    lessonId: number;
    title: string;
    artistName: string | null;
    startDate: string | null;
    thumbnailUrl: string | null;
  }[];
  questions: PublicPartnershipQuestion[];
  tiers: { minCount: number; pricePerPerson: number }[];
  maxHeadcount: number | null;
  applyDeadline: string | null;
  paymentDeadline: string | null;
  status: 'Open' | 'Closed' | 'Paid' | 'Cancelled';
  applicantCount: number;
  /** 서버가 계산해 내려주는 값 — 화면은 표시만 한다(계산식 복제 금지). */
  unitPrice: number;
  nextTier: PublicNextTier;
  formOpen: boolean;
  closedReason: 'DEADLINE_PASSED' | 'HEADCOUNT_FULL' | 'ALREADY_PAID' | 'CANCELLED' | null;
};

export type ApplyResult = {
  applicantId: number;
  appliedAt: string;
  /** 나까지 포함한 현재 인원 */
  applicantCount: number;
  unitPrice: number;
  nextTier: PublicNextTier;
};

export type ApplyError = { code: string; message: string; questionId?: string };

const base = () => process.env.PARTNER_API_BASE_URL ?? 'http://localhost:3000';

export const getPublicPartnership = async (
  code: string
): Promise<{ ok: true; data: PublicPartnership } | { ok: false; status: number }> => {
  try {
    const res = await fetch(`${base()}/api/public/partnerships/${encodeURIComponent(code)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, data: (await res.json()) as PublicPartnership };
  } catch {
    return { ok: false, status: 0 };
  }
};

// ── 파트너십 신청(제휴 요청) ─────────────────────────────────────
// 구성원 신청(위)보다 한 단계 앞이다: 단체 담당자가 스튜디오에 "파트너십 하고 싶어요" 를 보내고,
// 스튜디오가 관리자에서 승인하면 그때 제휴가 만들어져 구성원 신청 링크(/lessons/{code})가 나온다.

export type PartnershipOrganizationType = 'Company' | 'School' | 'Club' | 'Other';

export type PartnershipRequestBody = {
  /** guinness 스튜디오 id — 어느 스튜디오 관리자에게 보일지 */
  studioId: number;
  studioName: string;
  organizationName: string;
  organizationType: PartnershipOrganizationType;
  expectedHeadcount: number;
  desiredPeriod?: string;
  content?: string;
  contactName: string;
  phone: string;
  email?: string;
  memo?: string;
};

export type PartnershipRequestResult = { requestId: number; requestedAt: string };

export const postPartnershipRequest = async (
  body: PartnershipRequestBody
): Promise<{ ok: true; data: PartnershipRequestResult } | { ok: false; status: number; error: ApplyError }> => {
  try {
    const res = await fetch(`${base()}/api/public/partnership-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: json ?? { code: 'UNKNOWN', message: '잠시 후 다시 시도해 주세요.' },
      };
    }
    return { ok: true, data: json as PartnershipRequestResult };
  } catch {
    return { ok: false, status: 0, error: { code: 'NETWORK', message: '네트워크 연결을 확인해 주세요.' } };
  }
};

export const postPartnershipApplicant = async (
  code: string,
  body: { name: string; phone: string; memo?: string; answers: Record<string, string | string[]> }
): Promise<{ ok: true; data: ApplyResult } | { ok: false; status: number; error: ApplyError }> => {
  try {
    const res = await fetch(`${base()}/api/public/partnerships/${encodeURIComponent(code)}/applicants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: json ?? { code: 'UNKNOWN', message: '잠시 후 다시 시도해 주세요.' },
      };
    }
    return { ok: true, data: json as ApplyResult };
  } catch {
    return { ok: false, status: 0, error: { code: 'NETWORK', message: '네트워크 연결을 확인해 주세요.' } };
  }
};
