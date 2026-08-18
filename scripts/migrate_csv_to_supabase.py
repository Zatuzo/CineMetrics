# scripts/migrate_csv_to_supabase.py
import os
import sys
import pandas as pd
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

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
        r = requests.get(url, params=params, timeout=5).json()
        results = r.get("results", [])
        if not results:
            return "Unknown Director", "Cinema", "", None, 110, 10.0
        
        m = results[0]
        m_id = m["id"]
        overview = m.get("overview", "")
        pop = float(m.get("popularity", 10.0))
        poster = f"{TMDB_IMAGE_BASE}{m['poster_path']}" if m.get("poster_path") else None
        
        d_res = requests.get(f"{TMDB_BASE_URL}/movie/{m_id}", params={"api_key": TMDB_API_KEY, "append_to_response": "credits"}, timeout=5).json()
        genres = ", ".join([g["name"] for g in d_res.get("genres", [])]) or "Cinema"
        crew = d_res.get("credits", {}).get("crew", [])
        directors = [c["name"] for c in crew if c.get("job") == "Director"]
        director = ", ".join(directors) if directors else "Unknown Director"
        runtime = d_res.get("runtime") or 110
        
        return director, genres, overview, poster, int(runtime), pop
    except Exception:
        return "Unknown Director", "Cinema", "", None, 110, 10.0

def process_and_upload_film(supabase, user_id, row):
    """Worker task: Enriches and inserts a single film + log entry."""
    name = row['Name']
    year = int(row['Year']) if pd.notna(row.get('Year')) else None
    
    # 1. Check or insert movie
    q = supabase.table("movies").select("id").eq("title", name)
    if year:
        q = q.eq("release_year", year)
    res = q.execute()

    if res.data:
        movie_id = res.data[0]["id"]
    else:
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

    # 2. Insert watch log
    w_date = str(row['Date'].date()) if pd.notna(row.get('Date')) else None
    rating_val = float(row['Rating']) if pd.notna(row.get('Rating')) else None
    
    supabase.table("watch_logs").insert({
        "user_id": user_id,
        "movie_id": movie_id,
        "rating": rating_val,
        "review": str(row.get('Review', '')),
        "watched_at": w_date
    }).execute()

    return name

def run_fast_migration(export_dir):
    export_dir = os.path.abspath(os.path.expanduser(export_dir.strip()))
    print(f"📁 Reading Letterboxd export from: {export_dir}")
    supabase = get_supabase_client()
    user_id = get_or_create_user("zatuzo")
    print(f"👤 Target Supabase User ID: {user_id}\n")

    # Load CSVs
    diary_p = os.path.join(export_dir, "diary.csv")
    ratings_p = os.path.join(export_dir, "ratings.csv")
    reviews_p = os.path.join(export_dir, "reviews.csv")
    watchlist_p = os.path.join(export_dir, "watchlist.csv")

    diary_df = pd.read_csv(diary_p) if os.path.exists(diary_p) else pd.DataFrame()
    ratings_df = pd.read_csv(ratings_p) if os.path.exists(ratings_p) else pd.DataFrame()
    reviews_df = pd.read_csv(reviews_p) if os.path.exists(reviews_p) else pd.DataFrame()
    watchlist_df = pd.read_csv(watchlist_p) if os.path.exists(watchlist_p) else pd.DataFrame()

    if not diary_df.empty:
        base = diary_df.copy()
        date_col = 'Watched Date' if 'Watched Date' in base.columns else 'Date'
        base['Date'] = pd.to_datetime(base[date_col], errors='coerce')
    elif not ratings_df.empty:
        base = ratings_df.copy()
        base['Date'] = pd.to_datetime(base['Date'], errors='coerce')
    else:
        print("❌ No diary.csv or ratings.csv found.")
        return

    if not reviews_df.empty and 'Review' in reviews_df.columns:
        r_sub = reviews_df[['Name', 'Year', 'Review']].dropna(subset=['Review'])
        base = pd.merge(base, r_sub, on=['Name', 'Year'], how='left')

    if 'Rating' not in base.columns and not ratings_df.empty:
        rat_sub = ratings_df[['Name', 'Year', 'Rating']]
        base = pd.merge(base, rat_sub, on=['Name', 'Year'], how='left')

    base['Review'] = base['Review'].fillna('') if 'Review' in base.columns else ''
    base['Year'] = pd.to_numeric(base['Year'], errors='coerce')
    base = base.drop_duplicates(subset=['Name', 'Year']).reset_index(drop=True)

    print(f"🎬 Ingesting {len(base)} movies concurrently across 10 threads...")

    # Multi-threaded execution for Watch Logs
    completed = 0
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(process_and_upload_film, supabase, user_id, row) 
            for _, row in base.iterrows()
        ]
        for f in as_completed(futures):
            completed += 1
            print(f"  ⚡ [{completed}/{len(base)}] Done: {f.result()}")

    # Ingest Watchlist concurrently
    if not watchlist_df.empty:
        print(f"\n🎯 Ingesting {len(watchlist_df)} Watchlist titles...")
        def process_watchlist_item(row):
            w_name = row['Name']
            w_year = int(row['Year']) if pd.notna(row.get('Year')) else None
            q = supabase.table("movies").select("id").eq("title", w_name)
            if w_year:
                q = q.eq("release_year", w_year)
            w_res = q.execute()
            if w_res.data:
                mid = w_res.data[0]["id"]
            else:
                d, g, o, p, rt, pop = fetch_movie_tmdb(w_name, w_year)
                ins = supabase.table("movies").insert({
                    "title": w_name, "release_year": w_year, "director": d, 
                    "genres": g, "runtime_minutes": rt, "popularity": pop, 
                    "overview": o, "poster_url": p
                }).execute()
                mid = ins.data[0]["id"]
            
            existing_w = supabase.table("watchlists").select("movie_id").eq("user_id", user_id).eq("movie_id", mid).execute()
            if not existing_w.data:
                supabase.table("watchlists").insert({"user_id": user_id, "movie_id": mid}).execute()
            return w_name

        with ThreadPoolExecutor(max_workers=10) as executor:
            w_futures = [executor.submit(process_watchlist_item, r) for _, r in watchlist_df.iterrows()]
            for f in as_completed(w_futures):
                print(f"  📌 Watchlist queued: {f.result()}")

    print("\n✅ Migration complete! Your Supabase database is fully synced.")

if __name__ == "__main__":
    default_path = "/Users/zatuzo/Downloads/letterboxd"
    if len(sys.argv) > 1:
        target = sys.argv[1]
    else:
        target = input(f"Enter path [{default_path}]: ").strip() or default_path
    run_fast_migration(target)