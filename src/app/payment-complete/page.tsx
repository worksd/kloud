import React from 'react';
import Image from 'next/image';
import { api } from '@/app/api.client';
import { KloudScreen } from '@/shared/kloud.screen';
import { NavigateClickWrapper } from '@/utils/NavigateClickWrapper';
import { getLocale, translate } from '@/utils/translate';
import { formatLessonDate, formatLessonTimeRange } from '@/app/kiosk/kiosk.lesson';
import { getArtistLessonsAction } from '@/app/artistLessons/actions';
import { GetLessonResponse, ValidLessonResponse } from '@/app/endpoint/lesson.endpoint';
import { GuidelineResponse } from '@/app/endpoint/guideline.endpoint';
import { getPaymentRecordDetail } from '@/app/lessons/[id]/action/get.payment.record.detail';
import { GetPaymentRecordResponse, PaymentRecordStatus } from '@/app/endpoint/payment.record.endpoint';
import { kioskImageSrc } from '@/app/kiosk/kiosk.image';

// 결제 완료 — 영수증(결제상세) 대신 먼저 보여주는 환영 화면. 결제수단·상품과 무관하게 모든 결제 성공이 여기로 온다.
// lessonId가 있으면(수업 구매) 감성 섹션까지, 없으면 결제 기록 기반의 상품 카드 + 친절한 안내만.
//
// ⚠️ MOCK: 아직 데이터가 없는 섹션은 화면 검증용 목업으로 채워져 있다 — BE/실데이터 연동 시 교체.
//  · 준비물: guidelines 없으면 MOCK_GUIDELINES
//  · 함께하는 수강생 수: currentStudentCount 없으면 12
//  · 같이 들었던 수강생: 전부 MOCK (소비자용 API 없음)
//  · 강사 다음 수업: 비면 MOCK_NEXT_LESSONS
//  · 강사 영상: youtubeAddress 없어도 MOCK_VIDEOS
//  · 계좌이체 입금 계좌: MOCK_BANK_ACCOUNT (결제 API가 계좌를 내려주면 교체)

// ── MOCK 데이터 ──
const MOCK_GUIDELINES = [
  { id: -1, title: '편한 복장과 실내용 운동화', content: '움직임이 많은 수업이에요. 편한 운동복과 깨끗한 실내용 운동화를 준비해주세요.' },
  { id: -2, title: '물과 수건', content: '땀이 많이 나요! 개인 물병과 수건을 챙겨오시면 좋아요.' },
  { id: -3, title: '10분 일찍 도착하기', content: '수업 전에 가볍게 몸을 풀 수 있도록 조금 일찍 와주세요.' },
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
//  · 이 강사님의 다음 수업 (GET /artists/:id/lessons 중 예정 수업)
//  · 강사님의 영상 (artist.youtubeAddress)
// "이전에 같이 들었던 수강생" 섹션은 소비자용 수강생 목록 API가 없어 보류 — BE 협의 후 추가.

const Section = ({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) => (
  <section className={'px-5 mt-8'}>
    <h2 className={'text-[17px] font-bold text-black flex items-center gap-1.5'}>
      <span>{emoji}</span>{title}
    </h2>
    <div className={'mt-3'}>{children}</div>
  </section>
);

// 강사의 다음 수업 카드 — 가로 스크롤
const NextLessonCard = ({ lesson }: { lesson: ValidLessonResponse }) => (
  <NavigateClickWrapper method={'push'} route={KloudScreen.LessonDetail(lesson.id)}>
    <div className={'w-[150px] shrink-0 cursor-pointer active:opacity-80 transition-opacity'}>
      <div className={'relative w-[150px] aspect-[3/4] rounded-[14px] overflow-hidden bg-[#F1F3F6]'}>
        {lesson.thumbnailUrl && (
          <Image src={kioskImageSrc(lesson.thumbnailUrl, 400) ?? lesson.thumbnailUrl} alt={''} fill sizes={'150px'} className={'object-cover'}/>
        )}
      </div>
      <p className={'mt-2 text-[13px] font-bold text-black leading-snug line-clamp-1'}>{lesson.title}</p>
      <p className={'mt-0.5 text-[11px] text-[#8B95A1] truncate'}>{lesson.date}</p>
    </div>
  </NavigateClickWrapper>
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

  // 스튜디오 준비물(가이드라인) + 강사 다음 수업 병렬 조회 — 실패는 조용히 빈 목록
  const [guidelinesRes, artistLessonsRes] = await Promise.all([
    studio?.id ? api.guideline.list({ studioId: studio.id }).catch(() => null) : Promise.resolve(null),
    artist?.id ? getArtistLessonsAction({ artistId: artist.id }) : Promise.resolve({ lessons: [], totalPage: 0 }),
  ]);
  const realGuidelines: GuidelineResponse[] =
    guidelinesRes && 'guidelines' in guidelinesRes ? guidelinesRes.guidelines.slice(0, 3) : [];
  // MOCK 폴백 — 스튜디오가 가이드라인을 안 만들었어도 준비물 섹션은 채워 보여준다
  const guidelines = realGuidelines.length > 0
    ? realGuidelines
    : MOCK_GUIDELINES.map((g) => ({ ...g, isContentEditable: false } as GuidelineResponse));

  // 다음 수업 = 지금 이후 시작 + 방금 산 수업 제외, 가까운 순 3개
  const now = Date.now();
  const nextLessons = artistLessonsRes.lessons
    .filter((l) => l.id !== lesson?.id)
    .filter((l) => {
      const t = new Date(l.startDate.replace(/\./g, '-').replace(' ', 'T')).getTime();
      return !Number.isNaN(t) && t > now;
    })
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .slice(0, 3);

  const studentCount = lesson?.currentStudentCount || MOCK_STUDENT_COUNT; // MOCK 폴백
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

  return (
    <div className={'w-full min-h-screen bg-white flex flex-col pb-40'}>
      {/* 히어로 — 체크 + 설레는 인사 */}
      <div className={'flex flex-col items-center px-6 pt-12 text-center'}>
        {/* 히어로 아이콘 — 연한 헤일로 두 겹 + 그라데이션 원, 체크는 선이 그려지는 애니메이션 */}
        <div className={'relative w-[104px] h-[104px] flex items-center justify-center'}>
          <div className={'absolute inset-0 rounded-full bg-[#F2F4F6] animate-[haloPulse_460ms_ease-out]'}/>
          <div className={'absolute inset-[10px] rounded-full bg-[#E8EAED] animate-[haloPulse_460ms_ease-out]'}/>
          <div
            className={'relative w-[68px] h-[68px] rounded-full flex items-center justify-center animate-[scaleIn_360ms_cubic-bezier(0.34,1.56,0.64,1)]'}
            style={{ background: 'linear-gradient(145deg, #2B3138 0%, #14171B 100%)', boxShadow: '0 8px 20px rgba(20,23,27,0.28)' }}
          >
            <svg width={'32'} height={'32'} viewBox={'0 0 24 24'} fill={'none'}>
              <path
                d={'M5.5 12.5l4.2 4.2L18.5 7.5'}
                stroke={'white'}
                strokeWidth={'2.6'}
                strokeLinecap={'round'}
                strokeLinejoin={'round'}
                strokeDasharray={'24'}
                style={{ animation: 'checkDraw 420ms ease-out 180ms both' }}
              />
            </svg>
          </div>
        </div>
        <p className={'mt-5 text-[22px] font-bold text-black tracking-[-0.4px]'}>{heroTitle}</p>
        <p className={'mt-2 text-[15px] leading-relaxed text-[#4E5968] whitespace-pre-line'}>{greeting}</p>
      </div>

      {/* 입금 대기(계좌이체) — 입금 계좌 안내 + 확정 안내. 계좌는 MOCK (BE가 내려주면 교체) */}
      {isPending && (
        <div className={'mx-5 mt-6 rounded-[16px] bg-[#FFF4E5] px-4 py-4 flex flex-col gap-3'}>
          <div className={'flex items-start gap-2.5'}>
            <span className={'text-[16px]'}>🏦</span>
            <p className={'text-[13px] leading-relaxed font-medium text-[#A05A00] whitespace-pre-line'}>
              {await translate('payment_complete_pending_notice')}
            </p>
          </div>
          <div className={'rounded-[12px] bg-white/70 px-4 py-3 flex flex-col gap-1.5'}>
            <div className={'flex items-center justify-between'}>
              <span className={'text-[12px] text-[#A05A00]'}>{await translate('payment_complete_bank_account')}</span>
              <span className={'text-[14px] font-bold text-[#5C3A00]'}>{MOCK_BANK_ACCOUNT.bank} {MOCK_BANK_ACCOUNT.number}</span>
            </div>
            <div className={'flex items-center justify-between'}>
              <span className={'text-[12px] text-[#A05A00]'}>{await translate('payment_complete_bank_holder')}</span>
              <span className={'text-[13px] font-semibold text-[#5C3A00]'}>{MOCK_BANK_ACCOUNT.holder}</span>
            </div>
            {record && (
              <div className={'flex items-center justify-between'}>
                <span className={'text-[12px] text-[#A05A00]'}>{await translate('payment_complete_bank_amount')}</span>
                <span className={'text-[14px] font-bold text-[#5C3A00]'}>{record.amount.toLocaleString()}원</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 수업이 아닌 결제(패스권·연습실 등) — 결제 기록 기반 상품 카드 */}
      {!lesson && record && (
        <div className={'mx-5 mt-7 rounded-[20px] bg-[#F7F8F9] p-4 flex items-center gap-4'}>
          <div className={'relative w-[56px] h-[56px] rounded-[12px] overflow-hidden bg-[#E8EAED] shrink-0'}>
            {record.productImageUrl && (
              <Image src={kioskImageSrc(record.productImageUrl, 200) ?? record.productImageUrl} alt={''} fill sizes={'56px'} className={'object-cover'}/>
            )}
          </div>
          <div className={'flex-1 min-w-0'}>
            <p className={'text-[16px] font-bold text-black leading-snug line-clamp-2'}>{record.productName}</p>
            <p className={'mt-1 text-[13px] text-[#4E5968] truncate'}>
              {[`${record.amount.toLocaleString()}원`, record.paymentMethodLabel].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {/* 수업 요약 카드 */}
      {lesson && (
        <div className={'mx-5 mt-7 rounded-[20px] bg-[#F7F8F9] p-4 flex items-center gap-4'}>
          <div className={'relative w-[64px] h-[80px] rounded-[12px] overflow-hidden bg-[#E8EAED] shrink-0'}>
            {lesson.thumbnailUrl && (
              <Image src={kioskImageSrc(lesson.thumbnailUrl, 200) ?? lesson.thumbnailUrl} alt={''} fill sizes={'64px'} className={'object-cover'}/>
            )}
          </div>
          <div className={'flex-1 min-w-0'}>
            <p className={'text-[16px] font-bold text-black leading-snug line-clamp-2'}>{lesson.title}</p>
            {when && <p className={'mt-1 text-[13px] text-[#4E5968] truncate'}>{when}</p>}
            {who && <p className={'mt-0.5 text-[12px] text-[#8B95A1] truncate'}>{who}</p>}
          </div>
        </div>
      )}

      {/* 총 N명과 함께 + 같이 들었던 수강생 — 상품 종류와 무관하게 항상 노출. 수강생 목록은 전부 MOCK (소비자용 API 없음) */}
      {(
        <div className={'mx-5 mt-3 rounded-[16px] bg-[#E8F5E9] px-4 py-3.5 flex flex-col gap-2.5'}>
          <div className={'flex items-center gap-2.5'}>
            <span className={'text-[18px]'}>🎉</span>
            <p className={'text-[14px] font-semibold text-[#2E7D32]'}>
              {(await translate('payment_complete_together')).replace('{count}', String(studentCount))}
            </p>
          </div>
          <div className={'flex flex-col gap-1.5 pl-[30px]'}>
            {MOCK_CLASSMATES.map((c) => (
              <div key={c.name} className={'flex items-center gap-2'}>
                <span className={'w-[22px] h-[22px] rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-[#2E7D32] shrink-0'}>
                  {c.name.charAt(0)}
                </span>
                <p className={'text-[12.5px] text-[#3E6B42] truncate'}>
                  <span className={'font-bold'}>{c.name}</span>님 — {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 만나기 전에 준비하면 좋아요 — 스튜디오 가이드라인 */}
      {guidelines.length > 0 && (
        <Section emoji={'🎒'} title={await translate('payment_complete_prepare_title')}>
          <div className={'flex flex-col gap-2.5'}>
            {guidelines.map((g) => (
              <div key={g.id} className={'rounded-[14px] border border-[#F1F3F6] px-4 py-3'}>
                <p className={'text-[14px] font-bold text-black'}>{g.title}</p>
                {g.content && <p className={'mt-1 text-[13px] leading-relaxed text-[#4E5968] line-clamp-3 whitespace-pre-line'}>{g.content}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 이 강사님의 다음 수업 — 상품 종류와 무관하게 항상 노출, 실데이터 없으면 MOCK 카드 */}
      {(
        <Section
          emoji={'✨'}
          title={(await translate('payment_complete_next_lessons_title')).replace('{artist}', artist?.nickName || artist?.name || '강사')}
        >
          {nextLessons.length > 0 ? (
            <div className={'flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5'}>
              {nextLessons.map((l) => <NextLessonCard key={l.id} lesson={l}/>)}
            </div>
          ) : (
            <div className={'flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5'}>
              {MOCK_NEXT_LESSONS.map((l) => (
                <div key={l.id} className={'w-[150px] shrink-0'}>
                  <div className={'w-[150px] aspect-[3/4] rounded-[14px] bg-[#F1F3F6] flex items-center justify-center text-[36px]'}>🕺</div>
                  <p className={'mt-2 text-[13px] font-bold text-black leading-snug line-clamp-1'}>{l.title}</p>
                  <p className={'mt-0.5 text-[11px] text-[#8B95A1] truncate'}>{l.date}</p>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* 강사님의 지난 수업 영상 — 상품 종류와 무관하게 항상 노출. MOCK 카드, 실제 영상 데이터가 생기면 교체 */}
      {(
        <Section emoji={'🎬'} title={(await translate('payment_complete_videos_title')).replace('{artist}', artist?.nickName || artist?.name || '강사')}>
          <div className={'flex flex-col gap-2.5'}>
            {MOCK_VIDEOS.map((v) => (
              <div key={v.title} className={'flex items-center gap-3.5 rounded-[16px] border border-[#F1F3F6] px-3.5 py-3'}>
                <div className={'relative w-[96px] h-[56px] rounded-[10px] bg-[#1E2124] shrink-0 flex items-center justify-center'}>
                  <span className={'w-[26px] h-[26px] rounded-full bg-white/90 flex items-center justify-center'}>
                    <svg width={'10'} height={'12'} viewBox={'0 0 10 12'} fill={'none'}><path d={'M0 0l10 6-10 6V0z'} fill={'#1E2124'}/></svg>
                  </span>
                </div>
                <div className={'flex-1 min-w-0'}>
                  <p className={'text-[13.5px] font-bold text-black leading-snug line-clamp-2'}>{v.title}</p>
                  <p className={'mt-0.5 text-[11.5px] text-[#8B95A1]'}>{v.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 강사님의 유튜브 채널 — youtubeAddress 있을 때만 */}
      {artist?.youtubeAddress && (
        <Section emoji={'🎬'} title={(await translate('payment_complete_videos_title')).replace('{artist}', artist.nickName || artist.name)}>
          <a
            href={`https://www.youtube.com/${artist.youtubeAddress}`}
            target={'_blank'}
            rel={'noreferrer'}
            className={'flex items-center gap-3.5 rounded-[16px] border border-[#F1F3F6] px-4 py-3.5 active:bg-[#F7F8F9] transition-colors'}
          >
            <div className={'relative w-[44px] h-[44px] rounded-full overflow-hidden bg-[#F1F3F6] shrink-0'}>
              {artist.profileImageUrl && (
                <Image src={kioskImageSrc(artist.profileImageUrl, 120) ?? artist.profileImageUrl} alt={''} fill sizes={'44px'} className={'object-cover'}/>
              )}
            </div>
            <div className={'flex-1 min-w-0'}>
              <p className={'text-[14px] font-bold text-black truncate'}>{artist.nickName || artist.name}</p>
              <p className={'text-[12px] text-[#8B95A1]'}>{await translate('payment_complete_videos_desc')}</p>
            </div>
            <svg width={'18'} height={'18'} viewBox={'0 0 24 24'} fill={'none'} className={'shrink-0'}>
              <path d={'M9 6l6 6-6 6'} stroke={'#B1B8BE'} strokeWidth={'2'} strokeLinecap={'round'} strokeLinejoin={'round'}/>
            </svg>
          </a>
        </Section>
      )}

      {/* 하단 고정 CTA — 결제 내역 보기 / 확인(홈) */}
      <div
        className={'fixed bottom-0 left-0 right-0 bg-white border-t border-[#F1F3F6] px-5 pt-3 flex gap-2.5 max-w-[640px] mx-auto'}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}
      >
        {paymentId && (
          <div className={'flex-[2]'}>
            <NavigateClickWrapper method={'push'} route={KloudScreen.PaymentRecordDetail(paymentId)}>
              <button type={'button'} className={'w-full h-[52px] rounded-[14px] bg-[#F2F4F6] text-[15px] font-bold text-[#1E2124] active:scale-[0.98] transition-transform whitespace-nowrap'}>
                {await translate('payment_complete_view_receipt')}
              </button>
            </NavigateClickWrapper>
          </div>
        )}
        <div className={'flex-[3]'}>
          <NavigateClickWrapper method={'navigateMain'}>
            <button type={'button'} className={'w-full h-[52px] rounded-[14px] bg-[#1E2124] text-[16px] font-bold text-white active:scale-[0.98] transition-transform'}>
              {await translate('confirm')}
            </button>
          </NavigateClickWrapper>
        </div>
      </div>
    </div>
  );
}
