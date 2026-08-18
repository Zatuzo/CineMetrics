# scripts/migrate_csv_to_supabase.py
import os
import sys
import pandas as pd
import requests
import time

# Add root directory to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from config import TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE
from modules.database import get_supabase_client, get_or_create_user

def fetch_movie_tmdb(name, year=None):
    """Fetches details from TMDb with fallback."""
    if not TMDB_API_KEY:
        return "Unknown Director", "Cinema", "", None, 110, 10.0
    
    url = f"{TMDB_BASE_URL}/search/movie"
    params = {"api_key": TMDB_API_KEY, "query": name}
    if pd.notna(year):
        params["year"] = int(year)
    
    try:
        r = requests.get(url, params=params, timeout=4).json()
        results = r.get("results", [])
        if not results:
            return "Unknown Director", "Cinema", "", None, 110, 10.0
        
        m = results[0]
        m_id = m["id"]
        overview = m.get("overview", "")
        pop = float(m.get("popularity", 10.0))
        poster = f"{TMDB_IMAGE_BASE}{m['poster_path']}" if m.get("poster_path") else None
        
        # Credits & Runtime
        d_res = requests.get(f"{TMDB_BASE_URL}/movie/{m_id}", params={"api_key": TMDB_API_KEY, "append_to_response": "credits"}, timeout=4).json()
        genres = ", ".join([g["name"] for g in d_res.get("genres", [])]) or "Cinema"
        crew = d_res.get("credits", {}).get("crew", [])
        directors = [c["name"] for c in crew if c.get("job") == "Director"]
        director = ", ".join(directors) if directors else "Unknown Director"
        runtime = d_res.get("runtime") or 110
        
        return director, genres, overview, poster, int(runtime), pop
    except Exception:
        return "Unknown Director", "Cinema", "", None, 110, 10.0


def run_fast_migration(export_dir):
    export_dir = os.path.abspath(os.path.expanduser(export_dir.strip()))
    print(f"📁 Reading Letterboxd export from: {export_dir}")
    supabase = get_supabase_client()
    user_id = get_or_create_user("zatuzo")
    print(f"👤 Supabase User ID: {user_id}\n")

    # 1. Load Core CSVs directly
    diary_p = os.path.join(export_dir, "diary.csv")
    ratings_p = os.path.join(export_dir, "ratings.csv")
    reviews_p = os.path.join(export_dir, "reviews.csv")
    watchlist_p = os.path.join(export_dir, "watchlist.csv")

    diary_df = pd.read_csv(diary_p) if os.path.exists(diary_p) else pd.DataFrame()
    ratings_df = pd.read_csv(ratings_p) if os.path.exists(ratings_p) else pd.DataFrame()
    reviews_df = pd.read_csv(reviews_p) if os.path.exists(reviews_p) else pd.DataFrame()
    watchlist_df = pd.read_csv(watchlist_p) if os.path.exists(watchlist_p) else pd.DataFrame()

    # Base selection
    if not diary_df.empty:
        base = diary_df.copy()
        date_col = 'Watched Date' if 'Watched Date' in base.columns else 'Date'
        base['Date'] = pd.to_datetime(base[date_col], errors='coerce')
    elif not ratings_df.empty:
        base = ratings_df.copy()
        base['Date'] = pd.to_datetime(base['Date'], errors='coerce')
    else:
        print("❌ Could not find diary.csv or ratings.csv in the folder.")
        return

    # Merge Reviews
    if not reviews_df.empty and 'Review' in reviews_df.columns:
        r_sub = reviews_df[['Name', 'Year', 'Review']].dropna(subset=['Review'])
        base = pd.merge(base, r_sub, on=['Name', 'Year'], how='left')

    # Merge Ratings if missing
    if 'Rating' not in base.columns and not ratings_df.empty:
        rat_sub = ratings_df[['Name', 'Year', 'Rating']]
        base = pd.merge(base, rat_sub, on=['Name', 'Year'], how='left')

    base['Review'] = base['Review'].fillna('') if 'Review' in base.columns else ''
    base['Year'] = pd.to_numeric(base['Year'], errors='coerce')
    base = base.drop_duplicates(subset=['Name', 'Year']).reset_index(drop=True)

    print(f"🎬 Found {len(base)} unique logged films. Starting ingestion into Supabase...")

    # 2. Ingest Movies & Logs
    for i, row in base.iterrows():
        name = row['Name']
        year = int(row['Year']) if pd.notna(row.get('Year')) else None
        
        # Check if movie exists in Supabase
        q = supabase.table("movies").select("id").eq("title", name)
        if year:
            q = q.eq("release_year", year)
        res = q.execute()

        if res.data:
            movie_id = res.data[0]["id"]
        else:
            # Fetch from TMDb
            d, g, o, p, rt, pop = fetch_movie_tmdb(name, year)
            m_res = supabase.table("movies").insert({
                "title": name,
                "release_year": year,
                "director": d,
                "genres": g,
                "runtime_minutes": rt,
                "popularity": pop,
                "overview": o,
                "poster_url": p
            }).execute()
            movie_id = m_res.data[0]["id"]

        # Insert watch log
        w_date = str(row['Date'].date()) if pd.notna(row.get('Date')) else None
        rating_val = float(row['Rating']) if pd.notna(row.get('Rating')) else None
        
        supabase.table("watch_logs").insert({
            "user_id": user_id,
            "movie_id": movie_id,
            "rating": rating_val,
            "review": str(row.get('Review', '')),
            "watched_at": w_date
        }).execute()

        print(f"  [{i+1}/{len(base)}] Added: {name} ({year or 'N/A'})")
        time.sleep(0.05)

    # 3. Ingest Watchlist
    if not watchlist_df.empty:
        print(f"\n🎯 Ingesting {len(watchlist_df)} Watchlist titles...")
        for idx, row in watchlist_df.iterrows():
            w_name = row['Name']
            w_year = int(row['Year']) if pd.notna(row.get('Year')) else None
            
            q = supabase.table("movies").select("id").eq("title", w_name)
            if w_year:
                q = q.eq("release_year", w_year)
            w_res = q.execute()

            if w_res.data:
                w_movie_id = w_res.data[0]["id"]
            else:
                d, g, o, p, rt, pop = fetch_movie_tmdb(w_name, w_year)
                ins = supabase.table("movies").insert({
                    "title": w_name,
                    "release_year": w_year,
                    "director": d,
                    "genres": g,
                    "runtime_minutes": rt,
                    "popularity": pop,
                    "overview": o,
                    "poster_url": p
                }).execute()
                w_movie_id = ins.data[0]["id"]

            existing_w = supabase.table("watchlists").select("movie_id").eq("user_id", user_id).eq("movie_id", w_movie_id).execute()
            if not existing_w.data:
                supabase.table("watchlists").insert({
                    "user_id": user_id,
                    "movie_id": w_movie_id
                }).execute()
            print(f"  [{idx+1}/{len(watchlist_df)}] Watchlist: {w_name}")
            time.sleep(0.05)

    print("\n✅ Supabase migration complete! Refresh your Supabase Table Editor to verify.")

if __name__ == "__main__":
    default_path = "/Users/zatuzo/Downloads/letterboxd"
    if len(sys.argv) > 1:
        target = sys.argv[1]
    else:
        target = input(f"Enter path [{default_path}]: ").strip() or default_path
    run_fast_migration(target)