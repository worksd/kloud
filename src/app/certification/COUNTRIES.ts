export type CountrySpec = {
  key: string;
  region: string;
  nameKo: string;
  nameEn: string;
  dial: string;
  flag: string;
  notes?: string[];
  template?: string;
};

const defaultTemplate = '[{회사명}] verification: {숫자}';

export const COUNTRIES: CountrySpec[] = [
  // 북미
  {key: 'USCA', region: '아메리카', nameKo: '미국/캐나다', nameEn: 'USA/Canada', dial: '1', flag: '🇺🇸🇨🇦', notes: ['랜덤 번호로 변경']},

  // 아시아
  {key: 'KR', region: '아시아', nameKo: '대한민국', nameEn: 'South Korea', dial: '82', flag: '🇰🇷'},
  {key: 'TW', region: '아시아', nameKo: '대만', nameEn: 'Taiwan', dial: '886', flag: '🇹🇼', notes: ['랜덤 번호로 변경']},
  {
    key: 'JP',
    region: '아시아',
    nameKo: '일본',
    nameEn: 'Japan',
    dial: '81',
    flag: '🇯🇵',
    notes: ['Simple & Easy Notification Service SMS 고정?'],
    template: defaultTemplate
  },
  {
    key: 'CN',
    region: '아시아',
    nameKo: '중국',
    nameEn: 'China',
    dial: '86',
    flag: '🇨🇳',
    notes: ['랜덤 번호로 변경', 'OTP만 발송 가능', '【Verify】 자동 삽입'],
    template: '【Verify】 ' + defaultTemplate
  },
  {key: 'SG', region: '아시아', nameKo: '싱가포르', nameEn: 'Singapore', dial: '65', flag: '🇸🇬', notes: ['랜덤 번호로 변경']},
  {key: 'HK', region: '아시아', nameKo: '홍콩', nameEn: 'Hong Kong', dial: '852', flag: '🇭🇰'},
  {key: 'ID', region: '아시아', nameKo: '인도네시아', nameEn: 'Indonesia', dial: '62', flag: '🇮🇩'},
  {key: 'MY', region: '아시아', nameKo: '말레이시아', nameEn: 'Malaysia', dial: '60', flag: '🇲🇾'},
  {key: 'PH', region: '아시아', nameKo: '필리핀', nameEn: 'Philippines', dial: '63', flag: '🇵🇭'},
  {key: 'TH', region: '아시아', nameKo: '태국', nameEn: 'Thailand', dial: '66', flag: '🇹🇭', notes: ['랜덤 번호로 변경']},
  {key: 'BN', region: '아시아', nameKo: '브루나이', nameEn: 'Brunei Darussalam', dial: '673', flag: '🇧🇳'},
  {
    key: 'VN',
    region: '아시아',
    nameKo: '베트남',
    nameEn: 'Vietnam',
    dial: '84',
    flag: '🇻🇳',
    notes: ['현지 사업자만 발송 가능', '사전 등록 필요', 'OTP만 발송 가능'],
    template: defaultTemplate
  },
  {key: 'LA', region: '아시아', nameKo: '라오스', nameEn: 'Laos', dial: '856', flag: '🇱🇦'},
  {key: 'MM', region: '아시아', nameKo: '미얀마', nameEn: 'Myanmar', dial: '95', flag: '🇲🇲'},
  {key: 'KH', region: '아시아', nameKo: '캄보디아', nameEn: 'Cambodia', dial: '855', flag: '🇰🇭', notes: ['랜덤 번호로 변경']},
  {key: 'MO', region: '아시아', nameKo: '마카오', nameEn: 'Macau', dial: '853', flag: '🇲🇴'},
  {key: 'BD', region: '아시아', nameKo: '방글라데시', nameEn: 'Bangladesh', dial: '880', flag: '🇧🇩'},
  {key: 'IN', region: '아시아', nameKo: '인도', nameEn: 'India', dial: '91', flag: '🇮🇳', notes: ['랜덤 번호로 변경']},
  {key: 'PK', region: '아시아', nameKo: '파키스탄', nameEn: 'Pakistan', dial: '92', flag: '🇵🇰'},

  // 중동
  {key: 'SA', region: '중동', nameKo: '사우디아라비아', nameEn: 'Saudi Arabia', dial: '966', flag: '🇸🇦', notes: ['사전 등록 필요']},
  {
    key: 'AE',
    region: '중동',
    nameKo: '아랍에미리트',
    nameEn: 'United Arab Emirates',
    dial: '971',
    flag: '🇦🇪',
    notes: ['사전 등록 필요']
  },
  {key: 'BH', region: '중동', nameKo: '바레인', nameEn: 'Bahrain', dial: '973', flag: '🇧🇭', notes: ['GDPR']},
  {key: 'IL', region: '중동', nameKo: '이스라엘', nameEn: 'Israel', dial: '972', flag: '🇮🇱'},
  {key: 'EG', region: '중동', nameKo: '이집트', nameEn: 'Egypt', dial: '20', flag: '🇪🇬'},

  // 오세아니아
  {key: 'NZ', region: '오세아니아', nameKo: '뉴질랜드', nameEn: 'New Zealand', dial: '64', flag: '🇳🇿', notes: ['랜덤 번호로 변경']},
  {key: 'AU', region: '오세아니아', nameKo: '호주', nameEn: 'Australia', dial: '61', flag: '🇦🇺'},

  // 유럽
  {
    key: 'GB',
    region: '유럽',
    nameKo: '영국',
    nameEn: 'United Kingdom',
    dial: '44',
    flag: '🇬🇧',
    notes: ['GDPR', '랜덤 번호로 변경']
  },
  {key: 'DE', region: '유럽', nameKo: '독일', nameEn: 'Germany', dial: '49', flag: '🇩🇪', notes: ['GDPR']},
  {key: 'FR', region: '유럽', nameKo: '프랑스', nameEn: 'France', dial: '33', flag: '🇫🇷', notes: ['GDPR']},
  {key: 'NL', region: '유럽', nameKo: '네덜란드', nameEn: 'Netherlands', dial: '31', flag: '🇳🇱', notes: ['GDPR']},
  {key: 'ES', region: '유럽', nameKo: '스페인', nameEn: 'Spain', dial: '34', flag: '🇪🇸', notes: ['GDPR']},
  {key: 'IT', region: '유럽', nameKo: '이탈리아', nameEn: 'Italy', dial: '39', flag: '🇮🇹', notes: ['GDPR']},
  {key: 'SE', region: '유럽', nameKo: '스웨덴', nameEn: 'Sweden', dial: '46', flag: '🇸🇪', notes: ['GDPR']},
  {key: 'CH', region: '유럽', nameKo: '스위스', nameEn: 'Switzerland', dial: '41', flag: '🇨🇭', notes: ['GDPR']},
  {key: 'PL', region: '유럽', nameKo: '폴란드', nameEn: 'Poland', dial: '48', flag: '🇵🇱', notes: ['GDPR']},
  {key: 'PT', region: '유럽', nameKo: '포르투갈', nameEn: 'Portugal', dial: '351', flag: '🇵🇹', notes: ['GDPR', '랜덤 번호로 변경']},
  {key: 'BE', region: '유럽', nameKo: '벨기에', nameEn: 'Belgium', dial: '32', flag: '🇧🇪', notes: ['GDPR', '랜덤 번호로 변경']},
  {key: 'DK', region: '유럽', nameKo: '덴마크', nameEn: 'Denmark', dial: '45', flag: '🇩🇰', notes: ['GDPR']},
  {key: 'NO', region: '유럽', nameKo: '노르웨이', nameEn: 'Norway', dial: '47', flag: '🇳🇴', notes: ['GDPR']},
  {key: 'FI', region: '유럽', nameKo: '핀란드', nameEn: 'Finland', dial: '358', flag: '🇫🇮', notes: ['GDPR']},
  {key: 'IE', region: '유럽', nameKo: '아일랜드', nameEn: 'Ireland', dial: '353', flag: '🇮🇪', notes: ['GDPR']},
  {key: 'AT', region: '유럽', nameKo: '오스트리아', nameEn: 'Austria', dial: '43', flag: '🇦🇹', notes: ['GDPR']},
  {key: 'CZ', region: '유럽', nameKo: '체코', nameEn: 'Czech Republic', dial: '420', flag: '🇨🇿', notes: ['GDPR']},
  {key: 'GR', region: '유럽', nameKo: '그리스', nameEn: 'Greece', dial: '30', flag: '🇬🇷', notes: ['GDPR']},
  {key: 'LV', region: '유럽', nameKo: '라트비아', nameEn: 'Latvia', dial: '371', flag: '🇱🇻', notes: ['GDPR']},
  {key: 'LT', region: '유럽', nameKo: '리투아니아', nameEn: 'Lithuania', dial: '370', flag: '🇱🇹', notes: ['GDPR']},
  {key: 'RO', region: '유럽', nameKo: '루마니아', nameEn: 'Romania', dial: '40', flag: '🇷🇴', notes: ['GDPR']},
  {key: 'SI', region: '유럽', nameKo: '슬로베니아', nameEn: 'Slovenia', dial: '386', flag: '🇸🇮', notes: ['GDPR']},
  {key: 'SK', region: '유럽', nameKo: '슬로바키아', nameEn: 'Slovakia', dial: '421', flag: '🇸🇰', notes: ['GDPR']},
  {key: 'HR', region: '유럽', nameKo: '크로아티아', nameEn: 'Croatia', dial: '385', flag: '🇭🇷', notes: ['GDPR']},
  {key: 'LU', region: '유럽', nameKo: '룩셈부르크', nameEn: 'Luxembourg', dial: '352', flag: '🇱🇺', notes: ['GDPR']},
  {key: 'BY', region: '유럽', nameKo: '벨라루스', nameEn: 'Belarus', dial: '375', flag: '🇧🇾', notes: ['GDPR']},
  {key: 'BA', region: '유럽', nameKo: '보스니아', nameEn: 'Bosnia', dial: '387', flag: '🇧🇦', notes: ['GDPR', '랜덤 번호로 변경']},
  {key: 'BG', region: '유럽', nameKo: '불가리아', nameEn: 'Bulgaria', dial: '359', flag: '🇧🇬', notes: ['GDPR']},
  {key: 'RS', region: '유럽', nameKo: '세르비아', nameEn: 'Serbia', dial: '381', flag: '🇷🇸', notes: ['GDPR']},
  {key: 'EE', region: '유럽', nameKo: '에스토니아', nameEn: 'Estonia', dial: '372', flag: '🇪🇪', notes: ['GDPR']},
  {key: 'HU', region: '유럽', nameKo: '헝가리', nameEn: 'Hungary', dial: '36', flag: '🇭🇺', notes: ['GDPR']},

  // 동유럽/기타
  {key: 'RU', region: '유럽', nameKo: '러시아', nameEn: 'Russia', dial: '7', flag: '🇷🇺', notes: ['GDPR']},
  {key: 'UA', region: '유럽', nameKo: '우크라이나', nameEn: 'Ukraine', dial: '380', flag: '🇺🇦', notes: ['랜덤 번호로 변경']},

  // 중앙아시아/기타
  {key: 'AM', region: '아시아', nameKo: '아르메니아', nameEn: 'Armenia', dial: '374', flag: '🇦🇲'},
  {key: 'AZ', region: '아시아', nameKo: '아제르바이잔', nameEn: 'Azerbaijan', dial: '994', flag: '🇦🇿', notes: ['GDPR']},
  {key: 'KG', region: '아시아', nameKo: '키르기스스탄', nameEn: 'Kyrgyzstan', dial: '996', flag: '🇰🇬'},
  {key: 'TJ', region: '아시아', nameKo: '타지키스탄', nameEn: 'Tajikistan', dial: '992', flag: '🇹🇯'},
  {key: 'TM', region: '아시아', nameKo: '투르크메니스탄', nameEn: 'Turkmenistan', dial: '993', flag: '🇹🇲'},
  {key: 'TR', region: '유럽', nameKo: '튀르키예', nameEn: 'Turkey', dial: '90', flag: '🇹🇷'},
  {key: 'OM', region: '중동', nameKo: '오만', nameEn: 'Oman', dial: '968', flag: '🇴🇲'},
  {key: 'JO', region: '중동', nameKo: '요르단', nameEn: 'Jordan', dial: '962', flag: '🇯🇴'},
  {key: 'KW', region: '중동', nameKo: '쿠웨이트', nameEn: 'Kuwait', dial: '965', flag: '🇰🇼'},
  {key: 'YE', region: '중동', nameKo: '예맨', nameEn: 'Yemen', dial: '967', flag: '🇾🇪'},
];

// 국가명 일본어/중국어. ko/en은 CountrySpec에 있음. 키는 CountrySpec.key.
const COUNTRY_NAME_I18N: Record<string, { jp: string; zh: string }> = {
  USCA: { jp: 'アメリカ/カナダ', zh: '美国/加拿大' },
  KR: { jp: '韓国', zh: '韩国' },
  TW: { jp: '台湾', zh: '台湾' },
  JP: { jp: '日本', zh: '日本' },
  CN: { jp: '中国', zh: '中国' },
  SG: { jp: 'シンガポール', zh: '新加坡' },
  HK: { jp: '香港', zh: '香港' },
  ID: { jp: 'インドネシア', zh: '印度尼西亚' },
  MY: { jp: 'マレーシア', zh: '马来西亚' },
  PH: { jp: 'フィリピン', zh: '菲律宾' },
  TH: { jp: 'タイ', zh: '泰国' },
  BN: { jp: 'ブルネイ', zh: '文莱' },
  VN: { jp: 'ベトナム', zh: '越南' },
  LA: { jp: 'ラオス', zh: '老挝' },
  MM: { jp: 'ミャンマー', zh: '缅甸' },
  KH: { jp: 'カンボジア', zh: '柬埔寨' },
  MO: { jp: 'マカオ', zh: '澳门' },
  BD: { jp: 'バングラデシュ', zh: '孟加拉国' },
  IN: { jp: 'インド', zh: '印度' },
  PK: { jp: 'パキスタン', zh: '巴基斯坦' },
  SA: { jp: 'サウジアラビア', zh: '沙特阿拉伯' },
  AE: { jp: 'アラブ首長国連邦', zh: '阿联酋' },
  BH: { jp: 'バーレーン', zh: '巴林' },
  IL: { jp: 'イスラエル', zh: '以色列' },
  EG: { jp: 'エジプト', zh: '埃及' },
  NZ: { jp: 'ニュージーランド', zh: '新西兰' },
  AU: { jp: 'オーストラリア', zh: '澳大利亚' },
  GB: { jp: 'イギリス', zh: '英国' },
  DE: { jp: 'ドイツ', zh: '德国' },
  FR: { jp: 'フランス', zh: '法国' },
  NL: { jp: 'オランダ', zh: '荷兰' },
  ES: { jp: 'スペイン', zh: '西班牙' },
  IT: { jp: 'イタリア', zh: '意大利' },
  SE: { jp: 'スウェーデン', zh: '瑞典' },
  CH: { jp: 'スイス', zh: '瑞士' },
  PL: { jp: 'ポーランド', zh: '波兰' },
  PT: { jp: 'ポルトガル', zh: '葡萄牙' },
  BE: { jp: 'ベルギー', zh: '比利时' },
  DK: { jp: 'デンマーク', zh: '丹麦' },
  NO: { jp: 'ノルウェー', zh: '挪威' },
  FI: { jp: 'フィンランド', zh: '芬兰' },
  IE: { jp: 'アイルランド', zh: '爱尔兰' },
  AT: { jp: 'オーストリア', zh: '奥地利' },
  CZ: { jp: 'チェコ', zh: '捷克' },
  GR: { jp: 'ギリシャ', zh: '希腊' },
  LV: { jp: 'ラトビア', zh: '拉脱维亚' },
  LT: { jp: 'リトアニア', zh: '立陶宛' },
  RO: { jp: 'ルーマニア', zh: '罗马尼亚' },
  SI: { jp: 'スロベニア', zh: '斯洛文尼亚' },
  SK: { jp: 'スロバキア', zh: '斯洛伐克' },
  HR: { jp: 'クロアチア', zh: '克罗地亚' },
  LU: { jp: 'ルクセンブルク', zh: '卢森堡' },
  BY: { jp: 'ベラルーシ', zh: '白俄罗斯' },
  BA: { jp: 'ボスニア', zh: '波斯尼亚' },
  BG: { jp: 'ブルガリア', zh: '保加利亚' },
  RS: { jp: 'セルビア', zh: '塞尔维亚' },
  EE: { jp: 'エストニア', zh: '爱沙尼亚' },
  HU: { jp: 'ハンガリー', zh: '匈牙利' },
  RU: { jp: 'ロシア', zh: '俄罗斯' },
  UA: { jp: 'ウクライナ', zh: '乌克兰' },
  AM: { jp: 'アルメニア', zh: '亚美尼亚' },
  AZ: { jp: 'アゼルバイジャン', zh: '阿塞拜疆' },
  KG: { jp: 'キルギス', zh: '吉尔吉斯斯坦' },
  TJ: { jp: 'タジキスタン', zh: '塔吉克斯坦' },
  TM: { jp: 'トルクメニスタン', zh: '土库曼斯坦' },
  TR: { jp: 'トルコ', zh: '土耳其' },
  OM: { jp: 'オマーン', zh: '阿曼' },
  JO: { jp: 'ヨルダン', zh: '约旦' },
  KW: { jp: 'クウェート', zh: '科威特' },
  YE: { jp: 'イエメン', zh: '也门' },
};

// 로케일별 국가명. jp/zh 누락 시 영어로 폴백.
export function getCountryName(country: CountrySpec, locale: 'ko' | 'en' | 'jp' | 'zh'): string {
  switch (locale) {
    case 'en': return country.nameEn;
    case 'jp': return COUNTRY_NAME_I18N[country.key]?.jp ?? country.nameEn;
    case 'zh': return COUNTRY_NAME_I18N[country.key]?.zh ?? country.nameEn;
    default: return country.nameKo;
  }
}