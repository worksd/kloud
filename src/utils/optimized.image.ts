/**
 * 이미지 URL 최적화 helper — Next.js image optimizer(/_next/image)로 리사이즈 + q=50 압축 + 디스크 캐시.
 * 일반 <img> src에 그대로 넣을 수 있어 마크업 변경이 필요 없다.
 * (원본: kiosk.image.ts — 키오스크 전용이 아니어서 공용 유틸로 승격. kiosk 쪽은 re-export)
 *
 * Next.config qualities에 50이 등록되어 있고 remotePatterns은 모든 호스트 허용 상태라 추가 설정 없이 동작.
 */

// Next.js default imageSizes + deviceSizes. optimizer는 여기 등록된 width만 허용.
const VALID_WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

const resolveWidth = (requested: number): number => {
  return VALID_WIDTHS.find((w) => w >= requested) ?? VALID_WIDTHS[VALID_WIDTHS.length - 1];
};

export const optimizedImageSrc = (
  src: string | undefined | null,
  width: number = 128,
  quality: number = 50,
): string | undefined => {
  if (!src) return src ?? undefined;
  // 이미 optimizer 거쳤거나 data/blob URL이면 그대로
  if (src.startsWith('/_next/image') || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }
  const w = resolveWidth(width);
  return `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${quality}`;
};
