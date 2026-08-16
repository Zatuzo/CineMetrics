// src/services/tmdb.js
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE } from '../config';

const CACHE_KEY = 'cinefy_tmdb_cache_v1';

function getCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function setCache(cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // quota exceeded or private mode
  }
}

export async function searchTMDbMovies(query) {
  if (!query || !query.trim() || !TMDB_API_KEY) return [];

  const cacheKey = `search_${query.trim().toLowerCase()}`;
  const cache = getCache();
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query.trim())}&include_adult=false`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    
    const results = (data.results || []).slice(0, 8).map(m => ({
      id: m.id,
      title: m.title || m.original_title || 'Unknown Film',
      year: m.release_date ? m.release_date.split('-')[0] : 'N/A',
      releaseDate: m.release_date || '',
      overview: m.overview || 'No synopsis available.',
      rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : 0,
      voteCount: m.vote_count || 0,
      posterUrl: m.poster_path ? `${TMDB_IMAGE_BASE}${m.poster_path}` : null,
      backdropUrl: m.backdrop_path ? `${TMDB_IMAGE_BASE}${m.backdrop_path}` : null
    }));

    cache[cacheKey] = results;
    setCache(cache);
    return results;
  } catch (err) {
    console.error('TMDb Search Error:', err);
    return [];
  }
}

export async function fetchMovieMetadataByName(name, year) {
  if (!name || !TMDB_API_KEY) {
    return { director: 'Unknown Director', genre: 'Cinema', overview: '', poster: null, runtime: 110 };
  }

  const cacheKey = `meta_${name.toLowerCase()}_${year || ''}`;
  const cache = getCache();
  if (cache[cacheKey]) return cache[cacheKey];

  try {
    let url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(name)}`;
    if (year) url += `&year=${year}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    const firstMatch = (data.results || [])[0];
    if (!firstMatch) {
      return { director: 'Unknown Director', genre: 'Cinema', overview: '', poster: null, runtime: 110 };
    }

    const detailUrl = `${TMDB_BASE_URL}/movie/${firstMatch.id}?api_key=${TMDB_API_KEY}&append_to_response=credits`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();

    const crew = detailData.credits?.crew || [];
    const directors = crew.filter(c => c.job === 'Director').map(c => c.name);
    const director = directors.length > 0 ? directors.join(', ') : 'Unknown Director';
    const genres = (detailData.genres || []).map(g => g.name).join(', ') || 'Cinema';
    const poster = detailData.poster_path ? `${TMDB_IMAGE_BASE}${detailData.poster_path}` : null;
    const runtime = detailData.runtime || 110;

    const result = {
      director,
      genre: genres,
      overview: detailData.overview || firstMatch.overview || '',
      poster,
      runtime
    };

    cache[cacheKey] = result;
    setCache(cache);
    return result;
  } catch {
    return { director: 'Unknown Director', genre: 'Cinema', overview: '', poster: null, runtime: 110 };
  }
}
