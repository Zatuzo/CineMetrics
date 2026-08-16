// src/services/csvParser.js
import { fetchMovieMetadataByName } from './tmdb';

export function parseCSVText(csvText) {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  // Find header line
  let headerIndex = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const lower = lines[i].toLowerCase();
    if (lower.includes('name') || lower.includes('watched date') || lower.includes('rating') || lower.includes('uri')) {
      headerIndex = i;
      break;
    }
  }

  const rawHeaders = splitCSVLine(lines[headerIndex]);
  const headers = rawHeaders.map(h => h.trim());

  const rows = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i]);
    if (values.length >= headers.length - 2) {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] !== undefined ? values[idx].trim() : '';
      });
      rows.push(obj);
    }
  }
  return rows;
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function processLetterboxdFiles(files, onProgress) {
  const fileDataMap = {};

  for (const file of files) {
    const text = await file.text();
    const rows = parseCSVText(text);
    const lowerName = file.name.toLowerCase();

    if (lowerName.includes('diary')) {
      fileDataMap['diary'] = rows;
    } else if (lowerName.includes('rating')) {
      fileDataMap['ratings'] = rows;
    } else if (lowerName.includes('review')) {
      fileDataMap['reviews'] = rows;
    } else if (lowerName.includes('watchlist')) {
      fileDataMap['watchlist'] = rows;
    } else {
      fileDataMap[lowerName] = rows;
    }
  }

  const baseRows = fileDataMap['diary'] || fileDataMap['ratings'] || fileDataMap['reviews'] || [];
  if (baseRows.length === 0 && !fileDataMap['watchlist']) {
    return { diary: [], watchlist: [] };
  }

  // 1. Instant Synchronous Diary Parsing
  const diary = baseRows.map((row, i) => {
    const name = row['Name'] || row['name'] || row['Title'] || 'Untitled';
    const year = parseInt(row['Year'] || row['year'], 10) || null;
    const dateStr = row['Watched Date'] || row['Date'] || '';
    
    let date = null;
    let monthYear = 'Undated';
    let dayOfWeek = 'N/A';

    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        date = dateStr;
        monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'long' });
      }
    }

    const rating = parseFloat(row['Rating'] || row['rating']) || null;
    const decade = year ? `${Math.floor(year / 10) * 10}s` : 'N/A';

    return {
      id: i + 1,
      name,
      year,
      date,
      monthYear,
      dayOfWeek,
      rating,
      decade,
      director: row['Director'] || 'Auteur',
      genre: row['Genres'] || row['Genre'] || 'Cinema',
      overview: row['Overview'] || row['Review'] || '',
      poster: null,
      runtime: 115,
      review: row['Review'] || ''
    };
  });

  // 2. Instant Synchronous Watchlist Parsing (Zero latency)
  const rawWatch = fileDataMap['watchlist'] || [];
  const watchlist = rawWatch.map((row, i) => {
    const name = row['Name'] || row['name'] || row['Title'] || 'Untitled';
    const year = parseInt(row['Year'] || row['year'], 10) || null;

    return {
      id: 1000 + i,
      name,
      year,
      director: row['Director'] || 'Auteur',
      genre: row['Genres'] || row['Genre'] || 'Cinema',
      overview: row['Overview'] || '',
      poster: null
    };
  });

  if (onProgress) onProgress(60);

  // 3. Fast Parallel Enrichment for initial top 12 films so UI is instantly rich
  const enrichCount = Math.min(diary.length, 12);
  const enrichPromises = [];

  for (let i = 0; i < enrichCount; i++) {
    enrichPromises.push(
      fetchMovieMetadataByName(diary[i].name, diary[i].year).then(meta => {
        diary[i].director = meta.director || diary[i].director;
        diary[i].genre = meta.genre || diary[i].genre;
        diary[i].overview = meta.overview || diary[i].overview;
        diary[i].poster = meta.poster;
        diary[i].runtime = meta.runtime || 115;
      }).catch(() => {})
    );
  }

  // Enrich first 8 watchlist items in parallel
  const watchEnrichCount = Math.min(watchlist.length, 8);
  for (let i = 0; i < watchEnrichCount; i++) {
    enrichPromises.push(
      fetchMovieMetadataByName(watchlist[i].name, watchlist[i].year).then(meta => {
        watchlist[i].director = meta.director || watchlist[i].director;
        watchlist[i].genre = meta.genre || watchlist[i].genre;
        watchlist[i].overview = meta.overview || watchlist[i].overview;
        watchlist[i].poster = meta.poster;
      }).catch(() => {})
    );
  }

  await Promise.all(enrichPromises);

  if (onProgress) onProgress(100);

  return { diary, watchlist };
}
