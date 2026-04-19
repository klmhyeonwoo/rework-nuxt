-- ============================================================
-- Daily Tracker — Supabase Schema & RLS
-- Supabase SQL Editor에 전체 붙여넣고 실행
-- ============================================================

-- ── todos ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS todos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  date         DATE        NOT NULL,
  is_completed BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS todos_user_date_idx ON todos (user_id, date);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_select_public" ON todos FOR SELECT USING (true);
CREATE POLICY "todos_insert_auth"   ON todos FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "todos_update_auth"   ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "todos_delete_auth"   ON todos FOR DELETE USING (auth.uid() = user_id);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── diaries ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diaries (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE        NOT NULL,
  content    TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

CREATE INDEX IF NOT EXISTS diaries_user_date_idx ON diaries (user_id, date);

ALTER TABLE diaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diaries_select_public" ON diaries FOR SELECT USING (true);
CREATE POLICY "diaries_insert_auth"   ON diaries FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "diaries_update_auth"   ON diaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "diaries_delete_auth"   ON diaries FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER diaries_updated_at
  BEFORE UPDATE ON diaries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
