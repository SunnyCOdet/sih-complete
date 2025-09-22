import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Fallback values for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://gxkslinvnhxiulrpijet.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4a3NsaW52bmh4aXVscnBpamV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NjY4MzksImV4cCI6MjA3NDA0MjgzOX0.1Of7l_njM_V13z5QZfeyf-FKaDxZe4pIlsjx1eSRutI';

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY');
  throw new Error('Supabase configuration is missing. Please check your environment variables.');
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key present:', !!supabaseAnonKey);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
