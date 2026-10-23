'use client';

/**
 * 리캡 붐뱁 비트 — 음원 파일 없이 WebAudio 로 즉석 합성한다 (저작권 걱정 없음).
 * 화면(3D·슬라이드 전환)은 전부 이 엔진의 박자 시계(beat.now())를 기준으로 움직인다.
 *
 * - 92 BPM, 2마디(32 스텝) 루프: 킥·스네어·하이햇(스윙) + 서브 베이스 + 로파이 코드 + 바이닐 크랙클
 * - 슬라이드 하나 = 8카운트(8비트)
 * - 모바일 자동재생 정책 때문에 start() 는 반드시 사용자 탭 핸들러 안에서 불러야 한다.
 *   소리가 안 나는 환경에서도 시계는 performance.now() 로 계속 흐른다.
 */
export const BPM = 92;
export const BEAT_SEC = 60 / BPM;
export const SLIDE_BEATS = 8;
export const SLIDE_MS = SLIDE_BEATS * BEAT_SEC * 1000;

const STEPS = 32; // 16분음표 × 2마디
const STEP_SEC = BEAT_SEC / 4;
const SWING = 0.16; // 홀수 16분음표를 이만큼(스텝 비율) 늦춘다 — 붐뱁 특유의 끈적함

export const KICK_STEPS = [0, 10, 16, 23, 26];
export const SNARE_STEPS = [4, 12, 20, 28];
const GHOST_STEPS = [15, 31];
const OPEN_HAT_STEPS = [14, 30];
// 킥마다 베이스 음 (A1, A1, F1, F1, G1)
const BASS_HZ: Record<number, number> = { 0: 55, 10: 55, 16: 43.65, 23: 43.65, 26: 49 };
// 마디별 코드 — Am7 / Fmaj7
const CHORDS: Record<number, number[]> = {
  0: [220, 261.63, 329.63, 392],
  16: [174.61, 220, 261.63, 329.63],
};

class BeatEngine {
  private ctx: AudioContext | null = null;
  private bus: GainNode | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private crackle: AudioBufferSourceNode | null = null;
  private timer: ReturnType<typeof setInterval> | undefined;
  private startAt = 0;
  private nextStep = 0;
  private nextTime = 0;
  private fallbackStart = typeof performance !== 'undefined' ? performance.now() : 0;
  private fallbackPausedAt: number | null = null;
  private muted = false;

  /** 박자 시계 — 시작 이후 흐른 비트 수(소수). 소리 없이도 흐른다 */
  now(): number {
    if (this.ctx && this.ctx.state !== 'closed') return Math.max(0, (this.ctx.currentTime - this.startAt) / BEAT_SEC);
    const t = this.fallbackPausedAt ?? performance.now();
    return Math.max(0, (t - this.fallbackStart) / 1000 / BEAT_SEC);
  }

  isMuted() {
    return this.muted;
  }

  /** 사용자 탭 안에서 호출 — 시계를 0 으로 맞추고 비트를 튼다 */
  start() {
    this.stop();
    this.fallbackStart = performance.now();
    this.fallbackPausedAt = null;
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      this.ctx = ctx;
      this.noise = this.makeNoise(ctx);

      // bus → 로파이 필터 → 컴프레서 → 마스터
      const lofi = ctx.createBiquadFilter();
      lofi.type = 'lowpass';
      lofi.frequency.value = 9000;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14;
      comp.ratio.value = 4;
      this.master = ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.75;
      this.bus = ctx.createGain();
      this.bus.connect(lofi).connect(comp).connect(this.master).connect(ctx.destination);

      this.startCrackle(ctx);
      this.startAt = ctx.currentTime + 0.05;
      this.nextTime = this.startAt;
      this.nextStep = 0;
      this.timer = setInterval(() => this.schedule(), 25);
      void ctx.resume();
    } catch {
      this.ctx = null;
    }
  }

  stop() {
    clearInterval(this.timer);
    this.timer = undefined;
    try {
      this.crackle?.stop();
    } catch {
    }
    this.crackle = null;
    if (this.ctx && this.ctx.state !== 'closed') void this.ctx.close();
    this.ctx = null;
  }

  pause() {
    if (this.ctx) void this.ctx.suspend();
    else if (this.fallbackPausedAt == null) this.fallbackPausedAt = performance.now();
  }

  resume() {
    if (this.ctx) void this.ctx.resume();
    else if (this.fallbackPausedAt != null) {
      this.fallbackStart += performance.now() - this.fallbackPausedAt;
      this.fallbackPausedAt = null;
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx && this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.75, this.ctx.currentTime, 0.05);
  }

  private schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    while (this.nextTime < ctx.currentTime + 0.12) {
      const step = this.nextStep % STEPS;
      const t = this.nextTime + (step % 2 === 1 ? SWING * STEP_SEC : 0);
      this.playStep(step, t);
      this.nextStep++;
      this.nextTime = this.startAt + this.nextStep * STEP_SEC;
    }
  }

  private playStep(step: number, t: number) {
    if (KICK_STEPS.includes(step)) {
      this.kick(t);
      this.bass(t, BASS_HZ[step]);
    }
    if (SNARE_STEPS.includes(step)) this.snare(t, 1);
    if (GHOST_STEPS.includes(step)) this.snare(t, 0.25);
    if (OPEN_HAT_STEPS.includes(step)) this.hat(t, true);
    else if (step % 2 === 0 || step % 4 === 3) this.hat(t, false, step % 4 === 0 ? 0.32 : 0.18);
    if (CHORDS[step]) this.chord(t, CHORDS[step], BEAT_SEC * 4);
  }

  private env(t: number, peak: number, attack: number, decay: number) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    return g;
  }

  private kick(t: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    const g = this.env(t, 1.1, 0.004, 0.42);
    o.connect(g).connect(this.bus!);
    o.start(t);
    o.stop(t + 0.5);
  }

  private snare(t: number, vel: number) {
    const ctx = this.ctx!;
    const n = ctx.createBufferSource();
    n.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1400;
    const g = this.env(t, 0.55 * vel, 0.002, 0.2);
    n.connect(hp).connect(g).connect(this.bus!);
    n.start(t);
    n.stop(t + 0.25);
    // 몸통 — 짧은 톤
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(190, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.08);
    const og = this.env(t, 0.35 * vel, 0.002, 0.1);
    o.connect(og).connect(this.bus!);
    o.start(t);
    o.stop(t + 0.15);
  }

  private hat(t: number, open: boolean, vel = 0.3) {
    const ctx = this.ctx!;
    const n = ctx.createBufferSource();
    n.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 7500;
    const g = this.env(t, open ? 0.22 : vel * 0.5, 0.001, open ? 0.28 : 0.045);
    n.connect(hp).connect(g).connect(this.bus!);
    n.start(t);
    n.stop(t + (open ? 0.32 : 0.06));
  }

  private bass(t: number, hz: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.value = hz;
    const g = this.env(t, 0.45, 0.01, BEAT_SEC * 0.9);
    o.connect(g).connect(this.bus!);
    o.start(t);
    o.stop(t + BEAT_SEC);
  }

  /** 로파이 건반 — 살짝 디튠된 사인+삼각파를 저역통과 */
  private chord(t: number, notes: number[], dur: number) {
    const ctx = this.ctx!;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1600;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.03, t + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    lp.connect(g).connect(this.bus!);
    notes.forEach((hz, i) => {
      (['sine', 'triangle'] as OscillatorType[]).forEach((type, k) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = hz;
        o.detune.value = (k ? 7 : -5) + i;
        o.connect(lp);
        o.start(t);
        o.stop(t + dur);
      });
    });
  }

  private startCrackle(ctx: AudioContext) {
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() < 0.0009 ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.012;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const g = ctx.createGain();
    g.gain.value = 0.35;
    src.connect(g).connect(this.bus!);
    src.start();
    this.crackle = src;
  }

  private makeNoise(ctx: AudioContext) {
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
}

export const beat = new BeatEngine();

/**
 * 비주얼용 타격 엔벨로프 — 마지막 타격 이후 지수 감쇠(타격 순간 1 → 0).
 * steps 는 32 스텝 루프 기준 인덱스.
 */
export const hitEnv = (steps: number[], beatPos: number, decay = 7) => {
  const pos = ((beatPos * 4) % STEPS + STEPS) % STEPS;
  let last = -Infinity;
  for (const s of steps) if (s <= pos && s > last) last = s;
  if (last === -Infinity) last = steps[steps.length - 1] - STEPS;
  return Math.exp(-(pos - last) / 4 * decay);
};
