// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qstfqqjnmrqxeqovdpzx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzdGZxcWpubXJxeGVxb3ZkcHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2NTY2MjEsImV4cCI6MjA1NzIzMjYyMX0.zRJd8i0f_j-BmCpavPmxuPGhtCm9Zejjl8JqR2pkFcc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);