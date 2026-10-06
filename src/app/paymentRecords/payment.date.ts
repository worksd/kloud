// 결제 시각 표시용 — createdAt('yyyy.MM.dd HH:mm' | 'yyyy-MM-dd HH:mm', KST)을 날짜 그룹 라벨 + 시각으로 나눈다.
// 서버(UTC)에서 렌더돼도 KST 기준으로 '오늘/어제'를 판정한다.

const KST_OFFSET = 9 * 60 * 60 * 1000;
const WEEKDAYS: Record<string, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};
const RELATIVE: Record<string, { today: string; yesterday: string }> = {
  ko: { today: '오늘', yesterday: '어제' },
  en: { today: 'Today', yesterday: 'Yesterday' },
  jp: { today: '今日', yesterday: '昨日' },
  zh: { today: '今天', yesterday: '昨天' },
};

export type ParsedPaymentDate = {
  /** 그룹 키 'yyyy-MM-dd' */
  dateKey: string;
  /** 섹션 헤더 — '오늘' / '어제' / '9월 8일 (화)' / '2025년 12월 3일 (수)' */
  dateLabel: string;
  /** 행 표시 — '오후 3:12' / '3:12 PM' */
  timeLabel: string;
};

export const parsePaymentDate = (createdAt: string | undefined, locale: string, now: number = Date.now()): ParsedPaymentDate | null => {
  if (!createdAt) return null;
  const m = createdAt.match(/(\d{4})[.-](\d{1,2})[.-](\d{1,2})(?:\D+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  const hh = m[4] != null ? Number(m[4]) : null;
  const mi = m[5] != null ? Number(m[5]) : 0;

  const dateKey = `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const dayMs = Date.UTC(y, mo - 1, d); // KST 자정을 UTC 자정처럼 취급해 날짜 차만 계산
  const nowKst = new Date(now + KST_OFFSET);
  const todayMs = Date.UTC(nowKst.getUTCFullYear(), nowKst.getUTCMonth(), nowKst.getUTCDate());
  const dayDiff = Math.round((todayMs - dayMs) / 86400000);
  const weekday = (WEEKDAYS[locale] ?? WEEKDAYS.en)[new Date(dayMs).getUTCDay()];
  const rel = RELATIVE[locale] ?? RELATIVE.en;
  const sameYear = nowKst.getUTCFullYear() === y;

  let dateLabel: string;
  if (dayDiff === 0) dateLabel = rel.today;
  else if (dayDiff === 1) dateLabel = rel.yesterday;
  else {
    switch (locale) {
      case 'ko': dateLabel = sameYear ? `${mo}월 ${d}일 (${weekday})` : `${y}년 ${mo}월 ${d}일 (${weekday})`; break;
      case 'jp': dateLabel = sameYear ? `${mo}月${d}日 (${weekday})` : `${y}年${mo}月${d}日 (${weekday})`; break;
      case 'zh': dateLabel = sameYear ? `${mo}月${d}日 (周${weekday})` : `${y}年${mo}月${d}日 (周${weekday})`; break;
      default: {
        const month = new Date(dayMs).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
        dateLabel = sameYear ? `${weekday}, ${month} ${d}` : `${weekday}, ${month} ${d}, ${y}`;
      }
    }
  }

  let timeLabel = '';
  if (hh != null) {
    const mm = String(mi).padStart(2, '0');
    const h12 = hh % 12 === 0 ? 12 : hh % 12;
    switch (locale) {
      case 'ko': timeLabel = `${hh < 12 ? '오전' : '오후'} ${h12}:${mm}`; break;
      case 'jp': timeLabel = `${hh < 12 ? '午前' : '午後'} ${h12}:${mm}`; break;
      case 'zh': timeLabel = `${hh < 12 ? '上午' : '下午'} ${h12}:${mm}`; break;
      default: timeLabel = `${h12}:${mm} ${hh < 12 ? 'AM' : 'PM'}`;
    }
  }

  return { dateKey, dateLabel, timeLabel };
};
