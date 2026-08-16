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

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
  gradient.addColorStop(0, '#0b1120');
  gradient.addColorStop(1, '#020617');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1920);

  // Cyan top highlight line
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(0, 0, 1080, 24);

  // Top header branding
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 36px "Outfit", sans-serif';
  ctx.fillText(`CINEMETRICS // ${monthYear.toUpperCase()} WRAPPED`, 80, 160);

  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 54px "Outfit", sans-serif';
  ctx.fillText('Monthly Taste Capsule', 80, 230);

  // Persona Card
  drawRoundedRect(ctx, 80, 320, 920, 260, 24, '#1e293b', '#38bdf8', 3);
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('YOUR CINEMATIC PERSONA', 120, 380);

  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 52px "Outfit", sans-serif';
  ctx.fillText(persona, 120, 470);

  // Watch Time Box
  drawRoundedRect(ctx, 80, 620, 440, 300, 24, '#1e293b');
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('WATCH TIME', 120, 680);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px "Outfit", sans-serif';
  ctx.fillText(`${totalHours.toFixed(1)} hrs`, 120, 770);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`${totalFilms} films logged`, 120, 850);

  // Top Auteur Box
  drawRoundedRect(ctx, 560, 620, 440, 300, 24, '#1e293b');
  ctx.fillStyle = '#a855f7';
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('TOP AUTEUR', 600, 680);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 50px "Outfit", sans-serif';
  ctx.fillText(topDirector.slice(0, 16), 600, 770);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Most watched director', 600, 850);

  // Frequent Vibes & Genres
  drawRoundedRect(ctx, 80, 960, 920, 280, 24, '#1e293b');
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('FREQUENT VIBES & GENRES', 120, 1020);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px "Outfit", sans-serif';
  const genreStr = topGenres.slice(0, 3).join(' • ') || 'Cinema';
  ctx.fillText(genreStr.slice(0, 38), 120, 1110);

  // Lead Poster highlight
  if (posterUrl) {
    try {
      const img = await loadImage(posterUrl);
      ctx.save();
      roundRectPath(ctx, 420, 1280, 240, 360, 18);
      ctx.clip();
      ctx.drawImage(img, 420, 1280, 240, 360);
      ctx.restore();
    } catch {
      // ignore poster fail
    }
  }

  // Footer branding
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Created with Cinefy', 80, 1800);

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
