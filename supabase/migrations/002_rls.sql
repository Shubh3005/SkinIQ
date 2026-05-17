-- SkinIQ RLS policies — 4 core tables
-- Execute in Supabase Dashboard: SQL Editor → New query → Run
-- Run AFTER 001_schema.sql

-- =====================
-- profiles
-- Uses auth.uid() = id — profiles.id IS the user's UUID (no separate user_id column).
-- =====================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================
-- skin_scan_history
-- Includes DELETE — users can remove their own scans (Story 4.4).
-- =====================
ALTER TABLE public.skin_scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "skin_scan_history: select own"
  ON public.skin_scan_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "skin_scan_history: insert own"
  ON public.skin_scan_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skin_scan_history: delete own"
  ON public.skin_scan_history FOR DELETE
  USING (auth.uid() = user_id);

-- =====================
-- chat_history
-- =====================
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_history: select own"
  ON public.chat_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "chat_history: insert own"
  ON public.chat_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- achievements
-- =====================
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "achievements: select own"
  ON public.achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "achievements: insert own"
  ON public.achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================
-- routine_logs
-- Needs UPDATE — markRoutine() updates morning_completed/evening_completed
-- on an existing row when a user toggles a routine step.
-- =====================
ALTER TABLE public.routine_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "routine_logs: select own"
  ON public.routine_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "routine_logs: insert own"
  ON public.routine_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "routine_logs: update own"
  ON public.routine_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
