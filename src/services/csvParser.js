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

  // Parse Diary Data
  const diary = [];
  const total = baseRows.length;

  for (let i = 0; i < total; i++) {
    const row = baseRows[i];
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

    if (onProgress) {
      onProgress(Math.round(((i + 1) / total) * 100));
    }

    const meta = await fetchMovieMetadataByName(name, year);

    diary.push({
      id: i + 1,
      name,
      year,
      date,
      monthYear,
      dayOfWeek,
      rating,
      decade,
      director: meta.director,
      genre: meta.genre,
      overview: meta.overview,
      poster: meta.poster,
      runtime: meta.runtime,
      review: row['Review'] || ''
    });
  }

  // Parse Watchlist
  const watchlist = [];
  const rawWatch = fileDataMap['watchlist'] || [];
  for (let i = 0; i < rawWatch.length; i++) {
    const row = rawWatch[i];
    const name = row['Name'] || row['name'] || row['Title'] || 'Untitled';
    const year = parseInt(row['Year'] || row['year'], 10) || null;
    const meta = await fetchMovieMetadataByName(name, year);

    watchlist.push({
      id: 1000 + i,
      name,
      year,
      director: meta.director,
      genre: meta.genre,
      overview: meta.overview,
      poster: meta.poster
    });
  }

  return { diary, watchlist };
}
