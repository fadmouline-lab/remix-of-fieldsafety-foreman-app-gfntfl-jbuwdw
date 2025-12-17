
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://jlleexsrerdpbngtlokk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsbGVleHNyZXJkcGJuZ3Rsb2trIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDQ3NDQsImV4cCI6MjA4MTEyMDc0NH0.jdK-u4TB4mqeUSb3JuTvPBA73XruSy2sDDFFCX-SR0s';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
