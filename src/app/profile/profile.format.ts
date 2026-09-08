// 프로필 화면(모바일/PC) 공용 포맷터

export const has = (s?: string | null) => !!s && s.trim().length > 0;

const WEEKDAYS: Record<string, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};

export const formatEndDate = (dateStr: string, locale: string) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const wd = (WEEKDAYS[locale] ?? WEEKDAYS['en'])[d.getDay()];
  switch (locale) {
    case 'ko': return `${y}년 ${m}월 ${day}일(${wd}) 까지`;
    case 'jp': return `${y}年${m}月${day}日(${wd}) まで`;
    case 'zh': return `${y}年${m}月${day}日(${wd})`;
    default: return `Until ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${wd})`;
  }
};

export const formatPhone = (phone: string) => {
  const nums = phone.replace(/\D/g, '');
  if (nums.length === 11) return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7)}`;
  if (nums.length === 10) return `${nums.slice(0, 3)}-${nums.slice(3, 6)}-${nums.slice(6)}`;
  return phone;
};

// 'yyyy.MM.dd HH:mm' | 'yyyy-MM-dd HH:mm' (KST) → epoch ms. 서버(UTC)에서 렌더돼도 KST로 고정 해석
const parseKst = (input?: string): number | null => {
  if (!input) return null;
  const m = input.match(/(\d{4})[.-](\d{1,2})[.-](\d{1,2})(?:\D+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, hh = '0', mm = '0'] = m;
  const t = new Date(`${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}T${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00+09:00`).getTime();
  return Number.isNaN(t) ? null : t;
};

const KST_OFFSET = 9 * 60 * 60 * 1000;
const kstDayIndex = (ms: number) => Math.floor((ms + KST_OFFSET) / 86400000);

/**
 * 수업 시작까지 상대 시간 — '10분 후' / '3시간 후' / '내일' / '3일 후' / (7일 넘으면 null → 절대 날짜로 폴백).
 * 이미 시작했으면 '진행 중'.
 */
export const formatRelativeStart = (startDate: string | undefined, locale: string, now: number = Date.now()): string | null => {
  const start = parseKst(startDate);
  if (start == null) return null;
  const diffMin = Math.round((start - now) / 60000);
  const t = {
    ko: { now: '곧 시작', inProgress: '진행 중', min: (n: number) => `${n}분 후`, hour: (n: number) => `${n}시간 후`, tomorrow: '내일', day: (n: number) => `${n}일 후` },
    en: { now: 'Starting soon', inProgress: 'In progress', min: (n: number) => `in ${n} min`, hour: (n: number) => `in ${n}h`, tomorrow: 'Tomorrow', day: (n: number) => `in ${n} days` },
    jp: { now: 'まもなく', inProgress: '進行中', min: (n: number) => `${n}分後`, hour: (n: number) => `${n}時間後`, tomorrow: '明日', day: (n: number) => `${n}日後` },
    zh: { now: '即将开始', inProgress: '进行中', min: (n: number) => `${n}分钟后`, hour: (n: number) => `${n}小时后`, tomorrow: '明天', day: (n: number) => `${n}天后` },
  }[locale] ?? { now: 'Starting soon', inProgress: 'In progress', min: (n: number) => `in ${n} min`, hour: (n: number) => `in ${n}h`, tomorrow: 'Tomorrow', day: (n: number) => `in ${n} days` };

  if (diffMin < 0) return t.inProgress;
  if (diffMin < 1) return t.now;
  if (diffMin < 60) return t.min(diffMin);
  const dayDiff = kstDayIndex(start) - kstDayIndex(now);
  if (dayDiff === 0) return t.hour(Math.round(diffMin / 60));
  if (dayDiff === 1) return t.tomorrow;
  if (dayDiff <= 7) return t.day(dayDiff);
  return null;
};

/** 종료일('yyyy.MM.dd' | 'yyyy-MM-dd') 기준 D-day. 지났으면 null */
export const ddayLabel = (endDate?: string, now: number = Date.now()): string | null => {
  const end = parseKst(endDate);
  if (end == null) return null;
  const diff = kstDayIndex(end) - kstDayIndex(now);
  if (diff < 0) return null;
  return diff === 0 ? 'D-Day' : `D-${diff}`;
};
