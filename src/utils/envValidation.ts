/**
 * Environment Variables Validator for Production Readiness
 */

export interface EnvHealthReport {
  isValid: boolean;
  isSupabaseConfigured: boolean;
  missingVariables: string[];
  environment: 'development' | 'production' | 'test';
}

export function validateEnvironment(): EnvHealthReport {
  const missingVariables: string[] = [];
  
  const supabaseUrl = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_URL) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL);

  const supabaseAnonKey = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!supabaseUrl || supabaseUrl.includes('your-project-id')) {
    missingVariables.push('VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!supabaseAnonKey || supabaseAnonKey.includes('your-anon-key')) {
    missingVariables.push('VITE_SUPABASE_ANON_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const isSupabaseConfigured = missingVariables.length === 0;

  const isDev = 
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development');

  return {
    isValid: isSupabaseConfigured,
    isSupabaseConfigured,
    missingVariables,
    environment: isDev ? 'development' : 'production',
  };
}
