# 파트너스 실험실 — 시간표 타입(A/B/C) 설정 UI 가이드

> 대상: 파트너스(Partners) 어드민 Next.js 프로젝트 프론트엔드
> 목적: 스튜디오 운영자가 **실험실(Lab)** 메뉴에서 앱 스튜디오 상세의 **시간표 렌더 방식(A/B/C)** 을 미리보기와 함께 간단히 고르고 저장할 수 있게 한다.
> 이 문서는 “무엇을 만들지 + 어떻게 만들지”를 화면·상태·API·카피·엣지케이스까지 아주 세세하게 규정한다.

---

## 0. 한눈에 보기 (TL;DR)

- 실험실 안에 **“시간표 표시 방식”** 카드 하나를 추가한다.
- 그 안에서 **3개의 선택지(A/B/C)를 라디오 카드**로 보여준다. 각 카드는 `미리보기 일러스트 + 제목 + 한 줄 설명`.
- 선택 → **저장 버튼** 활성화 → 저장 시 `PATCH`로 `timeTableType` 저장 → 성공 토스트.
- 값이 없으면(미설정) **A가 기본**. 서버가 아무것도 안 내려주면 앱은 A로 렌더한다.
- 실험실 기능이므로 **“실험실” 뱃지 + 짧은 안내 문구**를 붙인다.

---

## 1. 도메인 개념 — 시간표 타입이란?

앱(스튜디오 상세)의 “이번 주 열리는 수업” 시간표는 **동일한 데이터**를 3가지 방식 중 하나로 그린다.
데이터(요일·시간·수업 셀)는 그대로이고 **표현(layout)만** 바뀐다.

| 값 | 이름(운영자용) | 한 줄 설명 | 이럴 때 추천 |
|----|----------------|-----------|-------------|
| `A` | 시간표형 (기본) | 요일 × 시간 격자에 수업을 시간대 위치에 배치 | 시간대가 촘촘하고 정규 수업표가 있는 스튜디오 |
| `B` | 채운 격자형 | 시간 열 없이 요일별로 수업을 위에서부터 빈틈없이 채움 | 수업이 드문드문 있어 A는 빈칸이 많은 스튜디오 |
| `C` | 리스트형 | 요일별로 `시간 · 썸네일 · 수업명` 리스트 | 수업 수가 적고 목록처럼 읽히길 원하는 스튜디오 |

> **중요:** 값은 대문자 단일 문자 `'A' | 'B' | 'C'`. 미설정(`null`/`undefined`)이면 앱은 **A**로 처리한다. 그러니 파트너스에서도 **초기 선택 상태 = 서버값 ?? 'A'**.

---

## 2. 각 타입의 실제 렌더 규칙 (미리보기 문구·일러스트 제작 근거)

미리보기 일러스트/스크린샷을 만들 때 아래 규칙을 반영하면 앱과 일치한다.

### 2-1. A — 시간표형 (Time-grid, 기본)
- 왼쪽 **TIME 열** + 월~일 **요일 열**.
- 수업이 **자기 시간대(row) 위치**에 배치된다 → 수업 사이에 **빈 칸(구멍)** 이 생길 수 있음.
- 수업 셀 = 썸네일(세로로 김, 대략 1:1.76) + 하단 반투명 바에 수업명.
- 오늘 요일 헤더는 **검은색 rounded 박스 + 흰 글씨**.

```
        월    화    수    목 ...
 10:00 [ ]  [수업] [ ]  [ ]
 11:00 [수업][ ]   [ ]  [수업]
 12:00 [ ]  [ ]   [수업][ ]
        ↑ 시간축에 맞춰 배치, 빈칸 존재
```

### 2-2. B — 채운 격자형 (Packed grid)
- **TIME 열 없음.** 요일 열만.
- 각 요일 열에 그 날 수업을 **위에서부터 빈틈없이(구멍 제거)** 쌓는다.
- 수업 셀 = A와 같은 썸네일 카드 + **좌상단에 진행 시간 배지**(예: `PM 5:00`).
- 좌우 여백이 거의 없어 셀이 화면 폭을 꽉 채운다.

```
   월     화     수     목
 [PM5]  [PM1]  [PM7]  [PM6]
 [PM7]  [PM3]         [PM8]
 [PM9]
   ↑ 시간 상관없이 위로 채움, 각 카드에 시간 배지
```

### 2-3. C — 리스트형 (Agenda list)
- 요일별 섹션. 각 수업이 **한 행** = `시간(PM 1:00) · 썸네일(작게) · 수업명`.
- 스크롤로 읽기 편한 목록형.

```
 월  07.28
   PM 5:00  [🖼]  힙합 기초
   PM 7:00  [🖼]  왁킹 중급
 수  07.30
   PM 1:00  [🖼]  걸스힙합
```

### 2-4. 공통(타입 무관) 헤더 — 참고용
세 타입 모두 상단에 다음이 공통으로 붙는다(파트너스에서 설정 대상 아님, 미리보기 일관성용 참고):
- **주차 제목**: `이번 주 열리는 수업` / `다음 주 열리는 수업` / `지난 주 열리는 수업`, 2주 이상은 `N월 M째 주`.
- **부제**: `월·수·금 수업이 열려요` (또는 매일이면 `매일 수업이 열려요`).
- 좌우 **주 이동 화살표**.

---

## 3. 데이터 & API 계약

### 3-1. 저장 필드
- 필드명(앱 응답 기준): `timeTableType`
- 타입: `'A' | 'B' | 'C'`
- 기본값(미설정): `A`
- 스코프: **스튜디오 단위**(스튜디오 1개당 1개 값).

### 3-2. 조회 / 저장 엔드포인트 (⚠️ BE와 최종 확인 필요)
아래는 권장 계약. 실제 라우트는 백엔드와 합의해 맞춘다.

**조회** — 실험실 진입 시 현재 값 로드
```
GET /partners/studios/{studioId}/settings
200 → { "timeTableType": "A" | "B" | "C" | null, ...otherSettings }
```

**저장** — 선택 후 저장
```
PATCH /partners/studios/{studioId}/settings
body: { "timeTableType": "B" }
200 → { "timeTableType": "B" }
```

- 저장 성공 판정은 응답의 `timeTableType`가 보낸 값과 같은지로 확인.
- 실패 시 에러 코드/메시지를 토스트로 노출하고 **선택 상태는 서버 최신값으로 롤백**.

> 참고: 앱 쪽은 `GET /studios/{id}/time-table` 응답에 `type: 'A'|'B'|'C'`가 실려 내려오며, 없으면 A로 렌더한다. 파트너스에서 저장한 값이 이 `type`으로 반영되는 구조라고 BE에 명시할 것.

---

## 4. 화면 구성 (Lab 섹션 UI 스펙)

### 4-1. 위치 / 진입
- 실험실(Lab) 목록 페이지 안에 **“시간표 표시 방식”** 항목(카드/행) 추가.
- 클릭 시 상세(또는 같은 페이지 내 확장)에서 A/B/C 선택 UI 노출.

### 4-2. 레이아웃 (권장: 세로 스택 라디오 카드)
```
┌───────────────────────────────────────────────┐
│  🧪 실험실                                       │
│  시간표 표시 방식                                 │
│  앱 스튜디오 화면의 주간 시간표가 이렇게 보여요.      │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ ◉  [미리보기]  시간표형 (기본)               │ │  ← 선택됨(테두리 강조 + 라디오 채움)
│  │               요일 × 시간 격자에 배치         │ │
│  └───────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────┐ │
│  │ ○  [미리보기]  채운 격자형                   │ │
│  │               요일별로 빈칸 없이 채움          │ │
│  └───────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────┐ │
│  │ ○  [미리보기]  리스트형                      │ │
│  │               시간·썸네일·수업명 목록          │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│                       [ 저장 ]  ← 변경 있을 때만 활성 │
└───────────────────────────────────────────────┘
```

### 4-3. 카드 1개 구성 요소
1. **라디오 인디케이터**(좌측) — 선택 시 채워짐.
2. **미리보기 썸네일**(좌측, 라디오 옆) — 각 타입의 대표 이미지/일러스트(권장 4:3 또는 정사각, 96~120px). 2절의 규칙대로 제작.
3. **제목** — “시간표형 (기본)” / “채운 격자형” / “리스트형”.
4. **설명** — 한 줄 카피(§6 참고).
5. (선택) 현재 적용중이면 우측에 `현재 적용중` 미니 뱃지.

### 4-4. 상태 정의
| 상태 | 시각 |
|------|------|
| 기본 | 회색 테두리(`#EEF0F2`), 흰 배경 |
| 선택됨 | 강조 테두리(브랜드색, 예 `#3CC0AF`) + 라디오 채움 + 살짝 tint 배경 |
| 포커스(키보드) | 포커스 링 |
| 저장 중 | 카드 비활성(dim) + 저장 버튼 스피너 |
| 로딩(초기) | 스켈레톤 3개 |
| 에러(조회 실패) | 인라인 에러 + 다시 시도 버튼 |

### 4-5. 저장 인터랙션
- 카드 선택만으로는 저장하지 않는다(오터치 방지). **저장 버튼**을 눌러야 반영.
- 선택값이 서버 저장값과 다를 때만 저장 버튼 **활성**.
- 저장 성공 → 토스트 `시간표 표시 방식을 변경했어요` + 저장 버튼 비활성(변경 없음 상태).
- 저장 실패 → 토스트 에러 + 선택값 서버 최신값으로 롤백.
- (선택) 실시간 반영이 아니라면 “앱에 반영까지 수 분 걸릴 수 있어요” 안내.

---

## 5. 구현 가이드 (Next.js / React / TypeScript)

> 아래는 참고 구현. 파트너스 프로젝트의 디자인 시스템/데이터 패칭 방식(React Query/SWR 등)에 맞춰 치환한다.

### 5-1. 타입 & 상수
```ts
// timetable-type.ts
export type TimeTableType = 'A' | 'B' | 'C';

export const TIMETABLE_TYPES: {
  value: TimeTableType;
  title: string;
  description: string;
  preview: string; // 미리보기 이미지 경로
}[] = [
  {
    value: 'A',
    title: '시간표형 (기본)',
    description: '요일 × 시간 격자에 수업을 시간대별로 배치해요.',
    preview: '/lab/timetable-a.png',
  },
  {
    value: 'B',
    title: '채운 격자형',
    description: '시간 열 없이 요일별로 수업을 빈칸 없이 채워요.',
    preview: '/lab/timetable-b.png',
  },
  {
    value: 'C',
    title: '리스트형',
    description: '요일별로 시간·썸네일·수업명을 목록으로 보여줘요.',
    preview: '/lab/timetable-c.png',
  },
];

export const DEFAULT_TIMETABLE_TYPE: TimeTableType = 'A';
```

### 5-2. 셀렉터 컴포넌트 (라디오 그룹)
```tsx
'use client';

import { useState } from 'react';
import { TIMETABLE_TYPES, TimeTableType, DEFAULT_TIMETABLE_TYPE } from './timetable-type';

type Props = {
  /** 서버에서 로드한 현재 값(없으면 A) */
  initialType: TimeTableType | null;
  onSave: (next: TimeTableType) => Promise<void>;
};

export function TimeTableTypeSelector({ initialType, onSave }: Props) {
  const saved = initialType ?? DEFAULT_TIMETABLE_TYPE;
  const [selected, setSelected] = useState<TimeTableType>(saved);
  const [saving, setSaving] = useState(false);
  const dirty = selected !== saved;

  const handleSave = async () => {
    if (!dirty || saving) return;
    setSaving(true);
    try {
      await onSave(selected); // 실패 시 throw → catch에서 롤백
    } catch {
      setSelected(saved); // 서버 최신값으로 롤백
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#EEF0F2] bg-white p-5">
      {/* 헤더 */}
      <div className="mb-1 flex items-center gap-2">
        <span className="rounded-full bg-[#EEF7F5] px-2 py-0.5 text-[11px] font-bold text-[#2AA894]">실험실</span>
        <h3 className="text-[16px] font-bold text-[#191F28]">시간표 표시 방식</h3>
      </div>
      <p className="mb-4 text-[13px] text-[#8B95A1]">앱 스튜디오 화면의 주간 시간표가 이렇게 보여요.</p>

      {/* 라디오 카드 그룹 */}
      <div role="radiogroup" aria-label="시간표 표시 방식" className="flex flex-col gap-2.5">
        {TIMETABLE_TYPES.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={saving}
              onClick={() => setSelected(opt.value)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors disabled:opacity-50
                ${active ? 'border-[#3CC0AF] bg-[#F3FBF9]' : 'border-[#EEF0F2] bg-white'}`}
            >
              {/* 라디오 */}
              <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${active ? 'border-[#3CC0AF]' : 'border-[#C7CDD3]'}`}>
                {active && <span className="h-2.5 w-2.5 rounded-full bg-[#3CC0AF]" />}
              </span>
              {/* 미리보기 */}
              <img src={opt.preview} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-[#EEF0F2] object-cover" />
              {/* 텍스트 */}
              <span className="min-w-0">
                <span className="block text-[15px] font-bold text-[#191F28]">{opt.title}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-[#8B95A1]">{opt.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* 저장 */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-lg bg-[#191F28] px-5 py-2.5 text-[14px] font-bold text-white transition-opacity disabled:opacity-40"
        >
          {saving ? '저장 중…' : '저장'}
        </button>
      </div>
    </section>
  );
}
```

### 5-3. 데이터 패칭 예시 (React Query 가정)
```tsx
'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TimeTableTypeSelector } from './TimeTableTypeSelector';
import { TimeTableType } from './timetable-type';

export function TimeTableTypeLab({ studioId }: { studioId: number }) {
  const qc = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['studio-settings', studioId],
    queryFn: () => fetch(`/api/partners/studios/${studioId}/settings`).then((r) => r.json()),
  });

  const mutation = useMutation({
    mutationFn: (timeTableType: TimeTableType) =>
      fetch(`/api/partners/studios/${studioId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeTableType }),
      }).then(async (r) => {
        if (!r.ok) throw new Error('save failed');
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studio-settings', studioId] });
      toast('시간표 표시 방식을 변경했어요');
    },
    onError: () => toast('저장에 실패했어요. 다시 시도해 주세요'),
  });

  if (isLoading) return <SelectorSkeleton />;
  if (isError) return <InlineError onRetry={refetch} />;

  return (
    <TimeTableTypeSelector
      initialType={data?.timeTableType ?? null}
      onSave={(next) => mutation.mutateAsync(next)}
    />
  );
}
```

---

## 6. 카피 (한국어, 그대로 사용 가능)

- 섹션 제목: **시간표 표시 방식**
- 섹션 설명: **앱 스튜디오 화면의 주간 시간표가 이렇게 보여요.**
- 실험실 뱃지: **실험실**
- 옵션
  - A — 제목 **시간표형 (기본)** / 설명 **요일 × 시간 격자에 수업을 시간대별로 배치해요.**
  - B — 제목 **채운 격자형** / 설명 **시간 열 없이 요일별로 수업을 빈칸 없이 채워요.**
  - C — 제목 **리스트형** / 설명 **요일별로 시간·썸네일·수업명을 목록으로 보여줘요.**
- 저장 버튼: **저장** / 진행 중 **저장 중…**
- 성공 토스트: **시간표 표시 방식을 변경했어요**
- 실패 토스트: **저장에 실패했어요. 다시 시도해 주세요**
- (선택) 반영 안내: **변경 사항은 앱에 곧 반영돼요.**

---

## 7. 접근성 / UX 체크리스트

- [ ] `role="radiogroup"` + 각 옵션 `role="radio"` + `aria-checked`.
- [ ] 키보드: Tab으로 그룹 진입, 화살표로 옵션 이동(선택), Enter/Space로 확정(원한다면 radiogroup 표준 키 동작 구현).
- [ ] 선택은 색만이 아니라 **라디오 채움 + 테두리**로도 구분(색맹 대응).
- [ ] 미리보기 이미지는 장식이면 `alt=""`, 의미 있으면 대체텍스트 제공.
- [ ] 저장 버튼은 변경 없을 때 비활성 → 불필요한 저장/혼란 방지.
- [ ] 저장 실패 시 **선택 상태 롤백**(사용자가 저장됐다고 오해하지 않게).

---

## 8. 엣지 케이스 & 주의

1. **기본값 A**: 서버값이 `null`/`undefined`/알 수 없는 값이면 **A로 취급**. (앱과 동일 규칙 — 앱은 `type ?? 'A'`.)
2. **알 수 없는 값 방어**: 서버가 `'D'` 등 미지원 값을 주면 A로 폴백하고 콘솔 경고.
3. **스튜디오 단위**: 값은 스튜디오별. 여러 스튜디오를 운영하는 파트너라면 스튜디오 선택 컨텍스트에 종속.
4. **실시간 반영 여부**: 앱은 시간표 조회 시점에 `type`을 받으므로, 저장 후 앱을 다시 진입/새로고침해야 반영될 수 있음. 필요하면 안내 문구 노출.
5. **미리보기 정합성**: 미리보기 이미지는 §2 규칙과 일치해야 함(특히 B의 시간 배지, C의 행 구성). 앱 UI가 바뀌면 미리보기도 갱신.
6. **저장 중복 클릭 방지**: `saving` 동안 카드/버튼 비활성.

---

## 9. QA 시나리오

- [ ] 미설정 스튜디오 진입 → **A가 선택**되어 보임, 저장 버튼 비활성.
- [ ] B 선택 → 저장 버튼 활성 → 저장 → 토스트 → 버튼 비활성, 새로고침해도 B 유지.
- [ ] 저장 실패(네트워크 강제 오류) → 에러 토스트 + 선택 A로 롤백.
- [ ] 앱에서 해당 스튜디오 상세 진입 → 저장한 타입으로 시간표가 렌더되는지 교차 확인.
- [ ] 키보드만으로 옵션 이동·저장 가능한지.
- [ ] 조회 실패 시 인라인 에러 + 다시 시도 동작.

---

## 10. BE에 확인/요청할 것 (체크리스트)

- [ ] 설정 조회/저장 엔드포인트 확정(§3-2 계약 or 대체).
- [ ] `timeTableType` 저장 값이 앱 `GET /studios/{id}/time-table` 응답의 `type`으로 반영되는지.
- [ ] 미설정 시 응답이 `null` 인지 필드 자체 생략인지(둘 다 A로 처리하지만 명시).
- [ ] 권한: 해당 스튜디오 운영자만 저장 가능(파트너 권한 체크).
