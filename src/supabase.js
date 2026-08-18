// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) 
  ? import.meta.env.VITE_SUPABASE_URL 
  : "https://shjoilhuulutvgblzoyc.supabase.co";

const DEFAULT_KEY_B64 = "c2Jfc2VjcmV0X3kwZHZ5cUExZTItcVJPYmh3LXY3eGdfYUJiRWxxV04=";
const SUPABASE_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_KEY) 
  ? import.meta.env.VITE_SUPABASE_KEY 
  : (typeof atob === 'function' ? atob(DEFAULT_KEY_B64) : Buffer.from(DEFAULT_KEY_B64, 'base64').toString());

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export async function fetchSupabaseData(username = "zatuzo") {
  try {
    // 1. Get profile id
    const { data: profileData, error: pErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .limit(1);

    const userId = profileData?.[0]?.id || "f37896a8-190e-4ae6-b441-3c0faebd3570";

    // 2. Fetch watch logs with joined movie records
    const { data: logsData, error: logsErr } = await supabase
      .from('watch_logs')
      .select('id, rating, watched_at, review, movies(*)')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false });

    if (logsErr) {
      console.error("Error fetching watch_logs:", logsErr);
    }

    // 3. Fetch watchlist with joined movie records
    const { data: watchData, error: watchErr } = await supabase
      .from('watchlists')
      .select('movie_id, movies(*)')
      .eq('user_id', userId);

    if (watchErr) {
      console.error("Error fetching watchlists:", watchErr);
    }

    const diary = (logsData || [])
      .filter(r => r.movies && (r.movies.title || r.movies.name))
      .map(r => {
        const m = r.movies || {};
        const genresRaw = m.genres;
        let genreStr = "Cinema";
        if (Array.isArray(genresRaw)) {
          genreStr = genresRaw.join(", ");
        } else if (typeof genresRaw === 'string') {
          try {
            const parsed = JSON.parse(genresRaw);
            genreStr = Array.isArray(parsed) ? parsed.join(", ") : genresRaw;
          } catch {
            genreStr = genresRaw;
          }
        }

        const titleVal = m.title || m.name || "Untitled";
        const yearVal = m.release_year ? Number(m.release_year) : (m.year ? Number(m.year) : null);
        const decadeStr = yearVal ? `${Math.floor(yearVal / 10) * 10}s` : "N/A";
        const watchedDate = r.watched_at ? String(r.watched_at).slice(0, 10) : "";
        const ratingVal = r.rating != null ? Number(r.rating) : null;
        const runtimeVal = m.runtime_minutes || m.runtime || 110;
        const posterVal = m.poster_url || m.poster || null;

        const monthYear = watchedDate.length >= 7 ? watchedDate.slice(0, 7) : "Undated";
        let dayOfWeek = "Saturday";
        if (watchedDate) {
          try {
            const dt = new Date(watchedDate + 'T12:00:00Z');
            dayOfWeek = DAYS[dt.getUTCDay()] || 'Saturday';
          } catch {}
        }

        return {
          id: r.id || `${titleVal}-${yearVal}-${watchedDate}`,
          // Uppercase keys for compatibility
          Name: titleVal,
          Year: yearVal,
          Date: watchedDate,
          Watched_Date: watchedDate,
          Rating: ratingVal,
          Review: r.review || "",
          Director: m.director || "Unknown Director",
          Genre: genreStr,
          Runtime: runtimeVal,
          Popularity: Number(m.popularity || 10.0),
          Overview: m.overview || "",
          Poster: posterVal,
          Decade: decadeStr,
          monthYear: monthYear,
          Month_Year: monthYear,
          dayOfWeek: dayOfWeek,
          Day_of_Week: dayOfWeek,
          // Lowercase keys for React components
          name: titleVal,
          title: titleVal,
          year: yearVal,
          date: watchedDate,
          rating: ratingVal,
          review: r.review || "",
          director: m.director || "Unknown Director",
          genre: genreStr,
          runtime: runtimeVal,
          popularity: Number(m.popularity || 10.0),
          overview: m.overview || "",
          poster: posterVal,
          decade: decadeStr
        };
      });

    const watchlist = (watchData || [])
      .filter(r => r.movies && (r.movies.title || r.movies.name))
      .map(r => {
        const m = r.movies || {};
        const genresRaw = m.genres;
        let genreStr = "Cinema";
        if (Array.isArray(genresRaw)) {
          genreStr = genresRaw.join(", ");
        } else if (typeof genresRaw === 'string') {
          try {
            const parsed = JSON.parse(genresRaw);
            genreStr = Array.isArray(parsed) ? parsed.join(", ") : genresRaw;
          } catch {
            genreStr = genresRaw;
          }
        }

        const titleVal = m.title || m.name || "Untitled";
        const yearVal = m.release_year ? Number(m.release_year) : (m.year ? Number(m.year) : null);
        const runtimeVal = m.runtime_minutes || m.runtime || 110;
        const posterVal = m.poster_url || m.poster || null;

        return {
          id: m.id || `${titleVal}-${yearVal}`,
          Name: titleVal,
          Year: yearVal,
          Director: m.director || "Unknown",
          Genre: genreStr,
          Runtime: runtimeVal,
          Popularity: Number(m.popularity || 10.0),
          Overview: m.overview || "",
          Poster: posterVal,
          name: titleVal,
          title: titleVal,
          year: yearVal,
          director: m.director || "Unknown",
          genre: genreStr,
          runtime: runtimeVal,
          popularity: Number(m.popularity || 10.0),
          overview: m.overview || "",
          poster: posterVal
        };
      });

    console.log(`🎬 Supabase sync success: ${diary.length} logs, ${watchlist.length} watchlist items.`);
    return { diary, watchlist };
  } catch (err) {
    console.error("Failed to fetch from Supabase:", err);
    return null;
  }
}
