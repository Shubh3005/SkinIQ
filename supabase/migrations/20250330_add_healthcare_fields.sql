
-- Add healthcare related fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS physician_name TEXT,
ADD COLUMN IF NOT EXISTS physician_phone TEXT,
ADD COLUMN IF NOT EXISTS morning_reminder TEXT DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS evening_reminder TEXT DEFAULT '20:00';
