'use client';

// 개인수업 수강생 초대(등록) — 강사 전용.
// 검색 → 수강생 선택 → 바텀시트에서 [수강권으로 등록 | 현장결제로 등록] → 인라인 확인 → 등록.
// BE 규칙: 수강권 있으면 패스 사용(POST /passes/:id/use), 없으면 현장결제(POST /paymentRecords/manual, admin).

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { kloudNav } from '@/app/lib/kloudNav';
import { Locale } from '@/shared/StringResource';
import { getLocaleString } from '@/app/components/locale';
import { GetUserResponse } from '@/app/endpoint/user.endpoint';
import { GetPassResponse } from '@/app/endpoint/pass.endpoint';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import {
  searchStudentsAction,
  getRegistrationOptionsAction,
  registerWithPassAction,
  registerOnsiteAction,
} from '@/app/privateLessons/[id]/invite/actions';
import LeftArrow from '../../../../../public/assets/left-arrow.svg';

const formatUserName = (u: GetUserResponse) => {
  if (u.nickName && u.name) return `${u.nickName}(${u.name})`;
  return u.name ?? u.nickName ?? u.phone ?? u.email ?? '사용자';
};

/** 상단 요약 카드 — 어떤 수업에 등록하는지 */
export type InviteLessonSummary = {
  title: string;
  thumbnailUrl?: string;
  /** 서버가 로케일 적용해 내려주는 표시용 일시 */
  date?: string;
  studioName?: string;
  roomName?: string;
};

type SheetState = {
  student: GetUserResponse;
  loading: boolean;
  passes: GetPassResponse[];
  price: number | null;
  selectedPassId: number | null;
  /** 인라인 확인 단계 — 확정 전 마지막 안내 */
  confirm: { method: 'pass' | 'onsite'; message: string } | null;
  submitting: boolean;
  error: string | null;
};

export const InviteStudentsForm = ({lessonId, studioId, lesson, locale}: {
  lessonId: number;
  studioId: number;
  lesson?: InviteLessonSummary | null;
  locale: Locale;
}) => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<GetUserResponse[]>([]);
  const [registered, setRegistered] = useState<{ id: number; label: string }[]>([]);
  const [sheet, setSheet] = useState<SheetState | null>(null);

  // 시트 열려있는 동안 배경 스크롤 잠금 (수업 상세 시트들과 동일 패턴)
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [sheet]);

  const onSearch = async () => {
    const q = query.trim();
    if (q === '' || searching) return;
    setSearching(true);
    const users = await searchStudentsAction({ query: q, studioId });
    setResults(users);
    setSearched(true);
    setSearching(false);
  };

  const openSheet = async (student: GetUserResponse) => {
    setSheet({ student, loading: true, passes: [], price: null, selectedPassId: null, confirm: null, submitting: false, error: null });
    const res = await getRegistrationOptionsAction({ lessonId, targetUserId: student.id, studioId });
    if (isGuinnessErrorCase(res)) {
      setSheet((s) => s && { ...s, loading: false, error: res.message });
      return;
    }
    const usable = (res.passes ?? []).filter((p) => p.usable);
    setSheet((s) => s && {
      ...s,
      loading: false,
      passes: usable,
      price: res.price ?? res.lesson?.price ?? null,
      selectedPassId: usable.length > 0 ? usable[0].id : null,
    });
  };

  const askConfirm = (method: 'pass' | 'onsite') => {
    setSheet((s) => {
      if (!s) return s;
      const name = formatUserName(s.student);
      const message = method === 'pass'
        ? getLocaleString({ locale, key: 'invite_confirm_pass' }).replace('{name}', name)
        : getLocaleString({ locale, key: 'invite_confirm_onsite' })
            .replace('{name}', name)
            .replace('{price}', `${new Intl.NumberFormat('ko-KR').format(s.price ?? 0)}${getLocaleString({ locale, key: 'won' })}`);
      return { ...s, confirm: { method, message }, error: null };
    });
  };

  const onConfirm = async () => {
    const s = sheet;
    if (!s || !s.confirm || s.submitting) return;
    setSheet({ ...s, submitting: true, error: null });

    const res = s.confirm.method === 'pass'
      ? await registerWithPassAction({ passId: s.selectedPassId!, lessonId, studioId })
      : await registerOnsiteAction({ lessonId, targetUserId: s.student.id, studioId });

    if (isGuinnessErrorCase(res)) {
      setSheet((prev) => prev && { ...prev, submitting: false, confirm: null, error: res.message });
      return;
    }

    const name = formatUserName(s.student);
    window.KloudEvent?.showToast?.(getLocaleString({ locale, key: 'invite_success' }).replace('{name}', name));
    setRegistered((prev) => prev.some((r) => r.id === s.student.id) ? prev : [...prev, { id: s.student.id, label: name }]);
    setSheet(null);
  };

  return (
    <div className="w-full min-h-screen bg-white flex flex-col pb-10">
      {/* 헤더 */}
      <div className="flex items-center gap-2 px-3 pt-4 pb-2">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => kloudNav.back()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full active:bg-[#F2F4F6] transition-colors"
        >
          <LeftArrow className="h-5 w-5 text-black"/>
        </button>
        <h1 className="flex-1 text-[18px] font-bold text-black">
          {getLocaleString({ locale, key: 'invite_students_title' })}
        </h1>
      </div>

      {/* 어떤 수업에 등록하는지 — 요약 카드 */}
      {lesson && (
        <div className="px-5 pt-2">
          <div className="flex items-center gap-3 rounded-xl bg-[#F7F8F9] px-4 py-3">
            {lesson.thumbnailUrl ? (
              <Image
                src={lesson.thumbnailUrl}
                alt={lesson.title}
                width={44}
                height={44}
                className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-[#EEF0F2]"
              />
            ) : (
              <span className="w-11 h-11 rounded-lg bg-[#EEF0F2] flex-shrink-0"/>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-[14px] font-bold text-black truncate">{lesson.title}</span>
              <span className="text-[12px] text-[#86898C] truncate">
                {[lesson.date, [lesson.studioName, lesson.roomName].filter(Boolean).join(' ')]
                  .filter(Boolean).join(' · ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 검색 */}
      <div className="px-5 pt-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
            placeholder={getLocaleString({ locale, key: 'invite_search_placeholder' })}
            className="flex-1 h-12 rounded-xl border border-[#E5E7EB] px-4 text-[15px] text-black placeholder:text-[#B0B8BF] focus:outline-none focus:border-black bg-white"
          />
          <button
            type="button"
            onClick={onSearch}
            disabled={searching || query.trim() === ''}
            className={`px-4 h-12 rounded-xl text-[14px] font-bold transition-colors ${
              searching || query.trim() === '' ? 'bg-[#F2F4F6] text-[#B0B8BF]' : 'bg-black text-white active:scale-[0.97]'
            }`}
          >
            {getLocaleString({ locale, key: 'search' })}
          </button>
        </div>
      </div>

      {/* 이번에 등록한 수강생 */}
      {registered.length > 0 && (
        <div className="px-5 pt-3 flex flex-wrap gap-1.5">
          {registered.map((r) => (
            <span key={r.id} className="px-2.5 py-1 rounded-full bg-[#E7F6F1] text-[#16A085] text-[12px] font-bold">
              ✓ {r.label}
            </span>
          ))}
        </div>
      )}

      {/* 검색 결과 */}
      <div className="px-5 pt-4">
        {searching ? (
          <div className="py-10 flex justify-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"/>
          </div>
        ) : results.length === 0 ? (
          searched && (
            <p className="py-10 text-center text-[13px] text-[#919191]">
              {getLocaleString({ locale, key: 'invite_no_result' })}
            </p>
          )
        ) : (
          <ul className="flex flex-col divide-y divide-[#F1F3F6]">
            {results.map((u) => (
              <li
                key={u.id}
                onClick={() => openSheet(u)}
                className="flex items-center gap-3 py-3 cursor-pointer active:bg-[#F7F8F9] -mx-2 px-2 rounded-[10px] transition-colors"
              >
                <Image
                  src={u.profileImageUrl || '/assets/default_profile.png'}
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-full object-cover w-9 h-9 flex-shrink-0"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-[14px] font-semibold text-black truncate">{formatUserName(u)}</span>
                  {(u.phone || u.email) && (
                    <span className="text-[12px] text-[#919191] truncate">{u.phone ?? u.email}</span>
                  )}
                </div>
                {registered.some((r) => r.id === u.id) && (
                  <span className="ml-auto text-[12px] font-bold text-[#16A085] shrink-0">✓</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 등록 바텀시트 */}
      {sheet && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={() => !sheet.submitting && setSheet(null)}>
          <div className="absolute inset-0 bg-black/40"/>
          <div
            className="relative w-full max-w-[640px] bg-white rounded-t-[20px] pb-8 pt-2 animate-[slideUp_200ms_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto my-2 w-10 h-1 rounded-full bg-[#E5E7EB]"/>

            {/* 수강생 요약 */}
            <div className="flex items-center gap-3 px-6 pb-3 pt-1">
              <Image
                src={sheet.student.profileImageUrl || '/assets/default_profile.png'}
                alt=""
                width={44}
                height={44}
                className="rounded-full object-cover w-11 h-11 flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-semibold text-black truncate">{formatUserName(sheet.student)}</span>
                {sheet.student.phone && <span className="text-[12px] text-[#919191] truncate">{sheet.student.phone}</span>}
              </div>
            </div>

            {sheet.loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin"/>
              </div>
            ) : sheet.confirm ? (
              /* 인라인 확인 단계 */
              <div className="px-6 pt-2">
                <p className="text-[14px] text-black whitespace-pre-line">{sheet.confirm.message}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    disabled={sheet.submitting}
                    onClick={() => setSheet((s) => s && { ...s, confirm: null })}
                    className="flex-1 h-12 rounded-xl bg-[#F2F4F6] text-[14px] font-bold text-black active:bg-[#E8EBEE] transition-colors"
                  >
                    {getLocaleString({ locale, key: 'cancel' })}
                  </button>
                  <button
                    type="button"
                    disabled={sheet.submitting}
                    onClick={onConfirm}
                    className="flex-1 h-12 rounded-xl bg-black text-white text-[14px] font-bold active:scale-[0.97] transition-transform flex items-center justify-center"
                  >
                    {sheet.submitting
                      ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                      : getLocaleString({ locale, key: 'confirm' })}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-6 pt-2 flex flex-col gap-4">
                {/* 사용 가능 수강권 */}
                {sheet.passes.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {sheet.passes.map((p) => {
                      const selected = sheet.selectedPassId === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSheet((s) => s && { ...s, selectedPassId: p.id })}
                          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${
                            selected ? 'border-black bg-black text-white' : 'border-[#EEEFF0] bg-white text-black'
                          }`}
                        >
                          <span className="flex flex-col min-w-0">
                            <span className="text-[14px] font-bold truncate">{p.passPlan?.name}</span>
                            {p.endDate && (
                              <span className={`text-[12px] truncate ${selected ? 'text-white/60' : 'text-[#86898C]'}`}>
                                ~ {p.endDate}
                              </span>
                            )}
                          </span>
                          {selected && (
                            <svg width="16" height="12" viewBox="0 0 10 8" fill="none" className="shrink-0 ml-2">
                              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      disabled={sheet.selectedPassId == null}
                      onClick={() => askConfirm('pass')}
                      className="h-12 rounded-xl bg-black text-white text-[14px] font-bold active:scale-[0.97] transition-transform disabled:bg-[#bcbfc2]"
                    >
                      {getLocaleString({ locale, key: 'invite_register_with_pass' })}
                    </button>
                  </div>
                ) : (
                  <p className="text-[13px] text-[#919191]">{getLocaleString({ locale, key: 'invite_no_pass' })}</p>
                )}

                {/* 현장결제 */}
                <button
                  type="button"
                  onClick={() => askConfirm('onsite')}
                  className="h-12 rounded-xl border border-[#E5E7EB] bg-white text-black text-[14px] font-bold active:bg-[#F7F8F9] transition-colors"
                >
                  {getLocaleString({ locale, key: 'invite_register_onsite' })}
                  {sheet.price != null && sheet.price > 0 && (
                    <span className="ml-1 text-[#86898C] font-medium">
                      · {new Intl.NumberFormat('ko-KR').format(sheet.price)}{getLocaleString({ locale, key: 'won' })}
                    </span>
                  )}
                </button>

                {sheet.error && <p className="text-[13px] text-[#E5484D] whitespace-pre-line">{sheet.error}</p>}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
