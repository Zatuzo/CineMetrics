# data_pipeline.py
import io
import requests
import numpy as np
import pandas as pd
from PIL import Image, ImageDraw, ImageFont
import streamlit as st
from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

TMDB_API_KEY = "76a327a724de6563297b5a4d68a6fcc4"

@st.cache_data(show_spinner=False)
def fetch_tmdb_metadata(movie_name, year=None):
    """Fetches Director, Genres, Overview Synopsis, Poster URL, and Runtime."""
    if not TMDB_API_KEY:
        return "Unknown Director", "Cinema", "", None, 110
    
    url = "https://api.themoviedb.org/3/search/movie"
    params = {"api_key": TMDB_API_KEY, "query": movie_name}
    if pd.notna(year):
        params["year"] = int(year)
        
    try:
        r = requests.get(url, params=params, timeout=5).json()
        results = r.get("results", [])
        if not results:
            return "Unknown Director", "Cinema", "", None, 110
            
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
        runtime = detail_res.get("runtime") or 110
        
        return director, genres, overview, poster_url, int(runtime)
    except Exception:
        return "Unknown Director", "Cinema", "", None, 110


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


@st.cache_data(show_spinner="Processing Letterboxd logs...")
def load_letterboxd_bundle(uploaded_files=None):
    if not uploaded_files:
        return pd.DataFrame()
    
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
        directors, genres, overviews, posters, runtimes = [], [], [], [], []
        prog = st.progress(0, text="Syncing metadata, runtimes & synopses from TMDb...")
        total = len(base_df)
        
        for i, row in base_df.iterrows():
            d, g, o, p, r = fetch_tmdb_metadata(row['Name'], row.get('Year'))
            directors.append(d)
            genres.append(g)
            overviews.append(o)
            posters.append(p)
            runtimes.append(r)
            prog.progress((i + 1) / total)
            
        prog.empty()
        base_df['Director'] = directors
        base_df['Genre'] = genres
        base_df['Overview'] = overviews
        base_df['Poster'] = posters
        base_df['Runtime'] = runtimes
    else:
        base_df['Director'] = 'Unknown Director'
        base_df['Genre'] = 'Cinema'
        base_df['Overview'] = ''
        base_df['Poster'] = None
        base_df['Runtime'] = 110

    if 'Review' not in base_df.columns:
        base_df['Review'] = ''
    base_df['Review'] = base_df['Review'].fillna('')

    # Review NLP Sentiment Score
    base_df['Sentiment_Polarity'] = base_df['Review'].apply(
        lambda x: TextBlob(str(x)).sentiment.polarity if str(x).strip() else 0.0
    )

    return base_df


@st.cache_data(show_spinner="Processing Letterboxd watchlist...")
def load_watchlist_data(uploaded_files=None):
    if not uploaded_files:
        return pd.DataFrame()
    
    watchlist_file = next((f for f in uploaded_files if 'watchlist' in f.name.lower()), None)
    if not watchlist_file:
        return pd.DataFrame()
        
    df_watch = safe_read_csv(watchlist_file)
    if df_watch.empty:
        return pd.DataFrame()
    df_watch['Year'] = pd.to_numeric(df_watch['Year'], errors='coerce')
    
    if TMDB_API_KEY:
        directors, genres, overviews, posters = [], [], [], []
        for _, row in df_watch.iterrows():
            d, g, o, p, _ = fetch_tmdb_metadata(row['Name'], row.get('Year'))
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


def get_cinematic_persona(monthly_df):
    """Calculates a Spotify-style Cinema Persona based on monthly viewing genres and decade."""
    if monthly_df.empty:
        return "Cinematic Explorer"
    
    all_genres = [
        g.strip() 
        for sublist in monthly_df['Genre'].dropna().str.split(',') 
        for g in sublist 
        if g.strip() and g.strip() != 'Cinema'
    ]
    top_genre = pd.Series(all_genres).mode()
    genre_str = top_genre[0] if not top_genre.empty else "Cinema"
    
    dec_mode = monthly_df['Decade'].mode()
    decade_str = dec_mode[0] if not dec_mode.empty else ""
    
    genre_titles = {
        'Crime': 'Gritty Crime Specialist',
        'Thriller': 'Suspense & Neo-Noir Devotee',
        'Mystery': 'Enigmatic Mystery Seeker',
        'Drama': 'Introspective Drama Purist',
        'Science Fiction': 'Futuristic Sci-Fi Visionary',
        'Sci-Fi': 'Futuristic Sci-Fi Visionary',
        'Action': 'High-Octane Adrenaline Junkie',
        'Comedy': 'Feel-Good Comedy Enthusiast',
        'Horror': 'Midnight Horror Aficionado',
        'Romance': 'Hopeless Romantic Cinephile',
        'Animation': 'Whimsical Animation Explorer',
        'Adventure': 'Epic Quest Adventurer',
        'Fantasy': 'Mythic World Dreamer',
        'Documentary': 'Realist Truth Seeker'
    }
    
    persona = genre_titles.get(genre_str, f"{genre_str} Connoisseur")
    if decade_str and decade_str not in ['N/As', 'nan', '']:
        return f"{decade_str} {persona}"
    return persona


def generate_instagram_story_card(month_str, monthly_df):
    """
    Generates a 1080x1920 (9:16) Spotify-Wrapped-style Instagram Story card
    for a given month of Letterboxd viewing history.
    """
    W, H = 1080, 1920
    img = Image.new('RGB', (W, H), color=(11, 15, 25))
    draw = ImageDraw.Draw(img)
    
    # Vertical gradient
    for y in range(H):
        r = int(11 + (y / H) * 16)
        g = int(15 + (y / H) * 14)
        b = int(25 + (y / H) * 22)
        draw.line([(0, y), (W, y)], fill=(r, g, b))
        
    # Card outer border glow
    draw.rounded_rectangle([35, 35, W - 35, H - 35], radius=36, outline=(56, 189, 248), width=3)
    
    # Safe font loader
    def get_font(size, bold=False):
        font_names = [
            "/System/Library/Fonts/Helvetica.ttc",
            "/System/Library/Fonts/SFProText-Bold.otf" if bold else "/System/Library/Fonts/SFProText-Regular.otf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "Arial-Bold.ttf" if bold else "Arial.ttf"
        ]
        for fn in font_names:
            try:
                return ImageFont.truetype(fn, size)
            except Exception:
                continue
        return ImageFont.load_default()

    font_pill = get_font(24, bold=True)
    font_title = get_font(60, bold=True)
    font_persona = get_font(34, bold=True)
    font_kpi_num = get_font(48, bold=True)
    font_kpi_label = get_font(22, bold=False)
    font_sec_head = get_font(30, bold=True)
    font_film_title = get_font(22, bold=True)
    font_film_sub = get_font(18, bold=False)
    font_text = get_font(24, bold=False)
    font_footer = get_font(20, bold=False)

    # 1. Header Pill & Title
    draw.rounded_rectangle([70, 75, 480, 125], radius=25, fill=(30, 41, 59), outline=(56, 189, 248), width=1)
    draw.text((95, 87), "🎬 CINEMETRICS REWIND", font=font_pill, fill=(56, 189, 248))
    
    # Month Title (e.g. OCTOBER 2024)
    draw.text((70, 150), month_str.upper(), font=font_title, fill=(255, 255, 255))
    
    # Persona Badge
    persona = get_cinematic_persona(monthly_df)
    draw.text((70, 235), f"✨ {persona}", font=font_persona, fill=(245, 158, 11))
    
    # 2. KPI Cards Row (3 Cards)
    total_films = len(monthly_df)
    total_mins = monthly_df['Runtime'].sum() if 'Runtime' in monthly_df.columns else total_films * 110
    total_hours = total_mins / 60.0
    mean_rating = monthly_df['Rating'].mean()
    rating_str = f"★ {mean_rating:.2f}" if pd.notna(mean_rating) else "★ N/A"

    kpis = [
        ("WATCH TIME", f"{total_hours:.1f} hrs", (56, 189, 248)),
        ("FILMS LOGGED", f"{total_films}", (245, 158, 11)),
        ("AVG RATING", rating_str, (16, 185, 129))
    ]
    
    card_w = 290
    card_gap = 35
    start_x = 70
    kpi_y = 305
    kpi_h = 150
    
    for i, (label, val, color) in enumerate(kpis):
        cx = start_x + i * (card_w + card_gap)
        draw.rounded_rectangle([cx, kpi_y, cx + card_w, kpi_y + kpi_h], radius=20, fill=(21, 29, 45), outline=(51, 65, 85), width=2)
        draw.text((cx + 25, kpi_y + 22), label, font=font_kpi_label, fill=(148, 163, 184))
        draw.text((cx + 25, kpi_y + 65), val, font=font_kpi_num, fill=color)

    # 3. Top Films Spotlight (Top 3 with Posters)
    draw.text((70, 495), "👑 TOP FILMS OF THE MONTH", font=font_sec_head, fill=(255, 255, 255))
    
    top_films = monthly_df.sort_values(by=['Rating', 'Name'], ascending=[False, True]).head(3)
    poster_w, poster_h = 290, 420
    poster_y = 550
    
    for i, (_, film) in enumerate(top_films.iterrows()):
        px = start_x + i * (poster_w + card_gap)
        
        poster_url = film.get('Poster')
        posted = False
        if poster_url:
            try:
                r = requests.get(poster_url, timeout=3)
                p_img = Image.open(io.BytesIO(r.content)).convert('RGB')
                p_img = p_img.resize((poster_w, poster_h), Image.Resampling.LANCZOS)
                img.paste(p_img, (px, poster_y))
                posted = True
            except Exception:
                posted = False
                
        if not posted:
            draw.rounded_rectangle([px, poster_y, px + poster_w, poster_y + poster_h], radius=16, fill=(30, 41, 59))
            draw.text((px + 40, poster_y + 190), "🎬 No Poster", font=font_film_title, fill=(148, 163, 184))
            
        # Rating badge overlay on top-left of poster
        r_val = film.get('Rating')
        r_txt = f"★ {r_val:.1f}" if pd.notna(r_val) else "Watched"
        draw.rounded_rectangle([px + 12, poster_y + 12, px + 125, poster_y + 52], radius=12, fill=(15, 23, 42), outline=(245, 158, 11), width=1)
        draw.text((px + 24, poster_y + 20), r_txt, font=font_film_sub, fill=(245, 158, 11))
        
        # Title text underneath
        name_txt = str(film['Name'])
        if len(name_txt) > 22:
            name_txt = name_txt[:20] + "..."
        year_txt = f"({int(film['Year'])})" if pd.notna(film.get('Year')) else ""
        draw.text((px, poster_y + poster_h + 15), name_txt, font=font_film_title, fill=(255, 255, 255))
        draw.text((px, poster_y + poster_h + 45), year_txt, font=font_film_sub, fill=(148, 163, 184))

    # 4. Top Directors & Top Genres Leaderboards
    sec2_y = 1100
    draw.rounded_rectangle([70, sec2_y, 520, sec2_y + 460], radius=24, fill=(21, 29, 45), outline=(51, 65, 85), width=2)
    draw.text((100, sec2_y + 25), "🏆 TOP DIRECTORS", font=font_sec_head, fill=(56, 189, 248))
    
    top_dirs = monthly_df[monthly_df['Director'] != 'Unknown Director']['Director'].value_counts().head(5)
    dy = sec2_y + 85
    if not top_dirs.empty:
        for rank, (dir_name, count) in enumerate(top_dirs.items(), 1):
            d_label = dir_name if len(dir_name) <= 16 else dir_name[:14] + ".."
            draw.text((100, dy), f"{rank}. {d_label}", font=font_text, fill=(255, 255, 255))
            draw.text((440, dy), f"{count} films", font=font_text, fill=(245, 158, 11))
            dy += 65
    else:
        draw.text((100, dy), "Various Directors", font=font_text, fill=(148, 163, 184))

    # Top Genres Card
    draw.rounded_rectangle([560, sec2_y, 1010, sec2_y + 460], radius=24, fill=(21, 29, 45), outline=(51, 65, 85), width=2)
    draw.text((590, sec2_y + 25), "🎭 TOP GENRES", font=font_sec_head, fill=(16, 185, 129))
    
    all_g = [
        g.strip() 
        for sublist in monthly_df['Genre'].dropna().str.split(',') 
        for g in sublist 
        if g.strip() and g.strip() != 'Cinema'
    ]
    top_g = pd.Series(all_g).value_counts().head(5)
    gy = sec2_y + 85
    if not top_g.empty:
        for rank, (g_name, count) in enumerate(top_g.items(), 1):
            pct = int((count / len(monthly_df)) * 100)
            g_label = g_name if len(g_name) <= 16 else g_name[:14] + ".."
            draw.text((590, gy), f"{rank}. {g_label}", font=font_text, fill=(255, 255, 255))
            draw.text((920, gy), f"{pct}%", font=font_text, fill=(16, 185, 129))
            gy += 65
    else:
        draw.text((590, gy), "Various Genres", font=font_text, fill=(148, 163, 184))

    # 5. Footer Watermark
    footer_y = 1800
    draw.line([(70, footer_y - 25), (1010, footer_y - 25)], fill=(51, 65, 85), width=1)
    draw.text((70, footer_y), "CINEMETRICS 🎬 Personal Film Diary & Taste Engine", font=font_footer, fill=(148, 163, 184))
    draw.text((770, footer_y), "Letterboxd Analytics", font=font_footer, fill=(56, 189, 248))
    
    return img