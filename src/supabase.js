// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://shjoilhuulutvgblzoyc.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function fetchSupabaseData(username = "zatuzo") {
  try {
    if (!SUPABASE_KEY) {
      console.warn("No Supabase key found in environment.");
      return null;
    }

    // 1. Get profile id
    const { data: profileData } = await supabase
      .table('profiles')
      .select('id')
      .eq('username', username)
      .limit(1);

    const userId = profileData?.[0]?.id || "f37896a8-190e-4ae6-b441-3c0faebd3570";

    // 2. Fetch watch logs
    const { data: logsData } = await supabase
      .table('watch_logs')
      .select('rating, watched_at, review, movies(*)')
      .eq('user_id', userId)
      .order('watched_at', { ascending: false });

    // 3. Fetch watchlist
    const { data: watchData } = await supabase
      .table('watchlists')
      .select('movie_id, movies(*)')
      .eq('user_id', userId);

    const diary = (logsData || []).map(r => {
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

      const yearVal = m.release_year ? Number(m.release_year) : null;
      const decadeStr = yearVal ? `${Math.floor(yearVal / 10) * 10}s` : "N/A";
      const watchedDate = r.watched_at || "";

      return {
        Name: m.title || "Untitled",
        Year: yearVal,
        Date: watchedDate,
        Watched_Date: watchedDate,
        Rating: r.rating ? Number(r.rating) : null,
        Review: r.review || "",
        Director: m.director || "Unknown Director",
        Genre: genreStr,
        Runtime: m.runtime_minutes || 110,
        Popularity: Number(m.popularity || 10.0),
        Overview: m.overview || "",
        Poster: m.poster_url || null,
        Decade: decadeStr
      };
    });

    const watchlist = (watchData || []).map(r => {
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

      return {
        Name: m.title || "Untitled",
        Year: m.release_year ? Number(m.release_year) : null,
        Director: m.director || "Unknown",
        Genre: genreStr,
        Runtime: m.runtime_minutes || 110,
        Popularity: Number(m.popularity || 10.0),
        Overview: m.overview || "",
        Poster: m.poster_url || null
      };
    });

    return { diary, watchlist };
  } catch (err) {
    console.error("Failed to fetch from Supabase:", err);
    return null;
  }
}
