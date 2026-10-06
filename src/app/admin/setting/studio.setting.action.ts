'use server'

import { api } from '@/app/api.client';
import { BusinessStudioResponse, MyStudioSettingsResponse, UpdateStudioRequest } from '@/app/endpoint/studio.endpoint';
import { isGuinnessErrorCase } from '@/app/guinnessErrorCase';

/** { studio } 래핑/비래핑 응답을 편다. 에러면 null */
const unwrap = (res: MyStudioSettingsResponse | { code?: string }): BusinessStudioResponse | null => {
  if (isGuinnessErrorCase(res)) return null;
  if ('studio' in res && res.studio) return res.studio;
  return 'id' in res ? (res as BusinessStudioResponse) : null;
};

export const getMyStudioProfileAction = async () => unwrap(await api.studio.getMyProfile({}));
export const getMyStudioBusinessAction = async () => unwrap(await api.studio.getMyBusiness({}));
export const getMyStudioLessonSettingsAction = async () => unwrap(await api.studio.getMyLessonSettings({}));
export const getMyStudioRoomSettingsAction = async () => unwrap(await api.studio.getMyRoomSettings({}));

export type UpdateStudioResult = { ok: true; studio: BusinessStudioResponse } | { ok: false; message: string };

/**
 * PATCH /studios — 담은 키만 바뀐다. 소유자(원장) 계정만 가능하고 운영자는 401(STUDIO_PARTNER_NOT_MATCH).
 * undefined 는 endpointBuilder 가 걷어내고, null 은 그대로 간다(판매 일정 초기화용).
 */
export const updateStudioAction = async (body: UpdateStudioRequest): Promise<UpdateStudioResult> => {
  try {
    const res = await api.studio.update(body);
    if (isGuinnessErrorCase(res)) {
      const code = (res as { code?: string }).code;
      const message = code === 'STUDIO_PARTNER_NOT_MATCH'
        ? '원장 계정만 수정할 수 있어요'
        : res.message || '저장하지 못했어요';
      return { ok: false, message };
    }
    if (!('id' in res)) return { ok: false, message: '저장하지 못했어요' };
    return { ok: true, studio: res };
  } catch {
    return { ok: false, message: '요청에 실패했어요' };
  }
};
