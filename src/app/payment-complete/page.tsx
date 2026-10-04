import React from 'react';
import Image from 'next/image';
import { api } from '@/app/api.client';
import { NavigateClickWrapper } from '@/utils/NavigateClickWrapper';
import { getLocale, translate } from '@/utils/translate';
import { PaymentCompleteResponse, PaymentRecordStatus } from '@/app/endpoint/payment.record.endpoint';
import { LessonTags } from '@/app/components/LessonTags';
import { HeroVideo } from '@/app/payment-complete/HeroVideo';
import { LessonLabel, LessonLevelLabel, LessonTypeLabel } from '@/app/components/LessonLabel';
import { LessonType } from '@/entities/lesson/lesson';

// 결제 완료 — 영수증(결제상세) 대신 먼저 보여주는 환영 화면. 결제수단·상품과 무관하게 모든 결제 성공이 여기로 온다.
// 데이터는 GET /paymentRecords/:paymentId/complete 응답 하나로 그린다 (docs/payment-complete-api-요청.md).
// 서버가 null/[]로 준 섹션은 숨긴다 — 목업으로 채우지 않는다. 날짜 문구는 서버 로케일 포맷을 그대로 찍는다.
//
// 디자인 방향: 썸네일을 상태바까지 풀블리드로 깔고(ignoreSafeArea) 그 위에 타이틀을 얹는다. 체크·이모지 아이콘은 쓰지 않는다.

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

// 풀블리드 히어로 — 영상(있으면) 또는 썸네일을 화면 최상단(상태바 포함)까지 깔고, 하단 그라데이션 위에 타이틀·인사를 얹는다.
const FullBleedHero = ({ videoUrl, posterUrl, aspect, children }: { videoUrl?: string | null; posterUrl?: string | null; aspect: string; children: React.ReactNode }) => (
  <div className={`relative w-full ${aspect} bg-[#191F28] overflow-hidden`}>
    <HeroVideo src={videoUrl} posterUrl={posterUrl}/>
    {/* 상태바 가독성용 상단 그라데이션 + 텍스트용 하단 그라데이션 */}
    <div className={'absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-black/40 to-transparent pointer-events-none'}/>
    <div className={'absolute inset-x-0 bottom-0 h-[80%] pointer-events-none'} style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0) 100%)' }}/>
    <div className={'absolute inset-x-0 bottom-0 px-6 pb-7 flex flex-col gap-2.5 pointer-events-none'} style={{ textShadow: '0 1px 12px rgba(0,0,0,0.6)' }}>{children}</div>
  </div>
);

// 문구 매트릭스 — 상품 종류(kind) × 상태(확정 / 입금 대기).
// '상품 구매'가 아니라 '수업 신청 온보딩' 느낌이 목표라 결제 완료보다 신청·발급·등록 완료를 앞세운다.
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
type CopyKind = keyof typeof TITLE_KEY;

export default async function PaymentCompletePage({ searchParams }: {
  searchParams: Promise<{ paymentId?: string; lessonId?: string }>;
}) {
  const { paymentId, lessonId } = await searchParams;
  const locale = await getLocale();

  // 집계 조회 1회 — lessonId는 정기수업 계약·정규반 패스권의 보조 힌트일 뿐이라 있으면 넘기고 서버가 알아서 무시한다.
  const res = paymentId
    ? await api.paymentRecord.getComplete({
        paymentId,
        ...(lessonId && /^\d+$/.test(lessonId) ? { lessonId: Number(lessonId) } : {}),
      }).catch(() => null)
    : null;
  const data: PaymentCompleteResponse | null = res && 'paymentId' in res ? res : null;

  const lesson = data?.lesson ?? null;
  const studio = lesson?.studio ?? null;
  const artist = lesson?.artist ?? null;
  // 계좌이체(무통장)는 입금 확인 전 Pending — '완료' 대신 '접수' 톤으로 안내
  const isPending = data?.status === PaymentRecordStatus.Pending;
  const isAccountTransfer = data?.product.methodType === 'account_transfer';
  const record = data?.paymentInfo ?? null;

  // 문구 분기 — 서버 kind. 연습실·묶음은 일반 문구
  const kind: CopyKind = data?.kind === 'lesson' || data?.kind === 'dedicated' || data?.kind === 'pass' ? data.kind : 'etc';
  const nameForGreeting = data?.greetingName || (await translate('payment_complete_greeting_name_fallback'));
  const planName = data?.product.name || (await translate('payment_complete_dedicated_fallback'));
  const lessonName = lesson?.title || data?.product.name || (await translate('payment_complete_lesson_fallback'));
  const heroTitle = (await translate(TITLE_KEY[kind][isPending ? 1 : 0]))
    .replace('{plan}', planName)
    .replace('{lesson}', lessonName);
  const greeting = (await translate(GREETING_KEY[kind][isPending ? 1 : 0]))
    .replace('{studio}', studio?.name ?? (await translate('payment_complete_greeting_studio_fallback')))
    .replace('{name}', nameForGreeting);

  const when = [lesson?.date, lesson?.timeRange].filter(Boolean).join(' · ');
  const who = [artist?.nickName, lesson?.room?.name].filter(Boolean).join(' · ');
  const artistName = artist?.nickName || artist?.name || (await translate('regular_class_artist'));
  const wonText = await translate('won');
  const totalDiscount = record?.discounts?.reduce((sum, d) => sum + d.amount, 0) ?? 0;

  const classmates = data?.classmates ?? { totalCount: 0, samples: [] };
  const upcomingLessons = data?.upcomingLessons ?? [];
  const videos = data?.videos ?? [];
  const classmateDescTpl = await translate('payment_complete_classmate_desc');
  const classmateCountTpl = await translate('payment_complete_classmate_count');
  const videoWatchText = await translate('payment_complete_video_watch');

  return (
    <div className={'w-full min-h-screen bg-white text-[#191F28] flex flex-col pb-40'}>
      {/* 히어로 — 풀블리드 위에 '신청 완료!' + 인사. 체크 아이콘 없음. heroVideoUrl(학원 유튜브 클립 mp4)이 오면 무음 자동재생, 없으면 썸네일 */}
      <FullBleedHero
        videoUrl={data?.product.heroVideoUrl}
        posterUrl={lesson?.thumbnailUrl ?? data?.product.imageUrl}
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
              {lesson.type && <LessonTypeLabel type={lesson.type as LessonType} locale={locale}/>}
              {lesson.genre && lesson.genre !== 'Default' && <LessonLabel label={lesson.genre} locale={locale}/>}
            </div>
          </div>
          {lesson.tags && lesson.tags.length > 0 && <LessonTags tags={lesson.tags.join(',')}/>}
          <div className={'flex flex-col gap-1'}>
            <p className={'text-[20px] font-bold text-[#191F28] leading-snug tracking-[-0.4px] line-clamp-2'}>{lesson.title}</p>
            {when && <p className={'text-[15px] font-medium text-[#4E5968] tracking-[-0.2px]'}>{when}</p>}
            {who && <p className={'text-[14px] text-[#8B95A1] tracking-[-0.2px] truncate'}>{who}</p>}
          </div>
        </div>
      )}

      {/* 수업이 아닌 결제(패스권·연습실 등) — 상품 정보 */}
      {!lesson && data && (
        <div className={'px-6 pt-6 flex flex-col gap-1'}>
          <p className={'text-[20px] font-bold text-[#191F28] leading-snug tracking-[-0.4px] line-clamp-2'}>{data.product.name}</p>
          <p className={'text-[15px] font-medium text-[#4E5968] tracking-[-0.2px] truncate'}>
            {[`${data.product.amount.toLocaleString()}${wonText}`, data.product.paymentMethodLabel].filter(Boolean).join(' · ')}
          </p>
        </div>
      )}

      {/* 입금 대기(계좌이체) — 입금 계좌 안내 + 확정 안내. 서버 bankAccount가 null이면 학원이 계좌를 안 적어둔 것 → 문의 안내 */}
      {isPending && (
        <div className={'mx-5 mt-6 rounded-[16px] bg-[#FFF8EC] px-5 py-4 flex flex-col gap-3'}>
          <p className={'text-[13px] leading-relaxed font-medium text-[#A05A00] whitespace-pre-line'}>
            {await translate('payment_complete_pending_notice')}
          </p>
          {data?.bankAccount ? (
            <div className={'rounded-[12px] bg-white/80 px-4 py-3 flex flex-col gap-2'}>
              <div className={'flex items-center justify-between gap-3'}>
                <span className={'text-[12px] text-[#A05A00] shrink-0'}>{await translate('payment_complete_bank_account')}</span>
                <span className={'text-[14px] font-bold text-[#3D2A0A] text-right'}>
                  {[data.bankAccount.bank, data.bankAccount.accountNumber].filter(Boolean).join(' ')}
                </span>
              </div>
              {data.bankAccount.depositor && (
                <div className={'flex items-center justify-between gap-3'}>
                  <span className={'text-[12px] text-[#A05A00] shrink-0'}>{await translate('payment_complete_bank_holder')}</span>
                  <span className={'text-[13px] font-semibold text-[#3D2A0A]'}>{data.bankAccount.depositor}</span>
                </div>
              )}
              <div className={'flex items-center justify-between gap-3'}>
                <span className={'text-[12px] text-[#A05A00] shrink-0'}>{await translate('payment_complete_bank_amount')}</span>
                <span className={'text-[14px] font-bold text-[#3D2A0A]'}>{data.bankAccount.amount.toLocaleString()}{wonText}</span>
              </div>
            </div>
          ) : isAccountTransfer ? (
            <p className={'text-[13px] font-semibold text-[#3D2A0A]'}>{await translate('payment_complete_bank_ask_studio')}</p>
          ) : null}
        </div>
      )}

      {/* 총 N명과 함께 + 같이 들었던 수강생 — 인원이 있을 때만. 샘플은 닉네임·프로필만 온다 */}
      {classmates.totalCount > 0 && (
        <div className={'mx-6 mt-8 flex flex-col gap-4'}>
          <div className={'flex items-center gap-3'}>
            {/* 아바타 스택 — 샘플 원 + 나머지 인원 +N */}
            <div className={'flex -space-x-2 shrink-0'}>
              {classmates.samples.map((c) => (
                <span key={c.userId} className={'relative w-[30px] h-[30px] rounded-full ring-2 ring-white overflow-hidden bg-[#E5E8EB] flex items-center justify-center text-[11px] font-bold text-[#4E5968]'}>
                  {c.profileImageUrl
                    ? <Image src={c.profileImageUrl} alt={''} quality={50} fill sizes={'30px'} className={'object-cover'}/>
                    : c.nickName.charAt(0)}
                </span>
              ))}
              {classmates.totalCount - classmates.samples.length > 0 && (
                <span className={'w-[30px] h-[30px] rounded-full ring-2 ring-white flex items-center justify-center text-[11px] font-bold bg-[#191F28] text-white'}>
                  +{classmates.totalCount - classmates.samples.length}
                </span>
              )}
            </div>
            <p className={'text-[15px] font-bold text-[#191F28] tracking-[-0.3px]'}>
              {(await translate('payment_complete_together')).replace('{count}', String(classmates.totalCount))}
            </p>
          </div>
          {classmates.samples.length > 0 && (
            <div className={'flex flex-col gap-2 pl-0.5'}>
              {classmates.samples.map((c) => (
                <p key={c.userId} className={'text-[13.5px] text-[#4E5968] truncate tracking-[-0.2px]'}>
                  <span className={'font-semibold text-[#191F28]'}>{c.nickName}</span>님 · {
                    c.lastSharedLessonTitle
                      ? classmateDescTpl.replace('{lesson}', c.lastSharedLessonTitle)
                      : classmateCountTpl.replace('{count}', String(c.sharedLessonCount))
                  }
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 이 강사님의 다가오는 수업 — 서버가 지금 이후·이번 수업 제외·가까운 순 5개로 준다. 탭 이동 없음 */}
      {upcomingLessons.length > 0 && (
        <Section title={(await translate('payment_complete_next_lessons_title')).replace('{artist}', artistName)}>
          <div className={'flex flex-col gap-3'}>
            {upcomingLessons.map((l) => <UpcomingLessonRow key={l.id} thumbnailUrl={l.thumbnailUrl} title={l.title} date={l.date}/>)}
          </div>
        </Section>
      )}

      {/* 강사님의 영상 — 서버 수집 유튜브 영상. 탭하면 유튜브로 */}
      {videos.length > 0 && (
        <Section title={(await translate('payment_complete_videos_title')).replace('{artist}', artistName)}>
          <div className={'flex flex-col gap-4'}>
            {videos.map((v) => (
              <a key={v.videoId} href={v.url} target={'_blank'} rel={'noreferrer'} className={'flex items-center gap-4 active:opacity-70 transition-opacity'}>
                <div className={'relative w-[112px] h-[64px] rounded-[12px] bg-[#191F28] shrink-0 overflow-hidden flex items-center justify-center'}>
                  {v.thumbnailUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.thumbnailUrl} alt={''} className={'absolute inset-0 w-full h-full object-cover'}/>
                  )}
                  <span className={'relative w-[28px] h-[28px] rounded-full bg-white/90 flex items-center justify-center'}>
                    <svg width={'10'} height={'12'} viewBox={'0 0 10 12'} fill={'none'}><path d={'M1 0l9 6-9 6V0z'} fill={'#191F28'}/></svg>
                  </span>
                </div>
                <div className={'flex-1 min-w-0'}>
                  <p className={'text-[14.5px] font-semibold text-[#191F28] leading-snug line-clamp-2 tracking-[-0.2px]'}>{v.title}</p>
                  <p className={'mt-1 text-[12px] text-[#8B95A1]'}>
                    {[v.viewCountLabel, v.publishedAtLabel].filter(Boolean).join(' · ') || videoWatchText}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* 강사님의 유튜브 채널 — youtubeAddress 있을 때만 (지금은 서버가 항상 null) */}
      {artist?.youtubeAddress && (
        <Section title={(await translate('payment_complete_videos_title')).replace('{artist}', artistName)}>
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
              <p className={'text-[14.5px] font-semibold text-[#191F28] truncate'}>{artistName}</p>
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
            {record.createdAt && <InfoRow label={await translate('payment_datetime')} value={record.createdAt}/>}
            {record.paymentMethodLabel && <InfoRow label={await translate('payment_method')} value={record.paymentMethodLabel}/>}
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
                {record.discounts.map((d, i) => (
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
