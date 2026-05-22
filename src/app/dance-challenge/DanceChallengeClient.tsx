'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronRight, Upload, RotateCcw, Music, Activity, Check, X } from 'lucide-react';
import { MOCK_CHALLENGES, ReferenceChallenge, MatchResult, runMockMatching } from '@/app/dance-challenge/mock';
import { kloudNav } from '@/app/lib/kloudNav';

type Step = 'list' | 'detail' | 'uploading' | 'analyzing' | 'result';

const ANALYZE_DURATION_MS = 2800;

const difficultyColor = (d: ReferenceChallenge['difficulty']): string => {
  switch (d) {
    case '입문': return 'bg-[#E8F5E9] text-[#2E7D32]';
    case '초급': return 'bg-[#E3F2FD] text-[#1565C0]';
    case '중급': return 'bg-[#FFF4E5] text-[#A05A00]';
    case '고급': return 'bg-[#FEECEC] text-[#E55B5B]';
  }
};

const verdictMeta = (v: MatchResult['verdict']): { label: string; color: string; icon: React.ReactNode } => {
  switch (v) {
    case 'match':    return { label: '완벽하게 따라했어요',   color: 'text-[#2E7D32]', icon: <Check size={28} strokeWidth={3}/> };
    case 'review':   return { label: '잘 따라왔어요',         color: 'text-[#A05A00]', icon: <Activity size={28} strokeWidth={2.5}/> };
    case 'mismatch': return { label: '한 번 더 시도해보세요',  color: 'text-[#E55B5B]', icon: <X size={28} strokeWidth={3}/> };
  }
};

export function DanceChallengeClient() {
  const [step, setStep] = useState<Step>('list');
  const [selected, setSelected] = useState<ReferenceChallenge | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const goList = () => {
    setStep('list');
    setSelected(null);
    setResult(null);
    setUploadedFileName(null);
    setAnalyzeProgress(0);
  };

  const goDetail = (c: ReferenceChallenge) => {
    setSelected(c);
    setStep('detail');
  };

  const onPickFile = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadedFileName(f.name);
    setStep('uploading');
    // 가짜 업로드 진행 — 600ms 후 분석 단계로
    setTimeout(() => setStep('analyzing'), 600);
  };

  // analyzing 단계에서 진행률 애니메이션 + ANALYZE_DURATION_MS 후 결과 산출
  useEffect(() => {
    if (step !== 'analyzing') return;
    setAnalyzeProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / ANALYZE_DURATION_MS) * 100));
      setAnalyzeProgress(pct);
    }, 60);
    const done = setTimeout(() => {
      setResult(runMockMatching());
      setStep('result');
    }, ANALYZE_DURATION_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [step]);

  return (
    <div className={'w-full min-h-screen bg-[#F7F8F9] flex flex-col'}>
      <Header step={step} onBack={() => {
        if (step === 'list') {
          kloudNav.back();
          return;
        }
        if (step === 'detail') { goList(); return; }
        if (step === 'result') { goList(); return; }
        // uploading/analyzing 중에는 뒤로 차단 (시연용 PoC)
      }}/>

      {step === 'list' && <ListView onSelect={goDetail}/>}
      {step === 'detail' && selected && (
        <DetailView challenge={selected} onUploadClick={onPickFile}/>
      )}
      {step === 'uploading' && <UploadingView fileName={uploadedFileName ?? ''}/>}
      {step === 'analyzing' && <AnalyzingView progress={analyzeProgress}/>}
      {step === 'result' && selected && result && (
        <ResultView
          challenge={selected}
          result={result}
          onRetry={() => { setResult(null); setStep('detail'); }}
          onPickAnother={goList}
        />
      )}

      <input
        ref={fileInputRef}
        type={'file'}
        accept={'video/*'}
        capture={'environment'}
        className={'hidden'}
        onChange={onFileChange}
      />
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function Header({ step, onBack }: { step: Step; onBack: () => void }) {
  const title = (() => {
    switch (step) {
      case 'list':      return '안무 따라하기';
      case 'detail':    return '챌린지 상세';
      case 'uploading': return '업로드 중';
      case 'analyzing': return '분석 중';
      case 'result':    return '결과';
    }
  })();
  return (
    <header className={'sticky top-0 z-10 bg-white border-b border-[#F1F3F6]'}>
      <div className={'flex items-center h-12 px-2'}>
        <button
          type={'button'}
          onClick={onBack}
          aria-label={'뒤로가기'}
          disabled={step === 'uploading' || step === 'analyzing'}
          className={'w-10 h-10 inline-flex items-center justify-center rounded-full active:bg-[#F2F4F6] disabled:opacity-40'}
        >
          <svg width={'20'} height={'20'} viewBox={'0 0 24 24'} fill={'none'}>
            <path d={'M15 18l-6-6 6-6'} stroke={'#1E2124'} strokeWidth={'2'} strokeLinecap={'round'} strokeLinejoin={'round'}/>
          </svg>
        </button>
        <h1 className={'flex-1 text-center text-[16px] font-bold text-[#191F28] -ml-10'}>{title}</h1>
      </div>
    </header>
  );
}

// ─── List ────────────────────────────────────────────────────────────────────

function ListView({ onSelect }: { onSelect: (c: ReferenceChallenge) => void }) {
  return (
    <div className={'flex-1 px-5 pt-4 pb-10 flex flex-col gap-3'}>
      <p className={'text-[13px] text-[#4E5968] leading-[1.6] mb-1'}>
        강사 안무를 따라 추고 영상을 올리면,<br/>유사도를 분석해서 점수를 알려드려요.
      </p>
      {MOCK_CHALLENGES.map((c) => (
        <button
          key={c.id}
          type={'button'}
          onClick={() => onSelect(c)}
          className={'bg-white rounded-2xl border border-[#E5E8EB] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex active:bg-[#FAFBFC] transition-colors'}
        >
          <div className={'relative w-[120px] h-[120px] bg-[#F2F4F6] shrink-0'}>
            <Image src={c.thumbnailUrl} alt={''} fill className={'object-cover'} sizes={'120px'} unoptimized/>
          </div>
          <div className={'flex-1 min-w-0 p-3 flex flex-col text-left'}>
            <div className={'flex items-center gap-1.5'}>
              <span className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold shrink-0 ${difficultyColor(c.difficulty)}`}>
                {c.difficulty}
              </span>
              <span className={'text-[11px] text-[#8B95A1] truncate'}>{c.genre}</span>
            </div>
            <div className={'mt-1 text-[15px] font-bold text-[#191F28] truncate'}>{c.title}</div>
            <div className={'mt-0.5 text-[12px] text-[#4E5968] truncate'}>{c.artistName}</div>
            <div className={'mt-auto flex items-center justify-between'}>
              <span className={'text-[11px] text-[#8B95A1] tabular-nums'}>{c.durationSec}초</span>
              <ChevronRight size={16} className={'text-[#B0B8C1]'}/>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Detail ──────────────────────────────────────────────────────────────────

function DetailView({ challenge, onUploadClick }: { challenge: ReferenceChallenge; onUploadClick: () => void }) {
  return (
    <div className={'flex-1 flex flex-col'}>
      <video
        src={challenge.videoUrl}
        poster={challenge.thumbnailUrl}
        controls
        playsInline
        className={'w-full bg-black aspect-video object-contain'}
      />
      <div className={'flex-1 px-5 pt-4 pb-6 flex flex-col gap-3'}>
        <div className={'flex items-center gap-1.5'}>
          <span className={`inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold ${difficultyColor(challenge.difficulty)}`}>
            {challenge.difficulty}
          </span>
          <span className={'text-[11px] text-[#8B95A1]'}>{challenge.genre} · {challenge.durationSec}초</span>
        </div>
        <h2 className={'text-[20px] font-bold text-[#191F28] leading-[1.3]'}>{challenge.title}</h2>
        <p className={'text-[13px] text-[#4E5968]'}>by {challenge.artistName}</p>

        <div className={'mt-2 rounded-2xl bg-white border border-[#E5E8EB] p-4'}>
          <p className={'text-[12px] font-bold text-[#191F28] mb-2'}>촬영 가이드</p>
          <ul className={'text-[12px] text-[#4E5968] leading-[1.7] list-disc pl-4'}>
            <li>밝은 곳에서 전신이 보이도록 촬영</li>
            <li>배경이 단순한 곳일수록 정확해요</li>
            <li>기준 영상과 같은 길이로 찍어주세요</li>
            <li>음악을 함께 재생하면 점수에 도움돼요</li>
          </ul>
        </div>
      </div>

      <div className={'sticky bottom-0 bg-white border-t border-[#F1F3F6] px-5 py-3'}>
        <button
          type={'button'}
          onClick={onUploadClick}
          className={'w-full h-12 rounded-2xl bg-[#1E2124] flex items-center justify-center gap-2 active:opacity-80 transition-opacity'}
        >
          <Upload size={18} className={'text-white'}/>
          <span className={'text-white font-bold text-[14px]'}>내 영상 올리기</span>
        </button>
      </div>
    </div>
  );
}

// ─── Uploading ───────────────────────────────────────────────────────────────

function UploadingView({ fileName }: { fileName: string }) {
  return (
    <div className={'flex-1 flex flex-col items-center justify-center px-8 gap-4'}>
      <div className={'w-16 h-16 rounded-full bg-white border border-[#E5E8EB] flex items-center justify-center'}>
        <Upload size={28} className={'text-[#1E2124] animate-bounce'}/>
      </div>
      <p className={'text-[14px] font-bold text-[#191F28]'}>업로드 중…</p>
      {fileName && (
        <p className={'text-[12px] text-[#8B95A1] truncate max-w-full'}>{fileName}</p>
      )}
    </div>
  );
}

// ─── Analyzing ───────────────────────────────────────────────────────────────

function AnalyzingView({ progress }: { progress: number }) {
  const phases = [
    { threshold: 33, label: '음원 패턴 분석 중' },
    { threshold: 66, label: '관절 움직임 비교 중' },
    { threshold: 100, label: '종합 점수 산출 중' },
  ];
  const current = phases.find((p) => progress < p.threshold) ?? phases[phases.length - 1];

  return (
    <div className={'flex-1 flex flex-col items-center justify-center px-8 gap-5'}>
      <div className={'relative w-24 h-24'}>
        <div className={'absolute inset-0 rounded-full bg-[#1E2124] animate-pulse'}/>
        <div className={'absolute inset-2 rounded-full bg-white flex items-center justify-center'}>
          <span className={'text-[20px] font-bold text-[#1E2124] tabular-nums'}>{progress}%</span>
        </div>
      </div>
      <p className={'text-[15px] font-bold text-[#191F28]'}>{current.label}</p>
      <p className={'text-[12px] text-[#8B95A1] text-center max-w-[260px] leading-[1.6]'}>
        분석에 몇 초 정도 걸려요.<br/>잠시만 기다려주세요.
      </p>
    </div>
  );
}

// ─── Result ──────────────────────────────────────────────────────────────────

function ResultView({
  challenge,
  result,
  onRetry,
  onPickAnother,
}: {
  challenge: ReferenceChallenge;
  result: MatchResult;
  onRetry: () => void;
  onPickAnother: () => void;
}) {
  const meta = verdictMeta(result.verdict);
  return (
    <div className={'flex-1 flex flex-col'}>
      <div className={'flex-1 px-5 pt-6 pb-4 flex flex-col gap-5'}>
        {/* 총점 + 판정 */}
        <div className={'flex flex-col items-center pt-4'}>
          <div className={`w-20 h-20 rounded-full bg-white border-2 border-current flex items-center justify-center ${meta.color}`}>
            {meta.icon}
          </div>
          <p className={`mt-3 text-[16px] font-bold ${meta.color}`}>{meta.label}</p>
          <div className={'mt-2 flex items-baseline gap-1'}>
            <span className={'text-[44px] font-bold text-[#191F28] tabular-nums leading-none'}>{result.totalScore}</span>
            <span className={'text-[14px] text-[#8B95A1] font-semibold'}>점</span>
          </div>
        </div>

        {/* 챌린지 요약 */}
        <div className={'rounded-2xl bg-white border border-[#E5E8EB] p-4 flex items-center gap-3'}>
          <div className={'relative w-12 h-12 rounded-lg overflow-hidden bg-[#F2F4F6] shrink-0'}>
            <Image src={challenge.thumbnailUrl} alt={''} fill className={'object-cover'} sizes={'48px'} unoptimized/>
          </div>
          <div className={'flex-1 min-w-0'}>
            <p className={'text-[13px] font-bold text-[#191F28] truncate'}>{challenge.title}</p>
            <p className={'text-[11px] text-[#8B95A1] truncate'}>{challenge.artistName}</p>
          </div>
        </div>

        {/* 점수 상세 */}
        <div className={'rounded-2xl bg-white border border-[#E5E8EB] p-4 flex flex-col gap-3'}>
          <ScoreBar
            icon={<Music size={16}/>}
            label={'음원 일치도'}
            score={result.musicScore}
          />
          <ScoreBar
            icon={<Activity size={16}/>}
            label={'동작 일치도'}
            score={result.motionScore}
          />
        </div>

        {/* PoC 안내 */}
        <p className={'text-[11px] text-[#B0B8C1] text-center'}>
          * 현재는 시연용 결과예요. 실제 분석 모델 적용 예정.
        </p>
      </div>

      {/* 액션 */}
      <div className={'sticky bottom-0 bg-white border-t border-[#F1F3F6] px-5 py-3 flex gap-2'}>
        <button
          type={'button'}
          onClick={onPickAnother}
          className={'flex-1 h-12 rounded-2xl bg-[#F2F4F6] flex items-center justify-center gap-1.5 active:opacity-80'}
        >
          <span className={'text-[#1E2124] font-bold text-[14px]'}>다른 챌린지</span>
        </button>
        <button
          type={'button'}
          onClick={onRetry}
          className={'flex-1 h-12 rounded-2xl bg-[#1E2124] flex items-center justify-center gap-1.5 active:opacity-80'}
        >
          <RotateCcw size={16} className={'text-white'}/>
          <span className={'text-white font-bold text-[14px]'}>다시 도전</span>
        </button>
      </div>
    </div>
  );
}

function ScoreBar({ icon, label, score }: { icon: React.ReactNode; label: string; score: number }) {
  const pct = Math.round(score * 100);
  return (
    <div className={'flex flex-col gap-1.5'}>
      <div className={'flex items-center justify-between'}>
        <div className={'flex items-center gap-1.5 text-[#4E5968]'}>
          {icon}
          <span className={'text-[12px] font-semibold'}>{label}</span>
        </div>
        <span className={'text-[14px] font-bold text-[#191F28] tabular-nums'}>{pct}%</span>
      </div>
      <div className={'w-full h-2 rounded-full bg-[#F2F4F6] overflow-hidden'}>
        <div
          className={'h-full bg-[#1E2124] rounded-full transition-all duration-500'}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
