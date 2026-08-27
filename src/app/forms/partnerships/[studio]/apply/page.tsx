// 파트너십 신청서 — form.rawgraphy.com/partnerships/{studio}/apply.
// 인트로에서 "신청서 작성하기"를 누르면 여기로 온다.

import React from 'react';
import { fs } from '@/app/forms/form.i18n';
import { formBasePath } from '@/app/forms/form.path';
import { Notice } from '@/app/forms/Notice';
import { getLocale } from '@/utils/translate';
import { loadFormStudio } from '../studio.load';
import { PartnershipRequestForm } from '../PartnershipRequestForm';

export const dynamic = 'force-dynamic';

export default async function PartnershipRequestApplyPage({params}: { params: Promise<{ studio: string }> }) {
  const { studio: key } = await params;
  const locale = await getLocale();
  const studio = await loadFormStudio(key);
  if (!studio) {
    return <Notice emoji="🔗" title={fs(locale, 'pr_studio_notfound_title')} message={fs(locale, 'pr_studio_notfound_msg')}/>;
  }

  const basePath = await formBasePath(`/partnerships/${encodeURIComponent(key)}`);
  return <PartnershipRequestForm studio={studio} locale={locale} basePath={basePath}/>;
}
