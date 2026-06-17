/**
 * 이미지 뷰어 ↔ 네이티브 브릿지
 *
 * 웹이 이미지 URL을 넘기면 네이티브가 전체화면 뷰어로 보여준다.
 * 예) https://guinness-bucket.s3.ap-northeast-2.amazonaws.com/rawgraphy/profile/profile.png
 */
'use client';

/** 네이티브 전체화면 이미지 뷰어로 해당 URL의 이미지를 띄운다. */
export const showImageOnNative = (imageUrl: string): void => {
  if (typeof window === 'undefined') return;
  if (!imageUrl) return;
  window.KloudEvent?.showImage?.(JSON.stringify({ imageUrl }));
};
