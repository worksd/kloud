'use client'

import React from "react";
import { motion } from "framer-motion";
import { RecapPerson, RecapResponse } from "@/app/recap/recap.types";
// 타입만 — three 번들이 슬라이드(메인 번들)로 끌려오지 않게
import type { RecapSceneKey } from "@/app/recap/three/RecapScenes";
import { ExtrudedNumber, FlipWords, GradientText, RECAP_GRADIENT, RECAP_SAFE_TOP, recapImage, TapeLabel } from "@/app/recap/RecapUi";
import { SLIDE_MS } from "@/app/recap/recap.beat";

/**
 * 리캡 스토리 슬라이드 정의 — 3D 씬 키 + 배경 틴트 + HTML 카피.
 * 데이터가 비는 슬라이드(최애 강사 없음 등)는 buildSlides 에서 빠진다.
 * 요약(마지막) 슬라이드는 RecapStory 가 공유 기능과 함께 직접 그린다.
 */
export type RecapSlide = {
  key: RecapSceneKey;
  tint: [string, string];
  /** ms */
  duration: number;
  render: () => React.ReactNode;
};

/** 슬라이드 머리말 — 연습실 바닥에 붙이는 노란 게퍼 테이프 라벨 */
const Eyebrow = ({ children, delay = 0.1 }: { children: React.ReactNode; delay?: number }) => (
  <div className={'mb-1'}>
    <TapeLabel delay={delay}>{children}</TapeLabel>
  </div>
);

const Sub = ({ children, delay = 1.2 }: { children: React.ReactNode; delay?: number }) => (
  <motion.p
    className={'mt-4 text-[16px] leading-[1.55] text-white/75 whitespace-pre-line'}
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    {children}
  </motion.p>
);

/** 3D 씬과 겹치지 않게 카피를 화면 아래쪽에 모은다 */
const Bottom = ({ children }: { children: React.ReactNode }) => (
  <div className={'absolute inset-x-0 bottom-0 px-7 pb-[max(env(safe-area-inset-bottom,0px),40px)]'}>{children}</div>
);
const Top = ({ children }: { children: React.ReactNode }) => (
  <div className={'absolute inset-x-0 px-7'} style={{ top: `calc(${RECAP_SAFE_TOP} + 80px)` }}>{children}</div>
);

export const Avatar = ({ person, size }: { person: RecapPerson; size: number }) => (
  <div
    className={'rounded-full overflow-hidden flex items-center justify-center font-black text-white'}
    style={{
      width: size,
      height: size,
      fontSize: size * 0.38,
      backgroundImage: person.profileImageUrl ? undefined : RECAP_GRADIENT,
      boxShadow: '0 0 0 3px rgba(255,255,255,0.9), 0 0 50px rgba(255,62,165,0.7)',
    }}
  >
    {person.profileImageUrl
      // eslint-disable-next-line @next/next/no-img-element
      ? <img src={recapImage(person.profileImageUrl, size > 100 ? 640 : 256)} alt={person.name} className={'w-full h-full object-cover'}/>
      : person.name.slice(0, 1)}
  </div>
);

type RankItem = { key: string; label: string; sub?: string; count: number; person?: RecapPerson };

/**
 * TOP N 순위 목록 — 장르·강사·수업·달이 같이 쓴다.
 * 1위만 그라데이션 글자 + 꽉 찬 바, 나머지는 한 줄씩 왼쪽에서 밀려 들어오고 바가 차오른다.
 */
const RankList = ({ items, unit, delay = 0.5 }: { items: RankItem[]; unit: string; delay?: number }) => {
  const max = Math.max(...items.map(i => i.count), 1);
  return (
    <div className={'flex flex-col gap-3'}>
      {items.map((it, i) => (
        <motion.div
          key={it.key}
          className={'flex items-center gap-3'}
          initial={{ opacity: 0, x: -40, rotateY: -30 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ delay: delay + i * 0.13, type: 'spring', stiffness: 140, damping: 16 }}
          style={{ transformPerspective: 600 }}
        >
          <span className={`w-5 text-[16px] font-black ${i === 0 ? 'text-white' : 'text-white/45'}`}>{i + 1}</span>
          {it.person && <Avatar person={it.person} size={i === 0 ? 44 : 38}/>}
          <div className={'flex-1 min-w-0'}>
            <div className={'flex items-baseline justify-between gap-2'}>
              <span className={`truncate font-bold ${i === 0 ? 'text-[18px]' : 'text-[15px]'}`}>
                {i === 0 ? <GradientText>{it.label}</GradientText> : it.label}
              </span>
              <span className={'shrink-0 text-[13px] text-white/70'}>{it.count}{unit}</span>
            </div>
            {it.sub && <p className={'text-[12px] text-white/50 truncate'}>{it.sub}</p>}
            <div className={'mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden'}>
              <motion.div
                className={'h-full rounded-full'}
                style={{ backgroundImage: i === 0 ? RECAP_GRADIENT : 'linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.3))' }}
                initial={{ width: 0 }}
                animate={{ width: `${(it.count / max) * 100}%` }}
                transition={{ delay: delay + 0.2 + i * 0.13, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
};

const daysSince = (iso: string) => Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));

export const buildSlides = (r: RecapResponse): RecapSlide[] => {
  const hours = Math.floor(r.totalMinutes / 60);
  const peakMonth = r.monthlyLessons.indexOf(Math.max(...r.monthlyLessons));
  const perWeek = (r.totalLessons / 52).toFixed(1);
  const favorite = r.topArtists[0];
  // 수업 많은 달 TOP 3 (월 인덱스)
  const topMonths = r.monthlyLessons.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).slice(0, 3).map(([, i]) => i);
  const slides: (RecapSlide | false)[] = [
    {
      key: 'opening',
      tint: ['#7C3AED', '#EC4899'],
      duration: SLIDE_MS,
      render: () => (
        <Bottom>
          <Eyebrow>{r.studio.name} RECAP</Eyebrow>
          <h1 className={'mt-2 text-[64px] leading-none font-black'}>
            <ExtrudedNumber value={r.year} duration={1.2} className={'!tracking-[-0.06em]'}/>
          </h1>
          <h2 className={'mt-4 text-[26px] font-extrabold leading-[1.3]'}>
            <FlipWords text={`${r.nickName}님이 ${r.studio.name}에서 보낸 1년,`} delay={0.6}/>
            <br/>
            <FlipWords text={'함께 돌아봐요'} delay={0.8} gradient/>
          </h2>
        </Bottom>
      ),
    },
    {
      key: 'lessons',
      tint: ['#DB2777', '#7C3AED'],
      duration: SLIDE_MS,
      render: () => (
        <Top>
          <Eyebrow>올해 {r.studio.name}에서</Eyebrow>
          <div className={'mt-2 flex items-end gap-2'}>
            <ExtrudedNumber value={r.totalLessons} className={'text-[96px] leading-[0.95]'}/>
            <span className={'mb-3 text-[32px] font-extrabold'}>번</span>
          </div>
          <h2 className={'mt-1 text-[28px] font-extrabold'}><FlipWords text={'춤을 췄어요'} delay={0.9} gradient/></h2>
          <Sub>일주일에 평균 {perWeek}번 꼴이에요.</Sub>
        </Top>
      ),
    },
    {
      key: 'hours',
      tint: ['#0891B2', '#7C3AED'],
      duration: SLIDE_MS,
      render: () => (
        <Bottom>
          <Eyebrow>거울 앞에 선 시간</Eyebrow>
          <div className={'mt-2 flex items-end gap-2'}>
            <ExtrudedNumber value={hours} className={'text-[96px] leading-[0.95]'}/>
            <span className={'mb-3 text-[32px] font-extrabold'}>시간</span>
          </div>
          <Sub>영화 {Math.round(r.totalMinutes / 120)}편을 볼 수 있는 시간 동안{'\n'}당신은 춤을 췄어요.</Sub>
        </Bottom>
      ),
    },
    r.topGenres.length > 0 && {
      key: 'genres',
      tint: ['#7C3AED', '#0891B2'],
      duration: SLIDE_MS,
      render: () => (
        <Top>
          <Eyebrow>당신의 장르 TOP {r.topGenres.length}</Eyebrow>
          <h2 className={'mt-2 mb-6 text-[44px] font-black leading-none'}>
            <FlipWords text={r.topGenres[0].name} delay={0.3} gradient/>
          </h2>
          <RankList items={r.topGenres.slice(0, 5).map(g => ({ key: g.name, label: g.name, count: g.count }))} unit={'회'} delay={0.6}/>
        </Top>
      ),
    },
    !!favorite && {
      key: 'artist',
      tint: ['#EC4899', '#4C1D95'],
      duration: SLIDE_MS,
      render: () => (
        <>
          <Top>
            <Eyebrow>{r.studio.name}에서 가장 많이 함께한 강사</Eyebrow>
          </Top>
          {/* 화면 정중앙 프로필 — 3D 빛의 고리 안에 들어간다 */}
          <motion.div
            className={'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}
            initial={{ scale: 0, rotateY: 180 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ delay: 0.35, type: 'spring', stiffness: 110, damping: 12 }}
            style={{ perspective: 600 }}
          >
            <Avatar person={favorite!} size={132}/>
          </motion.div>
          <Bottom>
            <h2 className={'text-[40px] font-black leading-tight'}><FlipWords text={favorite!.name} delay={0.6} gradient/></h2>
            <Sub delay={1}>{favorite!.count}번의 수업을 함께했어요.{'\n'}고마운 마음, 전해보는 건 어때요?</Sub>
          </Bottom>
        </>
      ),
    },
    r.topArtists.length > 1 && {
      key: 'crew',
      tint: ['#9333EA', '#0E7490'],
      duration: SLIDE_MS,
      render: () => (
        <Top>
          <Eyebrow>올해 함께한 강사 TOP {Math.min(r.topArtists.length, 5)}</Eyebrow>
          <h2 className={'mt-2 mb-6 text-[28px] font-extrabold leading-tight'}>
            <FlipWords text={'당신의 춤을 만든 사람들'} delay={0.3} gradient/>
          </h2>
          <RankList
            items={r.topArtists.slice(0, 5).map(a => ({ key: `${a.id}`, label: a.name, count: a.count, person: a }))}
            unit={'번'}
            delay={0.6}
          />
        </Top>
      ),
    },
    r.topLessons.length > 0 && {
      key: 'tracks',
      tint: ['#C026D3', '#1D4ED8'],
      duration: SLIDE_MS,
      render: () => (
        <Top>
          <Eyebrow>가장 많이 들은 수업 TOP {Math.min(r.topLessons.length, 3)}</Eyebrow>
          <h2 className={'mt-2 mb-6 text-[28px] font-extrabold leading-tight'}>
            <FlipWords text={'올해의 플레이리스트'} delay={0.3} gradient/>
          </h2>
          <RankList
            items={r.topLessons.slice(0, 3).map(l => ({ key: l.title, label: l.title, sub: `with ${l.artistName}`, count: l.count }))}
            unit={'번'}
            delay={0.6}
          />
        </Top>
      ),
    },
    {
      key: 'month',
      tint: ['#E11D48', '#7C3AED'],
      duration: SLIDE_MS,
      render: () => (
        <Top>
          <Eyebrow>가장 불타오른 달</Eyebrow>
          <div className={'mt-2 flex items-end gap-1'}>
            <ExtrudedNumber value={peakMonth + 1} className={'text-[96px] leading-[0.95]'}/>
            <span className={'mb-3 text-[32px] font-extrabold'}>월</span>
          </div>
          <Sub delay={1}>{r.monthlyLessons[peakMonth]}번의 수업.{'\n'}그 달의 당신은 멈추지 않았어요 🔥</Sub>
          {/* 2·3위 달 */}
          <div className={'mt-4 flex gap-2'}>
            {topMonths.slice(1).map((m, i) => (
              <motion.span
                key={m}
                className={'px-3 h-8 inline-flex items-center gap-1.5 rounded-full text-[13px] font-semibold bg-white/10 border border-white/15'}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + i * 0.12, type: 'spring', stiffness: 260, damping: 14 }}
              >
                <span className={'text-white/50'}>{i + 2}위</span>{m + 1}월 · {r.monthlyLessons[m]}번
              </motion.span>
            ))}
          </div>
        </Top>
      ),
    },
    !!r.firstLesson && {
      key: 'first',
      tint: ['#6D28D9', '#0E7490'],
      duration: SLIDE_MS,
      render: () => (
        <Bottom>
          <motion.p
            className={'mb-2 font-mono text-[13px] tracking-[0.1em] text-white/80'}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.65, repeat: Infinity }}
          >
            ◀◀ REW · {r.firstLesson!.date.replace(/-/g, '.')}
          </motion.p>
          <Eyebrow>모든 건 여기서 시작됐어요</Eyebrow>
          <motion.div
            className={'mt-4 rounded-3xl p-5 bg-white/10 backdrop-blur-md border border-white/15'}
            initial={{ rotateX: -60, opacity: 0, y: 40 }}
            animate={{ rotateX: 0, opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 100, damping: 14 }}
            style={{ transformPerspective: 800 }}
          >
            <p className={'text-[14px] text-white/60'}>{formatDate(r.firstLesson!.date)}</p>
            <p className={'mt-1 text-[24px] font-extrabold'}>{r.firstLesson!.title}</p>
            <p className={'mt-1 text-[15px] text-white/70'}>with {r.firstLesson!.artistName}</p>
          </motion.div>
          <Sub delay={1.1}>그날로부터 <GradientText className={'font-extrabold'}>{daysSince(r.firstLesson!.date)}일</GradientText>이 지났어요.</Sub>
        </Bottom>
      ),
    },
    r.longestStreakWeeks > 0 && {
      key: 'streak',
      tint: ['#D97706', '#BE185D'],
      duration: SLIDE_MS,
      render: () => (
        <Top>
          <Eyebrow>최장 연속 출석</Eyebrow>
          <div className={'mt-2 flex items-end gap-2'}>
            <ExtrudedNumber value={r.longestStreakWeeks} className={'text-[96px] leading-[0.95]'}/>
            <span className={'mb-3 text-[32px] font-extrabold'}>주 연속</span>
          </div>
          <Sub delay={1}>한 주도 빠짐없이 춤췄어요.{'\n'}이건 진짜 꾸준함이에요.</Sub>
        </Top>
      ),
    },
    {
      key: 'rank',
      tint: ['#B45309', '#6D28D9'],
      duration: SLIDE_MS,
      render: () => (
        <Bottom>
          <Eyebrow>{r.studio.name} 수강생 중</Eyebrow>
          <h2 className={'mt-2 flex items-end gap-2'}>
            <span className={'mb-3 text-[32px] font-extrabold'}>상위</span>
            <ExtrudedNumber value={r.topPercent} suffix={'%'} className={'text-[96px] leading-[0.95]'}/>
          </h2>
          <Sub delay={1}>올해 우리 스튜디오에서 가장 열심히{'\n'}춤춘 사람 중 한 명이에요 🏆</Sub>
        </Bottom>
      ),
    },
    {
      key: 'type',
      tint: r.dancerType.colors,
      duration: SLIDE_MS,
      render: () => (
        <Bottom>
          <Eyebrow>당신의 댄서 유형은</Eyebrow>
          <motion.h2
            className={'mt-2 text-[44px] font-black leading-tight'}
            initial={{ scale: 2.2, opacity: 0, filter: 'blur(12px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <GradientText>{r.dancerType.title}</GradientText>
          </motion.h2>
          <Sub delay={1.1}>{r.dancerType.description}</Sub>
          <div className={'mt-5 flex flex-wrap gap-2'}>
            {r.dancerType.keywords.map((k, i) => (
              <motion.span
                key={k}
                className={'px-3 h-8 inline-flex items-center rounded-full text-[14px] font-semibold bg-white/10 border border-white/20'}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 + i * 0.12, type: 'spring', stiffness: 260, damping: 14 }}
              >
                {k}
              </motion.span>
            ))}
          </div>
        </Bottom>
      ),
    },
  ];
  return slides.filter((s): s is RecapSlide => !!s);
};
