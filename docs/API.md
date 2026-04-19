# Daily Tracker API 문서

프론트엔드 연동을 위한 API 레퍼런스입니다.

## 공통 규칙

- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **인증 방식**: HttpOnly 쿠키 (`sb-access-token`)
  - `GET` 요청은 인증 불필요 (비로그인 조회 가능)
  - `POST` / `PATCH` / `DELETE` 요청은 로그인 필요
- **날짜 형식**: `YYYY-MM-DD` (e.g. `2026-04-19`)

### 에러 응답 형식

```json
{
  "statusCode": 401,
  "message": "로그인이 필요합니다."
}
```

| 상태 코드 | 의미 |
|-----------|------|
| `400` | 잘못된 요청 (필수 파라미터 누락, 형식 오류) |
| `401` | 인증 필요 또는 세션 만료 |
| `404` | 리소스를 찾을 수 없음 |
| `409` | 충돌 (날짜 중복 일기 등) |
| `500` | 서버 오류 |

---

## 인증 (Auth)

### 로그인

```
POST /api/auth/login
```

**Request Body**

```json
{
  "email": "your@email.com",
  "password": "your-password"
}
```

**Response** `200`

```json
{
  "user": {
    "id": "uuid",
    "email": "your@email.com"
  }
}
```

로그인 성공 시 `sb-access-token`, `sb-refresh-token` HttpOnly 쿠키가 자동으로 세팅됩니다.  
이후 요청에서 별도 헤더 없이 쿠키가 자동으로 전송됩니다.

**Error**

| 상태 코드 | 메시지 |
|-----------|--------|
| `400` | 이메일과 비밀번호를 입력해주세요. |
| `401` | 허용되지 않은 계정입니다. |

---

### 로그아웃

```
POST /api/auth/logout
```

쿠키를 삭제하고 세션을 만료시킵니다.

**Response** `200`

```json
{ "ok": true }
```

---

### 내 정보 조회

```
GET /api/auth/me
```

**Response** `200`

```json
{
  "user": {
    "id": "uuid",
    "email": "your@email.com"
  }
}
```

**Error**

| 상태 코드 | 메시지 |
|-----------|--------|
| `401` | 로그인이 필요합니다. |
| `401` | 유효하지 않은 세션입니다. |

---

## 투두 (Todos)

### 날짜별 투두 목록 조회

```
GET /api/todos?date={YYYY-MM-DD}
```

**Query Parameters**

| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `date` | O | 조회할 날짜 (`YYYY-MM-DD`) |

**Response** `200`

```json
{
  "date": "2026-04-19",
  "achievement_rate": 67,
  "todos": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "운동하기",
      "date": "2026-04-19",
      "is_completed": true,
      "created_at": "2026-04-19T09:00:00Z",
      "updated_at": "2026-04-19T10:00:00Z"
    }
  ]
}
```

> `achievement_rate`: 완료 항목 수 / 전체 항목 수 × 100 (소수점 버림).  
> 투두가 없는 날은 `null` 반환.

---

### 투두 생성

```
POST /api/todos
```

**Request Body**

```json
{
  "title": "운동하기",
  "date": "2026-04-19"
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `title` | O | 할 일 제목 |
| `date` | X | 날짜 (기본값: 오늘) |

**Response** `200`

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "운동하기",
  "date": "2026-04-19",
  "is_completed": false,
  "created_at": "2026-04-19T09:00:00Z",
  "updated_at": "2026-04-19T09:00:00Z"
}
```

---

### 투두 수정

```
PATCH /api/todos/:id
```

**Request Body** (하나 이상 필수)

```json
{
  "is_completed": true,
  "title": "수정된 제목"
}
```

| 필드 | 설명 |
|------|------|
| `is_completed` | 완료 상태 토글 |
| `title` | 제목 변경 |

**Response** `200` — 수정된 투두 객체 반환

---

### 투두 삭제

```
DELETE /api/todos/:id
```

**Response** `200`

```json
{ "ok": true }
```

---

## 잔디 히트맵 (Heatmap)

### 연간 / 월간 달성률 조회

```
GET /api/heatmap?year={YYYY}
GET /api/heatmap?year={YYYY}&month={MM}
```

**Query Parameters**

| 파라미터 | 필수 | 설명 |
|----------|------|------|
| `year` | O | 연도 (e.g. `2026`) |
| `month` | X | 월 1–12 (없으면 연간 전체 반환) |

**Response** `200`

```json
{
  "year": 2026,
  "month": 4,
  "data": {
    "2026-04-01": { "achievement_rate": 100, "level": 4 },
    "2026-04-02": { "achievement_rate": 50,  "level": 2 },
    "2026-04-19": { "achievement_rate": 67,  "level": 3 }
  }
}
```

> 투두 기록이 없는 날짜는 `data`에 포함되지 않습니다.  
> 포함되지 않은 날짜는 `level: 0` (무채색)으로 처리하세요.

**level 정의**

| level | 달성률 | 색상 (CSS 변수) |
|-------|--------|----------------|
| `0` | 기록 없음 / 0% | `--heatmap-0` |
| `1` | 1 – 33% | `--heatmap-1` |
| `2` | 34 – 66% | `--heatmap-2` |
| `3` | 67 – 99% | `--heatmap-3` |
| `4` | 100% | `--heatmap-4` |

---

## 일기 (Diaries)

### 날짜별 일기 조회

```
GET /api/diaries?date={YYYY-MM-DD}
```

**Response** `200`

해당 날짜의 일기가 있으면 객체, 없으면 `null` 반환.

```json
{
  "id": "uuid",
  "user_id": "uuid",
  "date": "2026-04-19",
  "content": "오늘 하루를 돌아보며...",
  "created_at": "2026-04-19T22:00:00Z",
  "updated_at": "2026-04-19T22:30:00Z"
}
```

---

### 일기 생성

```
POST /api/diaries
```

**Request Body**

```json
{
  "content": "오늘 하루를 돌아보며...",
  "date": "2026-04-19"
}
```

| 필드 | 필수 | 설명 |
|------|------|------|
| `content` | O | 일기 내용 |
| `date` | X | 날짜 (기본값: 오늘) |

> 날짜당 1개 제한. 동일 날짜 재시도 시 `409` 반환 → `PATCH`로 수정하세요.

**Response** `200` — 생성된 일기 객체 반환

---

### 일기 수정

```
PATCH /api/diaries/:id
```

**Request Body**

```json
{
  "content": "수정된 내용..."
}
```

**Response** `200` — 수정된 일기 객체 반환

---

### 일기 삭제

```
DELETE /api/diaries/:id
```

**Response** `200`

```json
{ "ok": true }
```

---

## 프론트엔드 연동 예시

### 로그인 후 투두 조회 (Vue 3 + $fetch)

```ts
// 로그인
await $fetch('/api/auth/login', {
  method: 'POST',
  body: { email: 'your@email.com', password: 'password' },
})

// 오늘의 투두 조회
const { todos, achievement_rate } = await $fetch('/api/todos', {
  query: { date: '2026-04-19' },
})
```

### 잔디 컴포넌트 연동

```vue
<script setup lang="ts">
const { data, fetch } = useHeatmap()

onMounted(() => fetch(2026))        // 연간
// onMounted(() => fetch(2026, 4))  // 월간
</script>

<template>
  <ActivityHeatmap :year="2026" :data="data" />
</template>
```
