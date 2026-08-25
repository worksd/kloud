'use client';

// PC 웹 탑바 중앙 검색창 — GET /search/suggestions(추천 검색어) 연동.
// 타이핑 250ms 디바운스로 추천을 드롭다운에 보여주고, Enter/항목 선택 시 /search?q=로 이동.
// 추천은 문자열 배열(수업/스튜디오 구분 없음) — 선택하면 그 문자열로 contents를 다시 검색하는 흐름.

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { KloudScreen } from '@/shared/kloud.screen';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { getSearchSuggestionsAction } from '@/app/search/get.search.suggestions.action';

export const WebSearchBox = ({locale}: { locale: Locale }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // /search 진입 상태로 새로고침해도 입력창에 현재 검색어가 남아 있게
  const [keyword, setKeyword] = useState(searchParams?.get('q') ?? '');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 응답 역전 방지 — 마지막 요청의 응답만 반영
  const requestSeqRef = useRef(0);

  // 바깥 클릭 시 드롭다운 닫기
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const fetchSuggestions = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = value.trim();
    if (!trimmed) {
      setSuggestions([]);
      setActiveIdx(-1);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const seq = ++requestSeqRef.current;
      const keywords = await getSearchSuggestionsAction(trimmed);
      if (seq !== requestSeqRef.current) return;
      setSuggestions(keywords);
      setActiveIdx(-1);
    }, 250);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
    setOpen(true);
    fetchSuggestions(e.target.value);
  };

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setOpen(false);
    setKeyword(trimmed);
    router.push(KloudScreen.Search(trimmed));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      setOpen(true);
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp' && suggestions.length > 0) {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      submit(activeIdx >= 0 ? suggestions[activeIdx] : keyword);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showDropdown = open && suggestions.length > 0;

  return (
    <div ref={rootRef} className="relative w-full max-w-[520px]">
      {/* 입력창 — 유튜브식 필 형태 */}
      <div className={`flex items-center h-10 bg-[#f5f6f8] border border-transparent rounded-full pl-4 pr-1.5 transition-colors focus-within:bg-white focus-within:border-[#dcdee0] ${showDropdown ? 'bg-white border-[#dcdee0]' : ''}`}>
        <input
          value={keyword}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder={getLocaleString({locale, key: 'search_placeholder'})}
          className="flex-1 min-w-0 bg-transparent text-[14px] text-black placeholder-[#A0A5AB] outline-none"
          aria-label="search"
          role="combobox"
          aria-controls="web-search-suggestions"
          aria-expanded={showDropdown}
        />
        {keyword && (
          <button
            aria-label="지우기"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { setKeyword(''); setSuggestions([]); setActiveIdx(-1); }}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#eceef0] transition-colors shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
              <path d="M6 6l12 12M18 6L6 18" stroke="#86898C" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        )}
        <button
          aria-label="검색"
          onClick={() => submit(keyword)}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#eceef0] transition-colors shrink-0"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-[18px] h-[18px]">
            <circle cx="11" cy="11" r="7" stroke="#1a1a1a" strokeWidth="1.8"/>
            <path d="M16.5 16.5L21 21" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* 추천 검색어 드롭다운 */}
      {showDropdown && (
        <div
          id="web-search-suggestions"
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white rounded-2xl border border-[#f0f1f3] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.16)] py-2 z-50 overflow-hidden"
        >
          {suggestions.map((s, idx) => (
            <button
              key={s}
              role="option"
              aria-selected={idx === activeIdx}
              // mousedown에서 input blur로 드롭다운이 먼저 닫히지 않게
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => submit(s)}
              onMouseEnter={() => setActiveIdx(idx)}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-[14px] text-black transition-colors ${idx === activeIdx ? 'bg-[#f5f6f8]' : ''}`}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
                <circle cx="11" cy="11" r="7" stroke="#A0A5AB" strokeWidth="1.8"/>
                <path d="M16.5 16.5L21 21" stroke="#A0A5AB" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span className="truncate">{s}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
