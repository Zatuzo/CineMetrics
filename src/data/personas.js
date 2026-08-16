// src/data/personas.js
import { GENRE_PERSONAS } from '../config';

export function calculateCinematicPersona(films = []) {
  if (!films || films.length === 0) {
    return "Cinematic Explorer";
  }

  // Count genres
  const genreCounts = {};
  films.forEach(film => {
    if (film.genre) {
      const parts = film.genre.split(',').map(g => g.trim()).filter(g => g && g !== 'Cinema');
      parts.forEach(g => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    }
  });

  // Find top genre
  let topGenre = "Cinema";
  let maxCount = 0;
  for (const [genre, count] of Object.entries(genreCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topGenre = genre;
    }
  }

  // Count decades
  const decadeCounts = {};
  films.forEach(film => {
    if (film.decade && film.decade !== 'N/A' && film.decade !== 'NaNs') {
      decadeCounts[film.decade] = (decadeCounts[film.decade] || 0) + 1;
    }
  });

  let topDecade = "";
  let maxDecadeCount = 0;
  for (const [decade, count] of Object.entries(decadeCounts)) {
    if (count > maxDecadeCount) {
      maxDecadeCount = count;
      topDecade = decade;
    }
  }

  const baseTitle = GENRE_PERSONAS[topGenre] || `${topGenre} Connoisseur`;
  return topDecade ? `${topDecade} ${baseTitle}` : baseTitle;
}
