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
