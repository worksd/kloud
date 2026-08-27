// 신청 화면 공통 입력 유틸 — 구성원 신청 폼과 파트너십 신청 폼이 같이 쓴다.

/** 010-1234-5678 — 입력 중 하이픈 자동 */
export const formatPhone = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length < 11) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
};

export const inputCls =
  'w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[15px] text-black placeholder-[#9CA3AF] outline-none focus:border-black transition-colors';

/** 선택 칩 — select/multiSelect 문항, 단체 유형 등 */
export const chipCls = (selected: boolean) =>
  `px-4 py-2 rounded-full border text-[14px] transition-colors ${
    selected ? 'bg-black text-white border-black' : 'bg-white text-black border-[#E5E7EB]'
  }`;
