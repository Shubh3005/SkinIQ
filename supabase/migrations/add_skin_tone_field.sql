
-- Add skin_tone column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS skin_tone TEXT;
