// src/components/PosterImage.jsx
import React, { useState, useEffect } from 'react';
import { Film } from 'lucide-react';
import { fetchMovieMetadataByName } from '../services/tmdb';

export default function PosterImage({ src, name, year, className = "poster-img" }) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);

    // If no initial src, attempt fast metadata lookup
    if (!src && name) {
      fetchMovieMetadataByName(name, year).then(meta => {
        if (meta && meta.poster) {
          setImgSrc(meta.poster);
        }
      }).catch(() => {});
    }
  }, [src, name, year]);

  if (!imgSrc || hasError) {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #1c1c1c 0%, #111111 100%)',
          border: '1px solid #282828',
          borderRadius: '4px',
          padding: '10px',
          textAlign: 'center',
          color: '#888888',
          height: '100%',
          width: '100%'
        }}
      >
        <Film size={20} color="#555555" style={{ marginBottom: '6px' }} />
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#cccccc', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {name}
        </span>
        {year && <span style={{ fontSize: '10px', color: '#666666', marginTop: '2px' }}>{year}</span>}
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={name}
      className={className}
      loading="lazy"
      onError={() => {
        // Fallback to fetch if the current URL failed
        if (name && !hasError) {
          fetchMovieMetadataByName(name, year).then(meta => {
            if (meta && meta.poster && meta.poster !== imgSrc) {
              setImgSrc(meta.poster);
            } else {
              setHasError(true);
            }
          }).catch(() => setHasError(true));
        } else {
          setHasError(true);
        }
      }}
    />
  );
}
