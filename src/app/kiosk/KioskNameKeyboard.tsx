'use client';

import React, {useState, useEffect, useRef} from 'react';

// ====== Korean Composition Engine ======
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

const CHO_MAP: Record<string, number> = {};
CHO.forEach((c, i) => CHO_MAP[c] = i);
const JUNG_MAP: Record<string, number> = {};
JUNG.forEach((v, i) => JUNG_MAP[v] = i);
const JONG_MAP: Record<string, number> = {};
JONG.forEach((c, i) => { if (c) JONG_MAP[c] = i; });

const COMPOUND_JUNG: Record<string, Record<string, string>> = {
  'ㅗ': {'ㅏ': 'ㅘ', 'ㅐ': 'ㅙ', 'ㅣ': 'ㅚ'},
  'ㅜ': {'ㅓ': 'ㅝ', 'ㅔ': 'ㅞ', 'ㅣ': 'ㅟ'},
  'ㅡ': {'ㅣ': 'ㅢ'},
};
const COMPOUND_JONG: Record<string, Record<string, string>> = {
  'ㄱ': {'ㅅ': 'ㄳ'},
  'ㄴ': {'ㅈ': 'ㄵ', 'ㅎ': 'ㄶ'},
  'ㄹ': {'ㄱ': 'ㄺ', 'ㅁ': 'ㄻ', 'ㅂ': 'ㄼ', 'ㅅ': 'ㄽ', 'ㅌ': 'ㄾ', 'ㅍ': 'ㄿ', 'ㅎ': 'ㅀ'},
  'ㅂ': {'ㅅ': 'ㅄ'},
};

const isConsonant = (c: string) => c in CHO_MAP;
const isVowel = (c: string) => c in JUNG_MAP;
const buildSyllable = (cho: number, jung: number, jong: number = 0) =>
    String.fromCharCode(0xAC00 + (cho * 21 + jung) * 28 + jong);

type CompBuf = {
  cho: string;
  jung1?: string;
  jung2?: string;
  jong1?: string;
  jong2?: string;
};

const getComposingChar = (buf: CompBuf): string => {
  const ci = CHO_MAP[buf.cho];
  if (ci === undefined) return buf.cho;
  if (!buf.jung1) return buf.cho;

  let jungStr = buf.jung1;
  if (buf.jung2) {
    jungStr = COMPOUND_JUNG[buf.jung1]?.[buf.jung2] ?? buf.jung1;
  }
  const ji = JUNG_MAP[jungStr];
  if (ji === undefined) return buf.cho + jungStr;

  let jongI = 0;
  if (buf.jong1) {
    let jongStr = buf.jong1;
    if (buf.jong2) {
      jongStr = COMPOUND_JONG[buf.jong1]?.[buf.jong2] ?? buf.jong1;
    }
    jongI = JONG_MAP[jongStr] ?? 0;
  }
  return buildSyllable(ci, ji, jongI);
};

// ====== Keyboard Layouts ======
const KO_ROWS = [
  ['ㅂ','ㅈ','ㄷ','ㄱ','ㅅ','ㅛ','ㅕ','ㅑ','ㅐ','ㅔ'],
  ['ㅁ','ㄴ','ㅇ','ㄹ','ㅎ','ㅗ','ㅓ','ㅏ','ㅣ'],
  ['ㅋ','ㅌ','ㅊ','ㅍ','ㅠ','ㅜ','ㅡ'],
];
const EN_ROWS = [
  ['Q','W','E','R','T','Y','U','I','O','P'],
  ['A','S','D','F','G','H','J','K','L'],
  ['Z','X','C','V','B','N','M'],
];
const KO_SHIFT: Record<string, string> = {
  'ㅂ': 'ㅃ', 'ㅈ': 'ㅉ', 'ㄷ': 'ㄸ', 'ㄱ': 'ㄲ', 'ㅅ': 'ㅆ',
  'ㅐ': 'ㅒ', 'ㅔ': 'ㅖ',
};

type Props = { onChange: (text: string) => void };

export const KioskNameKeyboard = ({onChange}: Props) => {
  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const [shift, setShift] = useState(false);
  const [committed, setCommitted] = useState('');
  const [buf, setBuf] = useState<CompBuf | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  const displayText = committed + (buf ? getComposingChar(buf) : '');
  useEffect(() => { onChangeRef.current(displayText); }, [displayText]);

  const handleKey = (rawKey: string) => {
    if (lang === 'en') {
      if (buf) {
        setCommitted(prev => prev + getComposingChar(buf));
        setBuf(null);
      }
      const char = shift ? rawKey.toUpperCase() : rawKey.toLowerCase();
      setShift(false);
      setCommitted(prev => prev + char);
      return;
    }

    const key = shift && KO_SHIFT[rawKey] ? KO_SHIFT[rawKey] : rawKey;
    if (shift) setShift(false);

    if (isConsonant(key)) {
      if (!buf) {
        setBuf({cho: key});
      } else if (!buf.jung1) {
        setCommitted(prev => prev + buf.cho);
        setBuf({cho: key});
      } else if (!buf.jong1) {
        if (key in JONG_MAP) {
          setBuf({...buf, jong1: key});
        } else {
          setCommitted(prev => prev + getComposingChar(buf));
          setBuf({cho: key});
        }
      } else if (!buf.jong2) {
        const compound = COMPOUND_JONG[buf.jong1]?.[key];
        if (compound && compound in JONG_MAP) {
          setBuf({...buf, jong2: key});
        } else {
          setCommitted(prev => prev + getComposingChar(buf));
          setBuf({cho: key});
        }
      } else {
        setCommitted(prev => prev + getComposingChar(buf));
        setBuf({cho: key});
      }
    } else if (isVowel(key)) {
      if (!buf) {
        setCommitted(prev => prev + key);
      } else if (!buf.jung1) {
        setBuf({...buf, jung1: key});
      } else if (!buf.jong1) {
        if (!buf.jung2) {
          const compound = COMPOUND_JUNG[buf.jung1]?.[key];
          if (compound) {
            setBuf({...buf, jung2: key});
            return;
          }
        }
        setCommitted(prev => prev + getComposingChar(buf));
        setBuf(null);
        setCommitted(prev => prev + key);
      } else if (!buf.jong2) {
        const syllable = getComposingChar({cho: buf.cho, jung1: buf.jung1, jung2: buf.jung2});
        setCommitted(prev => prev + syllable);
        setBuf({cho: buf.jong1, jung1: key});
      } else {
        const syllable = getComposingChar({cho: buf.cho, jung1: buf.jung1, jung2: buf.jung2, jong1: buf.jong1});
        setCommitted(prev => prev + syllable);
        setBuf({cho: buf.jong2, jung1: key});
      }
    }
  };

  const handleDelete = () => {
    if (buf) {
      if (buf.jong2) setBuf({...buf, jong2: undefined});
      else if (buf.jong1) setBuf({...buf, jong1: undefined});
      else if (buf.jung2) setBuf({...buf, jung2: undefined});
      else if (buf.jung1) setBuf({cho: buf.cho});
      else setBuf(null);
    } else {
      setCommitted(prev => prev.slice(0, -1));
    }
  };

  const handleSpace = () => {
    if (buf) {
      setCommitted(prev => prev + getComposingChar(buf) + ' ');
      setBuf(null);
    } else {
      setCommitted(prev => prev + ' ');
    }
  };

  const handleLangToggle = () => {
    if (buf) {
      setCommitted(prev => prev + getComposingChar(buf));
      setBuf(null);
    }
    setLang(prev => prev === 'ko' ? 'en' : 'ko');
    setShift(false);
  };

  const rows = lang === 'ko' ? KO_ROWS : EN_ROWS;
  const getLabel = (key: string) => {
    if (lang === 'ko' && shift && KO_SHIFT[key]) return KO_SHIFT[key];
    if (lang === 'en') return shift ? key : key.toLowerCase();
    return key;
  };

  return (
      <div className="w-full max-w-[600px] flex flex-col gap-[6px]">
        <div className="w-full h-[72px] rounded-[16px] border-2 border-gray-200 flex items-center justify-center mb-[8px]">
          <p className="text-[28px] font-medium text-black">
            {displayText || <span className="text-gray-300">이름 입력</span>}
          </p>
        </div>

        <div className="flex gap-[6px]">
          {rows[0].map(k => (
              <button key={k} onPointerDown={(e) => { e.preventDefault(); handleKey(k); }}
                      className="flex-1 h-[56px] rounded-[10px] bg-gray-100 text-[20px] font-medium text-black flex items-center justify-center active:bg-gray-300 transition-colors select-none">
                {getLabel(k)}
              </button>
          ))}
        </div>

        <div className="flex gap-[6px] px-[16px]">
          {rows[1].map(k => (
              <button key={k} onPointerDown={(e) => { e.preventDefault(); handleKey(k); }}
                      className="flex-1 h-[56px] rounded-[10px] bg-gray-100 text-[20px] font-medium text-black flex items-center justify-center active:bg-gray-300 transition-colors select-none">
                {getLabel(k)}
              </button>
          ))}
        </div>

        <div className="flex gap-[6px]">
          <button onPointerDown={(e) => { e.preventDefault(); setShift(prev => !prev); }}
                  className={`h-[56px] rounded-[10px] text-[18px] font-medium flex items-center justify-center transition-colors select-none ${shift ? 'bg-black text-white' : 'bg-gray-200 text-black active:bg-gray-300'}`}
                  style={{flex: 1.3}}>
            ⇧
          </button>
          {rows[2].map(k => (
              <button key={k} onPointerDown={(e) => { e.preventDefault(); handleKey(k); }}
                      className="flex-1 h-[56px] rounded-[10px] bg-gray-100 text-[20px] font-medium text-black flex items-center justify-center active:bg-gray-300 transition-colors select-none">
                {getLabel(k)}
              </button>
          ))}
          <button onPointerDown={(e) => { e.preventDefault(); handleDelete(); }}
                  className="h-[56px] rounded-[10px] bg-gray-200 text-black flex items-center justify-center active:bg-gray-300 transition-colors select-none"
                  style={{flex: 1.3}}>
            <svg width="28" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 3H20a1 1 0 011 1v16a1 1 0 01-1 1H9l-7-9 7-9z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 9l-4 6M12 9l4 6" stroke="black" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="flex gap-[6px]">
          <button onPointerDown={(e) => { e.preventDefault(); handleLangToggle(); }}
                  className="h-[56px] rounded-[10px] bg-gray-200 text-[16px] font-bold text-black flex items-center justify-center active:bg-gray-300 transition-colors select-none"
                  style={{flex: 1.5}}>
            {lang === 'ko' ? '한/영' : 'EN/한'}
          </button>
          <button onPointerDown={(e) => { e.preventDefault(); handleSpace(); }}
                  className="h-[56px] rounded-[10px] bg-gray-100 text-[16px] font-medium text-black flex items-center justify-center active:bg-gray-300 transition-colors select-none"
                  style={{flex: 4}}>
            스페이스
          </button>
        </div>
      </div>
  );
};
