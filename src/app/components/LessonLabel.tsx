'use client'
import { LessonType } from "@/entities/lesson/lesson";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";

// 장르 한글 매핑 — BE 키 그대로(케이싱 다양성 대비 lowercase). 매핑에 없으면 원문 그대로.
// Default는 호출부에서 미리 거르므로(=노출 X) 매핑하지 않음.
const KO_GENRE_MAP: Record<string, string> = {
  choreography: '코레오',
  breaking: '브레이킹',
  poppin: '팝핀',
  popping: '팝핀',           // BE 표준은 Poppin이지만 변형 대비
  locking: '락킹',
  waacking: '왁킹',
  hiphop: '힙합',
  'hip-hop': '힙합',          // 변형 대비
  house: '하우스',
  jazz: '재즈',
  krump: '크럼프',
  'k-pop': '케이팝',
  kpop: '케이팝',             // 변형 대비
  girlish: '걸리쉬',
  voguing: '보깅',
  afro: '아프로',
  heel: '힐',
  heels: '힐',                // 변형 대비
};

// 장르 라벨 — 원래 디자인(연회색 배경 + 회색 글씨). ko면 한글 매핑, 그 외는 원문.
export const LessonLabel = ({label, locale}: { label: string; locale?: Locale }) => {
  const display = locale === 'ko'
    ? (KO_GENRE_MAP[label.toLowerCase()] ?? label)
    : label;
  return (
    <div
      className="inline-block px-1 py-0.5 rounded-[6px] text-[12px] font-paperlogy bg-[#F5F5F8] text-[#707070] shadow-sm backdrop-blur-sm">
      {display}
    </div>
  );
};

// 수업 타입(워크샵/팝업/오디션/정규) — 원래 디자인(반투명 검정 배경 + 흰 글씨)으로 롤백
export const LessonTypeLabel = ({type, locale}: { type: LessonType, locale: Locale }) => {
  const labelKey = getLessonType({type});

  if (!labelKey) return null;

  return (
    <div className="inline-block px-1 py-0.5 rounded-[4px] text-[12px] font-paperlogy bg-[rgba(0,0,0,0.5)] text-white shadow-sm backdrop-blur-sm">
      {getLocaleString({locale, key: labelKey})}
    </div>
  );
};


export const LessonPosterTypeLabel = ({label}: { label: string }) => {
  if (label == 'Default') return;
  return (
    <div
      className="absolute top-0 left-0 text-white text-[12px] font-bold py-[6px] pl-[12px] pr-[8px] rounded-tl-[16px] rounded-br-[10px] font-paperlogy"
      style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
    >
      {label}
    </div>
  )
}

// BE는 'Beginner' | 'Basic' | 'Advanced'를 영문으로 내려줌. ko에서만 한글로 매핑, 그 외는 원문 노출.
const KO_LEVEL_MAP: Record<string, string> = {
  Beginner: '입문',
  Basic: '기초',
  Advanced: '심화',
};

// 난이도별 색상 — Advanced(와인), Basic(코발트 블루), Beginner(노란색). 매핑에 없는 값은 검정 폴백.
const LEVEL_STYLE: Record<string, string> = {
  Advanced: 'bg-[#7A1F2C] text-white',
  Basic:    'bg-[#0047AB] text-white',
  Beginner: 'bg-[#FACC15] text-black',
};
const LEVEL_STYLE_FALLBACK = 'bg-black text-white';

export const LessonLevelLabel = ({label, locale}: { label: string; locale?: Locale }) => {
  const display = locale === 'ko' ? (KO_LEVEL_MAP[label] ?? label) : label;
  const style = LEVEL_STYLE[label] ?? LEVEL_STYLE_FALLBACK;
  return (
    <div
      className={`inline-block px-1.5 py-0.5 rounded-[4px] text-[12px] font-paperlogy shadow-sm backdrop-blur-sm ${style}`}>
      {display}
    </div>
  );
}

const getLessonType = ({
                         type,
                       }: {
  type: LessonType;
}): StringResourceKey | undefined => {
  if (type === LessonType.Regular) {
    return 'regular';
  } else if (type == LessonType.Audition) {
    return 'audition';
  } else if (type == LessonType.PopUp) {
    return 'popup';
  } else if (type == LessonType.Workshop) {
    return 'workshop';
  }

  return undefined;
};
