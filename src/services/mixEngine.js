// src/services/mixEngine.js

export function buildCinemaMixes(diary = [], numMixes = 4) {
  if (!diary || diary.length === 0) return [];

  // Tally genres
  const genreMap = {};
  diary.forEach(film => {
    if (film.genre) {
      const parts = film.genre.split(',').map(g => g.trim()).filter(g => g && g !== 'Cinema');
      parts.forEach(g => {
        if (!genreMap[g]) genreMap[g] = [];
        genreMap[g].push(film);
      });
    }
  });

  // Sort genres by number of films
  const sortedGenres = Object.keys(genreMap).sort((a, b) => genreMap[b].length - genreMap[a].length);

  const colors = ['#38bdf8', '#10b981', '#f59e0b', '#a855f7', '#f43f5e', '#ec4899'];
  const mixes = [];

  for (let i = 0; i < Math.min(sortedGenres.length, numMixes); i++) {
    const genre = sortedGenres[i];
    const films = genreMap[genre]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 4);

    if (films.length >= 2) {
      const color = colors[i % colors.length];
      mixes.push({
        id: `mix_${genre.toLowerCase().replace(/\s+/g, '_')}`,
        title: `${genre} Daily Mix`,
        genre,
        color,
        description: `A custom algorithmic blend of your favorite ${genre.toLowerCase()} masterclasses and auteur staples.`,
        films
      });
    }
  }

  return mixes;
}
