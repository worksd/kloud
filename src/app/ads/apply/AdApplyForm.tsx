'use client';

import React, { useCallback, useRef, useState } from "react";

const MAX_IMAGES = 20;
const MAX_IMAGE_MB = 10;

type ImageItem = { id: string; file: File; url: string };

export const AdApplyForm = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback((files: FileList | null) => {
    if (!files) return;
    setError(null);
    const incoming = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (incoming.length === 0) return;
    if (incoming.some((f) => f.size > MAX_IMAGE_MB * 1024 * 1024)) {
      setError(`이미지는 장당 최대 ${MAX_IMAGE_MB}MB까지 올릴 수 있어요.`);
      return;
    }
    setImages((prev) => {
      const room = MAX_IMAGES - prev.length;
      if (room <= 0) {
        setError(`이미지는 최대 ${MAX_IMAGES}장까지 올릴 수 있어요.`);
        return prev;
      }
      const next = incoming.slice(0, room).map((file, i) => ({
        id: `${file.name}-${file.size}-${prev.length + i}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...next];
    });
  }, []);

  const removeImage = (id: string) => {
    setImages((prev) => {
      const t = prev.find((i) => i.id === id);
      if (t) URL.revokeObjectURL(t.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const clearAll = () => {
    images.forEach((i) => URL.revokeObjectURL(i.url));
    setImages([]);
    setError(null);
  };

  const handleAnalyze = () => {
    // TODO: AI 이미지 분석 연동 — images.map(i => i.file) 업로드 후 분석 결과로 수정 단계 진입
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addImages(e.dataTransfer.files);
  };

  const openPicker = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 w-full max-w-[760px] mx-auto px-6 pt-12 pb-32">
        <h1 className="text-[24px] font-bold text-black mb-1.5">광고 이미지 업로드</h1>
        <p className="text-[14px] text-[#86898C] mb-7">분석할 광고 이미지를 여러 장 올려주세요.</p>

        {images.length === 0 ? (
          /* 빈 상태 — 큰 드롭존 */
          <button
            type="button"
            onClick={openPicker}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`w-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-colors ${dragging ? 'border-black bg-[#F5F6F8]' : 'border-[#D9DDE1] bg-[#FAFBFC]'}`}
            style={{ minHeight: '46vh' }}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#F1F3F6] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8">
                <path d="M12 16V5m0 0L7.5 9.5M12 5l4.5 4.5" stroke="#1E2124" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16" stroke="#1E2124" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[16px] font-bold text-black">이미지를 끌어다 놓거나 클릭해서 선택</p>
              <p className="text-[13px] text-[#9AA0A6] mt-1">여러 장 한 번에 · 장당 최대 {MAX_IMAGE_MB}MB · 최대 {MAX_IMAGES}장</p>
            </div>
          </button>
        ) : (
          /* 업로드된 이미지 그리드 */
          <>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-semibold text-[#2A2D30]">{images.length}장 선택됨</span>
              <button onClick={clearAll} className="text-[13px] font-medium text-[#86898C] active:opacity-60">전체 삭제</button>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`grid grid-cols-3 sm:grid-cols-4 gap-2.5 rounded-2xl transition-colors ${dragging ? 'ring-2 ring-black ring-offset-4' : ''}`}
            >
              {images.map((img) => (
                <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden bg-[#F1F3F6]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    aria-label="remove"
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/65 flex items-center justify-center active:scale-90"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5">
                      <path d="M6 6l12 12M18 6L6 18" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={openPicker}
                  className="aspect-square rounded-2xl bg-[#F5F6F8] border-2 border-dashed border-[#D9DDE1] flex flex-col items-center justify-center gap-1.5 text-[#86898C] active:scale-[0.98] transition-transform"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
                    <path d="M12 5v14M5 12h14" stroke="#86898C" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="text-[12px] font-semibold">추가</span>
                </button>
              )}
            </div>
          </>
        )}

        {error && <p className="mt-4 text-[14px] font-medium text-[#C0392B]">{error}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { addImages(e.target.files); e.target.value = ''; }}
        />
      </div>

      {/* 하단 고정 — 분석하기 (이미지 있을 때 활성) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-[#EEF0F2] px-6 py-4">
        <div className="max-w-[760px] mx-auto">
          <button
            onClick={handleAnalyze}
            disabled={images.length === 0}
            className="w-full h-14 rounded-2xl bg-black text-white font-bold text-[16px] active:scale-[0.99] transition-transform disabled:opacity-40"
          >
            분석하기{images.length > 0 ? ` (${images.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
