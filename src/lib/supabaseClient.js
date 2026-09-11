import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

// Project Supabase Cloud configuration for NiveshSetu
const DEFAULT_SUPABASE_URL = 'https://edjacalxbvefzemtqejb.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkamFjYWx4YnZlZnplbXRxZWpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwODA1NjcsImV4cCI6MjEwMDY1NjU2N30.aq2MDakqaX5lx0RUzYcso2HuwdSZN7X7s8JH-XL8Thc';

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || DEFAULT_SUPABASE_URL;
const supabaseAnonKey =
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  getEnvVar('VITE_SUPABASE_PUBLISHABLE_KEY') ||
  DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[NiveshSetu AI] Supabase credentials not found. The application will operate in local fallback/demo mode.'
  );
}

// Instantiate the singleton Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const DOCUMENTS_BUCKET = 'documents';
