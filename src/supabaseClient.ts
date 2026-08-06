import { createClient } from '@supabase/supabase-js';

// Support Vite (import.meta.env) and Node/Express (process.env)
const getEnvVar = (key: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      return (import.meta as any).env[key] || '';
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || '';
    }
  } catch {}
  return '';
};

export const supabaseUrl =
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
  getEnvVar('VITE_SUPABASE_URL') ||
  getEnvVar('SUPABASE_URL') ||
  '';

export const supabaseAnonKey =
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  getEnvVar('SUPABASE_ANON_KEY') ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-supabase-project') &&
    !supabaseAnonKey.includes('your-anon-key')
);

export const isDevMode = (() => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      if ((import.meta as any).env.DEV) return true;
      if ((import.meta as any).env.MODE === 'development') return true;
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env) {
      if (process.env.NODE_ENV === 'development') return true;
    }
  } catch {}
  return false;
})();

// Fallback to dummy endpoint if credentials aren't provided yet so app won't crash on load
const fallbackUrl = 'https://xyzcompany.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.placeholder';

export const supabase = createClient(
  supabaseUrl || fallbackUrl,
  supabaseAnonKey || fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Uploads a customer photo or document to Supabase Storage bucket 'customer-photos'
 */
export async function uploadCustomerPhoto(file: File | Blob, fileName: string): Promise<string | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase credentials not configured. Photo upload skipped.');
    return null;
  }
  try {
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = `customer_${Date.now()}_${cleanFileName}`;
    const { data, error } = await supabase.storage
      .from('customer-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Supabase Storage error:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage.from('customer-photos').getPublicUrl(filePath);
    return urlData.publicUrl;
  } catch (err) {
    console.error('Error during photo upload:', err);
    return null;
  }
}
