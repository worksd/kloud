// TODO(2026-10-23): 점보트론 목 데이터 — UI 확인용 임시 코드. 서버 필드(openDate·saleStartDate·level·remainingSeats) 붙으면 main 배포 전 반드시 삭제할 것.
import type { JumbotronItem } from "@/app/home/Jumbotron";
import { LessonType } from "@/entities/lesson/lesson";
import { LessonStatus } from "@/app/endpoint/lesson.endpoint";

/**
 * 점보트론 목 데이터 (개발 전용, 2026-10-23) — 서버 필드(openDate·saleStartDate·level·remainingSeats) 추가 전 UI 확인용.
 * 시각은 지금 기준 상대값이라 카운트다운이 항상 살아 있다.
 */
const IMG = 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/event/haulstudio.jpeg';
const ARTIST = 'https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/1737360297269.jpg';
const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} 19:00`;
const days = (n: number) => fmt(new Date(Date.now() + n * 86400000));

const hours = (n: number) => { const d = new Date(Date.now() + n * 3600000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

const mins = (n: number) => hours(n / 60);

/** 케이스별 목 — 주석의 [번호]는 미리보기(/dev/jumbotron) 순서. id 는 실제 수업과 겹치지 않게 9000번대 */
export const JUMBOTRON_MOCK: JumbotronItem[] = [
  // ── 공개 예정 ──────────────────────────────
  // [1] 1시간 안 — 카운트다운 00:mm:ss
  { id: 9001, imageUrl: ARTIST, title: 'HAUL 힙합 코레오 — 신곡 루틴 집중반', description: '이번 컴백 신곡 안무를 8카운트 단위로 쪼개서 90분 안에 풀루틴까지 완성합니다. 촬영 포함.',
    artistName: 'JIN', artistImageUrl: ARTIST, lessonType: LessonType.PopUp, genre: '힙합', level: 'Basic',
    status: LessonStatus.Pending, openDate: mins(42), when: { startDate: days(10) }, duration: 90 },
  // [2] 몇 시간 안 — 카운트다운 hh:mm:ss
  { id: 9002, imageUrl: IMG, title: '하울 스페셜 팝업 — 아이돌 커버 원데이', description: '한정 20명. 공개되자마자 마감되는 수업이에요.',
    artistName: 'HAUL', artistImageUrl: ARTIST, lessonType: LessonType.PopUp, genre: 'K-POP', level: 'Beginner',
    status: LessonStatus.Pending, openDate: hours(5), when: { startDate: days(9) }, duration: 120 },
  // [3] 일주일 뒤 — 카운트다운 N일 hh:mm:ss
  { id: 9003, imageUrl: ARTIST, title: '연말 쇼케이스 준비 워크샵', description: '12월 무대에 설 팀을 미리 꾸립니다. 오디션 없이 선착순.',
    artistName: 'DAWN', artistImageUrl: ARTIST, lessonType: LessonType.Workshop, genre: '코레오', level: 'Advanced',
    status: LessonStatus.Pending, openDate: days(7), when: { startDate: days(20) } },
  // [4] 공개 시각 없음 — 카운트다운 대신 '공개 예정' 배지
  { id: 9004, imageUrl: IMG, title: '비밀 게스트 팝업 클래스', description: '강사는 공개일에 발표돼요.',
    lessonType: LessonType.PopUp, genre: '???', status: LessonStatus.Pending },

  // ── 판매 예정 ──────────────────────────────
  // [5] 내일 판매 시작 — 카운트다운
  { id: 9005, imageUrl: ARTIST, title: '코레오그래피 정규반 11월', description: '주 2회 4주 과정, 마지막 주 쇼케이스 영상 촬영',
    artistName: 'SOO', artistImageUrl: ARTIST, lessonType: LessonType.Regular, genre: '코레오', level: 'Advanced',
    status: LessonStatus.NotForSale, saleStartDate: hours(30), when: { startDate: days(6) } },
  // [6] 판매 시각 없음 — '판매 예정' 배지
  { id: 9006, imageUrl: IMG, title: '팝핀 기초반 12월', artistName: 'NOAH', artistImageUrl: ARTIST,
    lessonType: LessonType.Regular, genre: '팝핀', level: 'Beginner', status: LessonStatus.NotForSale, when: { startDate: days(30) } },

  // ── 판매 중 ────────────────────────────────
  // [7] 선예약 중
  { id: 9007, imageUrl: ARTIST, title: '왁킹 베이직 클래스', description: '팔 라인과 포즈를 집중적으로 다룹니다.',
    artistName: 'YUNA', artistImageUrl: ARTIST, lessonType: LessonType.Regular, genre: '왁킹', level: 'Basic',
    status: LessonStatus.PreSale, when: { startDate: days(4) } },
  // [8] 마지막 1자리
  { id: 9008, imageUrl: IMG, title: '걸스힙합 워크샵', description: '처음이어도 괜찮아요. 그루브부터 차근차근.',
    artistName: 'MINA', artistImageUrl: ARTIST, lessonType: LessonType.Workshop, genre: '걸스힙합', level: 'Beginner',
    status: LessonStatus.Recruiting, when: { startDate: days(1) }, duration: 60, remainingSeats: 1 },
  // [9] 오늘 수업 · 4자리 남음
  { id: 9009, imageUrl: ARTIST, title: '오늘 저녁 하우스 원데이', description: '퇴근하고 가볍게, 풋워크 위주.',
    artistName: 'LEO', artistImageUrl: ARTIST, lessonType: LessonType.PopUp, genre: '하우스', level: 'Basic',
    status: LessonStatus.Recruiting, when: { startDate: hours(3) }, remainingSeats: 4 },
  // [10] 자리 넉넉(12석) — 배지 없이 태그만
  { id: 9010, imageUrl: IMG, title: '크럼프 인트로', description: '에너지 터지는 크럼프 첫 걸음. 무릎 보호대 챙겨 오세요.',
    artistName: 'MAX', artistImageUrl: ARTIST, lessonType: LessonType.Regular, genre: '크럼프', level: 'Beginner',
    status: LessonStatus.Recruiting, when: { startDate: days(3) }, remainingSeats: 12 },
  // [11] 아주 긴 제목·긴 설명 — 2줄 말줄임 확인
  { id: 9011, imageUrl: ARTIST, title: '[11월 한정] 아이돌 데뷔조 출신 강사와 함께하는 K-POP 퍼포먼스 & 표정 연기 & 카메라 무브 마스터 클래스',
    description: '안무만 외우는 수업이 아니에요. 카메라 앞에서 어떻게 보여야 하는지, 표정·시선·킬링파트 연출까지 실제 직캠 촬영하면서 하나씩 피드백 드립니다. 끝나고 개인 직캠 영상 제공.',
    artistName: '아주긴강사이름을가진강사님', artistImageUrl: ARTIST, lessonType: LessonType.Workshop, genre: 'K-POP', level: 'Advanced',
    status: LessonStatus.Recruiting, when: { startDate: days(5) } },
  // [12] 수업 예정(Ready) — 배지 없음, 강사 사진 없음
  { id: 9012, imageUrl: IMG, title: '락킹 정규반 3주차', artistName: 'RAY',
    lessonType: LessonType.Regular, genre: '락킹', status: LessonStatus.Ready, when: { startDate: days(2) } },

  // ── 마감 / 종료 ────────────────────────────
  // [13] 결제 마감
  { id: 9013, imageUrl: ARTIST, title: '오디션반 — 입시 대비 실전 클래스', artistName: 'KAI', artistImageUrl: ARTIST,
    lessonType: LessonType.Audition, genre: '입시', status: LessonStatus.SaleClosed, when: { startDate: days(2) } },
  // [14] 수업 종료
  { id: 9014, imageUrl: IMG, title: '지난주 힙합 팝업 — 다시보기 공개', description: '영상은 수강생 단톡방에 올라가 있어요.',
    artistName: 'JIN', artistImageUrl: ARTIST, lessonType: LessonType.PopUp, genre: '힙합',
    status: LessonStatus.Completed, isEnded: true, when: { startDate: days(-5) } },
  // [15] 수업 취소
  { id: 9015, imageUrl: ARTIST, title: '재즈펑크 원데이', description: '강사 사정으로 취소되었습니다. 결제 금액은 전액 환불돼요.',
    artistName: 'ELLA', artistImageUrl: ARTIST, lessonType: LessonType.PopUp, genre: '재즈펑크', status: LessonStatus.Cancelled, when: { startDate: days(1) } },

  // ── 값 누락 ────────────────────────────────
  // [16] 제목만 — 태그·설명·강사·일시 전부 없음
  { id: 9016, imageUrl: IMG, title: '타이틀만 있는 수업', status: LessonStatus.Recruiting },
  // [17] 썸네일 없음 — 회색 바탕 위
  { id: 9017, imageUrl: '', title: '썸네일 없는 수업', description: '이미지가 없을 때도 글씨가 읽혀야 해요.',
    artistName: 'NONE', lessonType: LessonType.Regular, genre: '힙합', status: LessonStatus.Recruiting, when: { startDate: days(2) } },
];

/** 개발 환경 또는 JUMBOTRON_MOCK=1 일 때만 */
export const jumbotronMockEnabled = () => process.env.NODE_ENV !== 'production' || process.env.JUMBOTRON_MOCK === '1';

/**
 * 홈 점보트론을 목 케이스 전부(17장)로 바꾼다 — 사진은 실제 첫 점보트론 수업 사진 하나를 모든 카드에 복사.
 * 실제 수업이 없으면 목에 들어 있는 사진 그대로. 카드 탭은 목 id(9000번대)라 상세가 안 열릴 수 있다(UI 확인용).
 */
export const withJumbotronMock = (items: JumbotronItem[]): JumbotronItem[] => {
  const photo = items.find(i => i.imageUrl)?.imageUrl;
  if (!photo) return JUMBOTRON_MOCK;
  return JUMBOTRON_MOCK.map(m => ({ ...m, imageUrl: photo }));
};
