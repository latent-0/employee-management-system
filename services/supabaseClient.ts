import { createClient } from '@supabase/supabase-js';

// These environment variables would be set in your deployment environment.
// We fall back to placeholder values to prevent the app from crashing if they are not set.
const supabaseUrl = process.env.SUPABASE_URL || 'https://pfyxqaknxcvgieizxnir.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmeXhxYWtueGN2Z2llaXp4bmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MjMxMjUsImV4cCI6MjA3ODQ5OTEyNX0.y1znrybIG5a2G3O4To6kjn0tSp5fiK-m1oEkMpDDA20';

if (supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmeXhxYWtueGN2Z2llaXp4bmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5MjMxMjUsImV4cCI6MjA3ODQ5OTEyNX0.y1znrybIG5a2G3O4To6kjn0tSp5fiK-m1oEkMpDDA20' && !process.env.SUPABASE_ANON_KEY) {
    // In a real application, you'd want to handle this more gracefully.
    // For this environment, we'll log a warning to inform the user.
    console.warn('Supabase Anon Key not found in environment variables. Using the provided key as a fallback.');
}

// Initialize the client with either the real credentials or the placeholders.
// This prevents the "supabaseUrl is required" error.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);