'use client'

import PaymentButton, { PaymentType } from "@/app/lessons/[id]/payment/payment.button";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { RefundInformation } from "@/app/lessons/[id]/payment/RefundInformation";
import { PurchaseInformation } from "@/app/lessons/[id]/payment/PurchaseInformation";
import { SellerInformation } from "@/app/lessons/[id]/payment/SellerInformation";
import { PaymentMethodComponent } from "@/app/lessons/[id]/payment/PaymentMethod";
import { DiscountSection } from "@/app/lessons/[id]/payment/DiscountSection";
import { PassesSection } from "@/app/payment/PassesSection";
import { PricePolicySection } from "@/app/payment/PricePolicySection";
import { SubscriptionSection } from "@/app/payment/SubscriptionSection";
import { NextLessonCard } from "@/app/payment/NextLessonCard";
import { CouponResponse, DiscountResponse, GetPaymentMethodResponse, GetPaymentResponse, LessonPricePolicyResponse, PaymentMethodType } from "@/app/endpoint/payment.endpoint";
import { GetPassResponse } from "@/app/endpoint/pass.endpoint";
import { GetBillingResponse } from "@/app/endpoint/billing.endpoint";
import { Locale, StringResourceKey } from "@/shared/StringResource";
import { getLocaleString } from "@/app/components/locale";
import { firstLessonDate } from "@/utils/weekly.days";
import { dayDiffFromToday, formatRelativeDay, isAbsoluteRelativeDay } from "@/utils/lesson.relative.date";

type UnifiedPaymentType = 'lesson' | 'lesson-group' | 'pass-plan' | 'practice-room' | 'bundle' | 'regular-class';

const getPaymentType = (type: UnifiedPaymentType): PaymentType => {
  switch (type) {
    case 'lesson':
      return { value: 'lesson', prefix: 'LT', apiValue: 'lesson' };
    case 'lesson-group':
      // 수업 가격정책 = 정규반 패스권. 서버 item 은 'pass-plan'(lesson-group 은 2026-10-07 부터 거절). 판정용 value 만 lessonGroup 유지
      return { value: 'lessonGroup', prefix: 'LP', apiValue: 'pass-plan' };
    case 'pass-plan':
    // 정규반은 고른 가격정책(pass-plan)을 산다 — paymentId 도 'LP…'
    case 'regular-class':
      return { value: 'passPlan', prefix: 'LP', apiValue: 'pass-plan' };
    case 'practice-room':
      return { value: 'practiceRoom', prefix: 'PR', apiValue: 'practice-room' };
    case 'bundle':
      return { value: 'bundle', prefix: 'BD', apiValue: 'bundle' };
  }
}

const getTitleResource = (type: UnifiedPaymentType): StringResourceKey => {
  if (type === 'regular-class') return 'regular_class_price';
  if (type === 'pass-plan') return 'pass_plan_price';
  if (type === 'bundle') return 'promotion_price';
  if (type === 'practice-room') return 'practice_room_price';
  return 'lesson_price';
}

const getItemId = (payment: GetPaymentResponse, type: UnifiedPaymentType): number => {
  switch (type) {
    case 'lesson':
    // lesson-group으로 진입해도 정책 선택 전 기본값은 lesson id — 정책이 선택되면 호출부가 정책 id로 대체한다.
    case 'lesson-group':
      return payment.lesson?.id ?? 0;
    case 'pass-plan':
      return payment.passPlan?.id ?? 0;
    // 정책 선택 전 기본값 — 정책이 선택되면 호출부가 정책(=가격정책) id 로 대체한다
    case 'regular-class':
      return payment.regularClass?.id ?? 0;
    case 'practice-room':
      return payment.studioRoom?.id ?? 0;
    case 'bundle':
      return payment.bundle?.id ?? 0;
  }
}

const getItemTitle = (payment: GetPaymentResponse, type: UnifiedPaymentType): string => {
  switch (type) {
    case 'lesson':
    case 'lesson-group':
      return payment.lesson?.title ?? '';
    case 'pass-plan':
      return payment.passPlan?.name ?? '';
    case 'regular-class':
      return payment.regularClass?.name ?? '';
    case 'practice-room':
      return payment.studioRoom?.name ?? '';
    case 'bundle':
      return payment.bundle?.name ?? '';
  }
}

const getItemPrice = (payment: GetPaymentResponse, type: UnifiedPaymentType): number => {
  // 최상위 price가 있으면 우선 사용, 없으면 아이템별 price
  if (payment.price != null) return payment.price;
  switch (type) {
    case 'lesson':
    case 'lesson-group':
      return payment.lesson?.price ?? 0;
    case 'pass-plan':
      return payment.passPlan?.price ?? 0;
    case 'regular-class':
      return 0;
    case 'practice-room':
      return payment.price ?? payment.studioRoom?.unitPrice ?? 0;
    case 'bundle':
      return 0;
  }
}

const getStudio = (payment: GetPaymentResponse, type: UnifiedPaymentType) => {
  switch (type) {
    case 'lesson':
      return payment.lesson?.studio;
    case 'pass-plan':
      return payment.passPlan?.studio;
    case 'regular-class':
      return payment.regularClass?.studio;
    case 'practice-room':
      return null;
    case 'bundle':
      // bundle.studio는 간소형 — SellerInformation의 GetStudioResponse 풀 타입과 안 맞아 null 처리.
      // 판매자 정보는 BE가 페이로드에 풀 스튜디오 보내주면 그때 연결.
      return null;
  }
}

/** 가격정책 옆 '1회' 결제 카드의 선택 id — 서버 정책 id 는 양수라 겹치지 않는다 */
const ONE_TIME_OPTION_ID = -1;

/**
 * 시작 안내 문구에서 '화요일(9.24)' 부분만 굵게 — 템플릿에서 {day} 부터 ({date}) 닫는 괄호까지를 bold span 으로 감싼다.
 * {day} 가 없는 템플릿('내일({date})…')은 괄호 앞 단어부터, 괄호도 없으면 {date} 만.
 */
const emphasizeWhen = (template: string, day: string | undefined, date: string | undefined) => {
  const fill = (t: string) => t.replace('{day}', day ?? '').replace('{date}', date ?? '');
  const dateAt = template.indexOf('{date}');
  const dayAt = template.indexOf('{day}');
  // {date} 없이 {day} 만 있는 템플릿('11월 24일 (화)부터 시작합니다') — {day} 만 굵게
  if (dateAt < 0) {
    if (dayAt < 0) return fill(template);
    const end = dayAt + '{day}'.length;
    return (
      <>
        {fill(template.slice(0, dayAt))}
        <span className="font-bold text-black">{fill(template.slice(dayAt, end))}</span>
        {fill(template.slice(end))}
      </>
    );
  }
  const wrapped = template[dateAt - 1] === '(' && template[dateAt + '{date}'.length] === ')';
  const start = dayAt >= 0
    ? dayAt
    : wrapped ? template.lastIndexOf(' ', dateAt - 2) + 1 : dateAt;
  const end = dateAt + '{date}'.length + (wrapped ? 1 : 0);
  return (
    <>
      {fill(template.slice(0, start))}
      <span className="font-bold text-black">{fill(template.slice(start, end))}</span>
      {fill(template.slice(end))}
    </>
  );
};

/**
 * 첫 수업 시작 안내 문구 — 정규반·수업 결제 공용.
 * 오늘 → '오늘부터 바로 시작합니다' / 내일 → '내일(9.23)부터 바로 시작합니다' / 그 뒤 → '이번주 목요일(9.24)부터 시작합니다'.
 * 2주 넘게 남아 상대 표현이 절대 날짜('11월 24일 (화)')로 떨어지면 괄호 날짜는 생략 — '11월 24일 (화)부터 시작합니다'.
 * first 가 없으면(남은 회차 없음 등) fallbackDate 로 '{date}부터 시작'.
 */
const startNoticeLabel = (first: Date | null, fallbackDate: string, locale: Locale) => {
  if (!first) return emphasizeWhen(getLocaleString({ locale, key: 'pass_starts_on' }), undefined, fallbackDate);
  const diff = dayDiffFromToday(first);
  if (diff <= 0) return getLocaleString({ locale, key: 'regular_class_starts_today' });
  const md = `${first.getMonth() + 1}.${first.getDate()}`;
  if (diff > 1 && isAbsoluteRelativeDay(first)) {
    return emphasizeWhen(getLocaleString({ locale, key: 'regular_class_starts_on_date' }), formatRelativeDay(first, locale), undefined);
  }
  return emphasizeWhen(
    getLocaleString({ locale, key: diff === 1 ? 'regular_class_starts_tomorrow' : 'regular_class_starts_on' }),
    formatRelativeDay(first, locale),
    md,
  );
};

const needsMountCheck = (type: UnifiedPaymentType) =>
  type === 'pass-plan' || type === 'regular-class';

const defaultMethod = (type: UnifiedPaymentType): PaymentMethodType | undefined =>
  type === 'pass-plan' || type === 'regular-class' ? 'credit' : undefined;

export const UnifiedPaymentInfo = ({
  payment,
  type,
  url,
  appVersion,
  os,
  locale,
  beforeDepositor,
  actualPayerUserId,
  isProxyPayment,
  practiceRoomInfo,
  buttonSlotId,
}: {
  payment: GetPaymentResponse,
  type: UnifiedPaymentType,
  url: string,
  appVersion: string,
  os?: string,
  beforeDepositor: string,
  actualPayerUserId?: number,
  isProxyPayment?: boolean,
  locale: Locale,
  practiceRoomInfo?: { studioRoomId: number; startDate: string; endDate: string },
  /**
   * 결제 버튼을 화면 하단 고정 대신 이 id의 DOM 노드로 portal한다.
   * PC 결제 폼(PaymentPcForm)이 우측 요약 카드 아래 슬롯을 두고 지정 — 모바일 인스턴스는 미지정(고정 버튼 유지).
   */
  buttonSlotId?: string,
}) => {
  // easy_pay의 providers를 개별 메서드로 풀어서 사용
  const easyPayLabel: Record<string, string> = {
    naver_pay: getLocaleString({ locale, key: 'naver_pay' }),
    kakao_pay: getLocaleString({ locale, key: 'kakao_pay' }),
    toss_pay: getLocaleString({ locale, key: 'toss_pay' }),
  };
  // 패스권 전용 — 수업인데 서버가 price를 null로 주고 가격정책도 없으면 금액이 정해지지 않은 수업이다.
  // 이때는 카드·해외카드·내 결제수단·계좌이체·간편결제 전부 막고 패스권(회차 차감)으로만 결제한다.
  // (methods에 뭐가 와도 무시. 할인 패스는 깎을 금액이 없어 쓸 수 없다)
  const rawPricePolicies = payment.lesson?.pricePolicies ?? payment.pricePolicies ?? [];
  const passOnly = type === 'lesson' && payment.price == null && rawPricePolicies.filter(p => p.status !== 'Cancelled').length === 0;

  // 'pass'는 결제수단 영역이 아니라 별도 PassesSection으로 렌더 — 결제수단 옵션에서 제외.
  // 단 methods에 'pass'가 있다는 사실은 "패스 결제 활성" 신호로 PassesSection 노출 가드에 사용.
  const passMethodEnabled = passOnly || payment.methods.some(m => m.type === 'pass');
  const paymentMethods: GetPaymentMethodResponse[] = (passOnly ? [] : payment.methods)
    .filter(m => m.type !== 'pass')
    .flatMap(m => {
      if (m.type === 'easy_pay' && m.providers && m.providers.length > 0) {
        return m.providers.map((p, i) => ({ id: m.id * -100 - i, type: p, name: easyPayLabel[p] ?? p }));
      }
      return [m];
    });

  // canSubscribe=true면 정기결제 스페셜 섹션을 따로 노출한다.
  // 결제수단 목록은 BE가 주는 대로 전부(billing 포함) 그대로 — 일반 billing 선택은 단건 결제,
  // 정기결제 섹션 선택(subscribeSelected)일 때만 구독 생성(POST /subscription)으로 간다.
  // 1회(단건) 선택 중엔 정기결제 섹션을 숨긴다 — oneTimeSelected 는 아래 가격정책 state 에서 결정되므로 렌더 직전에 합친다
  const canSubscribeBase = payment.canSubscribe === true && !passOnly;

  // BE 응답이 user와 같은 레벨로 분리됨 — 마이그레이션 호환 위해 둘 다 시도.
  // 비회원(연습실 게스트)은 user가 없으므로 옵셔널 체이닝.
  const availablePasses: GetPassResponse[] = payment.passes ?? payment.user?.passes ?? [];

  // BE가 단일 passRule로 내려줌 (신규). legacy passRules[] 첫 요소 fallback.
  // - Discount 룰 → 일반 결제수단 + selectedDiscount 적용 (결제수단/패스 동시 활성 OK, 잔액 일반 결제)
  // - FreeCount/Unlimited 룰 → selectedMethod='pass' + selectedDiscount=undefined (use pass 풀커버)
  const getPrimaryRule = (pass: GetPassResponse) =>
    pass.passRule ?? (pass.passRules ?? [])[0];

  const getPassDiscountRule = (pass: GetPassResponse) => {
    const rule = getPrimaryRule(pass);
    return rule?.usable && rule.benefitType === 'Discount' ? rule : undefined;
  };

  const buildDiscountFromPass = (pass: GetPassResponse): DiscountResponse | undefined => {
    const rule = getPrimaryRule(pass);
    if (!rule?.usable || rule.benefitType !== 'Discount' || (rule.benefitValue ?? 0) <= 0) return undefined;
    return {
      key: pass.passPlan?.name ?? 'pass',
      value: String(rule.benefitValue ?? 0),
      amount: rule.benefitValue ?? 0,
      type: 'passRule',
      itemId: pass.id,
      description: pass.passPlan?.name,
      passRule: {
        id: rule.id,
        status: rule.status,
        startDate: rule.startDate,
        endDate: rule.endDate,
        remainingCount: rule.remainingCount,
        usageCount: rule.usageCount,
        targetType: rule.targetType,
        targetValue: rule.targetValue,
        targetLabel: rule.targetLabel,
        benefitType: rule.benefitType,
        benefitValue: rule.benefitValue,
        excludes: rule.excludes,
        usable: rule.usable,
      },
    };
  };

  // 수업 가격 정책 — 존재하면 방식 선택 UI를 노출하고 선택한 정책의 price/paymentId로 결제한다.
  // 스펙상 위치는 lesson 하위. payment 루트는 구버전 응답 폴백이다.
  // 판매 중단(Cancelled)된 방식은 제외 — 이미 산 수강권은 유지되지만 새로 팔지는 않는다.
  // 정렬은 서버가 lessonCount 오름차순으로 보장하므로 그대로 쓴다.
  const pricePolicies: LessonPricePolicyResponse[] = useMemo(() => {
    const fromApi = payment.lesson?.pricePolicies ?? payment.pricePolicies ?? [];
    return fromApi.filter(p => p.status !== 'Cancelled');
  }, [payment.lesson?.pricePolicies, payment.pricePolicies]);
  const hasPolicies = pricePolicies.length > 0;
  // 방식이 요일로 갈리는지(월/수/금 등) — 섹션 제목·첫 수업일 안내 분기에 쓴다
  const policiesHaveDays = pricePolicies.some(p => (p.days?.length ?? 0) > 0);
  // 1회 결제 카드 — 수업 결제에서 수강료(최상위 price)가 있고 가격정책도 함께 오면(2026-10-21 서버) 정책 옆에 '1회' 선택지를 둔다.
  // 1회는 최상위 price·paymentId(LT…)로 단건 결제하고 패스권을 쓸 수 있다. 정책을 고르면 지금까지와 같다(LP…, 패스·정기결제 분기).
  // 정규반(regular-class)은 최상위 price 가 기본 정책 값이라 1회 카드를 두지 않는다.
  const oneTimeAvailable = type === 'lesson' && hasPolicies && payment.price != null;
  // 0원 수업의 1회 — 서버가 methods 를 남겨 보내도 무료 신청으로 처리(결제수단·패스·할인 섹션 숨김)
  const oneTimeFreePrice = oneTimeAvailable && payment.price === 0;
  // 기본 선택 — 구매 가능한(usable !== false) 방식 중 isRecommended 우선, 없으면 1회(있을 때), 없으면 첫 번째.
  // 전부 불가면 첫 번째를 선택해 사유를 보여주고 결제 버튼은 disabled로 막는다.
  const defaultPolicyId = hasPolicies
    ? (pricePolicies.find(p => p.isRecommended && p.usable !== false)?.id
        ?? (oneTimeAvailable ? ONE_TIME_OPTION_ID : undefined)
        ?? (pricePolicies.find(p => p.usable !== false) ?? pricePolicies[0]).id)
    : undefined;
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | undefined>(defaultPolicyId);
  const oneTimeSelected = oneTimeAvailable && selectedPolicyId === ONE_TIME_OPTION_ID;
  const oneTimeFree = oneTimeSelected && oneTimeFreePrice;
  // 1회를 골랐으면 정책 없음 — 아래 분기가 전부 수업 단건(LT) 경로로 떨어진다
  const selectedPolicy = hasPolicies && !oneTimeSelected
    ? (pricePolicies.find(p => p.id === selectedPolicyId) ?? pricePolicies[0])
    : undefined;
  // 선택 UI 에 넘길 옵션 — 1회 카드는 정책과 같은 모양(id 는 음수 센티넬)으로 맨 앞에
  const policyOptions: LessonPricePolicyResponse[] = oneTimeAvailable
    ? [{ id: ONE_TIME_OPTION_ID, paymentId: payment.paymentId, name: getLocaleString({ locale, key: 'one_time_option' }), lessonCount: 1, price: payment.price ?? 0 }, ...pricePolicies]
    : pricePolicies;

  const [cards, setCards] = useState<GetBillingResponse[]>(payment.cards ?? []);
  // 사용 가능한 패스 후보 — Discount/FreeCount/Unlimited 구분 없이 일단 잡는다.
  // 단 가격 정책(정기, LGT) 수업은 패스권으로 살 수 없으므로(패스는 회차 단건 LT 전용) 자동 선택하지 않는다.
  // 기본 선택이 1회면 단건 결제라 패스 자동 선택 대상 — 다만 0원 1회는 무료 신청이라 제외.
  const initialPolicySelected = defaultPolicyId != null && defaultPolicyId !== ONE_TIME_OPTION_ID;
  const initialOneTimeFree = defaultPolicyId === ONE_TIME_OPTION_ID && oneTimeFreePrice;
  const detectedInitialPass = (initialPolicySelected || initialOneTimeFree) ? undefined : availablePasses.find(p => {
    const rule = getPrimaryRule(p);
    if (passOnly && getPassDiscountRule(p)) return false; // 패스 전용에선 할인 패스는 못 쓴다
    return !!rule?.usable || (p.passFeatures ?? []).some(f => f.usable);
  });
  const detectedIsDiscount = !!(detectedInitialPass && getPassDiscountRule(detectedInitialPass));
  // 초기 패스 분기:
  //   - Discount 룰 → 일반 결제수단 + selectedDiscount 자동 적용 (passMethodEnabled 무관)
  //   - 그 외(FreeCount/Unlimited) 룰 → 결제수단을 'pass'로 진입해야 하므로 passMethodEnabled가 true일 때만 허용.
  //     methods에 pass가 없는데 use-pass 류 패스만 보이는 부정합 케이스는 자동 method 선택을 보류해
  //     결제 버튼이 disabled 되도록 유도(사용자에게 명시 선택 강제).
  const fallbackMethod: PaymentMethodType | undefined = passOnly
    ? undefined
    : (defaultMethod(type) ?? (paymentMethods.length > 0 ? paymentMethods[0].type : undefined));
  const useTypePassWithoutPassMethod =
    !passMethodEnabled && !!detectedInitialPass && !detectedIsDiscount;
  const initialPass: GetPassResponse | undefined = useTypePassWithoutPassMethod
    ? undefined
    : detectedInitialPass;
  const initialPassIsDiscount = !!(initialPass && getPassDiscountRule(initialPass));
  const initialMethod: PaymentMethodType | undefined = useTypePassWithoutPassMethod
    ? undefined                                                // BE 부정합 → disabled 유도
    : (initialPass && !initialPassIsDiscount ? 'pass' : fallbackMethod);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | undefined>(initialMethod);
  const [selectedPass, setSelectedPass] = useState<GetPassResponse | undefined>(initialPass);
  const [selectedBillingCard, setSelectedBillingCard] = useState<GetBillingResponse | undefined>(
    payment.cards && payment.cards.length > 0 ? payment.cards[0] : undefined
  );
  const [depositor, setDepositor] = useState(beforeDepositor);
  const [mounted, setMounted] = useState(false);
  // portal 대상은 서버 렌더된 노드라 마운트 후에만 찾을 수 있다
  const [buttonSlot, setButtonSlot] = useState<HTMLElement | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponResponse | undefined>(undefined);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountResponse | undefined>(
    (type === 'pass-plan' || type === 'regular-class' || type === 'practice-room' || !initialPass || !initialPassIsDiscount)
      ? undefined
      : buildDiscountFromPass(initialPass)
  );

  const [passOnlyNotice, setPassOnlyNotice] = useState<string | undefined>(undefined);
  const handleSelectMethod = (method: PaymentMethodType) => {
    if (passOnly && method !== 'pass') return; // 패스 전용 — 일반 결제수단은 선택 불가
    setSelectedMethod(method);
    // 현재 선택된 패스가 FreeCount/Unlimited(=use pass 흐름)면 일반 결제수단과 모순 → 해제.
    // Discount 패스는 일반 결제수단과 같이 쓰는 정상 케이스 → 유지.
    if (method !== 'pass' && selectedPass && !getPassDiscountRule(selectedPass)) {
      setSelectedPass(undefined);
    }
  }

  // 정기결제 섹션이 선택됐는지 — 결제수단은 'billing'을 공유하되 제출 경로(단건/구독)만 가른다
  const [subscribeSelected, setSubscribeSelected] = useState(false);

  // 수강 방식(1회 / 가격정책) 선택 — 정책으로 가면 패스권을 못 쓰니 1회에서 고른 패스·패스 할인을 풀고,
  // 1회로 오면 정기결제 섹션이 사라지므로 구독 모드를 해제한다.
  const handleSelectOption = (optionId: number) => {
    setSelectedPolicyId(optionId);
    if (optionId !== ONE_TIME_OPTION_ID) {
      if (selectedPass) {
        setSelectedPass(undefined);
        if (selectedDiscount?.type === 'passRule') setSelectedDiscount(undefined);
      }
      if (selectedMethod === 'pass') setSelectedMethod(fallbackMethod);
    } else {
      setSubscribeSelected(false);
    }
  };
  // 패스 선택 등 어떤 경로로든 수단이 billing에서 벗어나면 구독 모드 해제
  useEffect(() => {
    if (subscribeSelected && selectedMethod !== 'billing') setSubscribeSelected(false);
  }, [subscribeSelected, selectedMethod]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!buttonSlotId) return;
    setButtonSlot(document.getElementById(buttonSlotId));
  }, [buttonSlotId]);

  if (needsMountCheck(type) && !mounted) return null;

  const studio = getStudio(payment, type);
  // 정규반도 패스권(가격정책)을 사는 결제라 보유 패스로는 못 산다
  const noPass = type === 'pass-plan' || type === 'regular-class' || type === 'practice-room';
  // 가격정책을 골랐으면 그 옵션의 가격, 1회·정책 없는 상품은 최상위 price(없으면 아이템별 price)가 상품가.
  const itemPrice = selectedPolicy ? selectedPolicy.price : getItemPrice(payment, type);
  const canSubscribe = canSubscribeBase && !oneTimeSelected;

  // 정기결제 주기 — 선택한 가격 정책으로 연산: 회차 수 ÷ 주당 요일 수 ≈ N주마다.
  // 요일 없는 정책은 회차 기준(N회마다), 정책 없는 상품(패스플랜 등)은 월 단위 폴백.
  const subscriptionCycle = (() => {
    if (selectedPolicy && selectedPolicy.lessonCount > 0) {
      const daysPerWeek = selectedPolicy.days?.length ?? 0;
      if (daysPerWeek > 0) {
        const weeks = Math.max(1, Math.round(selectedPolicy.lessonCount / daysPerWeek));
        return {
          suffix: getLocaleString({ locale, key: 'subscription_per_weeks' }).replace('{n}', String(weeks)),
          label: getLocaleString({ locale, key: 'cycle_every_weeks' }).replace('{n}', String(weeks)),
        };
      }
      return {
        suffix: getLocaleString({ locale, key: 'subscription_per_sessions' }).replace('{n}', String(selectedPolicy.lessonCount)),
        label: getLocaleString({ locale, key: 'cycle_every_sessions' }).replace('{n}', String(selectedPolicy.lessonCount)),
      };
    }
    return {
      suffix: getLocaleString({ locale, key: 'subscription_per_month' }),
      label: getLocaleString({ locale, key: 'cycle_monthly' }),
    };
  })();
  const priceAvailable = hasPolicies || payment.price != null;
  const priceNotAvailable = !priceAvailable && payment.methods.length === 0;

  // 할인은 하나만 선택 가능 (패스 할인 or 쿠폰)
  const activeDiscounts: DiscountResponse[] | undefined = (() => {
    if (selectedCoupon) {
      return [{
        key: selectedCoupon.name,
        value: String(selectedCoupon.discountAmount),
        amount: selectedCoupon.discountAmount,
        type: 'Coupon',
        itemId: selectedCoupon.id,
      }];
    }
    if (selectedDiscount) {
      return [selectedDiscount];
    }
    return undefined;
  })();

  const totalDiscount = (activeDiscounts ?? []).reduce((sum, d) => sum + d.amount, 0);
  const totalPrice = Math.max(0, itemPrice - totalDiscount);

  // 번들 프로모션 — 원래 금액(bundle.originalPrice)이 판매가(itemPrice)보다 크면
  // 하단 결제정보에 "원래 금액"(찍찍 긋기) + "프로모션 할인" 항목으로 표시.
  // 표시 전용이라 API로 넘어가는 activeDiscounts에는 포함하지 않는다(이중 차감 방지).
  const bundlePromotion = (() => {
    if (type !== 'bundle') return null;
    const orig = payment.bundle?.originalPrice;
    if (orig == null || orig <= itemPrice) return null;
    return { originalPrice: orig, discount: orig - itemPrice };
  })();

  const displayOriginalPrice = bundlePromotion?.originalPrice ?? itemPrice;
  const displayDiscounts: DiscountResponse[] | undefined = bundlePromotion
    ? [
        {
          key: getLocaleString({ locale, key: 'promotion_discount' }),
          value: String(bundlePromotion.discount),
          amount: bundlePromotion.discount,
          type: 'Promotion',
          itemId: 0,
        },
        ...(activeDiscounts ?? []),
      ]
    : activeDiscounts;

  return (
    <div className={"flex flex-col"}>
      {/* 대리 결제 안내 배너 */}
      {isProxyPayment && (
        <div className="mx-6 mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-900">
            📢 {payment.user?.name}{getLocaleString({ locale, key: 'proxy_payment_notice' })}
          </p>
        </div>
      )}

      {/* 수강 횟수 가격정책 선택 — 1회/4회/8회 등 옵션이 있을 때만 노출.
          "무엇을 사는지"가 정해져야 결제 금액이 확정되므로 결제수단보다 위에 온다. */}
      {hasPolicies && (
        <>
          <PricePolicySection
            locale={locale}
            policies={policyOptions}
            selectedPolicyId={selectedPolicyId}
            onSelectPolicy={(policy) => handleSelectOption(policy.id)}
            // 정규반 옵션은 횟수 차이일 수도, 요일(월요반/수요반) 차이일 수도 있어 중립 문구.
            // 수업 가격정책도 요일(월/수/금)로 갈리면 '수강 횟수 선택'은 안 맞으므로 같은 중립 문구
            titleKey={type === 'regular-class' || policiesHaveDays ? 'select_enroll_option' : undefined}
            hideDescription={type === 'regular-class'}
          />
          {/* 첫 수업 시작일 안내 — 결제 화면에 띄운 회차(firstLessonId로 전송되는 그 회차)부터 계약이 잡힌다.
              date는 서버가 로케일 적용해 내려주는 표시 문자열 그대로. */}
          {/* 정규반 — 첫 수업 시작 안내(상대 날짜).
              서버가 고른 방식의 nextLesson(휴강·취소 회차 반영, 2026-10-21)을 주면 그 날짜. null 이면 남은 회차가 없어 패스 시작일만.
              키 자체가 없는 구서버면 종전대로 startDate(패스 시작일, 남은 패스가 있으면 그 만료 다음 날)부터 방식 요일 중 가장 가까운 날을 FE 가 추정.
              상대 날짜는 수업 카드와 같은 formatRelativeDay(기기 로컬). 결제 폼은 마운트 후에만 그리므로(needsMountCheck) 하이드레이션 불일치 없음 */}
          {type === 'regular-class' && payment.startDate && (() => {
            const nextLesson = selectedPolicy?.nextLesson;
            const first = nextLesson === null
              ? null
              : nextLesson
                ? firstLessonDate(nextLesson.startDate, undefined)
                : firstLessonDate(payment.startDate, selectedPolicy?.days);
            const label = startNoticeLabel(first, payment.startDate, locale);
            // 서버가 첫 회차를 주면 시작 안내 + 회차 정보(썸네일·제목·일시·수업시간·강사)를 한 카드로. 구서버(키 없음)·null 이면 안내 배너만
            if (nextLesson) return <NextLessonCard lesson={nextLesson} label={label} locale={locale} />;
            return (
              <div className="mx-6 mt-3 rounded-[12px] bg-[#F7F8FA] px-4 py-3">
                <span className="text-[13px] font-medium text-[#4E5968]">{label}</span>
              </div>
            );
          })()}
          {/* [2026-10-21 논의] item=lesson 결제 화면에서 정규반(가격정책)까지 파는 이유와 알려진 혼동 케이스
              - "lesson 은 기존처럼 해당 회차만 사게 두는 게 낫지 않나, 여기서 정규반을 사는 게 헷갈려 보인다"는 의견이 있었다.
              - 유지한 이유: 유저는 시간표를 많이 보고, 시간표 → 회차 상세로 들어가면 정규반 구매 동선이 끊긴다.
                홈의 '수강 등록하기'가 더 빠르긴 하지만 시간표 진입이 흔해 상세에서도 정규반을 살 수 있어야 한다.
              - 서버 동작: 여기서 정규반(paymentId LP…)을 결제하면 서버는 가장 가까운 회차부터 티켓을 만든다.
                어떤 LT(화면에 띄운 회차)에서 들어왔는지는 서버가 모른다. 그래서 '이 회차부터'가 아니라 서버 nextLesson(가장 가까운 회차)을 보여준다.
              - DB 구조를 아는 우리 눈엔 헷갈리지만 유저 입장에선 괜찮다고 판단. 딱 하나 걸리는 케이스는
                다음주 시간표/다음주 회차 상세로 들어와 "다음주부터 들어야지" 하는 유저가 아래 시작 안내 문구까지 무시하는 경우.
              - 결론: 흔한 케이스가 아니라 일단 지켜본다. 실제로 발생하면 경고 문구를 더 세게 주는 쪽을 다시 고민. */}
          {/* 수업 가격정책 — 방식을 고르면 정규반에 등록하는 것이라 정규반과 같은 시작 안내(문구·카드)를 쓴다.
              서버가 고른 방식의 nextLesson 을 주면 그 회차 카드. 구서버(키 없음)·남은 회차 없음(null)이면 화면 회차(lesson.date)부터
              방식 요일 중 가장 가까운 날을 FE 가 추정해 배너로(휴강·공휴일 반영 안 됨).
              '이번 수업만 체험하기'(단건)를 골랐으면 정규반 등록이 아니라 생략. */}
          {type !== 'regular-class' && payment.lesson?.date && !oneTimeSelected && (() => {
            const nextLesson = selectedPolicy?.nextLesson;
            const first = nextLesson
              ? firstLessonDate(nextLesson.startDate, undefined)
              : firstLessonDate(payment.lesson!.date, selectedPolicy?.days);
            const label = startNoticeLabel(first, payment.lesson!.date!, locale);
            if (nextLesson) return <NextLessonCard lesson={nextLesson} label={label} locale={locale} />;
            return (
              <div className="mx-6 mt-3 rounded-[12px] bg-[#F7F8FA] px-4 py-3">
                <span className="text-[13px] font-medium text-[#4E5968]">{label}</span>
              </div>
            );
          })()}
          {/* 패스 전용이면 바로 아래 안내 박스가 이어지므로 구분선 없이 여백만 */}
          {!passOnly && <div className="my-5 mx-6 h-px bg-[#F0F0F0]" />}
        </>
      )}

      {/* 정기결제 스페셜 섹션 — canSubscribe 상품에서만. 선택 시 구독 생성(POST /subscription) 경로 */}
      {canSubscribe && (
        <SubscriptionSection
          locale={locale}
          price={itemPrice}
          cycleSuffix={subscriptionCycle.suffix}
          cycleLabel={subscriptionCycle.label}
          cards={cards ?? []}
          onCardsChangeAction={(cards) => setCards(cards)}
          selectedBillingCard={selectedBillingCard}
          selectBillingCard={(card: GetBillingResponse) => setSelectedBillingCard(card)}
          selected={subscribeSelected}
          onSelectAction={() => {
            setSubscribeSelected(true);
            handleSelectMethod('billing');
          }}
        />
      )}

      {/* 0원 수업의 1회 — 서버가 methods 를 남겨 보내도 무료 신청(결제 버튼 price 0 → free 경로)이라 결제수단을 그리지 않는다 */}
      {!oneTimeFree && paymentMethods.length > 0 && (
        <>
          <PaymentMethodComponent
            locale={locale}
            passes={[]}
            cards={cards ?? []}
            onCardsChangeAction={(cards) => setCards(cards)}
            selectedPass={selectedPass}
            selectedBillingCard={selectedBillingCard}
            selectBillingCard={(card: GetBillingResponse) => setSelectedBillingCard(card)}
            selectPass={(pass: GetPassResponse) => setSelectedPass(pass)}
            paymentOptions={paymentMethods}
            selectedMethod={subscribeSelected ? undefined : selectedMethod}
            selectPaymentMethodAction={(m) => {
              // 일반 수단을 고르면 정기결제 모드 해제 (같은 billing이어도 단건 경로)
              setSubscribeSelected(false);
              handleSelectMethod(m);
            }}
            depositor={depositor}
            setDepositorAction={setDepositor}
            refundAccount={{
              holderName: payment.refundDepositor,
              bankName: payment.refundAccountBank,
              accountNumber: payment.refundAccountNumber
            }}

            os={os}
            appVersion={appVersion}
            titleOverride={
              payment.price == null
                ? getLocaleString({ locale, key: 'application_method' })
                // 정기결제 섹션이 따로 있으면 이 목록은 '일반결제' — 단건 경로임을 구분
                : canSubscribe
                  ? getLocaleString({ locale, key: 'regular_payment' })
                  : undefined
            }
          />

          <div className="mt-5 mx-6 h-px bg-[#F0F0F0]" />
        </>
      )}

      {/* 패스권 — 결제수단/할인과 같은 레벨의 별도 영역.
          methods에 'pass'가 활성이면 무조건 섹션 노출(passes 비어 있어도 안내 메시지 표시). */}
      {passMethodEnabled && !oneTimeFree && (
        <>
          {passOnly && (
            <div className="mx-6 mt-7 mb-3 rounded-[12px] bg-[#F7F8FA] px-3.5 py-3">
              <p className="text-[13px] leading-relaxed text-[#4E5968] whitespace-pre-line">{getLocaleString({ locale, key: 'payment_pass_only_notice' })}</p>
              {passOnlyNotice && <p className="mt-1 text-[12.5px] text-[#E55B5B] font-medium">{passOnlyNotice}</p>}
            </div>
          )}
          <PassesSection
            locale={locale}
            passes={availablePasses}
            // 가격 정책(정기, LP) 결제는 패스권 사용 불가 — 숨기지 않고 사유와 함께 전체 비활성. 1회(단건)를 골랐으면 쓸 수 있다
            disabledReason={selectedPolicy ? getLocaleString({ locale, key: 'pass_blocked_for_price_policy' }) : undefined}
            selectedPass={selectedPass}
            onSelectPass={(pass) => {
              // 패스 전용 — 할인 패스는 깎을 금액이 없어 선택 불가. 선택을 무시하고 사유만 보여준다
              if (passOnly && pass && getPassDiscountRule(pass)) {
                setPassOnlyNotice(getLocaleString({ locale, key: 'payment_pass_only_discount_blocked' }));
                return;
              }
              setPassOnlyNotice(undefined);
              setSelectedPass(pass);
              setSelectedCoupon(undefined);
              if (!pass) {
                setSelectedDiscount(undefined);
                if (selectedMethod === 'pass') setSelectedMethod(fallbackMethod);
                return;
              }
              if (getPassDiscountRule(pass)) {
                // Discount 패스 — 결제수단은 일반 그대로 유지(pass였으면 fallback), 할인만 적용
                setSelectedDiscount(buildDiscountFromPass(pass));
                if (selectedMethod === 'pass') setSelectedMethod(fallbackMethod);
              } else {
                // FreeCount/Unlimited — use pass 흐름. selectedMethod='pass', 할인 없음.
                setSelectedMethod('pass');
                setSelectedDiscount(undefined);
              }
            }}
          />
          <div className="my-5 mx-6 h-px bg-[#F0F0F0]" />
        </>
      )}

      {/* 할인 섹션 — 패스 전용(금액 없음)·0원 1회(깎을 금액 없음)면 쿠폰·할인은 의미가 없어 숨긴다 */}
      {!noPass && !priceNotAvailable && !passOnly && !oneTimeFree && (
        <>
          <DiscountSection
            locale={locale}
            discounts={payment.discounts}
            coupons={payment.coupons}
            selectedCoupon={selectedCoupon}
            onSelectCoupon={setSelectedCoupon}
            selectedDiscount={selectedDiscount}
            onSelectDiscount={setSelectedDiscount}
          />
          <div className="my-5 mx-6 h-px bg-[#F0F0F0]" />
        </>
      )}

      {/* 결제 정보 */}
      {priceAvailable && (
        <>
          <PurchaseInformation
            originalPrice={displayOriginalPrice}
            totalPrice={totalPrice}
            method={selectedMethod}
            titleResource={bundlePromotion ? 'original_price' : getTitleResource(type)}
            locale={locale}
            discounts={displayDiscounts}
            strikeOriginalPrice={!!bundlePromotion}
          />

          <div className="my-2 h-2 bg-[#F7F8F9]" />
        </>
      )}

      {priceNotAvailable && (
        <div className="px-6 py-8 text-center">
          <span className="text-[15px] text-[#85898C] font-medium">
            {type === 'practice-room'
              ? getLocaleString({ locale, key: 'practice_room_not_available' })
              : getLocaleString({ locale, key: 'no_available_payment_method' })}
          </span>
        </div>
      )}

      {priceAvailable && (
        <div className={`flex flex-col ${noPass ? 'gap-y-5' : 'space-y-4'} px-6 py-2`}>
          {/* 결제 유의사항 */}
          <div>
            <div className="font-medium text-[13px] text-[#999] mb-1.5">
              {getLocaleString({locale, key: 'payment_notice'})}
            </div>
            <div className="text-[12px] text-[#B0B3B8] font-medium leading-relaxed">
              • {getLocaleString({locale, key: 'apple_pay_domestic_only'})}
            </div>
            {(type === 'pass-plan' || type === 'regular-class') && (
              <div className="text-[12px] text-[#B0B3B8] font-medium leading-relaxed">
                • {getLocaleString({locale, key: 'pass_plan_point_refund_notice'})}
              </div>
            )}
          </div>
          {/* 판매자 정보 */}
          {studio && <SellerInformation studio={studio} locale={locale}/>}
          {/* 환불 안내 — 대관(roomRefundDays 내려옴)이면 이용료 환불 기준 안내로 대체 */}
          <RefundInformation locale={locale} roomRefundDays={payment.roomRefundDays}/>
        </div>
      )}

      {/* 결제 버튼.
          - 기본(모바일/앱 웹뷰): full-width fixed bottom
          - buttonSlotId 지정(PC 폼): 우측 요약 카드 아래 슬롯으로 portal — 화면 하단 고정 아님.
            slot 노드를 찾기 전(첫 페인트)에는 잠깐 fixed로 렌더되지만 PC 인스턴스는 곧바로 이동한다. */}
      {(() => {
        // 버튼 비활성 사유 — 아래 disabled 식과 같은 순서로 첫 사유 하나만 (PC 웹 hover 툴팁용)
        const needMethod = type === 'practice-room' || totalPrice > 0;
        const disabledReason = selectedPolicy?.usable === false
          ? (selectedPolicy.reason ?? getLocaleString({locale, key: 'payment_disabled_policy_unusable'}))
          : (passOnly && (selectedMethod !== 'pass' || !selectedPass))
          ? getLocaleString({locale, key: 'payment_disabled_pass_only'})
          : priceNotAvailable
          ? getLocaleString({locale, key: 'payment_disabled_price_unavailable'})
          : (type === 'practice-room' && !practiceRoomInfo)
            ? getLocaleString({locale, key: 'payment_disabled_no_slot'})
            : (needMethod && !selectedMethod)
              ? getLocaleString({locale, key: 'payment_disabled_no_method'})
              : (selectedMethod === 'pass' && !selectedPass)
                ? getLocaleString({locale, key: 'payment_disabled_no_pass'})
                : (needMethod && selectedMethod === 'billing' && !selectedBillingCard?.billingKey)
                  ? getLocaleString({locale, key: 'payment_disabled_no_card'})
                  : undefined;
        const paymentButton = (
        <PaymentButton
          locale={locale}
          method={selectedMethod}
          appVersion={appVersion}
          selectedBilling={selectedBillingCard}
          selectedPass={selectedPass}
          selectedDiscounts={noPass ? undefined : activeDiscounts}
          // 정책 결제 — 수업은 lesson-group(LGT), 정규반은 가격정책 pass-plan(LP). id 는 둘 다 정책 id
          type={selectedPolicy ? getPaymentType(type === 'regular-class' ? 'regular-class' : 'lesson-group') : getPaymentType(type)}
          // 정규반은 결제 API 로는 pass-plan 이지만 유저에겐 '정규반 등록' — 비회원 인증 시트 문구만 정규반으로
          guestItemType={type === 'regular-class' ? 'regular-class' : undefined}
          id={selectedPolicy ? selectedPolicy.id : getItemId(payment, type)}
          lessonId={payment.lesson?.id}
          price={priceAvailable ? totalPrice : null}
          title={getItemTitle(payment, type)}
          user={payment.user}
          depositor={depositor}
          disabled={
            selectedPolicy?.usable === false ||
            // 패스 전용 — 패스권을 고르기 전엔 결제 불가 (PortOne에 totalAmount 0 이 넘어가던 경로 차단)
            (passOnly && (selectedMethod !== 'pass' || !selectedPass)) ||
            priceNotAvailable ||
            (type === 'practice-room' && !practiceRoomInfo) ||
            // 연습실은 서버가 총액을 나중에 계산해 totalPrice가 0일 수 있음 → 결제수단은 항상 필수
            (type === 'practice-room' && (
              !selectedMethod ||
              (selectedMethod === 'pass' && !selectedPass) ||
              (selectedMethod === 'billing' && !selectedBillingCard?.billingKey)
            )) ||
            (totalPrice > 0 && (
              !selectedMethod ||
              (selectedMethod === 'pass' && !selectedPass) ||
              (selectedMethod === 'billing' && !selectedBillingCard?.billingKey)
            )) ||
            (!priceAvailable && selectedMethod === 'pass' && !selectedPass)
          }
          // 정책을 고르면 그 정책의 결제 id로 결제한다 — 최상위 paymentId는 기본 정책의 것일 뿐이다
          disabledReason={disabledReason}
          paymentId={selectedPolicy?.paymentId ?? payment.paymentId}
          canSubscribe={subscribeSelected}
          subscriptionCycleLabel={subscriptionCycle.label}
          actualPayerUserId={noPass ? undefined : actualPayerUserId}
          hasRefundAccount={payment.refundAccountNumber != null && payment.refundAccountNumber.length > 0}
          onBillingCardsChange={(cards) => setCards(cards)}
          practiceRoomInfo={practiceRoomInfo}
        />
        );
        return buttonSlot
          ? createPortal(<div className="w-full">{paymentButton}</div>, buttonSlot)
          : <div className="fixed bottom-2 left-0 w-full px-6 z-30">{paymentButton}</div>;
      })()}
    </div>
  )
}
