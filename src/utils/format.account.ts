/**
 * 계좌번호를 은행별 포맷에 맞춰 하이픈으로 구분하여 반환합니다.
 * 은행명이 없거나 매칭되지 않으면 기본 포맷(4-3-나머지)을 적용합니다.
 *
 * @param accountNumber 숫자로만 이루어진 계좌번호 문자열
 * @param bankName 은행명 (optional)
 * @returns 포맷된 계좌번호 (e.g. "1002-449-104625")
 */
export const formatAccountNumber = (accountNumber?: string, bankName?: string): string => {
  if (!accountNumber) return '';

  const digits = accountNumber.replace(/\D/g, '');
  if (digits.length === 0) return '';

  const format = (pattern: number[]) => {
    const parts: string[] = [];
    let idx = 0;
    for (const len of pattern) {
      if (idx >= digits.length) break;
      parts.push(digits.slice(idx, idx + len));
      idx += len;
    }
    if (idx < digits.length) {
      parts.push(digits.slice(idx));
    }
    return parts.join('-');
  };

  if (bankName) {
    const name = bankName.toLowerCase().replace(/[\s-]+/g, '');

    // 3-2-6 (10~11자리): 국민
    if (['kb', 'kookmin', '국민'].some(k => name.includes(k)) && digits.length >= 10) {
      return format([3, 2, 4, digits.length - 9]);
    }
    // 3-3-6 (12자리): 신한, 우리
    if (['shinhan', 'sinhan', '신한', 'woori', '우리'].some(k => name.includes(k)) && digits.length >= 11) {
      return format([3, 3, digits.length - 6]);
    }
    // 3-6-2-3 (14자리): 하나
    if (['hana', '하나'].some(k => name.includes(k)) && digits.length >= 12) {
      return format([3, 6, 2, digits.length - 11]);
    }
    // 3-4-4-2 (13자리): 농협
    if (['nonghyup', '농협', 'nh'].some(k => name.includes(k)) && digits.length >= 11) {
      return format([3, 4, 4, digits.length - 11]);
    }
    // 4-3-6 (13자리): 우리(구), IBK, 카카오뱅크, 토스
    if (['ibk', '기업', 'kakao', '카카오', 'toss', '토스'].some(k => name.includes(k)) && digits.length >= 10) {
      return format([4, 3, digits.length - 7]);
    }
  }

  // 기본 포맷: 4-3-나머지
  if (digits.length <= 7) return digits;
  return format([4, 3, digits.length - 7]);
};
