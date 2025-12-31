// src/services/wishesApi.js
import { createClient } from '@supabase/supabase-js';

// Paste your values here from Step 9
const SUPABASE_URL = 'https://fppanjwnistjupzirihi.supabase.co'; // ← Replace this
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwcGFuanduaXN0anVwemlyaWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxOTcwOTAsImV4cCI6MjA4Mjc3MzA5MH0.1zT5QFmJWydK-5O2IPyfNi4WXr5WEz6nfm9tvDeyC_k'; // ← Replace this

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function fetchWishes() {
    try {
        const { data, error } = await supabase
            .from('wishes')
            .select('*')
            .order('createdAt', { ascending: false });

        if (error) throw error;

        return { wishes: data || [] };
    } catch (error) {
        console.error('Error fetching wishes:', error);
        return { wishes: [] };
    }
}

export async function postWish({ name, message }) {
    try {
        const newWish = {
            name: name.trim(),
            message: message.trim(),
            createdAt: Date.now()
        };

        const { data, error } = await supabase
            .from('wishes')
            .insert([newWish])
            .select()
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error posting wish:', error);
        throw error;
    }
}