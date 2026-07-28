import { Locale } from "@/shared/StringResource";

// 수업 시각을 '벽시계' 기준 로컬 Date로 파싱한다.
// startDate가 '...Z'(UTC)로 와도 타임존 변환을 하지 않고 리터럴 연-월-일-시-분을 그대로 쓴다.
// 우선순위: date(yyyy-MM-dd)+startTime(HH:mm) → startDate의 리터럴 구성요소.
export type LessonWhen = { date?: string; startTime?: string; startDate?: string };

const REL_WEEKDAYS: Record<Locale, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  jp: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
};
const LOCALE_TAG: Record<Locale, string> = { ko: 'ko-KR', en: 'en-US', jp: 'ja-JP', zh: 'zh-CN' };

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const mondayOf = (d: Date) => {
  const s = startOfDay(d);
  const day = s.getDay();
  s.setDate(s.getDate() - (day === 0 ? 6 : day - 1));
  return s;
};
const fmtTime = (d: Date, locale: Locale) => {
  if (locale === 'ko') {
    const h = d.getHours();
    // 오전(0~11) / 오후(12~17) / 저녁(18~23)
    const ap = h < 12 ? '오전' : h < 18 ? '오후' : '저녁';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${ap} ${h12}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return new Intl.DateTimeFormat(LOCALE_TAG[locale], { hour: 'numeric', minute: '2-digit' }).format(d);
};

export const parseLessonWallClock = (lesson: LessonWhen): Date | null => {
  // 구분자는 '-'(ISO) / '.'(KST 표기), 구분은 'T' 또는 공백 모두 허용. TZ 변환 없이 리터럴만.
  // 시각까지 담긴 startDate를 우선(‘date’만 있으면 시간이 00:00로 잡혀 '오전 12:00'이 되므로).
  if (lesson.startDate) {
    const m = lesson.startDate.match(/(\d{4})[-.](\d{1,2})[-.](\d{1,2})[T\s](\d{1,2}):(\d{2})/);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
  }
  if (lesson.date) {
    const dm = lesson.date.match(/(\d{4})[-.](\d{1,2})[-.](\d{1,2})/);
    if (!dm) return null;
    let h = 0, mi = 0;
    if (lesson.startTime) {
      const tm = lesson.startTime.match(/(\d{1,2}):(\d{2})/);
      if (tm) { h = Number(tm[1]); mi = Number(tm[2]); }
    }
    return new Date(Number(dm[1]), Number(dm[2]) - 1, Number(dm[3]), h, mi);
  }
  return null;
};

// 월 몇째 주 라벨 (예: "7월 셋째 주") — ISO week(목요일 기준) 계산.
export const getMonthWeekLabel = (baseDate: Date, locale: Locale): string => {
  const monday = mondayOf(baseDate);
  const thursday = new Date(monday);
  thursday.setDate(monday.getDate() + 3);
  const month = thursday.getMonth();
  const year = thursday.getFullYear();
  const firstDayOfMonth = new Date(year, month, 1);
  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));
  const weekIndex = Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 86400000));
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const weekNames = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째'];
  if (locale === 'ko') return `${month + 1}월 ${weekNames[weekIndex] ?? `${weekIndex + 1}번째`} 주`;
  if (locale === 'jp') return `${month + 1}月 第${weekIndex + 1}週`;
  if (locale === 'zh') return `${month + 1}月 第${weekIndex + 1}周`;
  return `Week ${weekIndex + 1} of ${monthNames[month]}`;
};

// 주 단위 상대 접두어 — 이번주/다음주/지난주, 그 밖은 '7월 셋째 주' 등 월-주차 라벨.
export const getRelativeWeekPrefix = (baseDate: Date, refDate: Date, locale: Locale): string => {
  const diff = Math.round((mondayOf(baseDate).getTime() - mondayOf(refDate).getTime()) / (7 * 86400000));
  const rel = {
    ko: { this: '이번주', next: '다음주', prev: '지난주' },
    en: { this: 'this week', next: 'next week', prev: 'last week' },
    jp: { this: '今週', next: '来週', prev: '先週' },
    zh: { this: '本周', next: '下周', prev: '上周' },
  }[locale];
  if (diff === 0) return rel.this;
  if (diff === 1) return rel.next;
  if (diff === -1) return rel.prev;
  return getMonthWeekLabel(baseDate, locale);
};

// 수업 시각 → 상대 날짜 + 시각. 오늘/내일/모레 · 이번 주/다음 주 요일 · 그 외 날짜.
export const formatRelativeLessonDate = (lesson: LessonWhen, locale: Locale): string => {
  const d = parseLessonWallClock(lesson);
  if (!d) return '';
  const now = new Date();
  const dayDiff = Math.round((startOfDay(d).getTime() - startOfDay(now).getTime()) / 86400000);
  const weekDiff = Math.round((mondayOf(d).getTime() - mondayOf(now).getTime()) / (7 * 86400000));
  const wd = REL_WEEKDAYS[locale][d.getDay()];
  const time = fmtTime(d, locale);

  let dayLabel: string;
  if (dayDiff === 0) dayLabel = { ko: '오늘', en: 'Today', jp: '今日', zh: '今天' }[locale];
  else if (dayDiff === 1) dayLabel = { ko: '내일', en: 'Tomorrow', jp: '明日', zh: '明天' }[locale];
  else if (dayDiff >= 2 && weekDiff === 0) dayLabel = { ko: `이번주 ${wd}요일`, en: `This ${wd}`, jp: `今週${wd}曜`, zh: `本周${wd}` }[locale];
  else if (weekDiff === 1) dayLabel = { ko: `다음주 ${wd}요일`, en: `Next ${wd}`, jp: `来週${wd}曜`, zh: `下周${wd}` }[locale];
  else {
    const md = locale === 'ko'
      ? `${d.getMonth() + 1}월 ${d.getDate()}일 (${wd})`
      : new Intl.DateTimeFormat(LOCALE_TAG[locale], { month: 'short', day: 'numeric', weekday: 'short' }).format(d);
    return `${md} ${time}`;
  }
  return `${dayLabel} ${time}`;
};
