-- SkinIQ schema — 4 core tables
-- Execute in Supabase Dashboard: SQL Editor → New query → Run
-- Run BEFORE 002_rls.sql

-- =====================
-- profiles
-- One row per user. The handle_new_user trigger auto-inserts a minimal
-- row on every new auth.users record so the profile always exists.
-- =====================
CREATE TABLE IF NOT EXISTS public.profiles (
  id               uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name        text,
  avatar_url       text,
  skin_type        text,
  skin_tone        text,
  morning_reminder text DEFAULT '08:00',
  evening_reminder text DEFAULT '20:00',
  physician_name   text,
  physician_phone  text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- skin_scan_history
-- "acneSeverity" is double-quoted to preserve camelCase.
-- All insert sites (useSkinAnalysis.ts, CameraScanner.tsx) reference
-- this exact column name — do not rename to acne_severity.
-- skin_issues is text[] — the API returns an array and the app inserts it as one.
-- =====================
CREATE TABLE IF NOT EXISTS public.skin_scan_history (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  skin_type      text,
  skin_issues    text[],
  skin_tone      text,
  scan_image     text,
  disease        text,
  "acneSeverity" text,
  created_at     timestamptz DEFAULT now()
);

-- =====================
-- chat_history
-- =====================
CREATE TABLE IF NOT EXISTS public.chat_history (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  message    text NOT NULL,
  response   text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- =====================
-- achievements
-- =====================
CREATE TABLE IF NOT EXISTS public.achievements (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name        text NOT NULL,
  description text NOT NULL,
  icon        text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- =====================
-- routine_logs
-- Tracks daily morning/evening routine completion per user.
-- date is PostgreSQL date type; app writes 'yyyy-MM-dd' strings via date-fns.
-- UNIQUE (user_id, date) enforces one row per user per day — markRoutine()
-- checks for existence first, then updates or inserts accordingly.
-- =====================
CREATE TABLE IF NOT EXISTS public.routine_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date              date NOT NULL,
  morning_completed boolean DEFAULT false,
  evening_completed boolean DEFAULT false,
  created_at        timestamptz DEFAULT now(),
  UNIQUE (user_id, date)
);
