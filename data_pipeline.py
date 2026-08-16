# data_pipeline.py
import io
import requests
import numpy as np
import pandas as pd
from PIL import Image
import streamlit as st
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

TMDB_API_KEY = "76a327a724de6563297b5a4d68a6fcc4"

@st.cache_data(show_spinner=False)
def fetch_tmdb_metadata(movie_name, year=None):
    """Fetches Director, Genres, Overview Synopsis, and Poster URL."""
    if not TMDB_API_KEY:
        return "Unknown Director", "Cinema", "", None
    
    url = "https://api.themoviedb.org/3/search/movie"
    params = {"api_key": TMDB_API_KEY, "query": movie_name}
    if pd.notna(year):
        params["year"] = int(year)
        
    try:
        r = requests.get(url, params=params, timeout=5).json()
        results = r.get("results", [])
        if not results:
            return "Unknown Director", "Cinema", "", None
            
        movie_id = results[0]["id"]
        overview = results[0].get("overview", "")
        poster_path = results[0].get("poster_path")
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None
        
        detail_url = f"https://api.themoviedb.org/3/movie/{movie_id}"
        detail_res = requests.get(
            detail_url, 
            params={"api_key": TMDB_API_KEY, "append_to_response": "credits"}, 
            timeout=5
        ).json()
        
        genres = ", ".join([g["name"] for g in detail_res.get("genres", [])]) or "Cinema"
        crew = detail_res.get("credits", {}).get("crew", [])
        directors = [m["name"] for m in crew if m.get("job") == "Director"]
        director = ", ".join(directors) if directors else "Unknown Director"
        
        return director, genres, overview, poster_url
    except Exception:
        return "Unknown Director", "Cinema", "", None


def load_letterboxd_bundle(uploaded_files=None):
    if not uploaded_files:
        return pd.DataFrame()
    
    file_map = {}
    for f in uploaded_files:
        name = f.name.lower()
        if 'diary' in name:
            file_map['diary'] = pd.read_csv(f)
        elif 'rating' in name:
            file_map['ratings'] = pd.read_csv(f)
        elif 'review' in name:
            file_map['reviews'] = pd.read_csv(f)
        else:
            file_map[name] = pd.read_csv(f)

    if 'diary' in file_map:
        base_df = file_map['diary']
    elif 'ratings' in file_map:
        base_df = file_map['ratings']
    elif 'reviews' in file_map:
        base_df = file_map['reviews']
    else:
        base_df = list(file_map.values())[0]

    # Date normalization
    if 'Watched Date' in base_df.columns:
        base_df['Date'] = pd.to_datetime(base_df['Watched Date'], errors='coerce')
    elif 'Date' in base_df.columns:
        base_df['Date'] = pd.to_datetime(base_df['Date'], errors='coerce')
    else:
        base_df['Date'] = pd.NaT

    # Merge Reviews & Ratings
    if 'reviews' in file_map and file_map['reviews'] is not base_df:
        rev_df = file_map['reviews'][['Name', 'Year', 'Review']].dropna(subset=['Review'])
        base_df = pd.merge(base_df, rev_df, on=['Name', 'Year'], how='left')

    if 'ratings' in file_map and 'Rating' not in base_df.columns:
        rat_df = file_map['ratings'][['Name', 'Year', 'Rating']]
        base_df = pd.merge(base_df, rat_df, on=['Name', 'Year'], how='left')

    base_df['Year'] = pd.to_numeric(base_df['Year'], errors='coerce')
    base_df['Decade'] = (base_df['Year'] // 10 * 10).dropna().astype(int).astype(str) + 's'
    base_df['Rating'] = pd.to_numeric(base_df['Rating'], errors='coerce')
    base_df = base_df.drop_duplicates(subset=['Name', 'Year']).reset_index(drop=True)

    # Feature Engineering for Habits
    base_df['Day_of_Week'] = base_df['Date'].dt.day_name()
    base_df['Month_Year'] = base_df['Date'].dt.to_period('M').astype(str)

    # Enrich metadata
    if TMDB_API_KEY:
        directors, genres, overviews, posters = [], [], [], []
        prog = st.progress(0, text="Syncing metadata & synopses from TMDb...")
        total = len(base_df)
        
        for i, row in base_df.iterrows():
            d, g, o, p = fetch_tmdb_metadata(row['Name'], row.get('Year'))
            directors.append(d)
            genres.append(g)
            overviews.append(o)
            posters.append(p)
            prog.progress((i + 1) / total)
            
        prog.empty()
        base_df['Director'] = directors
        base_df['Genre'] = genres
        base_df['Overview'] = overviews
        base_df['Poster'] = posters
    else:
        base_df['Director'] = 'Unknown Director'
        base_df['Genre'] = 'Cinema'
        base_df['Overview'] = ''
        base_df['Poster'] = None

    if 'Review' not in base_df.columns:
        base_df['Review'] = ''
    base_df['Review'] = base_df['Review'].fillna('')

    # Review NLP Sentiment Score
    base_df['Sentiment_Polarity'] = base_df['Review'].apply(
        lambda x: TextBlob(str(x)).sentiment.polarity if str(x).strip() else 0.0
    )

    return base_df


def load_watchlist_data(uploaded_files=None):
    if not uploaded_files:
        return pd.DataFrame()
    
    watchlist_file = next((f for f in uploaded_files if 'watchlist' in f.name.lower()), None)
    if not watchlist_file:
        return pd.DataFrame()
        
    df_watch = pd.read_csv(watchlist_file)
    df_watch['Year'] = pd.to_numeric(df_watch['Year'], errors='coerce')
    
    if TMDB_API_KEY:
        directors, genres, overviews, posters = [], [], [], []
        for _, row in df_watch.iterrows():
            d, g, o, p = fetch_tmdb_metadata(row['Name'], row.get('Year'))
            directors.append(d)
            genres.append(g)
            overviews.append(o)
            posters.append(p)
            
        df_watch['Director'] = directors
        df_watch['Genre'] = genres
        df_watch['Overview'] = overviews
        df_watch['Poster'] = posters
    else:
        df_watch['Director'] = 'Unknown'
        df_watch['Genre'] = 'Cinema'
        df_watch['Overview'] = ''
        df_watch['Poster'] = None
        
    return df_watch


def generate_poster_collage(poster_urls, cols=3, rows=3, thumb_size=(300, 450)):
    """Downloads poster images and stitches them into an exportable collage."""
    valid_urls = [u for u in poster_urls if u][:cols * rows]
    if not valid_urls:
        return None
    
    images = []
    for u in valid_urls:
        try:
            res = requests.get(u, timeout=4)
            img = Image.open(io.BytesIO(res.content)).convert('RGB')
            img = img.resize(thumb_size, Image.Resampling.LANCZOS)
            images.append(img)
        except Exception:
            continue
            
    if not images:
        return None

    w, h = thumb_size
    grid_img = Image.new('RGB', (cols * w, rows * h), color=(15, 23, 42))
    
    for idx, img in enumerate(images):
        r = idx // cols
        c = idx % cols
        grid_img.paste(img, (c * w, r * h))
        
    return grid_img