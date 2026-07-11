'use server'

import { api } from "@/app/api.client";
import { SocialLinkParameter } from "@/app/endpoint/auth.endpoint";

// SNS 계정 연결 — POST /auth/social-link.
// 다른 계정에 물려있으면 needsConfirm:true → 동일 token/code + confirm:true로 재호출(이전).
export const socialLinkAction = async (params: SocialLinkParameter) => {
  return await api.auth.socialLink(params);
};

// 현재 계정에 연결된 소셜 provider 목록 — /users/me의 socialLinks
export const getMySocialLinksAction = async (): Promise<string[]> => {
  const res = await api.user.me({});
  if ('id' in res) return (res.socialLinks ?? []).map((s) => s.provider);
  return [];
};
