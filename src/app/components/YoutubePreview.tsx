'use client';

import { useEffect, useRef, useId, useState } from "react";
import YoutubeIcon from "../../../public/assets/youtube-colored.svg";

type Props = {
  videoId: string;
  duration?: number;
  className?: string;
  watchMoreLabel?: string;
};

export const YoutubePreview = ({ videoId, duration = 5, className = "", watchMoreLabel = "YouTube에서 보기 ▶" }: Props) => {
  const containerId = useId().replace(/:/g, '-');
  const divId = `yt-preview${containerId}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [ready, setReady] = useState(false);
  const [ended, setEnded] = useState(false);

  // YouTube IFrame API 스크립트 로드
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).YT?.Player) {
      setReady(true);
      return;
    }

    const prev = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      prev?.();
      setReady(true);
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  }, []);

  // 플레이어 생성 + duration 후 일시정지
  useEffect(() => {
    if (!ready || playerRef.current) return;

    playerRef.current = new (window as any).YT.Player(divId, {
      width: '100%',
      height: '100%',
      videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        controls: 0,
        playsinline: 1,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
      },
      events: {
        onReady: (e: any) => {
          e.target.mute();
          e.target.playVideo();

          const iframe = containerRef.current?.querySelector('iframe');
          if (iframe) {
            iframe.style.border = 'none';
            iframe.setAttribute('frameBorder', '0');
          }

          timerRef.current = setInterval(() => {
            try {
              if (e.target.getCurrentTime() >= duration) {
                e.target.pauseVideo();
                if (timerRef.current) clearInterval(timerRef.current);
                setEnded(true);
              }
            } catch {}
          }, 300);
        },
      },
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      try { playerRef.current?.destroy(); } catch {}
      playerRef.current = null;
    };
  }, [ready, divId, videoId, duration]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div id={divId} className="absolute inset-0 [&>iframe]:border-none" />

      {/* 5초 후 페이드인 오버레이 */}
      <div className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-500
        ${ended ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40" />
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="relative z-20 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur rounded-full text-[13px] font-semibold text-black
            active:scale-95 transition-transform"
        >
          <YoutubeIcon className="w-5 h-5 flex-shrink-0" />
          <span className="leading-none whitespace-nowrap">{watchMoreLabel}</span>
        </a>
      </div>

      {/* 재생 중 클릭 차단 */}
      {!ended && <div className="absolute inset-0 z-10" />}
    </div>
  );
};
