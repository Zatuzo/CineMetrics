// src/services/storyCard.js

export async function generateStoryCardBlob({
  monthYear,
  persona,
  totalFilms,
  totalHours,
  topDirector,
  topGenres = [],
  posterUrl = null
}) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');

  // Deep Velvet Red Gradient Background
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
  gradient.addColorStop(0, '#1c050a');
  gradient.addColorStop(0.5, '#0e0306');
  gradient.addColorStop(1, '#050102');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  // Crimson accent top banner
  ctx.fillStyle = '#e11d48';
  ctx.fillRect(0, 0, 1080, 20);

  // Top header branding
  ctx.fillStyle = '#e11d48';
  ctx.font = 'bold 34px "Cinzel", Georgia, serif';
  ctx.fillText(`CINEMETRICS // ${monthYear.toUpperCase()} THEATRE REEL`, 80, 160);

  ctx.fillStyle = '#fff1f2';
  ctx.font = 'bold 50px "Cinzel", Georgia, serif';
  ctx.fillText('Monthly Screening Capsule', 80, 230);

  // Persona Card
  drawRoundedRect(ctx, 80, 320, 920, 260, 20, '#260a10', '#e11d48', 2);
  ctx.fillStyle = '#fda4af';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CURATED THEATRE PERSONA', 120, 380);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 48px "Cinzel", Georgia, serif';
  ctx.fillText(persona, 120, 470);

  // Watch Time Box
  drawRoundedRect(ctx, 80, 620, 440, 300, 20, '#260a10');
  ctx.fillStyle = '#e11d48';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SCREEN TIME', 120, 680);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px "Cinzel", Georgia, serif';
  ctx.fillText(`${totalHours.toFixed(1)} hrs`, 120, 770);

  ctx.fillStyle = '#9f7580';
  ctx.font = '26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${totalFilms} films logged`, 120, 850);

  // Top Auteur Box
  drawRoundedRect(ctx, 560, 620, 440, 300, 20, '#260a10');
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('TOP AUTEUR', 600, 680);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 46px "Cinzel", Georgia, serif';
  ctx.fillText(topDirector.slice(0, 16), 600, 770);

  ctx.fillStyle = '#9f7580';
  ctx.font = '26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Auditorium rotation', 600, 850);

  // Frequent Vibes & Genres
  drawRoundedRect(ctx, 80, 960, 920, 280, 20, '#260a10');
  ctx.fillStyle = '#f43f5e';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('FEATURED GENRES & PROGRAMMES', 120, 1020);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px "Cinzel", Georgia, serif';
  const genreStr = topGenres.slice(0, 3).join(' • ') || 'Cinema';
  ctx.fillText(genreStr.slice(0, 38), 120, 1110);

  // Lead Poster highlight
  if (posterUrl) {
    try {
      const img = await loadImage(posterUrl);
      ctx.save();
      roundRectPath(ctx, 420, 1280, 240, 360, 16);
      ctx.clip();
      ctx.drawImage(img, 420, 1280, 240, 360);
      ctx.restore();
    } catch {
      // ignore
    }
  }

  // Footer branding
  ctx.fillStyle = '#9f7580';
  ctx.font = 'bold 26px "Cinzel", Georgia, serif';
  ctx.fillText('Curated via Cinefy Theatre Engine', 80, 1800);

  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(blob), 'image/png');
  });
}

function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke = null, lineWidth = 1) {
  ctx.save();
  ctx.beginPath();
  roundRectPath(ctx, x, y, width, height, radius);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

function roundRectPath(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
