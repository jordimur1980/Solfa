import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kzjzjmqpzwaamuqvpjfd.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6anpqbXFwendhYW11cXZwamZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMzgwNjksImV4cCI6MjA5MjYxNDA2OX0.qXzPMJBpoca53phPrv_RX0FVRbhbd-tYWI1Ri9vmo1E'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)