# WRD: Daily Tracker — 투두, 잔디, 일기 통합 개인 생산성 앱

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | Nuxt 3, Vue 3, TypeScript, SCSS |
| 상태관리 | Pinia |
| Backend | Nuxt Server Routes (`server/api/`) |
| DB / Auth | Supabase (PostgreSQL + Supabase Auth) |
| 구현 범위 | 컴포넌트: 잔디 히트맵, 툴팁 / 나머지: API + Supabase 완전 구현 |

---

## 기능 명세

### 1. 투두리스트 CRUD

- **구현 방식**: Nuxt server routes → Supabase `todos` 테이블. 날짜(`date: YYYY-MM-DD`)로 필터링.
- **입력**: `title: string`, `date: string`, `is_completed?: boolean`
- **출력**: 투두 배열 + 해당 날짜 달성률(`achievement_rate: number`, 0–100 정수)
- **제약사항**: 로그인 사용자만 쓰기 가능. `date` 없으면 서버에서 오늘 날짜 기본값 사용.
- **엣지케이스**: 투두 0개인 날은 달성률 `null` 반환(잔디 셀 무채색 처리).

### 2. 잔디 히트맵 컴포넌트

- **구현 방식**: `components/ActivityHeatmap.vue` — props로 `year` 또는 `month` 수신, API `/api/heatmap` 결과를 셀로 렌더링.
- **입력(props)**: `year: number`, `month?: number` (없으면 연간 전체)
- **출력**: 날짜별 그리드. 달성률에 따라 CSS 채도 클래스 5단계 부여.
- **채도 레벨**:

  | 레벨 | 달성률 | CSS 변수 |
  |------|--------|----------|
  | 0 | null / 0% | `--heatmap-0` |
  | 1 | 1–33% | `--heatmap-1` |
  | 2 | 34–66% | `--heatmap-2` |
  | 3 | 67–99% | `--heatmap-3` |
  | 4 | 100% | `--heatmap-4` |

- **제약사항**: 컴포넌트 자체적으로 API fetch 불가 — 부모에서 데이터를 주입(composable `useHeatmap()` 제공).

### 3. 툴팁 컴포넌트

- **구현 방식**: `components/HeatmapTooltip.vue` — 잔디 셀 hover 시 절대위치로 렌더링.
- **입력(props)**: `date: string`, `achievementRate: number | null`, `visible: boolean`, `position: { x: number, y: number }`
- **출력**: 날짜(`YYYY년 M월 D일`)와 달성률(`달성률: 72%` 또는 `기록 없음`) 표시.
- **엣지케이스**: `achievementRate === null`이면 "기록 없음" 텍스트 출력.

### 4. 오늘의 일기 CRUD

- **구현 방식**: Nuxt server routes → Supabase `diaries` 테이블. `date` 컬럼에 UNIQUE 제약.
- **입력**: `content: string`, `date: string`
- **출력**: 단일 일기 객체 `{ id, date, content, created_at, updated_at }`
- **제약사항**: 날짜당 1개 제한(DB UNIQUE 제약으로 강제). 로그인 사용자만 쓰기 가능.
- **엣지케이스**: 동일 날짜 `POST` 시 409 반환. `PATCH`로 수정 유도.

### 5. 인증

- **구현 방식**: Supabase Auth Email/Password. 서버 미들웨어에서 세션 검증.
- **허용 계정**: 환경변수 `ALLOWED_EMAIL` / `ALLOWED_PASSWORD`로 단일 계정 제어. 로그인 시도 시 이메일이 `ALLOWED_EMAIL`과 불일치하면 401 반환.
- **조회 허용**: `todos`, `diaries`, `heatmap` GET은 인증 불필요(Supabase RLS `SELECT` 공개).
- **쓰기 제한**: `INSERT / UPDATE / DELETE`는 RLS로 `auth.uid() IS NOT NULL` 조건 부여.
- **엣지케이스**: 세션 만료 시 401 반환 → 클라이언트에서 재로그인 유도.

### 6. 디자인 토큰 (SCSS)

- **구현 방식**: `assets/styles/_tokens.scss` — 전역 SCSS 변수 및 CSS Custom Properties 정의.
- **제공 토큰**:

  ```scss
  // Color
  --color-primary: #222222;
  --color-bg: #ffffff;
  --color-border: #e0e0e0;
  --color-text-muted: #888888;

  // Button
  --btn-bg: #222222;
  --btn-color: #ffffff;
  --btn-border-radius: 4px;
  --btn-padding: 8px 16px;

  // Heatmap
  --heatmap-0: #eeeeee;
  --heatmap-1: #c6d9c6;
  --heatmap-2: #7fb87f;
  --heatmap-3: #3d8f3d;
  --heatmap-4: #1a6e1a;
  ```

- **제약사항**: Nuxt `css` 옵션에 전역 import. 컴포넌트에서 `@use` 금지, CSS var로만 참조.

---

## API 설계

| Method | Path | 인증 | 설명 |
|--------|------|------|------|
| GET | `/api/todos?date=YYYY-MM-DD` | 불필요 | 날짜별 투두 목록 + 달성률 반환 |
| POST | `/api/todos` | 필요 | 투두 생성 |
| PATCH | `/api/todos/:id` | 필요 | 완료 상태 토글 / 제목 수정 |
| DELETE | `/api/todos/:id` | 필요 | 투두 삭제 |
| GET | `/api/heatmap?year=YYYY` | 불필요 | 연간 날짜별 달성률 맵 반환 |
| GET | `/api/heatmap?year=YYYY&month=MM` | 불필요 | 월간 날짜별 달성률 맵 반환 |
| GET | `/api/diaries?date=YYYY-MM-DD` | 불필요 | 날짜별 일기 조회 |
| POST | `/api/diaries` | 필요 | 일기 생성 |
| PATCH | `/api/diaries/:id` | 필요 | 일기 수정 |
| DELETE | `/api/diaries/:id` | 필요 | 일기 삭제 |
| POST | `/api/auth/login` | 불필요 | 로그인 (환경변수 계정 검증) |
| POST | `/api/auth/logout` | 필요 | 로그아웃 |
| GET | `/api/auth/me` | 필요 | 세션 사용자 정보 반환 |

### 응답 예시

**`GET /api/todos?date=2026-04-19`**
```json
{
  "date": "2026-04-19",
  "achievement_rate": 67,
  "todos": [
    { "id": "uuid", "title": "운동하기", "is_completed": true, "created_at": "..." },
    { "id": "uuid", "title": "독서 30분", "is_completed": true, "created_at": "..." },
    { "id": "uuid", "title": "코드 리뷰", "is_completed": false, "created_at": "..." }
  ]
}
```

**`GET /api/heatmap?year=2026`**
```json
{
  "year": 2026,
  "data": {
    "2026-01-01": { "achievement_rate": 100, "level": 4 },
    "2026-01-02": { "achievement_rate": 50, "level": 2 },
    "2026-04-19": { "achievement_rate": 67, "level": 3 }
  }
}
```

---

## 데이터 모델

```
todos {
  id:           uuid          PK, default gen_random_uuid()
  user_id:      uuid          FK → auth.users.id
  title:        text          NOT NULL
  date:         date          NOT NULL
  is_completed: boolean       DEFAULT false
  created_at:   timestamptz   DEFAULT now()
  updated_at:   timestamptz   DEFAULT now()
}
인덱스: (user_id, date)

diaries {
  id:         uuid          PK, default gen_random_uuid()
  user_id:    uuid          FK → auth.users.id
  date:       date          NOT NULL
  content:    text          NOT NULL
  created_at: timestamptz   DEFAULT now()
  updated_at: timestamptz   DEFAULT now()
  UNIQUE(user_id, date)
}

-- achievement_rate는 todos에서 집계, 별도 저장 없음
-- heatmap API는 todos를 date로 GROUP BY하여 계산
```

### Supabase RLS 정책 요약

```sql
-- todos
CREATE POLICY "todos_select_public" ON todos FOR SELECT USING (true);
CREATE POLICY "todos_insert_auth"   ON todos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "todos_update_auth"   ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "todos_delete_auth"   ON todos FOR DELETE USING (auth.uid() = user_id);

-- diaries (동일 패턴)
CREATE POLICY "diaries_select_public" ON diaries FOR SELECT USING (true);
CREATE POLICY "diaries_insert_auth"   ON diaries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "diaries_update_auth"   ON diaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "diaries_delete_auth"   ON diaries FOR DELETE USING (auth.uid() = user_id);
```

---

## 비기능 요구사항

- **성능**: heatmap API는 단일 쿼리(GROUP BY date)로 집계. 연간 조회 기준 응답 200ms 이내 목표.
- **보안**: 환경변수 `ALLOWED_EMAIL` 불일치 시 로그인 거부. Supabase 서비스 키는 서버 사이드에서만 사용.
- **타입 안전성**: Supabase 스키마에서 `supabase gen-types`로 TypeScript 타입 자동 생성, `database.types.ts`로 관리.
- **환경변수**:

  | 키 | 용도 |
  |----|------|
  | `SUPABASE_URL` | Supabase 프로젝트 URL |
  | `SUPABASE_ANON_KEY` | 클라이언트용 공개 키 |
  | `SUPABASE_SERVICE_KEY` | 서버 전용 서비스 키 |
  | `ALLOWED_EMAIL` | 로그인 허용 이메일 |
  | `ALLOWED_PASSWORD` | 로그인 허용 비밀번호 |

---

## 구현 우선순위

| 우선순위 | 기능 | 이유 |
|----------|------|------|
| P0 | Supabase 스키마 + RLS 설정 | 모든 API의 기반 |
| P0 | 인증 API (`/api/auth/*`) | 쓰기 기능 선행 조건 |
| P0 | 투두 CRUD API | 핵심 데이터 생성 |
| P1 | 잔디 히트맵 API + 컴포넌트 | 시각화 핵심 기능 |
| P1 | 툴팁 컴포넌트 | 잔디와 세트 |
| P1 | 일기 CRUD API | 핵심 사용자 경험 |
| P2 | 디자인 토큰 SCSS | 스타일 일관성 |
