// 다크 모드 팔레트 — 라이트 색 → 다크 색 변환 규칙.
// postcss.dark.tokens.js 가 빌드 때 Tailwind 가 뽑은 모든 무채색(회색 계열) 선언을 CSS 변수로 감싸고,
// 여기 규칙으로 계산한 다크 값을 `:root[data-theme="dark"]` 블록에 써 넣는다.
// → 4,700여 곳의 하드코딩 색(bg-white, text-[#1E2124] …)을 파일마다 고치지 않아도 다크 모드가 적용된다.
//
// 역할(role)별로 다르게 뒤집는다 — 같은 #1E2124 라도 글자(fg)면 밝게, 배경(bg)이면 '떠 있는 회색'으로.
//  - bg: 밝은 면(흰 페이지·회색 카드)은 어두운 면으로, 검정 버튼/칩은 글자(흰색 유지)가 읽히는 짙은 회색으로.
//  - fg: 검정 글자는 밝게, 연한 회색 글자(비활성)는 어둡게. 흰 글자는 그대로 (이미지·색 칩 위 텍스트).
//  - bd: 연한 테두리는 어두운 테두리로, 검정 테두리(선택 강조)는 밝게. 흰 테두리는 그대로.
// 채도가 있는 색(빨강·파랑·브랜드)은 건드리지 않는다 (isNeutral).

/** 무채색 판정 — RGB 최대·최소 차가 이 값 이하면 회색 계열로 본다 (#4E5968=26, #8B95A1=22, #E55B5B=138) */
const NEUTRAL_CHROMA = 30;

const isNeutral = ([r, g, b]) => Math.max(r, g, b) - Math.min(r, g, b) <= NEUTRAL_CHROMA;

const rgbToHsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
};

const hslToRgb = ([h, s, l]) => {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const f = (t) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255));
};

/** 구간 선형 보간 — anchors: [[L_in, L_out], ...] (L_in 오름차순) */
const interp = (anchors, x) => {
  if (x <= anchors[0][0]) return anchors[0][1];
  for (let i = 1; i < anchors.length; i++) {
    const [x0, y0] = anchors[i - 1], [x1, y1] = anchors[i];
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return anchors[anchors.length - 1][1];
};

// 역할별 명도(HSL L) 변환 앵커.
const ANCHORS = {
  // 배경: 흰색(1.0)→페이지 바닥, 연회색 카드(0.9~0.97)→조금 더 밝은 면(계층 유지),
  //       중간 회색은 중간 유지, 검정(0)→글자가 읽히는 짙은 회색(0.21)
  bg: [[0, 0.21], [0.13, 0.26], [0.25, 0.30], [0.5, 0.42], [0.75, 0.36], [0.85, 0.23], [0.90, 0.18], [0.95, 0.14], [0.975, 0.105], [1.0, 0.075]],
  // 글자: 검정→거의 흰색, 짙은 회색→밝은 회색, 중간 회색은 살짝 밝게, 연한 회색(비활성)→어둡게
  fg: [[0, 0.95], [0.13, 0.91], [0.3, 0.76], [0.5, 0.62], [0.65, 0.50], [0.75, 0.42], [0.85, 0.34], [0.94, 0.28]],
  // 테두리: 검정→밝게, 연회색 구분선(0.9~0.97)→어두운 구분선
  bd: [[0, 0.90], [0.2, 0.78], [0.5, 0.50], [0.8, 0.28], [0.9, 0.21], [0.95, 0.18], [0.985, 0.16]],
};

/** 흰색은 글자·테두리 역할에서 뒤집지 않는다 (이미지 위 흰 글자, 흰 링). 거의 흰색(F7 이상)도 글자로 쓰였다면 어두운 배경 위 글자이므로 유지 */
const KEEP_WHITE_L = { fg: 0.95, bd: 0.985 };

// 손으로 맞춘 값 — 가장 많이 쓰이는 색은 계층이 또렷하게 보이도록 고정. 키는 소문자 hex 6자리.
const OVERRIDES = {
  bg: {
    ffffff: [18, 19, 22],     // 페이지·카드 바닥
    f9f9fb: [26, 28, 32],     // PC 설정 배경 / surface-1
    f9fafb: [26, 28, 32],
    fafbfc: [26, 28, 32],
    f7f8f9: [27, 29, 33],
    f7f8fa: [27, 29, 33],
    f2f4f6: [34, 37, 42],     // surface-2 (칩·입력창·아이콘 박스)
    f1f3f6: [34, 37, 42],
    f3f4f6: [34, 37, 42],
    f4f5f7: [34, 37, 42],
    f0f0f0: [36, 39, 44],
    e8eaed: [43, 47, 53],     // surface-3
    e5e7eb: [43, 47, 53],
    e7eaee: [43, 47, 53],
    '000000': [51, 55, 61],   // 검정 버튼 → 떠 있는 짙은 회색 (흰 글자 유지)
  },
  fg: {
    '000000': [242, 243, 245],
    '1e2124': [233, 235, 238],
    '191f28': [233, 235, 238],
    '171717': [236, 237, 239],
    '222222': [233, 235, 238],
    '4e5968': [174, 182, 193],
    '6d7882': [154, 163, 173],
    '86898c': [154, 157, 161],
    '8b95a1': [143, 153, 165],
    b0b8c1: [98, 104, 112],
    bcbfc2: [98, 104, 112],
    bfc2c5: [98, 104, 112],
  },
  bd: {
    eef0f2: [42, 46, 51],
    eeeff0: [42, 46, 51],
    f1f3f6: [42, 46, 51],
    f0f1f3: [42, 46, 51],
    e6e8ea: [42, 46, 51],
    e5e7eb: [46, 50, 56],
    '000000': [233, 235, 238],
  },
};

/**
 * @param {'bg'|'fg'|'bd'} role
 * @param {[number,number,number]} rgb  라이트 색
 * @returns {[number,number,number]|null} 다크 색. null 이면 바꾸지 않음(채도 있는 색·흰 글자 등)
 */
const toDark = (role, rgb) => {
  if (!isNeutral(rgb)) return null;
  const key = rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
  const fixed = OVERRIDES[role]?.[key];
  if (fixed) return fixed;
  const [h, s, l] = rgbToHsl(rgb);
  if (KEEP_WHITE_L[role] != null && l >= KEEP_WHITE_L[role]) return null;
  // 배경은 채도를 눌러 탁한 색 틴트가 튀지 않게, 글자·테두리는 그대로
  const s2 = role === 'bg' ? s * 0.6 : s;
  return hslToRgb([h, s2, interp(ANCHORS[role], l)]);
};

module.exports = { toDark, isNeutral, NEUTRAL_CHROMA };
