# CLAUDE.md — Daily Tracker

## 문서 참조

- **PRD** → [docs/PRD.md](docs/PRD.md) : 제품 목표, 기능 정의, 성공 지표
- **WRD** → [docs/WRD.md](docs/WRD.md) : API 설계, DB 스키마, 컴포넌트 명세, 구현 우선순위

새 기능 작업 전 반드시 WRD를 먼저 확인한다.

---

## 프로젝트 개요

개인 생산성 앱. 투두 관리 + 깃허브 잔디 스타일 히트맵 + 오늘의 일기를 하나의 공간에서 제공한다.

**단일 사용자** — 환경변수(`ALLOWED_EMAIL`)에 등록된 계정만 쓰기 가능. 조회는 비로그인 허용.

### 기술 스택

| 구분 | 기술 |
|------|------|
| Framework | Nuxt 4, Vue 3, TypeScript |
| Style | SCSS (`assets/styles/_tokens.scss` 기반 디자인 토큰) |
| 상태관리 | Pinia |
| Backend | Nuxt Server Routes (`server/api/`) |
| DB / Auth | Supabase |
| 패키지 매니저 | pnpm |

### 디렉토리 구조 (예정)

```
app/
  components/
    ActivityHeatmap.vue   # 잔디 히트맵 컴포넌트
    HeatmapTooltip.vue    # 툴팁 컴포넌트
  composables/
    useHeatmap.ts
    useAuth.ts
  stores/
    todo.ts
    diary.ts
    auth.ts
server/
  api/
    todos/
    diaries/
    heatmap/
    auth/
  middleware/
    auth.ts               # 쓰기 요청 인증 검증
assets/
  styles/
    _tokens.scss          # 디자인 토큰 (--color-primary: #222 등)
```

---

## 구현 범위

- **만들 것**: Nuxt Server API 전체 + Supabase 스키마/RLS + `ActivityHeatmap.vue` + `HeatmapTooltip.vue` + SCSS 토큰
- **만들지 않을 것**: 페이지 UI 전체 (투두 목록 페이지, 일기 페이지 등 레이아웃)

---

## 개인 워크플로우

### 작업 순서 (WRD 우선순위 기준)

1. Supabase 스키마 + RLS 설정
2. 환경변수 세팅 및 인증 API
3. 투두 CRUD API
4. 잔디 히트맵 API + 컴포넌트
5. 일기 CRUD API
6. 디자인 토큰 SCSS

### 브랜치 전략

- `main` — 배포 가능 상태 유지
- 기능별 브랜치: `feat/todo-api`, `feat/heatmap`, `feat/diary-api` 등

### 커밋 컨벤션

```
feat: 새 기능
fix: 버그 수정
chore: 설정, 의존성
refactor: 리팩토링
style: 스타일/포맷 변경
```

---

## 코딩 지침

### 공통

- 타입은 `supabase gen-types`로 생성한 `database.types.ts` 기준으로 사용한다.
- 환경변수는 `useRuntimeConfig()`로 접근. 서비스 키는 서버 사이드에서만 사용.
- 주석은 WHY가 명확할 때만 작성한다. 코드가 설명하는 내용은 주석으로 반복하지 않는다.

### API (Server Routes)

- 인증이 필요한 엔드포인트는 `server/middleware/auth.ts`에서 처리한다.
- 성공 응답: `200/201`, 인증 오류: `401`, 중복: `409`, 잘못된 입력: `400`.
- heatmap은 DB 집계 쿼리(GROUP BY)로 처리하며 별도 테이블에 저장하지 않는다.

### 컴포넌트

- `ActivityHeatmap.vue`는 데이터를 직접 fetch하지 않는다. 부모에서 `useHeatmap()` composable로 주입.
- 디자인 토큰은 CSS Custom Properties(`var(--color-primary)`)로만 참조. SCSS `@use` 금지.
- 스타일 변수 추가 시 반드시 `_tokens.scss`에만 선언한다.

### Supabase

- RLS는 SELECT 공개, INSERT/UPDATE/DELETE는 `auth.uid() IS NOT NULL` 또는 `auth.uid() = user_id` 조건.
- 서비스 키(`SUPABASE_SERVICE_KEY`)는 RLS 우회 목적으로만 사용하며 반드시 서버에서만 호출한다.

---

## 환경변수 목록

| 키 | 설명 |
|----|------|
| `SUPABASE_URL` | Supabase 프로젝트 URL |
| `SUPABASE_ANON_KEY` | 클라이언트용 공개 키 |
| `SUPABASE_SERVICE_KEY` | 서버 전용 서비스 키 (노출 금지) |
| `ALLOWED_EMAIL` | 로그인 허용 이메일 |
| `ALLOWED_PASSWORD` | 로그인 허용 비밀번호 |
