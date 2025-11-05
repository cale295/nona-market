import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jktugidytxdinekjihlc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdHVnaWR5dHhkaW5la2ppaGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MTg2NzksImV4cCI6MjA2MzQ5NDY3OX0.m-hphTs4G0Oyz69NAvbUL485HO_SZ_6i9N7NyPAo13Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
