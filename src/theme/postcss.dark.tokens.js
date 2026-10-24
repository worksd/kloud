// PostCSS 플러그인 — 다크 모드 색 토큰화.
// Tailwind 가 뽑은 CSS 에서 불투명한 무채색 선언을 찾아 `rgb(var(--dk-<role>-<hex>, r g b) / …)` 로 감싸고,
// 파일 끝에 `:root[data-theme="dark"] { --dk-…: r g b }` 블록을 붙인다.
//  - 라이트: 변수가 없으니 fallback(원래 색) 그대로 → 지금과 100% 같은 렌더.
//  - 다크:   <html data-theme="dark"> 아래에서 변수가 잡혀 색만 바뀜. hover:/lg:/active: 등 모든 변형이 자동으로 따라온다.
// 반투명 색(bg-black/50, rgb(0 0 0 / 0.5) 딤·그라디언트)은 그대로 둔다 — 이미지 위 오버레이는 다크에서도 어두워야 한다.
// 변환 규칙(어떤 색이 어떤 색이 되는지)은 dark.palette.js.
const { toDark } = require('./dark.palette');

const HEX_RE = /#([0-9a-f]{3}|[0-9a-f]{6})(?![0-9a-f])/gi;
// rgb(r g b), rgb(r g b / var(--tw-x-opacity)), rgba(r, g, b, var(…)), rgb(r g b / 0.5)
const RGB_RE = /rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*(?:[/,]\s*(var\([^()]*\)|[\d.]+%?))?\s*\)/gi;
const KEYWORD_RE = /\b(white|black)\b/gi;

const roleOf = (prop) => {
  const p = prop.toLowerCase();
  if (p === 'color' || p === 'fill' || p === 'stroke' || p === 'caret-color' || p === 'accent-color'
    || p === 'text-decoration-color' || p === '-webkit-text-fill-color') return 'fg';
  if (p === 'background-color' || p === 'background' || p.startsWith('--tw-gradient-')) return 'bg';
  if (p === 'outline-color' || p === 'outline' || p === '--tw-ring-color' || p === 'column-rule-color'
    || (p.startsWith('border') && (p.endsWith('-color') || /^border(-(top|right|bottom|left|inline|block)(-(start|end))?)?$/.test(p)))) return 'bd';
  return null;
};

const hexToRgb = (hex) => {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};

const plugin = () => ({
  postcssPlugin: 'kloud-dark-tokens',
  OnceExit(root, { Rule, Declaration }) {
    // node_modules 의 CSS(react-calendar 등)는 건드리지 않는다
    const file = root.source?.input?.file ?? '';
    if (file.includes('node_modules')) return;

    /** @type {Map<string, [number,number,number]>} 변수명 → 다크 rgb */
    const tokens = new Map();

    const wrap = (role, rgb, alphaVar) => {
      const dark = toDark(role, rgb);
      if (!dark) return null;
      const key = rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
      const name = `--dk-${role}-${key}`;
      tokens.set(name, dark);
      const inner = `var(${name}, ${rgb.join(' ')})`;
      return alphaVar ? `rgb(${inner} / ${alphaVar})` : `rgb(${inner})`;
    };

    root.walkDecls((decl) => {
      const role = roleOf(decl.prop);
      if (!role) return;
      let value = decl.value;
      if (!value || value.includes('--dk-')) return;
      // 그라디언트는 밝은 색(흰색으로 페이드아웃)만 — 이미지 위 검정 그라디언트는 그대로
      const gradientOnlyLight = decl.prop.startsWith('--tw-gradient-');
      const lightEnough = (rgb) => !gradientOnlyLight || Math.min(...rgb) >= 217;

      value = value.replace(RGB_RE, (m, r, g, b, alpha) => {
        // 숫자 알파(반투명)는 유지. var(--tw-*-opacity) 는 불투명 기본값이라 변환 대상.
        if (alpha && !alpha.startsWith('var(')) return m;
        const rgb = [r, g, b].map(Number);
        if (!lightEnough(rgb)) return m;
        return wrap(role, rgb, alpha) ?? m;
      });
      value = value.replace(HEX_RE, (m) => {
        const rgb = hexToRgb(m);
        if (!lightEnough(rgb)) return m;
        return wrap(role, rgb) ?? m;
      });
      value = value.replace(KEYWORD_RE, (m) => {
        const rgb = m.toLowerCase() === 'white' ? [255, 255, 255] : [0, 0, 0];
        if (!lightEnough(rgb)) return m;
        return wrap(role, rgb) ?? m;
      });
      if (value !== decl.value) decl.value = value;
    });

    if (tokens.size === 0) return;
    const rule = new Rule({ selector: ':root[data-theme="dark"]' });
    [...tokens.keys()].sort().forEach((name) => {
      rule.append(new Declaration({ prop: name, value: tokens.get(name).join(' ') }));
    });
    root.append(rule);
  },
});
plugin.postcss = true;

module.exports = plugin;
