import { headers } from 'next/headers';

// 신청 화면의 "브라우저에 보이는" 경로.
// form.rawgraphy.com 에서는 proxy가 /forms 를 붙여 rewrite 하므로 브라우저 주소에는 /forms 가 없고,
// 로컬/기본 호스트에서 직접 열면 /forms/... 그대로다. 링크·redirect 는 이 값으로 만들어야 어긋나지 않는다.
export const formBasePath = async (pathUnderForms: string): Promise<string> => {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
  return host.startsWith('form.') ? pathUnderForms : `/forms${pathUnderForms}`;
};
