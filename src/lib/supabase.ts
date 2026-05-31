// DESCUBRA HUB - SUPABASE CLIENT CONNECTION (supabase.ts)
// This file initializes the Supabase client if public environment keys are present.
// Otherwise, it cleanly falls back to our localStorage mock database (db.ts) so the system remains fully testable.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Safely register connection without crashing the app on missing keys
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to determine if we are in Mock mode or Live Supabase mode
export const isLiveMode = (): boolean => {
  return supabase !== null;
};

// Log connection state to developers
if (typeof window !== 'undefined') {
  if (isLiveMode()) {
    console.log('%c Descubra Hub: Conectado ao banco de dados live do Supabase! ', 'background: #059669; color: #fff; font-weight: bold; padding: 4px;');
  } else {
    console.log('%c Descubra Hub: Modo Offline/Local ativado. Banco de dados Mock (localStorage) operando com sucesso! ', 'background: #2563eb; color: #fff; font-weight: bold; padding: 4px;');
  }
}
