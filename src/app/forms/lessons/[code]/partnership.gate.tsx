// 인트로(/lessons/{code})와 폼(/lessons/{code}/apply)이 같은 판정을 공유한다.
// 판단은 서버(formOpen·closedReason)가 하고 여기는 그 값대로 안내 화면을 고르기만 한다 —
// 클라이언트가 마감일을 직접 비교하면 시계가 다를 때 어긋난다.

import React from 'react';
import { getPublicPartnership, PublicPartnership } from '@/app/forms/partnership.api';
import { fs } from '@/app/forms/form.i18n';
import { Notice } from '@/app/forms/Notice';
import { Locale } from '@/shared/StringResource';
import { StatusCard } from './PartnershipApplyForm';

export const loadPartnership = async (
  code: string,
  locale: Locale
): Promise<{ p: PublicPartnership } | { blocked: React.ReactElement }> => {
  const res = await getPublicPartnership(code);

  if (!res.ok) {
    // 존재 여부를 캐물을 수 있는 문구는 피한다 (만료/오타를 구분해 주지 않는다)
    return {
      blocked: res.status === 404
        ? <Notice emoji="🔗" title={fs(locale, 'pf_notfound_title')} message={fs(locale, 'pf_notfound_msg')}/>
        : <Notice emoji="⏳" title={fs(locale, 'pf_error_title')} message={fs(locale, 'pf_error_msg')}/>,
    };
  }

  const p = res.data;
  if (p.formOpen) return { p };

  switch (p.closedReason) {
    case 'DEADLINE_PASSED':
      // 폼은 숨기되 조건은 그대로 노출 — 다음 기수 문의로 이어진다
      return {
        blocked: (
          <Notice emoji="⏰" title={fs(locale, 'pf_closed_title')}
                  message={p.applyDeadline ? fs(locale, 'pf_closed_msg', {date: p.applyDeadline}) : undefined}>
            <div className="w-full mt-4 text-left">
              <StatusCard p={p} locale={locale}/>
            </div>
          </Notice>
        ),
      };
    case 'HEADCOUNT_FULL':
      return { blocked: <Notice emoji="🎉" title={fs(locale, 'pf_full_title', {n: p.maxHeadcount ?? 0})} message={fs(locale, 'pf_full_msg')}/> };
    case 'ALREADY_PAID':
      return { blocked: <Notice emoji="✅" title={fs(locale, 'pf_paid_title')} message={fs(locale, 'pf_paid_msg')}/> };
    case 'CANCELLED':
    default:
      return { blocked: <Notice emoji="🚫" title={fs(locale, 'pf_cancelled_title')} message={fs(locale, 'pf_cancelled_msg')}/> };
  }
};
