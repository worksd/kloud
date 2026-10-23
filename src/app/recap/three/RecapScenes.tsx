'use client'

import React, { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshDistortMaterial } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, Color, Group, MathUtils, Mesh, PerspectiveCamera, ShaderMaterial, Vector2,
} from "three";
import { beat, hitEnv, KICK_STEPS } from "@/app/recap/recap.beat";

/**
 * 리캡 3D — 인트로 다이얼로그와 스토리 화면이 같이 쓴다.
 * next/dynamic(ssr:false)로만 불러온다 (three 번들이 홈 첫 로딩에 끼지 않게, WebGL 은 SSR 불가).
 *
 * 연출 구조
 * - 파티클 모프: 빛 입자 5천여 개가 하나의 계(系)로 계속 살아 있고, 슬라이드가 바뀌면 터지듯 흩어졌다가 다음 형태(은하·나선·기둥·후광…)로 재조립된다.
 * - 히어로 오브젝트: 핵심 슬라이드에만 유리(투과+무지갯빛 박막)·금속·리퀴드 같은 실제 재질의 오브젝트 하나.
 * - 카메라: 전환 순간 앞으로 훅 다가갔다 물러나는 킥 + 손가락 패럴랙스 + 느린 자동 궤도.
 * - 후처리: 블룸 + 렌즈 색수차 + 필름 그레인 + 비네트로 영상 같은 질감.
 * 반사는 원격 HDR 대신 Lightformer 로 스튜디오 조명을 한 번 구워 쓴다 (CDN 요청 없음).
 */
export const NEON = {
  pink: '#FF3EA5',
  purple: '#8B5CF6',
  cyan: '#22D3EE',
  gold: '#FFC94A',
};

export type RecapSceneKey =
  | 'intro' | 'opening' | 'lessons' | 'hours' | 'genres' | 'artist' | 'crew' | 'tracks'
  | 'month' | 'first' | 'streak' | 'rank' | 'type' | 'summary';

export type RecapSceneProps = {
  scene: RecapSceneKey;
  lessons?: number;
  genres?: number[];
  monthly?: number[];
  streakWeeks?: number;
  typeColors?: [string, string];
  // 아래는 화면 쪽에서 넘기지만 이 씬에선 쓰지 않는다
  year?: number;
  hours?: number;
  topPercent?: number;
  genreNames?: string[];
  artistImage?: string;
  studioName?: string;
};

/* ───────────────────────── 파티클 형태 ───────────────────────── */

const N = 5200;

/** 형태가 시간에 따라 흐르는 방식 — 표시 위치에만 더해진다 (목표 형태는 그대로) */
type Flow = 'none' | 'tunnel' | 'wave' | 'ribbon';

type Shape = { pos: Float32Array; col: Float32Array; flow: Flow; spin: number };

const tmpColor = new Color();
const palette = (hexes: string[]) => hexes.map(h => new Color(h));

/** 여러 색 정지점 사이 보간 → out[i] 에 RGB(밝기 gain 배) */
const paint = (stops: Color[], t: number, out: Float32Array, i: number, gain: number) => {
  const x = MathUtils.clamp(t, 0, 1) * (stops.length - 1);
  const k = Math.min(Math.floor(x), stops.length - 2);
  tmpColor.copy(stops[k]).lerp(stops[k + 1], x - k);
  out[i * 3] = tmpColor.r * gain;
  out[i * 3 + 1] = tmpColor.g * gain;
  out[i * 3 + 2] = tmpColor.b * gain;
};

const put = (out: Float32Array, i: number, x: number, y: number, z: number) => {
  out[i * 3] = x;
  out[i * 3 + 1] = y;
  out[i * 3 + 2] = z;
};

/** x축 회전을 형태에 구워 넣는다 (기울어진 원반·은하용) */
const tiltX = (out: Float32Array, i: number, a: number) => {
  const y = out[i * 3 + 1], z = out[i * 3 + 2];
  out[i * 3 + 1] = y * Math.cos(a) - z * Math.sin(a);
  out[i * 3 + 2] = y * Math.sin(a) + z * Math.cos(a);
};

const buildShape = (p: RecapSceneProps, seed: Float32Array): Shape => {
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const s = (i: number, k: number) => seed[i * 4 + k];
  const hot = palette(['#ffffff', NEON.pink, NEON.purple, NEON.cyan]);
  let flow: Flow = 'none';
  let spin = 0.1;

  // 은하 — 세 갈래 나선 팔 + 바깥 먼지. 인트로·오프닝·요약
  const galaxy = (scale: number) => {
    for (let i = 0; i < N; i++) {
      if (s(i, 3) > 0.94) {
        const th = s(i, 0) * Math.PI * 2, ph = Math.acos(2 * s(i, 1) - 1), r = (3 + s(i, 2) * 2) * scale;
        put(pos, i, Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r * 0.6, Math.sin(ph) * Math.sin(th) * r);
        paint(hot, 0.6 + s(i, 2) * 0.4, col, i, 0.5);
        continue;
      }
      const arm = i % 3;
      const r = (0.12 + Math.pow(s(i, 0), 0.65) * 2.6);
      const a = r * 1.85 + arm * (Math.PI * 2 / 3) + (s(i, 1) - 0.5) * 0.8 * (1.25 - r / 2.7);
      const thick = (s(i, 2) - 0.5) * 0.22 * (2.9 - r);
      put(pos, i, Math.cos(a) * r * scale, thick * scale, Math.sin(a) * r * scale);
      tiltX(pos, i, 0.95);
      paint(hot, r / 2.7, col, i, 2.1 - r * 0.45);
    }
    spin = 0.12;
  };

  switch (p.scene) {
    case 'intro':
    case 'opening':
      galaxy(1);
      break;
    case 'summary':
      galaxy(0.75);
      break;

    // 수업 수 — 이중 나선 탑, 가로대(사다리)가 군데군데
    case 'lessons': {
      const stops = palette([NEON.pink, NEON.purple, NEON.cyan]);
      for (let i = 0; i < N; i++) {
        const t = s(i, 0);
        const a = t * Math.PI * 9 + (i % 2) * Math.PI;
        const r = 1.05 + (s(i, 1) - 0.5) * 0.16;
        const rung = s(i, 3) > 0.86 ? (2 * s(i, 2) - 1) : 1;
        put(pos, i, Math.cos(a) * r * rung, -2.7 + t * 4.4, Math.sin(a) * r * rung);
        paint(stops, t, col, i, rung === 1 ? 1.6 : 0.8);
      }
      spin = 0.35;
      break;
    }

    // 총 시간 — 서로 다른 축으로 기운 다섯 겹 궤도 (가운데 유리 렌즈)
    case 'hours': {
      const stops = palette([NEON.cyan, NEON.purple, NEON.pink]);
      for (let i = 0; i < N; i++) {
        const k = i % 5;
        const r = 1.0 + k * 0.38 + (s(i, 1) - 0.5) * 0.05;
        const a = s(i, 0) * Math.PI * 2;
        let x = Math.cos(a) * r, y = Math.sin(a) * r, z = (s(i, 2) - 0.5) * 0.05;
        const rx = k * 0.62, ry = k * 0.95;
        [y, z] = [y * Math.cos(rx) - z * Math.sin(rx), y * Math.sin(rx) + z * Math.cos(rx)];
        [x, z] = [x * Math.cos(ry) + z * Math.sin(ry), -x * Math.sin(ry) + z * Math.cos(ry)];
        put(pos, i, x, y, z);
        paint(stops, k / 4, col, i, 1.5);
      }
      spin = 0.25;
      break;
    }

    // 장르 — 순위 기둥 (목록이 위를 차지하므로 아래쪽에 낮게)
    case 'genres': {
      const values = (p.genres?.length ? p.genres : [1]).slice(0, 5);
      const max = Math.max(...values, 1);
      const n = values.length;
      const gap = Math.min(1.05, 4.4 / n);
      const stops = palette([NEON.pink, NEON.purple, NEON.cyan]);
      for (let i = 0; i < N; i++) {
        const c = i % n;
        const h = 0.35 + (values[c] / max) * 1.9;
        const t = Math.pow(s(i, 0), 0.8);
        const a = s(i, 1) * Math.PI * 2, rad = Math.sqrt(s(i, 2)) * 0.26;
        put(pos, i, (c - (n - 1) / 2) * gap + Math.cos(a) * rad, -2.75 + t * h, Math.sin(a) * rad);
        paint(stops, c / Math.max(1, n - 1), col, i, (c === 0 ? 1.4 : 0.85) + t * 1.1);
      }
      spin = 0.08;
      break;
    }

    // 최애 강사 — 프로필(HTML)을 감싸는 빛의 고리 + 흩날리는 먼지
    case 'artist': {
      const stops = palette(['#ffffff', NEON.pink, NEON.purple]);
      for (let i = 0; i < N; i++) {
        const a = s(i, 0) * Math.PI * 2;
        if (s(i, 3) < 0.8) {
          const r = 1.62 + (s(i, 1) - 0.5) * (s(i, 2) * 0.3);
          put(pos, i, Math.cos(a) * r, Math.sin(a) * r, (s(i, 2) - 0.5) * 0.12);
          paint(stops, 0.2 + 0.6 * Math.abs(Math.sin(a)), col, i, 1.9);
        } else {
          const r = 2.1 + s(i, 1) * 1.6;
          put(pos, i, Math.cos(a) * r, Math.sin(a) * r, (s(i, 2) - 0.5) * 2);
          paint(stops, 0.8, col, i, 0.6);
        }
      }
      spin = 0;
      break;
    }

    // 함께한 강사 TOP5 — 바닥에 깔린 빛의 물결
    case 'crew': {
      const stops = palette([NEON.purple, NEON.pink, NEON.cyan]);
      for (let i = 0; i < N; i++) {
        const x = (s(i, 0) - 0.5) * 6.4, z = (s(i, 1) - 0.5) * 3.6 - 0.4;
        put(pos, i, x, -2.35 + Math.sin(x * 1.3 + z) * 0.22 + Math.cos(z * 2.1) * 0.12, z);
        paint(stops, s(i, 0), col, i, 0.9 + s(i, 2) * 0.6);
      }
      flow = 'wave';
      spin = 0;
      break;
    }

    // 많이 들은 수업 — 바닥에서 도는 LP 판, 홈마다 빛이 맺히고 스펙큘러가 훑고 지나간다
    case 'tracks': {
      const label = new Color(NEON.pink), groove = new Color('#3b2a6b'), shine = new Color('#ffffff');
      for (let i = 0; i < N; i++) {
        const r = Math.round(Math.sqrt(s(i, 0)) * 1.95 * 16) / 16 + (s(i, 1) - 0.5) * 0.012;
        const a = s(i, 2) * Math.PI * 2;
        put(pos, i, Math.cos(a) * r, 0, Math.sin(a) * r);
        tiltX(pos, i, 0.55);
        pos[i * 3 + 1] -= 2.25;
        const spec = Math.pow(Math.max(0, Math.cos(a - 0.9)), 10);
        tmpColor.copy(r < 0.5 ? label : groove).lerp(shine, spec * 0.8);
        const g = r < 0.5 ? 1.6 : 0.7 + spec * 1.6;
        col[i * 3] = tmpColor.r * g;
        col[i * 3 + 1] = tmpColor.g * g;
        col[i * 3 + 2] = tmpColor.b * g;
      }
      spin = 0.5;
      break;
    }

    // 불타오른 달 — 12개 빛기둥이 원을 이루고 최고의 달만 금빛으로 타오른다
    case 'month': {
      const values = p.monthly?.length === 12 ? p.monthly : Array(12).fill(1);
      const max = Math.max(...values, 1);
      const peak = values.indexOf(max);
      const cold = new Color(NEON.purple), fire = palette([NEON.pink, NEON.gold, '#ffffff']);
      for (let i = 0; i < N; i++) {
        const m = i % 12;
        const h = 0.25 + (values[m] / max) * 2.1;
        const t = Math.pow(s(i, 0), 0.75);
        const ang = (m / 12) * Math.PI * 2;
        const a = s(i, 1) * Math.PI * 2, rad = Math.sqrt(s(i, 2)) * 0.17;
        put(pos, i, Math.cos(ang) * 2.05 + Math.cos(a) * rad, -1.6 + t * h, Math.sin(ang) * 2.05 + Math.sin(a) * rad);
        tiltX(pos, i, 0.42);
        if (m === peak) paint(fire, t, col, i, 1.6 + t);
        else {
          col[i * 3] = cold.r * (0.5 + t * 0.6);
          col[i * 3 + 1] = cold.g * (0.5 + t * 0.6);
          col[i * 3 + 2] = cold.b * (0.5 + t * 0.6);
        }
      }
      spin = 0.18;
      break;
    }

    // 첫 수업 회상 — 시간의 터널을 거슬러 앞으로 흘러온다
    case 'first': {
      const stops = palette([NEON.cyan, NEON.purple, '#ffffff']);
      for (let i = 0; i < N; i++) {
        const a = s(i, 1) * Math.PI * 2, r = 1.9 + s(i, 2) * 1.6;
        put(pos, i, Math.cos(a) * r, Math.sin(a) * r, -12 + s(i, 0) * 14);
        paint(stops, s(i, 3), col, i, 0.9 + s(i, 3) * 0.8);
      }
      flow = 'tunnel';
      spin = 0;
      break;
    }

    // 연속 출석 — 끊기지 않고 이어지는 금빛 리본
    case 'streak': {
      const stops = palette([NEON.gold, '#ffffff', NEON.pink]);
      for (let i = 0; i < N; i++) {
        const x = -2.7 + s(i, 0) * 5.4, ph = x * 2.2;
        put(pos, i, x, Math.sin(ph) * 0.55 + (s(i, 1) - 0.5) * 0.14, Math.cos(ph) * 0.45 + (s(i, 2) - 0.5) * 0.14);
        paint(stops, s(i, 0), col, i, 1.5);
      }
      flow = 'ribbon';
      spin = 0;
      break;
    }

    // 상위 N% — 메달을 감싸는 금빛 성운
    case 'rank': {
      const stops = palette([NEON.gold, '#ffffff', NEON.pink]);
      for (let i = 0; i < N; i++) {
        const th = s(i, 0) * Math.PI * 2;
        if (s(i, 3) < 0.55) {
          const r = 1.75 + (s(i, 1) - 0.5) * 0.35;
          put(pos, i, Math.cos(th) * r, Math.sin(th) * r * 0.32, Math.sin(th) * r);
          tiltX(pos, i, 0.3);
          paint(stops, s(i, 2) * 0.5, col, i, 1.5);
        } else {
          const ph = Math.acos(2 * s(i, 1) - 1), r = 2.2 + s(i, 2) * 1.6;
          put(pos, i, Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r, Math.sin(ph) * Math.sin(th) * r);
          paint(stops, 0.3 + s(i, 2) * 0.7, col, i, 0.55);
        }
      }
      spin = 0.15;
      break;
    }

    // 댄서 유형 — 블롭을 감싸는 유형 색의 오라
    case 'type': {
      const [c0, c1] = p.typeColors ?? [NEON.purple, NEON.pink];
      const stops = palette([c0, c1, '#ffffff']);
      for (let i = 0; i < N; i++) {
        const th = s(i, 0) * Math.PI * 2, ph = Math.acos(2 * s(i, 1) - 1);
        const r = 1.75 + Math.pow(s(i, 2), 2) * 1.4;
        put(pos, i, Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r, Math.sin(ph) * Math.sin(th) * r);
        paint(stops, (Math.cos(ph) + 1) / 2, col, i, 1.3 - (r - 1.75) * 0.5);
      }
      spin = 0.2;
      break;
    }
  }
  return { pos, col, flow, spin };
};

/* ───────────────────────── 파티클 계 ───────────────────────── */

const particleVertex = /* glsl */`
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPulse;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.75 + 0.25 * sin(uTime * 2.3 + aSize * 37.0);
    // 비트 킥에 입자가 살짝 부풀었다 돌아온다
    gl_PointSize = aSize * twinkle * (1.0 + 0.22 * uPulse) * uPixelRatio * (9.0 / -mv.z);
    vColor = aColor;
    // 큰 입자는 초점 밖 보케 — 흐리고 옅게
    vAlpha = aSize > 15.0 ? 0.16 : 1.0;
  }
`;

const particleFragment = /* glsl */`
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = pow(1.0 - d * 2.0, 2.4);
    gl_FragColor = vec4(vColor * core * vAlpha, core * vAlpha);
  }
`;

/**
 * 하나의 파티클 계 — 목표 형태가 바뀌면
 * 1) 0.5초간 바깥으로 터져 나갔다가 2) 입자마다 조금씩 다른 속도로 새 형태에 빨려 들어간다.
 */
const ParticleMorph = (props: RecapSceneProps) => {
  const dpr = useThree(s => s.viewport.dpr);
  const group = useRef<Group>(null);

  const seed = useMemo(() => {
    const a = new Float32Array(N * 4);
    for (let i = 0; i < a.length; i++) a[i] = Math.random();
    return a;
  }, []);

  const { geometry, cur, curCol } = useMemo(() => {
    const g = new BufferGeometry();
    const position = new Float32Array(N * 3);
    const color = new Float32Array(N * 3);
    const size = new Float32Array(N);
    const c = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // 처음엔 먼 구 껍질에서 날아들어온다
      const th = seed[i * 4] * Math.PI * 2, ph = Math.acos(2 * seed[i * 4 + 1] - 1), r = 9 + seed[i * 4 + 2] * 6;
      c[i * 3] = Math.sin(ph) * Math.cos(th) * r;
      c[i * 3 + 1] = Math.cos(ph) * r;
      c[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r;
      size[i] = seed[i * 4 + 3] > 0.975 ? 18 + seed[i * 4] * 16 : 2.4 + seed[i * 4 + 3] * 5.5;
    }
    g.setAttribute('position', new BufferAttribute(position, 3));
    g.setAttribute('aColor', new BufferAttribute(color, 3));
    g.setAttribute('aSize', new BufferAttribute(size, 1));
    return { geometry: g, cur: c, curCol: new Float32Array(N * 3) };
  }, [seed]);

  const material = useMemo(() => new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 }, uPulse: { value: 0 } },
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  }), []);

  const { scene, genres, monthly, typeColors } = props;
  const target = useMemo(
    () => buildShape({ scene, genres, monthly, typeColors }, seed),
    // 배열 props 는 내용 기준으로만 다시 만든다
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scene, seed, JSON.stringify(genres), JSON.stringify(monthly), JSON.stringify(typeColors)],
  );

  const burst = useRef(0);
  useEffect(() => {
    burst.current = 0;
  }, [target]);

  useEffect(() => () => {
    geometry.dispose();
    material.dispose();
  }, [geometry, material]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;
    material.uniforms.uTime.value = t;
    material.uniforms.uPixelRatio.value = dpr;
    material.uniforms.uPulse.value = hitEnv(KICK_STEPS, beat.now(), 8);
    burst.current += dt;
    const push = burst.current < 0.5 ? Math.pow(1 - burst.current / 0.5, 2) * 9 * dt : 0;

    const out = geometry.attributes.position.array as Float32Array;
    const outCol = geometry.attributes.aColor.array as Float32Array;
    const { pos, col, flow } = target;
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      const s0 = seed[i * 4], s1 = seed[i * 4 + 1], s2 = seed[i * 4 + 2], s3 = seed[i * 4 + 3];
      // 입자마다 다른 속도로 수렴 — 한 덩어리로 움직이지 않고 흐르듯 모인다
      const k = Math.min(1, dt * (1.6 + s3 * 2.8) * (burst.current < 0.5 ? 0.35 : 1));
      let x = cur[i3], y = cur[i3 + 1], z = cur[i3 + 2];
      if (push > 0) {
        const len = Math.hypot(x, y, z) + 0.001;
        x += (x / len) * push * (0.6 + s0);
        y += (y / len) * push * (0.6 + s1);
        z += (z / len) * push * (0.6 + s2);
      }
      x += (pos[i3] - x) * k;
      y += (pos[i3 + 1] - y) * k;
      z += (pos[i3 + 2] - z) * k;
      cur[i3] = x;
      cur[i3 + 1] = y;
      cur[i3 + 2] = z;

      // 살아 있는 듯한 미세 흔들림 + 형태별 흐름
      let dx = Math.sin(t * 1.3 + s0 * 20) * 0.022;
      let dy = Math.cos(t * 1.1 + s1 * 20) * 0.022;
      let dz = Math.sin(t * 0.9 + s2 * 20) * 0.022;
      if (flow === 'tunnel') dz += ((z + 12 + t * 2.4) % 14) - 12 - z;
      else if (flow === 'wave') dy += Math.sin(t * 1.4 + x * 1.2 + z * 0.8) * 0.18;
      else if (flow === 'ribbon') dy += Math.sin(t * 2 + x * 2.2) * 0.2;
      out[i3] = x + dx;
      out[i3 + 1] = y + dy;
      out[i3 + 2] = z + dz;

      for (let c = 0; c < 3; c++) {
        curCol[i3 + c] += (col[i3 + c] - curCol[i3 + c]) * Math.min(1, dt * 2.5);
        // 터지는 순간엔 하얗게 달아오른다
        outCol[i3 + c] = curCol[i3 + c] + push * 0.35;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.aColor.needsUpdate = true;
    if (group.current) group.current.rotation.y += dt * target.spin;
  });

  return (
    <group ref={group}>
      <points geometry={geometry} material={material} frustumCulled={false}/>
    </group>
  );
};

/* ───────────────────────── 히어로 오브젝트 ───────────────────────── */

const easeOutBack = (t: number) => {
  const c1 = 2.2, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** 히어로 등장 — 0 에서 탄성 있게 튀어나오며 한 바퀴 비튼다. key 를 바꾸면 다시 재생 */
const HeroEntrance = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<Group>(null);
  const t = useRef(0);
  useFrame((_, d) => {
    if (!ref.current) return;
    t.current = Math.min(1, t.current + d * 1.1);
    ref.current.scale.setScalar(Math.max(0.0001, easeOutBack(t.current)));
    ref.current.rotation.z = (1 - t.current) * (1 - t.current) * Math.PI * 0.6;
  });
  return <group ref={ref}>{children}</group>;
};

/** 프리즘 유리 — 투과 + 박막 무지갯빛 + 클리어코트. 뒤의 파티클이 굴절돼 비친다 */
const GlassMaterial = ({ tint = '#ff9ad5' }: { tint?: string }) => (
  <meshPhysicalMaterial
    color={'#ffffff'}
    transmission={1}
    thickness={1.4}
    roughness={0.05}
    ior={1.5}
    iridescence={1}
    iridescenceIOR={1.35}
    iridescenceThicknessRange={[120, 900]}
    clearcoat={1}
    clearcoatRoughness={0.04}
    attenuationColor={tint}
    attenuationDistance={2.4}
    envMapIntensity={1.7}
  />
);

const GlassKnot = ({ scale = 1 }: { scale?: number }) => {
  const ref = useRef<Mesh>(null);
  useFrame((_, d) => {
    if (!ref.current) return;
    ref.current.rotation.x += d * 0.18;
    ref.current.rotation.y += d * 0.27;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.35} floatIntensity={0.6}>
      <mesh ref={ref} scale={scale}>
        <torusKnotGeometry args={[0.85, 0.3, 320, 56]}/>
        <GlassMaterial/>
      </mesh>
    </Float>
  );
};

/** 총 시간 — 궤도 한가운데의 유리 렌즈 */
const GlassLens = () => (
  <Float speed={2} floatIntensity={0.4}>
    <mesh>
      <sphereGeometry args={[0.72, 96, 96]}/>
      <GlassMaterial tint={'#8fe9ff'}/>
    </mesh>
  </Float>
);

/** 상위 N% — 두께 있는 금 메달. 테두리는 광택, 안쪽 면은 결이 살짝 무딘 브러시드 골드 */
const Medal = () => {
  const ref = useRef<Group>(null);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 1.1;
  });
  return (
    <Float speed={1.8} floatIntensity={0.5} rotationIntensity={0.2}>
      <group ref={ref}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.15, 1.15, 0.2, 128]}/>
          <meshPhysicalMaterial color={'#E9B949'} metalness={1} roughness={0.32} clearcoat={0.6} clearcoatRoughness={0.2} envMapIntensity={1.6}/>
        </mesh>
        <mesh>
          <torusGeometry args={[1.15, 0.09, 48, 192]}/>
          <meshPhysicalMaterial color={'#FFD978'} metalness={1} roughness={0.12} clearcoat={1} envMapIntensity={2}/>
        </mesh>
        <mesh position={[0, 0, 0.11]}>
          <torusGeometry args={[0.78, 0.035, 32, 160]}/>
          <meshPhysicalMaterial color={'#FFF1C2'} metalness={1} roughness={0.1} envMapIntensity={2}/>
        </mesh>
        <mesh position={[0, 0, -0.11]}>
          <torusGeometry args={[0.78, 0.035, 32, 160]}/>
          <meshPhysicalMaterial color={'#FFF1C2'} metalness={1} roughness={0.1} envMapIntensity={2}/>
        </mesh>
      </group>
    </Float>
  );
};

/** 댄서 유형 — 무지갯빛 막이 도는 리퀴드 블롭 */
const LiquidBlob = ({ colors }: { colors: [string, string] }) => (
  <Float speed={2.2} rotationIntensity={0.8} floatIntensity={0.8}>
    <mesh scale={1.15}>
      <sphereGeometry args={[1, 160, 160]}/>
      <MeshDistortMaterial
        color={colors[0]}
        roughness={0.06}
        metalness={0.15}
        clearcoat={1}
        clearcoatRoughness={0.05}
        iridescence={1}
        iridescenceIOR={1.4}
        transmission={0.35}
        thickness={1.2}
        envMapIntensity={1.5}
        distort={0.42}
        speed={2.2}
      />
    </mesh>
  </Float>
);

const Hero = ({ scene, typeColors }: RecapSceneProps) => {
  switch (scene) {
    case 'intro':
    case 'opening': return <GlassKnot/>;
    case 'summary': return <GlassKnot scale={0.55}/>;
    case 'hours': return <GlassLens/>;
    case 'rank': return <Medal/>;
    case 'type': return <LiquidBlob colors={typeColors ?? [NEON.purple, NEON.pink]}/>;
    default: return null;
  }
};

/* ───────────────────────── 카메라 · 캔버스 ───────────────────────── */

/**
 * 전환 킥(앞으로 훅 다가갔다 물러남 + 살짝 기울기) + 손가락 패럴랙스 + 느린 자동 궤도
 */
const CameraRig = ({ scene }: { scene: RecapSceneKey }) => {
  const kick = useRef(1);
  useEffect(() => {
    kick.current = 1;
  }, [scene]);
  useFrame((state, delta) => {
    const cam = state.camera as PerspectiveCamera;
    const t = state.clock.elapsedTime;
    kick.current *= Math.exp(-Math.min(delta, 1 / 30) * 2.6);
    cam.position.x = MathUtils.lerp(cam.position.x, state.pointer.x * 0.6 + Math.sin(t * 0.15) * 0.35, 0.05);
    cam.position.y = MathUtils.lerp(cam.position.y, state.pointer.y * 0.35 + Math.cos(t * 0.12) * 0.2, 0.05);
    // 전환 킥 + 비트 킥마다 아주 살짝 앞으로
    cam.position.z = 6.5 - kick.current * 1.5 - hitEnv(KICK_STEPS, beat.now(), 10) * 0.12;
    cam.lookAt(0, 0, 0);
    cam.rotateZ(kick.current * 0.07);
  });
  return null;
};

/** 세로로 긴 폰 화면에서도 씬(가로 약 5 유닛 기준)이 잘리지 않게 줄인다 */
const Fit = ({ children }: { children: React.ReactNode }) => {
  const width = useThree(s => s.viewport.width);
  return <group scale={Math.min(1, width / 5.2)}>{children}</group>;
};

const CA_OFFSET = new Vector2(0.0009, 0.0012);

/**
 * 리캡 3D 캔버스 — 배경은 투명이라 뒤의 CSS 그라데이션이 비친다.
 * 터치 이벤트는 위 HTML 레이어가 받으므로, 패럴랙스 포인터는 document.body 기준으로 읽는다.
 */
export default function RecapCanvas(props: RecapSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix={'client'}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* 스튜디오 조명을 한 번만 구워 유리·금속 반사에 쓴다 */}
      <Environment resolution={512} frames={1}>
        <Lightformer form={'rect'} intensity={3} color={'#ffffff'} position={[0, 5, -2]} scale={[10, 3, 1]}/>
        <Lightformer form={'rect'} intensity={5} color={NEON.pink} position={[5, 1, 2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]}/>
        <Lightformer form={'rect'} intensity={5} color={NEON.cyan} position={[-5, -1, 2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]}/>
        <Lightformer form={'ring'} intensity={2.5} color={NEON.purple} position={[0, 0, -6]} scale={6}/>
      </Environment>
      <Fit>
        <ParticleMorph {...props}/>
        <HeroEntrance key={props.scene}>
          <Hero {...props}/>
        </HeroEntrance>
      </Fit>
      <CameraRig scene={props.scene}/>
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.35} luminanceSmoothing={0.25} intensity={1.15} radius={0.82}/>
        <ChromaticAberration offset={CA_OFFSET} radialModulation modulationOffset={0.35}/>
        <Noise opacity={0.05} premultiply/>
        <Vignette eskil={false} offset={0.25} darkness={0.7}/>
      </EffectComposer>
    </Canvas>
  );
}
