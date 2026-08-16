# data_pipeline.py
import pandas as pd
import numpy as np
import requests
import streamlit as st

TMDB_API_KEY = "76a327a724de6563297b5a4d68a6fcc4"

@st.cache_data(show_spinner=False)
def fetch_tmdb_metadata(movie_name, year=None):
    """Fetches Director, Genres, and Poster path from TMDb."""
    if not TMDB_API_KEY:
        return "Unknown Director", "Cinema", None
    
    url = "https://api.themoviedb.org/3/search/movie"
    params = {"api_key": TMDB_API_KEY, "query": movie_name}
    if pd.notna(year):
        params["year"] = int(year)
        
    try:
        r = requests.get(url, params=params, timeout=5).json()
        results = r.get("results", [])
        if not results:
            return "Unknown Director", "Cinema", None
            
        movie_id = results[0]["id"]
        poster_path = results[0].get("poster_path")
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else None
        
        # Get Credits & Details for Director & Genres
        detail_url = f"https://api.themoviedb.org/3/movie/{movie_id}"
        detail_res = requests.get(
            detail_url, 
            params={"api_key": TMDB_API_KEY, "append_to_response": "credits"}, 
            timeout=5
        ).json()
        
        # Extract Genres
        genres = ", ".join([g["name"] for g in detail_res.get("genres", [])]) or "Cinema"
        
        # Extract Director
        crew = detail_res.get("credits", {}).get("crew", [])
        directors = [m["name"] for m in crew if m.get("job") == "Director"]
        director = ", ".join(directors) if directors else "Unknown Director"
        
        return director, genres, poster_url
    except Exception:
        return "Unknown Director", "Cinema", None

# In data_pipeline.py

def safe_read_csv(file_obj):
    """Safely reads a Letterboxd CSV file by resolving seek position and skipping metadata headers."""
    try:
        file_obj.seek(0)
        content_bytes = file_obj.read()
        file_obj.seek(0)
        
        content = content_bytes.decode('utf-8-sig', errors='ignore')
        lines = content.splitlines()
        
        skip_rows = 0
        for i, line in enumerate(lines[:10]):
            cols = [c.strip().lower() for c in line.split(',')]
            # Look for headers
            if any(h in cols for h in ['name', 'watched date', 'date', 'rating', 'uri']):
                skip_rows = i
                break
                
        file_obj.seek(0)
        return pd.read_csv(file_obj, skiprows=skip_rows)
    except Exception:
        try:
            file_obj.seek(0)
            return pd.read_csv(file_obj)
        except Exception:
            return pd.DataFrame()

def load_watchlist_data(uploaded_files=None):
    """Finds and enriches watchlist.csv from the uploaded batch."""
    if not uploaded_files:
        return pd.DataFrame()
    
    watchlist_file = None
    for f in uploaded_files:
        if 'watchlist' in f.name.lower():
            watchlist_file = f
            break
            
    if not watchlist_file:
        return pd.DataFrame()
        
    df_watch = safe_read_csv(watchlist_file)
    if df_watch.empty:
        return pd.DataFrame()
    df_watch['Year'] = pd.to_numeric(df_watch['Year'], errors='coerce')
    
    # Enrich watchlist titles with TMDb metadata
    if TMDB_API_KEY:
        directors, genres, posters = [], [], []
        for _, row in df_watch.iterrows():
            d, g, p = fetch_tmdb_metadata(row['Name'], row.get('Year'))
            directors.append(d)
            genres.append(g)
            posters.append(p)
            
        df_watch['Director'] = directors
        df_watch['Genre'] = genres
        df_watch['Poster'] = posters
    else:
        df_watch['Director'] = 'Unknown'
        df_watch['Genre'] = 'Cinema'
        df_watch['Poster'] = None
        
    return df_watch

def load_letterboxd_bundle(uploaded_files=None):
    if not uploaded_files:
        return get_starter_dataset()
    
    file_map = {}
    for f in uploaded_files:
        name = f.name.lower()
        if 'diary' in name:
            file_map['diary'] = safe_read_csv(f)
        elif 'rating' in name:
            file_map['ratings'] = safe_read_csv(f)
        elif 'review' in name:
            file_map['reviews'] = safe_read_csv(f)
        else:
            file_map[name] = safe_read_csv(f)

    # Base selection priority
    if 'diary' in file_map:
        base_df = file_map['diary']
    elif 'ratings' in file_map:
        base_df = file_map['ratings']
    elif 'reviews' in file_map:
        base_df = file_map['reviews']
    else:
        base_df = list(file_map.values())[0]

    # Dates
    if 'Watched Date' in base_df.columns:
        base_df['Date'] = pd.to_datetime(base_df['Watched Date'], errors='coerce')
    elif 'Date' in base_df.columns:
        base_df['Date'] = pd.to_datetime(base_df['Date'], errors='coerce')
    else:
        base_df['Date'] = pd.NaT

    # Merge Reviews
    if 'reviews' in file_map and file_map['reviews'] is not base_df:
        rev_df = file_map['reviews'][['Name', 'Year', 'Review']].dropna(subset=['Review'])
        base_df = pd.merge(base_df, rev_df, on=['Name', 'Year'], how='left')

    # Merge Ratings
    if 'ratings' in file_map and 'Rating' not in base_df.columns:
        rat_df = file_map['ratings'][['Name', 'Year', 'Rating']]
        base_df = pd.merge(base_df, rat_df, on=['Name', 'Year'], how='left')

    base_df['Year'] = pd.to_numeric(base_df['Year'], errors='coerce')
    base_df['Decade'] = (base_df['Year'] // 10 * 10).dropna().astype(int).astype(str) + 's'
    base_df['Rating'] = pd.to_numeric(base_df['Rating'], errors='coerce')
    base_df = base_df.drop_duplicates(subset=['Name', 'Year']).reset_index(drop=True)

    # Enrich with TMDb
    if TMDB_API_KEY:
        directors, genres, posters = [], [], []
        prog = st.progress(0, text="Fetching director and genre metadata from TMDb...")
        total = len(base_df)
        
        for i, row in base_df.iterrows():
            d, g, p = fetch_tmdb_metadata(row['Name'], row.get('Year'))
            directors.append(d)
            genres.append(g)
            posters.append(p)
            prog.progress((i + 1) / total)
            
        prog.empty()
        base_df['Director'] = directors
        base_df['Genre'] = genres
        base_df['Poster'] = posters
    else:
        base_df['Director'] = 'Unknown Director'
        base_df['Genre'] = 'Cinema'
        base_df['Poster'] = None

    if 'Review' not in base_df.columns:
        base_df['Review'] = ''

    return base_df


def get_starter_dataset():
    df = pd.DataFrame({
        'Date': pd.date_range(start='2024-01-01', periods=5, freq='W'),
        'Name': ['Nightcrawler', 'The Remains of the Day', 'Zodiac', 'Memories of Murder', 'Drive'],
        'Year': [2014, 1993, 2007, 2003, 2011],
        'Rating': [4.5, 5.0, 4.5, 5.0, 4.0],
        'Director': ['Dan Gilroy', 'James Ivory', 'David Fincher', 'Bong Joon-ho', 'Nicolas Winding Refn'],
        'Genre': ['Crime, Thriller', 'Drama, Romance', 'Crime, Mystery', 'Crime, Drama', 'Crime, Drama'],
        'Review': [''] * 5,
        'Poster': [None] * 5
    })
    df['Decade'] = (df['Year'] // 10 * 10).astype(str) + 's'
    return df