'use server'

export type InstagramVerifyResult =
  | { status: 'connected'; username?: string }
  | { status: 'pending' }
  | { status: 'error'; message: string };

// TODO: BE 엔드포인트 생기면 교체.
// 현재는 NestJS 측에 /instagram/verify 같은 라우트가 없어서 stub.
// 예상 호출: api.instagram.verify({})
//   → BE: 현재 유저의 pending 연동 상태 조회 후 결과 반환
export const verifyInstagramAction = async (): Promise<InstagramVerifyResult> => {
  return { status: 'pending' };
};
