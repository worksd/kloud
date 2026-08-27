// 파트너십 신청 화면의 대상 스튜디오 조회.
// 링크의 {studio} 는 숫자 id 이거나 slug(@핸들) 다 — 스튜디오가 관리자에서 받은 링크를 뿌리므로
// 사람이 읽기 좋은 slug 를 우선 쓰되, slug 가 없는 스튜디오는 id 로도 열린다.
// 스튜디오 정보는 guinness(실서버)에서, 신청 제출은 파트너 관리자 목업으로 간다.

import { api } from '@/app/api.client';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';
import { GetStudioResponse } from '@/app/endpoint/studio.endpoint';

export type FormStudio = Pick<GetStudioResponse, 'id' | 'name' | 'profileImageUrl' | 'address' | 'roadAddress' | 'slug'>;

export const loadFormStudio = async (key: string): Promise<FormStudio | null> => {
  const decoded = decodeURIComponent(key).replace(/^@/, '');
  if (!decoded) return null;
  try {
    const res = /^\d+$/.test(decoded)
      ? await api.studio.get({ id: Number(decoded) })
      : await api.studio.getBySlug({ slug: decoded });
    if (!res || isGuinnessErrorCase(res)) return null;
    const studio = 'studio' in res ? res.studio : res;
    if (!studio?.id) return null;
    return {
      id: studio.id,
      name: studio.name,
      profileImageUrl: studio.profileImageUrl,
      address: studio.address,
      roadAddress: studio.roadAddress,
      slug: studio.slug,
    };
  } catch {
    return null;
  }
};
