import {createClient} from "@supabase/supabase-js"; 
// const project_url = process.env.SUPABASE_URL;
// const project_anon_key = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(
    "https://tuwedhkobttxpydawzwp.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1d2VkaGtvYnR0eHB5ZGF3endwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODI5MDIsImV4cCI6MjA2MzY1ODkwMn0.7Y68odObuUGCPogKi3TC2IuiAlnkv3D4owXfTD425wI"
);