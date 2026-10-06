'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Search, UserRoundPlus, X } from 'lucide-react';
import { Locale } from '@/shared/StringResource';
import { AdminRegisterStudentDialog } from '@/app/admin/AdminRegisterStudentDialog';
import { StudentListItemResponse, StudentListOrder } from '@/app/endpoint/student.endpoint';
import { getStudentsAction, StudentsPage } from '@/app/admin/students/students.action';

// 관리자 수강생 탭 — 수강생 추가 + 검색 + 정렬 세그먼트/활성 수강생 스위치 + 20명씩 더보기. 행을 누르면 상세 다이얼로그.
// 첫 페이지는 서버에서 렌더해 내려오고, 조건이 바뀌면 서버 액션으로 1페이지부터 다시 받는다.

const ORDERS: { value: StudentListOrder; label: string }[] = [
  { value: 'CreatedAtDesc', label: '최근 등록순' },
  { value: 'AlphabeticalAsc', label: '가나다순' },
];

/** '-'는 서버가 값 없음 대신 내려주는 문자열 — 화면에는 안 보이게 */
const val = (s?: string) => (s && s !== '-' ? s : undefined);

/** 01012345678 → 010-1234-5678. 국내 번호 형태가 아니면 그대로 */
const formatPhone = (phone?: string) => {
  const digits = val(phone)?.replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return digits;
};

function StudentRow({ st, onClick }: { st: StudentListItemResponse; onClick: () => void }) {
  const name = val(st.name) ?? val(st.nickName) ?? '-';
  // 닉네임은 이름과 다를 때만 곁들인다 (이름이 없어 닉네임을 이름 자리에 쓴 경우 중복 방지)
  const nick = val(st.nickName);
  const showNick = nick && nick !== name;
  const phone = formatPhone(st.phone);
  const tags = (st.tags ?? []).filter((t) => t.name);
  return (
    <li>
    <button type={'button'} onClick={onClick} className={'w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-[#FAFBFC] transition-colors'}>
      <span className={'relative w-[42px] h-[42px] rounded-[14px] bg-[#F7F8FA] overflow-hidden flex items-center justify-center shrink-0 text-[15px] font-bold text-[#4E5968]'}>
        {st.profileImageUrl
          ? <Image src={st.profileImageUrl} alt={''} fill sizes={'42px'} className={'object-cover'}/>
          : name.slice(0, 1)}
      </span>
      <div className={'flex-1 min-w-0'}>
        <div className={'flex items-baseline gap-1.5 min-w-0'}>
          <span className={'text-[15px] font-bold text-[#191F28] truncate'}>{name}</span>
          {showNick && <span className={'text-[12.5px] text-[#8B95A1] truncate'}>{nick}</span>}
        </div>
        <p className={'mt-0.5 text-[13px] text-[#4E5968] truncate'}>{phone ?? '연락처 없음'}</p>
        {tags.length > 0 && (
          <div className={'mt-1 flex gap-1 min-w-0 overflow-hidden'}>
            {tags.slice(0, 3).map((t) => (
              <span key={t.id} className={'shrink-0 rounded-md bg-[#F2F4F6] px-1.5 py-[1px] text-[11px] font-semibold text-[#4E5968]'}>{t.name}</span>
            ))}
            {tags.length > 3 && <span className={'shrink-0 text-[11px] text-[#8B95A1]'}>+{tags.length - 3}</span>}
          </div>
        )}
      </div>
      {st.parentName && (
        <span className={'shrink-0 rounded-lg bg-[#EEF3FF] px-2 py-1 text-[11px] font-bold text-[#3B5BDB]'}>보호자</span>
      )}
    </button>
    </li>
  );
}

/** 상세 다이얼로그 — 목록 응답에 있는 정보만(별도 조회 없음) */
function StudentDetailDialog({ st, onClose }: { st: StudentListItemResponse; onClose: () => void }) {
  const [closing, setClosing] = useState(false);
  const close = () => {
    if (closing) return;
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  };
  const name = val(st.name) ?? val(st.nickName) ?? '-';
  const nick = val(st.nickName);
  const tags = (st.tags ?? []).filter((t) => t.name);
  const rows: { label: string; value?: string }[] = [
    { label: '닉네임', value: nick && nick !== name ? nick : undefined },
    { label: '연락처', value: formatPhone(st.phone) },
    { label: '이메일', value: val(st.email) },
    { label: '등록일', value: st.registeredAt },
    { label: '보호자', value: st.parentName ? [st.parentName, formatPhone(st.parentPhone)].filter(Boolean).join(' · ') : undefined },
  ];
  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center px-6 ${
        closing ? 'animate-[fadeOut_200ms_ease-out_forwards]' : 'animate-[fadeIn_200ms_ease-out]'
      }`}
      onClick={close}
    >
      <div className={'absolute inset-0 bg-black/40'}/>
      <div
        className={'relative w-full max-w-[380px] bg-white rounded-[24px] p-6 animate-[scaleIn_260ms_ease-out]'}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={'flex items-center gap-3.5'}>
          <span className={'relative w-[56px] h-[56px] rounded-[18px] bg-[#F7F8FA] overflow-hidden flex items-center justify-center shrink-0 text-[20px] font-bold text-[#4E5968]'}>
            {st.profileImageUrl
              ? <Image src={st.profileImageUrl} alt={''} fill sizes={'56px'} className={'object-cover'}/>
              : name.slice(0, 1)}
          </span>
          <div className={'min-w-0'}>
            <p className={'text-[19px] font-bold text-black truncate'}>{name}</p>
            {tags.length > 0 && (
              <div className={'mt-1 flex flex-wrap gap-1'}>
                {tags.map((t) => (
                  <span key={t.id} className={'rounded-md bg-[#F2F4F6] px-1.5 py-[1px] text-[11px] font-semibold text-[#4E5968]'}>{t.name}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <dl className={'mt-5 flex flex-col divide-y divide-[#F1F3F6] border-y border-[#F1F3F6]'}>
          {rows.filter((r) => r.value).map((r) => (
            <div key={r.label} className={'flex items-center gap-3 py-2.5'}>
              <dt className={'w-[64px] shrink-0 text-[13px] font-semibold text-[#8B95A1]'}>{r.label}</dt>
              <dd className={'flex-1 min-w-0 text-[14px] text-black break-all'}>{r.value}</dd>
            </div>
          ))}
        </dl>
        <button
          type={'button'}
          onClick={close}
          className={'mt-5 w-full h-[48px] rounded-[12px] bg-[#F2F4F6] text-[15px] font-semibold text-[#1E2124] active:scale-[0.98] transition-transform'}
        >
          닫기
        </button>
      </div>
    </div>
  );
}

export function StudentList({ initial, locale }: { initial: StudentsPage; locale: Locale }) {
  const [keyword, setKeyword] = useState('');
  const [order, setOrder] = useState<StudentListOrder>('CreatedAtDesc');
  const [onlyActive, setOnlyActive] = useState(false);
  const [data, setData] = useState<StudentsPage>(initial);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // 늦게 도착한 이전 조건의 응답이 최신 화면을 덮지 않게 — 요청마다 번호를 매기고 마지막 것만 반영
  const seq = useRef(0);
  const first = useRef(true);
  const [detail, setDetail] = useState<StudentListItemResponse | null>(null);
  const [regOpen, setRegOpen] = useState(false);
  // 새로 등록하면 검색·필터를 지우고 최근 등록순 1페이지로 — 방금 등록한 사람이 맨 위에 온다
  const [reloadKey, setReloadKey] = useState(0);
  const onRegistered = () => { setKeyword(''); setOnlyActive(false); setOrder('CreatedAtDesc'); setReloadKey((k) => k + 1); };

  // 조건 변경 → 1페이지부터 다시. 검색어는 300ms 디바운스.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = ++seq.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await getStudentsAction({ page: 1, order, onlyActive, keyword });
        if (seq.current !== id) return;
        setData(res);
        setPage(1);
      } finally {
        if (seq.current === id) setLoading(false);
      }
    }, keyword ? 300 : 0);
    return () => clearTimeout(timer);
  }, [keyword, order, onlyActive, reloadKey]);

  const hasMore = page < data.totalPage;
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    const id = seq.current;
    setLoadingMore(true);
    try {
      const res = await getStudentsAction({ page: page + 1, order, onlyActive, keyword });
      if (seq.current !== id) return;
      setData((prev) => ({ ...res, students: [...prev.students, ...res.students] }));
      setPage((p) => p + 1);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
      {/* 수강생 추가 */}
      <div className={'mx-4 mt-3'}>
        <button
          type={'button'}
          onClick={() => setRegOpen(true)}
          className={'w-full h-[48px] rounded-2xl bg-[#1E2124] flex items-center justify-center gap-2 text-[15px] font-bold text-white active:scale-[0.98] transition-transform'}
        >
          <UserRoundPlus size={18} strokeWidth={1.8}/>
          수강생 추가
        </button>
      </div>

      {/* 검색 */}
      <div className={'mx-4 mt-3 flex items-center gap-2 rounded-2xl bg-white border border-[#EEF0F2] px-4 py-2.5'}>
        <Search size={18} strokeWidth={1.8} className={'shrink-0 text-[#8B95A1]'}/>
        <input
          type={'search'}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={'이름 또는 전화번호 뒤 4자리'}
          enterKeyHint={'search'}
          className={'flex-1 min-w-0 bg-transparent text-[14px] text-black placeholder-[#B0B8C1] outline-none'}
        />
        {keyword && (
          <button type={'button'} onClick={() => setKeyword('')} aria-label={'검색어 지우기'} className={'shrink-0 w-6 h-6 rounded-full bg-[#F2F4F6] flex items-center justify-center'}>
            <X size={13} strokeWidth={2.2} className={'text-[#6B7684]'}/>
          </button>
        )}
      </div>

      {/* 정렬(세그먼트, 둘 중 하나) + 활성 수강생만(스위치, 켜고 끄기) — 성격이 달라 모양도 다르게 */}
      <div className={'mx-4 mt-2.5 flex items-center justify-between gap-3'}>
        <div role={'radiogroup'} aria-label={'정렬'} className={'flex p-[3px] rounded-full bg-[#EEF0F2]'}>
          {ORDERS.map((o) => {
            const on = order === o.value;
            return (
              <button
                key={o.value}
                type={'button'}
                role={'radio'}
                aria-checked={on}
                onClick={() => setOrder(o.value)}
                className={`h-[30px] px-3.5 rounded-full text-[13px] font-semibold transition-all ${
                  on ? 'bg-white text-[#191F28] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'text-[#8B95A1] active:text-[#4E5968]'
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
        <button
          type={'button'}
          role={'switch'}
          aria-checked={onlyActive}
          onClick={() => setOnlyActive((v) => !v)}
          className={'flex items-center gap-2 shrink-0'}
        >
          <span className={`text-[13px] font-semibold transition-colors ${onlyActive ? 'text-[#191F28]' : 'text-[#8B95A1]'}`}>활성 수강생만</span>
          <span className={`relative w-[40px] h-[24px] rounded-full transition-colors ${onlyActive ? 'bg-[#1E2124]' : 'bg-[#D1D6DB]'}`}>
            <span className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all ${onlyActive ? 'left-[19px]' : 'left-[3px]'}`}/>
          </span>
        </button>
      </div>

      {/* 목록 */}
      <section className={`mx-4 mt-3 rounded-2xl bg-white border border-[#EEF0F2] overflow-hidden transition-opacity ${loading ? 'opacity-50' : ''}`}>
        <p className={'px-4 pt-3.5 text-[12.5px] font-semibold text-[#8B95A1]'}>
          {keyword ? '검색 결과' : onlyActive ? '활성 수강생' : '전체'} {data.totalCount.toLocaleString()}명
        </p>
        {data.students.length === 0 ? (
          <p className={'px-4 py-12 text-center text-[14px] text-[#8B95A1]'}>
            {keyword ? '검색 결과가 없어요' : '아직 등록된 수강생이 없어요'}
          </p>
        ) : (
          <ul className={'mt-1 flex flex-col divide-y divide-[#F1F3F6]'}>
            {data.students.map((st) => <StudentRow key={st.id} st={st} onClick={() => setDetail(st)}/>)}
          </ul>
        )}
        {hasMore && (
          <div className={'px-4 pb-4'}>
            <button
              type={'button'}
              onClick={loadMore}
              disabled={loadingMore}
              className={'w-full h-[44px] rounded-[12px] bg-[#F2F4F6] text-[14px] font-semibold text-[#1E2124] active:bg-[#E8EAED] transition-colors disabled:opacity-60'}
            >
              {loadingMore ? '…' : `더보기 (${data.students.length}/${data.totalCount})`}
            </button>
          </div>
        )}
      </section>

      {detail && <StudentDetailDialog st={detail} onClose={() => setDetail(null)}/>}
      <AdminRegisterStudentDialog open={regOpen} locale={locale} onClose={() => setRegOpen(false)} onRegistered={onRegistered}/>
    </>
  );
}
