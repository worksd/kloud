import { NextRequest, NextResponse } from 'next/server';

/**
 * 광고 신청 Mock 백엔드 (토큰 불필요, 공개 엔드포인트).
 * - POST /api/ads/apply : multipart/form-data 로 광고 신청 접수 → { success, id }
 * - GET  /api/ads/apply : 접수된 신청 목록 (mock 관리용)
 * 실제 DB/스토리지 없이 모듈 메모리에 보관하고 이미지는 메타데이터만 기록한다.
 */

export type AdApplicationType = 'banner' | 'popup' | 'home_feed' | 'studio_detail' | 'etc';

export type AdApplicationRecord = {
  id: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  title: string;
  adType: AdApplicationType;
  content: string;
  landingUrl?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  note?: string;
  images: { name: string; size: number; type: string }[];
  createdAt: string;
};

// mock 저장소 — 프로세스 메모리. 서버 재시작 시 초기화.
const submissions: AdApplicationRecord[] = [];

const REQUIRED_FIELDS: { key: keyof AdApplicationRecord; label: string }[] = [
  { key: 'companyName', label: '회사/광고주명' },
  { key: 'contactName', label: '담당자 이름' },
  { key: 'contactEmail', label: '연락처 이메일' },
  { key: 'title', label: '광고 제목' },
  { key: 'content', label: '광고 내용' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AD_TYPES: AdApplicationType[] = ['banner', 'popup', 'home_feed', 'studio_detail', 'etc'];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const str = (k: string) => ((form.get(k) as string | null) ?? '').trim();

    const record: AdApplicationRecord = {
      id: `AD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1e4).toString().padStart(4, '0')}`,
      companyName: str('companyName'),
      contactName: str('contactName'),
      contactEmail: str('contactEmail'),
      contactPhone: str('contactPhone') || undefined,
      title: str('title'),
      adType: (AD_TYPES.includes(str('adType') as AdApplicationType) ? str('adType') : 'banner') as AdApplicationType,
      content: str('content'),
      landingUrl: str('landingUrl') || undefined,
      startDate: str('startDate') || undefined,
      endDate: str('endDate') || undefined,
      budget: str('budget') ? Number(str('budget').replace(/[^\d]/g, '')) : undefined,
      note: str('note') || undefined,
      images: form.getAll('images')
        .filter((v): v is File => v instanceof File && v.size > 0)
        .map((f) => ({ name: f.name, size: f.size, type: f.type })),
      createdAt: new Date().toISOString(),
    };

    // 필수값 검증
    const missing = REQUIRED_FIELDS.filter((f) => !record[f.key]);
    if (missing.length > 0) {
      return NextResponse.json(
        { success: false, message: `${missing.map((m) => m.label).join(', ')}을(를) 입력해주세요.` },
        { status: 400 },
      );
    }
    if (!EMAIL_RE.test(record.contactEmail)) {
      return NextResponse.json({ success: false, message: '이메일 형식이 올바르지 않습니다.' }, { status: 400 });
    }
    if (record.images.length === 0) {
      return NextResponse.json({ success: false, message: '광고 이미지를 1개 이상 첨부해주세요.' }, { status: 400 });
    }

    submissions.push(record);
    // mock — 실제 처리 대신 서버 로그로 접수 확인
    console.log('[ad-apply] 신청 접수:', { id: record.id, company: record.companyName, images: record.images.length });

    return NextResponse.json({ success: true, id: record.id }, { status: 201 });
  } catch (e) {
    console.error('[ad-apply] 처리 실패', e);
    return NextResponse.json({ success: false, message: '신청 처리에 실패했습니다. 다시 시도해주세요.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ count: submissions.length, submissions });
}
