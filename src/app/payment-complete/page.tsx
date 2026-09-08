import React from 'react';
import Image from 'next/image';
import { api } from '@/app/api.client';
import { KloudScreen } from '@/shared/kloud.screen';
import { NavigateClickWrapper } from '@/utils/NavigateClickWrapper';
import { getLocale, translate } from '@/utils/translate';
import { formatLessonDate, formatLessonTimeRange } from '@/app/kiosk/kiosk.lesson';
import { getArtistLessonsAction } from '@/app/artistLessons/actions';
import { GetLessonResponse, ValidLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { getPaymentRecordDetail } from '@/app/lessons/[id]/action/get.payment.record.detail';
import { GetPaymentRecordResponse, PaymentRecordStatus } from '@/app/endpoint/payment.record.endpoint';
import { LessonTags } from '@/app/components/LessonTags';
import { HeroVideo } from '@/app/payment-complete/HeroVideo';
import { LessonLabel, LessonLevelLabel, LessonTypeLabel } from '@/app/components/LessonLabel';

// 결제 완료 — 영수증(결제상세) 대신 먼저 보여주는 환영 화면. 결제수단·상품과 무관하게 모든 결제 성공이 여기로 온다.
// lessonId가 있으면(수업 구매) 감성 섹션까지, 없으면 결제 기록 기반의 상품 카드 + 친절한 안내만.
//
// 디자인 방향: 썸네일을 상태바까지 풀블리드로 깔고(ignoreSafeArea) 그 위에 타이틀을 얹는다. 체크·이모지 아이콘은 쓰지 않는다.
//
// TODO(MOCK): 아직 데이터가 없는 섹션은 화면 검증용 목업으로 채워져 있다 — BE/실데이터 연동 시 교체. 아래 TODO(MOCK) 표시 지점 참고.
//  · 준비물: 항상 MOCK_GUIDELINES (스튜디오 가이드라인 API 연동은 문구·형식 정리 후)
//  · 함께하는 수강생 수: currentStudentCount 없으면 12
//  · 같이 들었던 수강생: 전부 MOCK (소비자용 API 없음)
//  · 강사 다가오는 수업: 비면 MOCK_NEXT_LESSONS
//  · 강사 영상: youtubeAddress 없어도 MOCK_VIDEOS
//  · 계좌이체 입금 계좌: MOCK_BANK_ACCOUNT (결제 API가 계좌를 내려주면 교체)
//  · 히어로 영상: MOCK_HERO_VIDEO (public/mock) — 썸네일 대신 임시

// ── MOCK 데이터 ── TODO(MOCK): 실데이터 연동 시 전부 제거
const MOCK_GUIDELINES = [
  { id: -1, title: '편한 복장과 실내용 운동화', content: '움직임이 많은 수업이에요. 편한 운동복과 깨끗한 실내용 운동화를 준비해주세요.' },
  { id: -2, title: '물과 수건', content: '땀이 많이 나요. 개인 물병과 수건을 챙겨오시면 좋아요.' },
  { id: -3, title: '10분 일찍 도착하기', content: '수업 전에 가볍게 몸을 풀 수 있도록 조금 일찍 와주세요.' },
  { id: -4, title: '촬영은 수업 마지막에', content: '수업 중 촬영은 자제해주시고, 마무리 촬영 시간에 마음껏 남겨가세요.' },
];
const MOCK_CLASSMATES = [
  { name: '서연', desc: '지난달 K-POP 베이직에서 함께했어요' },
  { name: '민준', desc: '2번의 수업을 같이 들었어요' },
];
const MOCK_NEXT_LESSONS = [
  { id: -1, title: 'Choreo Basic', date: '9월 12일 (토) 오후 7:00' },
  { id: -2, title: 'K-POP Master Class', date: '9월 19일 (토) 오후 7:00' },
];
const MOCK_VIDEOS = [
  { title: '지난주 Choreo Class 정리 영상', meta: '조회수 1.2천 · 1주 전' },
  { title: 'K-POP 안무 하이라이트', meta: '조회수 3.4천 · 3주 전' },
];
const MOCK_BANK_ACCOUNT = { bank: '신한은행', number: '110-123-456789', holder: '라우그라피' };
const MOCK_STUDENT_COUNT = 12;
//  · "{스튜디오}도 {이름}님을 만날 생각에 설레고 있어요"
//  · 만나기 전에 준비하면 좋아요 (스튜디오 가이드라인)
//  · 총 N명의 수강생과 함께해요 (lesson.currentStudentCount)
//  · 이 강사님의 다가오는 수업 (GET /artists/:id/lessons 중 예정 수업, 최대 5개)
//  · 강사님의 영상 (artist.youtubeAddress)
// "이전에 같이 들었던 수강생" 섹션은 소비자용 수강생 목록 API가 없어 보류 — BE 협의 후 추가.

// 카드번호 4자리 하이픈 포맷 — 결제내역 상세(PaymentRecordDetailForm)와 동일
const formatCardNumber = (cardNumber?: string | null) => {
  if (!cardNumber) return '';
  return cardNumber.replace(/[\s-]/g, '').replace(/(.{4})(?=.)/g, '$1-');
};

// 결제 정보 행 — 라벨 회색 왼쪽 / 값 오른쪽
const InfoRow = ({ label, value, valueClassName }: { label: string; value: React.ReactNode; valueClassName?: string }) => (
  <div className={'flex items-start justify-between gap-4'}>
    <span className={'text-[14px] text-[#8B95A1] shrink-0 tracking-[-0.2px]'}>{label}</span>
    <span className={`text-[14px] font-medium text-[#4E5968] text-right break-all tracking-[-0.2px] ${valueClassName ?? ''}`}>{value}</span>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className={'px-6 mt-12'}>
    <h2 className={'text-[19px] font-bold text-[#191F28] tracking-[-0.4px]'}>{title}</h2>
    <div className={'mt-4'}>{children}</div>
  </section>
);

// 강사의 다가오는 수업 — 안내용 촘촘한 세로 리스트. 원형 썸네일 + 제목/일시. 탭 이동 없음.
const UpcomingLessonRow = ({ thumbnailUrl, title, date }: { thumbnailUrl?: string | null; title: string; date: string }) => (
  <div className={'flex items-center gap-3'}>
    <div className={'relative w-[40px] h-[40px] rounded-full overflow-hidden bg-[#F2F4F6] shrink-0'}>
      {thumbnailUrl && (
        <Image src={thumbnailUrl} alt={''} quality={50} fill sizes={'40px'} className={'object-cover'}/>
      )}
    </div>
    <div className={'flex-1 min-w-0 flex flex-col gap-0.5'}>
      <p className={'text-[14px] font-semibold text-[#191F28] leading-snug truncate tracking-[-0.2px]'}>{title}</p>
      <p className={'text-[12.5px] text-[#8B95A1] truncate'}>{date}</p>
    </div>
  </div>
);

// TODO(MOCK): 히어로 영상 — 썸네일 대신 임시로 이 영상을 깐다. 실데이터(수업 영상/썸네일) 연동 시 교체하고 public/mock 영상 삭제.
const MOCK_HERO_VIDEO = '/mock/payment-complete-hero.mp4';

// 풀블리드 히어로 — 영상(MOCK)을 화면 최상단(상태바 포함)까지 깔고, 하단 그라데이션 위에 타이틀·인사를 얹는다.
// 페이지가 ignoreSafeArea라 상태바 뒤까지 영상이 들어간다. 무음·자동재생·루프, 멈춰 있으면 탭해서 재생(HeroVideo). 영상 로드 전엔 썸네일이 poster로 보인다.
const FullBleedHero = ({ posterUrl, aspect, children }: { posterUrl?: string | null; aspect: string; children: React.ReactNode }) => (
  <div className={`relative w-full ${aspect} bg-[#191F28] overflow-hidden`}>
    <HeroVideo src={MOCK_HERO_VIDEO} posterUrl={posterUrl}/>
    {/* 상태바 가독성용 상단 그라데이션 + 텍스트용 하단 그라데이션 */}
    <div className={'absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/40 to-transparent pointer-events-none'}/>
    {/* 밝은 영상 위에서도 흰 글씨가 읽히도록 — 아래 절반을 거의 검게, 위로 길게 풀어준다 */}
    <div className={'absolute inset-x-0 bottom-0 h-[80%] pointer-events-none'} style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 100%)' }}/>
    <div className={'absolute inset-x-0 bottom-0 px-6 pb-7 flex flex-col gap-2.5 pointer-events-none'} style={{ textShadow: '0 1px 12px rgba(0,0,0,0.6)' }}>{children}</div>
  </div>
);

export default async function PaymentCompletePage({ searchParams }: {
  searchParams: Promise<{ paymentId?: string; lessonId?: string }>;
}) {
  const { paymentId, lessonId } = await searchParams;
  const locale = await getLocale();

  // 수업 정보 + 내 이름 + 결제 기록 병렬 조회. 실패해도 해당 섹션만 숨겨진다.
  const [lessonRes, meRes, recordRes] = await Promise.all([
    lessonId && /^\d+$/.test(lessonId) ? api.lesson.get({ id: Number(lessonId) }) : Promise.resolve(null),
    api.user.me({}),
    paymentId ? getPaymentRecordDetail({ paymentId }).catch(() => null) : Promise.resolve(null),
  ]);
  const lesson: GetLessonResponse | null = lessonRes && 'id' in lessonRes ? lessonRes : null;
  const myName = meRes && 'id' in meRes ? (meRes.name || meRes.nickName || '') : '';
  const record: GetPaymentRecordResponse | null = recordRes && 'paymentId' in recordRes ? recordRes : null;
  // 계좌이체(무통장)는 입금 확인 전 Pending — '완료' 대신 '접수' 톤으로 안내
  const isPending = record?.status === PaymentRecordStatus.Pending;

  const studio = lesson?.studio;
  const artist = lesson?.artists?.[0];

  // 강사 다음 수업 조회 — 실패는 조용히 빈 목록
  const artistLessonsRes = artist?.id
    ? await getArtistLessonsAction({ artistId: artist.id })
    : { lessons: [], totalPage: 0 };
  // TODO(MOCK): 준비물 — MOCK 고정. 스튜디오 가이드라인(api.guideline.list) 연동은 문구·형식이 정리된 뒤에.
  const guidelines = MOCK_GUIDELINES;

  // 다가오는 수업 = 지금 이후 시작 + 방금 산 수업 제외, 가까운 순 최대 5개
  const now = Date.now();
  const nextLessons = artistLessonsRes.lessons
    .filter((l) => l.id !== lesson?.id)
    .filter((l) => {
      const t = new Date(l.startDate.replace(/\./g, '-').replace(' ', 'T')).getTime();
      return !Number.isNaN(t) && t > now;
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 5);

  const studentCount = lesson?.currentStudentCount || MOCK_STUDENT_COUNT; // TODO(MOCK): currentStudentCount 없을 때 폴백
  const when = lesson ? [formatLessonDate(lesson, locale), formatLessonTimeRange(lesson, locale)].filter(Boolean).join(' · ') : '';
  const who = lesson ? [artist?.nickName, lesson.room?.name].filter(Boolean).join(' · ') : '';

  // 인사말 — 수업이면 스튜디오가 설레는 문구, 그 외 상품이면 일반 감사 문구. 입금 대기면 접수 안내가 우선.
  const nameForGreeting = myName || (await translate('payment_complete_greeting_name_fallback'));
  // 문구 매트릭스 — 상품 종류(수업 LT / 전용반 LP+Dedicated / 일반 패스권 LP / 그 외) × 상태(확정 / 입금 대기).
  // '상품 구매'가 아니라 '수업 신청 온보딩' 느낌이 목표라 결제 완료보다 신청·발급·등록 완료를 앞세운다.
  const kind: 'lesson' | 'dedicated' | 'pass' | 'etc' =
    lesson || paymentId?.startsWith('LT') ? 'lesson'
      : paymentId?.startsWith('LP')
        ? (record?.passPlan?.type === 'Dedicated' ? 'dedicated' : 'pass')
        : 'etc';
  const TITLE_KEY = {
    lesson: ['payment_complete_lesson_title', 'payment_complete_pending_lesson_title'],
    dedicated: ['payment_complete_dedicated_title', 'payment_complete_pending_dedicated_title'],
    pass: ['payment_complete_pass_title', 'payment_complete_pending_pass_title'],
    etc: ['payment_complete_title', 'payment_complete_pending_title'],
  } as const;
  const GREETING_KEY = {
    lesson: ['payment_complete_greeting', 'payment_complete_pending_lesson_greeting'],
    // 전용반은 그 수업에 등록하는 것 — 확정 인사는 수업과 동일하게 '수업에서 만나요'
    dedicated: ['payment_complete_greeting', 'payment_complete_pending_dedicated_greeting'],
    pass: ['payment_complete_pass_greeting', 'payment_complete_pending_pass_greeting'],
    etc: ['payment_complete_generic_greeting', 'payment_complete_pending_greeting'],
  } as const;
  // 타이틀에 실제 이름 사용 — 수업은 lesson.title("HYO Choreo 신청 완료!"), 전용반은 passPlan.name.
  // 이름을 못 구하면 '수업'/'전용반' 일반명사 폴백.
  const planName = record?.passPlan?.name || (await translate('payment_complete_dedicated_fallback'));
  const lessonName = lesson?.title || record?.productName || (await translate('payment_complete_lesson_fallback'));
  const heroTitle = (await translate(TITLE_KEY[kind][isPending ? 1 : 0]))
    .replace('{plan}', planName)
    .replace('{lesson}', lessonName);
  const greeting = (await translate(GREETING_KEY[kind][isPending ? 1 : 0]))
    .replace('{studio}', studio?.name ?? (await translate('payment_complete_greeting_studio_fallback')))
    .replace('{name}', nameForGreeting);

  const artistName = artist?.nickName || artist?.name || '강사';
  const wonText = await translate('won');
  const totalDiscount = record?.discounts?.reduce((sum, d) => sum + d.amount, 0) ?? 0;

  return (
    <div className={'w-full min-h-screen bg-white text-[#191F28] flex flex-col pb-40'}>
      {/* 히어로 — 풀블리드 영상(MOCK) 위에 '신청 완료!' + 인사. 체크 아이콘 없음 */}
      <FullBleedHero
        posterUrl={lesson ? lesson.thumbnailUrl : record?.productImageUrl}
        aspect={lesson ? 'aspect-[3/4]' : 'aspect-[1/1]'}
      >
        <p className={'text-[28px] font-bold text-white tracking-[-0.7px] leading-tight'}>{heroTitle}</p>
        <p className={'text-[15px] leading-relaxed text-white/90 whitespace-pre-line tracking-[-0.2px]'}>{greeting}</p>
      </FullBleedHero>

      {/* 수업 정보 — 사진 아래 텍스트 블록. 라벨(레벨/타입/장르)·태그는 수업 상세와 동일 컴포넌트 */}
      {lesson && (
        <div className={'px-6 pt-6 flex flex-col gap-3'}>
          <div className={'flex items-center justify-between gap-3'}>
            {studio ? (
              <div className={'flex items-center gap-2 min-w-0'}>
                <div className={'relative w-[24px] h-[24px] rounded-full overflow-hidden bg-[#F2F4F6] shrink-0'}>
                  {studio.profileImageUrl && (
                    <Image src={studio.profileImageUrl} alt={''} quality={50} fill sizes={'24px'} className={'object-cover'}/>
                  )}
                </div>
                <p className={'text-[14px] font-semibold text-[#4E5968] truncate tracking-[-0.2px]'}>{studio.name}</p>
              </div>
            ) : <div/>}
            <div className={'flex items-center gap-[3px] shrink-0'}>
              {lesson.level && <LessonLevelLabel label={lesson.level} locale={locale}/>}
              {lesson.type && <LessonTypeLabel type={lesson.type} locale={locale}/>}
              {lesson.genre && lesson.genre !== 'Default' && <LessonLabel label={lesson.genre} locale={locale}/>}
            </div>
          </div>
          {lesson.tags && <LessonTags tags={lesson.tags}/>}
          <div className={'flex flex-col gap-1'}>
            <p className={'text-[20px] font-bold text-[#191F28] leading-snug tracking-[-0.4px] line-clamp-2'}>{lesson.title}</p>
            {when && <p className={'text-[15px] font-medium text-[#4E5968] tracking-[-0.2px]'}>{when}</p>}
            {who && <p className={'text-[14px] text-[#8B95A1] tracking-[-0.2px] truncate'}>{who}</p>}
          </div>
        </div>
      )}

      {/* 수업이 아닌 결제(패스권·연습실 등) — 결제 기록 기반 상품 정보 */}
      {!lesson && record && (
        <div className={'px-6 pt-6 flex flex-col gap-1'}>
          <p className={'text-[20px] font-bold text-[#191F28] leading-snug tracking-[-0.4px] line-clamp-2'}>{record.productName}</p>
          <p className={'text-[15px] font-medium text-[#4E5968] tracking-[-0.2px] truncate'}>
            {[`${record.amount.toLocaleString()}원`, record.paymentMethodLabel].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}

      {/* 입금 대기(계좌이체) — 입금 계좌 안내 + 확정 안내. TODO(MOCK): 계좌는 MOCK_BANK_ACCOUNT (BE가 내려주면 교체) */}
      {isPending && (
        <div className={'mx-5 mt-6 rounded-[16px] bg-[#FFF8EC] px-5 py-4 flex flex-col gap-3'}>
          <p className={'text-[13px] leading-relaxed font-medium text-[#A05A00] whitespace-pre-line'}>
            {await translate('payment_complete_pending_notice')}
          </p>
          <div className={'rounded-[12px] bg-white/80 px-4 py-3 flex flex-col gap-2'}>
            <div className={'flex items-center justify-between gap-3'}>
              <span className={'text-[12px] text-[#A05A00] shrink-0'}>{await translate('payment_complete_bank_account')}</span>
              <span className={'text-[14px] font-bold text-[#3D2A0A] text-right'}>{MOCK_BANK_ACCOUNT.bank} {MOCK_BANK_ACCOUNT.number}</span>
            </div>
            <div className={'flex items-center justify-between gap-3'}>
              <span className={'text-[12px] text-[#A05A00] shrink-0'}>{await translate('payment_complete_bank_holder')}</span>
              <span className={'text-[13px] font-semibold text-[#3D2A0A]'}>{MOCK_BANK_ACCOUNT.holder}</span>
            </div>
            {record && (
              <div className={'flex items-center justify-between gap-3'}>
                <span className={'text-[12px] text-[#A05A00] shrink-0'}>{await translate('payment_complete_bank_amount')}</span>
                <span className={'text-[14px] font-bold text-[#3D2A0A]'}>{record.amount.toLocaleString()}원</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 총 N명과 함께 + 같이 들었던 수강생 — 상품 종류와 무관하게 항상 노출. TODO(MOCK): 수강생 목록(MOCK_CLASSMATES)은 전부 MOCK (소비자용 API 없음) */}
      <div className={'mx-6 mt-8 flex flex-col gap-4'}>
        <div className={'flex items-center gap-3'}>
          {/* 아바타 스택 — 이니셜 원 3개 겹치기 */}
          <div className={'flex -space-x-2 shrink-0'}>
            {[...MOCK_CLASSMATES.map((c) => c.name.charAt(0)), `+${Math.max(studentCount - MOCK_CLASSMATES.length, 0)}`].map((label, i) => (
              <span
                key={i}
                className={`w-[30px] h-[30px] rounded-full ring-2 ring-white flex items-center justify-center text-[11px] font-bold ${i === MOCK_CLASSMATES.length ? 'bg-[#191F28] text-white' : 'bg-[#E5E8EB] text-[#4E5968]'}`}
              >
                {label}
              </span>
            ))}
          </div>
          <p className={'text-[15px] font-bold text-[#191F28] tracking-[-0.3px]'}>
            {(await translate('payment_complete_together')).replace('{count}', String(studentCount))}
          </p>
        </div>
        <div className={'flex flex-col gap-2 pl-0.5'}>
          {MOCK_CLASSMATES.map((c) => (
            <p key={c.name} className={'text-[13.5px] text-[#4E5968] truncate tracking-[-0.2px]'}>
              <span className={'font-semibold text-[#191F28]'}>{c.name}</span>님 · {c.desc}
            </p>
          ))}
        </div>
      </div>

      {/* 만나기 전에 준비하면 좋아요 — TODO(MOCK): MOCK_GUIDELINES 고정. 번호 + 제목/설명, 얇은 구분선 리스트 */}
      <Section title={await translate('payment_complete_prepare_title')}>
        <div className={'flex flex-col divide-y divide-[#F2F4F6]'}>
          {guidelines.map((g, i) => (
            <div key={g.id} className={'flex items-start gap-4 py-4 first:pt-1 last:pb-0'}>
              <span className={'text-[13px] font-bold text-[#B0B8C1] tabular-nums pt-[2px] shrink-0 w-[18px]'}>{String(i + 1).padStart(2, '0')}</span>
              <div className={'flex-1 min-w-0'}>
                <p className={'text-[15.5px] font-bold text-[#191F28] leading-snug tracking-[-0.3px]'}>{g.title}</p>
                {g.content && <p className={'mt-1 text-[14px] leading-relaxed text-[#4E5968] line-clamp-3 whitespace-pre-line tracking-[-0.2px]'}>{g.content}</p>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 이 강사님의 다가오는 수업 — 안내용 촘촘한 세로 리스트 최대 5개(탭 이동 없음). TODO(MOCK): 실데이터 없으면 MOCK_NEXT_LESSONS 행 */}
      <Section title={(await translate('payment_complete_next_lessons_title')).replace('{artist}', artistName)}>
        <div className={'flex flex-col gap-3'}>
          {nextLessons.length > 0
            ? nextLessons.map((l) => <UpcomingLessonRow key={l.id} thumbnailUrl={l.thumbnailUrl} title={l.title} date={l.date}/>)
            : MOCK_NEXT_LESSONS.map((l) => <UpcomingLessonRow key={l.id} title={l.title} date={l.date}/>)}
        </div>
      </Section>

      {/* 강사님의 지난 수업 영상 — 상품 종류와 무관하게 항상 노출. TODO(MOCK): MOCK_VIDEOS 카드, 실제 영상 데이터가 생기면 교체 */}
      <Section title={(await translate('payment_complete_videos_title')).replace('{artist}', artistName)}>
        <div className={'flex flex-col gap-4'}>
          {MOCK_VIDEOS.map((v) => (
            <div key={v.title} className={'flex items-center gap-4'}>
              <div className={'relative w-[112px] h-[64px] rounded-[12px] bg-[#191F28] shrink-0 flex items-center justify-center'}>
                <span className={'w-[28px] h-[28px] rounded-full bg-white flex items-center justify-center'}>
                  <svg width={'10'} height={'12'} viewBox={'0 0 10 12'} fill={'none'}><path d={'M1 0l9 6-9 6V0z'} fill={'#191F28'}/></svg>
                </span>
              </div>
              <div className={'flex-1 min-w-0'}>
                <p className={'text-[14.5px] font-semibold text-[#191F28] leading-snug line-clamp-2 tracking-[-0.2px]'}>{v.title}</p>
                <p className={'mt-1 text-[12px] text-[#8B95A1]'}>{v.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 강사님의 유튜브 채널 — youtubeAddress 있을 때만 */}
      {artist?.youtubeAddress && (
        <Section title={(await translate('payment_complete_videos_title')).replace('{artist}', artist.nickName || artist.name)}>
          <a
            href={`https://www.youtube.com/${artist.youtubeAddress}`}
            target={'_blank'}
            rel={'noreferrer'}
            className={'flex items-center gap-3.5 rounded-[16px] bg-[#F9FAFB] px-4 py-3.5 active:bg-[#F2F4F6] transition-colors'}
          >
            <div className={'relative w-[44px] h-[44px] rounded-full overflow-hidden bg-[#F2F4F6] shrink-0'}>
              {artist.profileImageUrl && (
                <Image src={artist.profileImageUrl} alt={''} quality={50} fill sizes={'44px'} className={'object-cover'}/>
              )}
            </div>
            <div className={'flex-1 min-w-0'}>
              <p className={'text-[14.5px] font-semibold text-[#191F28] truncate'}>{artist.nickName || artist.name}</p>
              <p className={'text-[12px] text-[#8B95A1]'}>{await translate('payment_complete_videos_desc')}</p>
            </div>
            <svg width={'18'} height={'18'} viewBox={'0 0 24 24'} fill={'none'} className={'shrink-0'}>
              <path d={'M9 6l6 6-6 6'} stroke={'#B1B8BE'} strokeWidth={'2'} strokeLinecap={'round'} strokeLinejoin={'round'}/>
            </svg>
          </a>
        </Section>
      )}

      {/* 결제 정보 — 결제내역 상세로 보내지 않고 이 화면에서 바로 보여준다 */}
      {record && (
        <Section title={await translate('payment_information_title')}>
          <div className={'rounded-[16px] bg-[#F9FAFB] px-5 py-4 flex flex-col gap-3'}>
            <InfoRow label={await translate('payment_id')} value={record.paymentId} valueClassName={'font-paperlogy'}/>
            <InfoRow label={await translate('payment_datetime')} value={record.createdAt}/>
            <InfoRow label={await translate('payment_method')} value={record.paymentMethodLabel}/>
            {record.cardNumber ? (
              <InfoRow label={await translate('card_information')} value={formatCardNumber(record.cardNumber)} valueClassName={'font-paperlogy'}/>
            ) : record.depositor ? (
              <InfoRow label={await translate('depositor_name')} value={record.depositor}/>
            ) : null}

            <div className={'h-[1px] bg-[#E5E8EB] my-1'}/>

            {/* 할인이 있으면 기본 금액(amount + 할인 합) → 할인 항목 → 총액. 없으면 총액만 */}
            {totalDiscount > 0 && (
              <>
                <InfoRow label={await translate('original_price')} value={`${(record.amount + totalDiscount).toLocaleString()}${wonText}`}/>
                {record.discounts!.map((d, i) => (
                  <InfoRow key={i} label={d.key} value={`-${d.amount.toLocaleString()}${wonText}`} valueClassName={'text-[#E55B5B]'}/>
                ))}
              </>
            )}
            <div className={'flex items-center justify-between gap-4'}>
              <span className={'text-[15px] font-bold text-[#191F28] tracking-[-0.3px]'}>{await translate('total_amount')}</span>
              <span className={'text-[18px] font-bold text-[#191F28] tracking-[-0.4px]'}>{record.amount.toLocaleString()}{wonText}</span>
            </div>
          </div>
        </Section>
      )}

      {/* 하단 고정 CTA — 확인(홈). 결제 내역은 위 섹션에서 바로 보여주므로 별도 버튼 없음 */}
      <div
        className={'fixed bottom-0 left-0 right-0 bg-white px-5 pt-3 max-w-[640px] mx-auto'}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}
      >
        <NavigateClickWrapper method={'navigateMain'}>
          <button type={'button'} className={'w-full h-[52px] rounded-[14px] bg-[#191F28] text-[16px] font-bold text-white active:scale-[0.98] transition-transform'}>
            {await translate('confirm')}
          </button>
        </NavigateClickWrapper>
      </div>
    </div>
  );
}
