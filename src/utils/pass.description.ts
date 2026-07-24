import { Locale } from "@/shared/StringResource";

/**
 * 패스권 rule/feature description 생성 유틸
 *
 * 서버 description에 의존하지 않고, 클라이언트에서 key+value 기반으로 문구를 생성합니다.
 */

// ── Rule Description ──

interface RuleDescriptionInput {
  target: { type: string; label?: string | null };
  benefit: { type: string; value?: number | null; startTime?: string | null; endTime?: string | null };
  duration?: number | string | null;
  excludes?: { type: string; label?: string | null }[];
}

// 시간대(HH:mm~HH:mm) 문구 조각. 둘 중 하나라도 없으면 빈 문자열.
const timeWindow = (startTime?: string | null, endTime?: string | null): string =>
  startTime && endTime ? `${startTime}~${endTime}` : '';

const RULE_TARGET: Record<string, Record<Locale, (label?: string | null, passName?: string) => string>> = {
  All: {
    ko: () => '수업',
    en: () => 'classes',
    jp: () => 'レッスン',
    zh: () => '课程',
  },
  Genre: {
    ko: (label) => `${label ?? ''} 수업`,
    en: (label) => `${label ?? ''} classes`,
    jp: (label) => `${label ?? ''} レッスン`,
    zh: (label) => `${label ?? ''} 课程`,
  },
  LessonType: {
    ko: (label) => `${label ?? ''} 수업`,
    en: (label) => `${label ?? ''} classes`,
    jp: (label) => `${label ?? ''} レッスン`,
    zh: (label) => `${label ?? ''} 课程`,
  },
  Exclusive: {
    ko: (_label, passName) => `${passName || ''} 전용 수업`.trim(),
    en: (_label, passName) => `${passName || ''} exclusive classes`.trim(),
    jp: (_label, passName) => `${passName || ''} 専用レッスン`.trim(),
    zh: (_label, passName) => `${passName || ''} 专属课程`.trim(),
  },
  Artist: {
    ko: (label) => `${label ?? ''} 강사의 수업`,
    en: (label) => `${label ?? ''}'s classes`,
    jp: (label) => `${label ?? ''} 講師のレッスン`,
    zh: (label) => `${label ?? ''} 老师的课程`,
  },
  PracticeRoom: {
    ko: () => '연습실',
    en: () => 'practice room',
    jp: () => '練習室',
    zh: () => '练习室',
  },
};

// 분(minutes) → 로케일별 '3시간' / '1시간 30분' / '45분' 표기
export const formatMinutes = (minutes: number, locale: Locale): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const unit = { ko: { h: '시간', m: '분' }, en: { h: 'h', m: 'm' }, jp: { h: '時間', m: '分' }, zh: { h: '小时', m: '分钟' } }[locale];
  if (h > 0 && m > 0) return locale === 'en' ? `${h}${unit.h} ${m}${unit.m}` : `${h}${unit.h} ${m}${unit.m}`;
  if (h > 0) return `${h}${unit.h}`;
  return `${m}${unit.m}`;
};

const RULE_BENEFIT: Record<string, Record<Locale, (value?: number | null, duration?: number | string | null, win?: string) => string>> = {
  Unlimited: {
    ko: () => '무제한으로 이용할 수 있어요',
    en: () => 'can be used unlimited',
    jp: () => '無制限で利用できます',
    zh: () => '可以无限使用',
  },
  // 특정 시간대(startTime~endTime) 무제한 이용권. 시간대 없으면 일반 무제한과 동일.
  UnlimitedWindow: {
    ko: (_v, _d, win) => win ? `${win}에 무제한으로 이용할 수 있어요` : '무제한으로 이용할 수 있어요',
    en: (_v, _d, win) => win ? `can be used unlimited from ${win}` : 'can be used unlimited',
    jp: (_v, _d, win) => win ? `${win}に無制限で利用できます` : '無制限で利用できます',
    zh: (_v, _d, win) => win ? `在${win}时段内可以无限使用` : '可以无限使用',
  },
  FreeCount: {
    ko: (v) => `${v ?? 0}회 수강할 수 있어요`,
    en: (v) => `can be used ${v ?? 0} times`,
    jp: (v) => `${v ?? 0}回受講できます`,
    zh: (v) => `可以使用${v ?? 0}次`,
  },
  UnlimitedDay: {
    ko: (v, d) => `${d ?? 0}일 중 ${v ?? 0}일을 골라 원하는 수업을 수강할 수 있어요`,
    en: (v, d) => `choose ${v ?? 0} days out of ${d ?? 0} and attend any class`,
    jp: (v, d) => `${d ?? 0}日のうち${v ?? 0}日を選んでお好きなレッスンを受講できます`,
    zh: (v, d) => `在${d ?? 0}天内自由选择${v ?? 0}天上课`,
  },
  Discount: {
    ko: (v) => `${(v ?? 0).toLocaleString('ko-KR')}원 할인 받을 수 있어요`,
    en: (v) => `get ${(v ?? 0).toLocaleString()} won discount`,
    jp: (v) => `${(v ?? 0).toLocaleString()}ウォン割引を受けられます`,
    zh: (v) => `可以获得${(v ?? 0).toLocaleString()}韩元折扣`,
  },
  // 연습실 시간권 — value는 분(minutes). '3시간 이용할 수 있어요'
  TimeMinutes: {
    ko: (v) => `${formatMinutes(v ?? 0, 'ko')} 이용할 수 있어요`,
    en: (v) => `can be used for ${formatMinutes(v ?? 0, 'en')}`,
    jp: (v) => `${formatMinutes(v ?? 0, 'jp')}利用できます`,
    zh: (v) => `可以使用${formatMinutes(v ?? 0, 'zh')}`,
  },
};

const CONNECTOR: Record<Locale, string> = {
  ko: '을 ',
  en: ' ',
  jp: 'を',
  zh: '',
};

const EXCLUDE_PREFIX: Record<Locale, string> = {
  ko: ' (단, ',
  en: ' (except ',
  jp: ' (ただし、',
  zh: ' (但',
};

const EXCLUDE_SUFFIX: Record<Locale, string> = {
  ko: ' 제외)',
  en: ')',
  jp: ' 除く)',
  zh: ' 除外)',
};

const EXCLUDE_TYPE: Record<string, Record<Locale, (label?: string | null) => string>> = {
  Genre: {
    ko: (label) => `${label} 장르`,
    en: (label) => `${label} genre`,
    jp: (label) => `${label} ジャンル`,
    zh: (label) => `${label} 类型`,
  },
  Artist: {
    ko: (label) => `${label} 강사`,
    en: (label) => `${label}`,
    jp: (label) => `${label} 講師`,
    zh: (label) => `${label} 老师`,
  },
};

const ALL_TARGET_DISCOUNT: Record<Locale, string> = {
  ko: '모든 수업',
  en: 'all classes',
  jp: '全てのレッスン',
  zh: '所有课程',
};

export const formatRuleDescription = (rule: RuleDescriptionInput, locale: Locale = 'ko', passName?: string): string => {
  const isAllDiscount = rule.target.type === 'All' && rule.benefit.type === 'Discount';
  const targetFn = RULE_TARGET[rule.target.type] ?? RULE_TARGET['All'];
  const targetText = isAllDiscount
    ? ALL_TARGET_DISCOUNT[locale]
    : targetFn[locale](rule.target.label, passName);

  const benefitFn = RULE_BENEFIT[rule.benefit.type] ?? RULE_BENEFIT['FreeCount'];
  const benefitText = benefitFn[locale](rule.benefit.value, rule.duration, timeWindow(rule.benefit.startTime, rule.benefit.endTime));

  // UnlimitedDay 문구는 자체에 "원하는 수업을"이 포함된 완결 문장이라 target prefix를 붙이지 않는다.
  let sentence = rule.benefit.type === 'UnlimitedDay'
    ? benefitText
    : `${targetText}${CONNECTOR[locale]}${benefitText}`;

  if (rule.excludes && rule.excludes.length > 0) {
    const excludeTexts = rule.excludes.map((ex) => {
      const fn = EXCLUDE_TYPE[ex.type]?.[locale];
      return fn ? fn(ex.label) : `${ex.label}`;
    });
    sentence += `${EXCLUDE_PREFIX[locale]}${excludeTexts.join(', ')}${EXCLUDE_SUFFIX[locale]}`;
  }

  return sentence;
};

// ── Feature Description ──

export const FEATURE_LABELS: Record<string, Record<Locale, string>> = {
  canPrePurchase: {
    ko: '사전구매 가능',
    en: 'Pre-purchase',
    jp: '事前購入可能',
    zh: '可提前购买',
  },
  priorityEntry: {
    ko: '우선입장',
    en: 'Priority entry',
    jp: '優先入場',
    zh: '优先入场',
  },
  practiceRoom: {
    ko: '연습실 이용',
    en: 'Practice room',
    jp: '練習室利用',
    zh: '练习室使用',
  },
  tag: {
    ko: '전용수업 태그',
    en: 'Exclusive tag',
    jp: '専用レッスンタグ',
    zh: '专属课程标签',
  },
};

const FEATURE_DESC: Record<string, Record<Locale, (value?: string | null) => string>> = {
  canPrePurchase: {
    ko: () => '수업을 선예약 기간에 미리 신청할 수 있어요',
    en: () => 'You can reserve classes during the pre-booking period',
    jp: () => 'レッスンを先行予約期間に事前申請できます',
    zh: () => '可以在预约期间提前申请课程',
  },
  priorityEntry: {
    ko: () => '수업 입장시 우선적으로 입장할 수 있어요',
    en: () => 'You can enter the class with priority',
    jp: () => 'レッスン入場時に優先的に入場できます',
    zh: () => '上课时可以优先入场',
  },
  practiceRoom: {
    ko: (v) => Number(v) > 0 ? `연습실을 ${v}분 이용할 수 있어요` : '연습실을 이용할 수 있어요',
    en: (v) => Number(v) > 0 ? `You can use the practice room for ${v} minutes` : 'You can use the practice room',
    jp: (v) => Number(v) > 0 ? `練習室を${v}分利用できます` : '練習室を利用できます',
    zh: (v) => Number(v) > 0 ? `可以使用练习室${v}分钟` : '可以使用练习室',
  },
  tag: {
    ko: (v) => v ? `${v} 전용 수업을 수강할 수 있어요` : '전용 수업을 수강할 수 있어요',
    en: (v) => v ? `You can take ${v} exclusive classes` : 'You can take exclusive classes',
    jp: (v) => v ? `${v} 専用レッスンを受講できます` : '専用レッスンを受講できます',
    zh: (v) => v ? `可以参加${v}专属课程` : '可以参加专属课程',
  },
};

export const formatFeatureDescription = (key: string, locale: Locale = 'ko', value?: string | null): string => {
  const fn = FEATURE_DESC[key]?.[locale];
  return fn ? fn(value) : '';
};
