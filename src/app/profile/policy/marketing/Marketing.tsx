'use client';

// 광고성 정보 수신 동의 — iframe 대신 inline 콘텐츠로 렌더링.
// iOS WKWebView에서 iframe 로딩 시 native nav bar가 사라지고 검정 노출되는 이슈 회피.
// 원문: https://hello.rawgraphy.com/ko/marketing-agreement (2026-05-25)
const Marketing = ({locale}: {locale: string}) => {
  const content = MARKETING_CONTENT[locale] ?? MARKETING_CONTENT.ko;

  return (
    <div className="w-full min-h-screen bg-white px-6 py-6 pb-16 text-black">
      <h1 className="text-2xl font-bold mb-2">{content.title}</h1>
      <p className="text-sm text-gray-500 mb-6">{content.date}</p>
      <p className="text-[15px] leading-7 mb-6">{content.intro}</p>

      {content.sections.map((section, i) => (
        <section key={i} className="mb-6">
          <h2 className="text-lg font-semibold mb-2">{section.heading}</h2>
          <p className="text-[15px] leading-7 whitespace-pre-line">{section.body}</p>
        </section>
      ))}

      <p className="text-[15px] leading-7 mt-8 text-gray-700">{content.closing}</p>
    </div>
  );
};

type Section = { heading: string; body: string };
type MarketingDoc = {
  title: string;
  date: string;
  intro: string;
  sections: Section[];
  closing: string;
};

const KO: MarketingDoc = {
  title: '광고성 정보 수신 동의',
  date: '2026년 5월 25일',
  intro:
    '로우그래피 주식회사(이하 "회사")는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 및 「개인정보 보호법」 등 관계 법령에 따라 광고성 정보를 전송하기 위해 수신자의 사전 동의를 받고 있으며, 수신 동의 여부를 정기적으로 확인합니다.',
  sections: [
    {
      heading: '제1조 (목적)',
      body: '본 동의는 회사가 제공하는 서비스와 관련하여 회원에게 유용한 정보, 혜택, 행사, 프로모션 등 광고성 정보를 전달하기 위한 사항을 규정함을 목적으로 합니다.',
    },
    {
      heading: '제2조 (이용 항목)',
      body: 'ID, 이름, 휴대전화번호, 이메일 주소',
    },
    {
      heading: '제3조 (수신 정보의 종류)',
      body: '신규 서비스 및 기능 안내, 이벤트·캠페인 등 프로모션 정보, 할인·혜택 안내, 제휴사 혜택 안내 등',
    },
    {
      heading: '제4조 (수신 방법)',
      body: '이메일, 문자 메시지(SMS/LMS), 카카오톡 알림톡, 앱/플랫폼 내 알림 중 하나 이상의 방법으로 발송됩니다.',
    },
    {
      heading: '제5조 (동의 철회 및 변경)',
      body: '회원은 언제든지 광고성 정보 수신 동의를 철회할 수 있으며, 마이페이지 설정, 수신 거부 링크, 고객센터 등을 통해 요청할 수 있습니다. 철회 시 광고성 정보 발송은 즉시 중단됩니다.',
    },
    {
      heading: '제6조 (보유 및 이용 기간)',
      body: '광고성 정보 수신 동의일로부터 동의 철회 또는 회원 탈퇴 시까지 보유·이용하며, 철회 또는 탈퇴 시 즉시 파기합니다. 단, 관계 법령에 따라 보존이 필요한 경우 그에 따릅니다.',
    },
  ],
  closing:
    '본 동의는 선택동의로서 거부하실 수 있으며, 거부하시더라도 서비스 이용에는 제한이 없습니다.',
};

const EN: MarketingDoc = {
  title: 'Marketing Information Consent',
  date: 'May 25, 2026',
  intro:
    'Rawgraphy Inc. ("Company") obtains prior consent from recipients to send marketing information in accordance with the Act on Promotion of Information and Communications Network Utilization and Information Protection and the Personal Information Protection Act, and periodically verifies such consent.',
  sections: [
    {
      heading: 'Article 1 (Purpose)',
      body: 'This consent sets out matters for delivering useful information, benefits, events, promotions, and other marketing information to members in connection with the services provided by the Company.',
    },
    {
      heading: 'Article 2 (Items Used)',
      body: 'ID, name, mobile phone number, email address',
    },
    {
      heading: 'Article 3 (Types of Information Received)',
      body: 'Announcements of new services and features, promotional information including events and campaigns, discount and benefit notices, partner benefits, etc.',
    },
    {
      heading: 'Article 4 (Methods of Receipt)',
      body: 'Sent via one or more of the following: email, SMS/LMS, KakaoTalk AlimTalk, in-app/platform notifications.',
    },
    {
      heading: 'Article 5 (Withdrawal and Change of Consent)',
      body: 'Members may withdraw consent to receive marketing information at any time via My Page settings, the unsubscribe link, or customer service. Upon withdrawal, marketing information transmission ceases immediately.',
    },
    {
      heading: 'Article 6 (Retention and Use Period)',
      body: 'Retained and used from the date of consent until withdrawal of consent or membership termination, at which point it is destroyed immediately. However, if retention is required by relevant laws, those laws apply.',
    },
  ],
  closing:
    'This consent is optional and may be refused. Refusal does not restrict use of the service.',
};

const MARKETING_CONTENT: Record<string, MarketingDoc> = {
  ko: KO,
  en: EN,
  ja: EN, // 일본어 컨텐츠 미준비 — 영문 폴백
  zh: EN, // 중문 컨텐츠 미준비 — 영문 폴백
};

export default Marketing;
