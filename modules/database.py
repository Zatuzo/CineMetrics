# modules/database.py
import os
import pandas as pd
from datetime import datetime
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY
from textblob import TextBlob

_supabase: Client = None

DEFAULT_COLUMNS = [
    'Name', 'Year', 'Watched Date', 'Date', 'Rating', 'Review', 
    'Director', 'Genre', 'Overview', 'Poster', 'Runtime', 'Decade', 
    'Letterboxd URI', 'Day_of_Week', 'Month_Year', 'Sentiment_Polarity'
]

def get_supabase_client() -> Client:
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in config.py")
        _supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    return _supabase

def get_or_create_user(username: str = "zatuzo") -> str:
    supabase = get_supabase_client()
    try:
        res = supabase.table("users").select("*").eq("username", username).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]["id"]
        insert_res = supabase.table("users").insert({"username": username}).execute()
        if insert_res.data and len(insert_res.data) > 0:
            return insert_res.data[0]["id"]
    except Exception:
        try:
            res = supabase.table("profiles").select("*").eq("username", username).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]["id"]
            insert_res = supabase.table("profiles").insert({"username": username}).execute()
            if insert_res.data and len(insert_res.data) > 0:
                return insert_res.data[0]["id"]
        except Exception:
            pass

    return username

def upsert_movie_record(movie_dict: dict):
    supabase = get_supabase_client()
    name = str(movie_dict.get("Name", "Untitled")).strip()
    year = movie_dict.get("Year")
    if pd.notna(year):
        try:
            year = int(year)
        except:
            year = None
    else:
        year = None

    director = movie_dict.get("Director")
    director = str(director).strip() if pd.notna(director) and str(director).strip() not in ['Unknown Director', 'Auteur'] else None

    genre = movie_dict.get("Genre")
    genre = str(genre).strip() if pd.notna(genre) else "Cinema"

    overview = movie_dict.get("Overview")
    overview = str(overview).strip() if pd.notna(overview) else ""

    poster = movie_dict.get("Poster")
    poster = str(poster).strip() if pd.notna(poster) and poster else None

    runtime = movie_dict.get("Runtime")
    if pd.notna(runtime):
        try:
            runtime = int(runtime)
        except:
            runtime = 110
    else:
        runtime = 110

    decade = movie_dict.get("Decade")
    decade = str(decade).strip() if pd.notna(decade) else None

    letterboxd_uri = movie_dict.get("Letterboxd URI")
    letterboxd_uri = str(letterboxd_uri).strip() if pd.notna(letterboxd_uri) else None

    movie_payload = {
        "name": name,
        "year": year,
        "director": director,
        "genre": genre,
        "overview": overview,
        "poster": poster,
        "runtime": runtime,
        "decade": decade,
        "letterboxd_uri": letterboxd_uri
    }

    try:
        query = supabase.table("movies").select("id").eq("name", name)
        if year:
            query = query.eq("year", year)
        existing = query.execute()

        if existing.data and len(existing.data) > 0:
            movie_id = existing.data[0]["id"]
            supabase.table("movies").update(movie_payload).eq("id", movie_id).execute()
            return movie_id
        else:
            insert_res = supabase.table("movies").insert(movie_payload).execute()
            if insert_res.data and len(insert_res.data) > 0:
                return insert_res.data[0]["id"]
    except Exception as e:
        print(f"Error in upsert_movie_record for {name}: {e}")
        raise e

    return None

def fetch_user_watch_logs(username: str = "zatuzo") -> pd.DataFrame:
    """Fetches persistent watch logs and joined movie metadata from Supabase."""
    try:
        supabase = get_supabase_client()
        user_id = get_or_create_user(username)
        
        # Try fetching with user_id filter or all watch_logs
        try:
            res = supabase.table("watch_logs").select("*, movies(*)").eq("user_id", user_id).order("watched_at", desc=True).execute()
        except Exception:
            res = supabase.table("watch_logs").select("*, movies(*)").execute()

        if not res.data:
            return pd.DataFrame(columns=DEFAULT_COLUMNS)

        records = []
        for row in res.data:
            movie = row.get("movies") or {}
            watched_at_str = row.get("watched_at") or row.get("created_at") or ""
            
            record = {
                "Name": movie.get("name", "Untitled"),
                "Year": movie.get("year"),
                "Watched Date": watched_at_str,
                "Date": pd.to_datetime(watched_at_str, errors='coerce'),
                "Rating": row.get("rating"),
                "Review": row.get("review", "") or "",
                "Director": movie.get("director") or "Unknown Director",
                "Genre": movie.get("genre") or "Cinema",
                "Overview": movie.get("overview") or "",
                "Poster": movie.get("poster"),
                "Runtime": movie.get("runtime") or 110,
                "Decade": movie.get("decade") or (f"{int(movie.get('year')) // 10 * 10}s" if movie.get("year") else "N/A"),
                "Letterboxd URI": movie.get("letterboxd_uri")
            }
            records.append(record)

        df = pd.DataFrame(records)
        df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')
        df['Year'] = pd.to_numeric(df['Year'], errors='coerce')
        df['Day_of_Week'] = df['Date'].dt.day_name()
        df['Month_Year'] = df['Date'].dt.to_period('M').astype(str)
        df['Sentiment_Polarity'] = df['Review'].apply(
            lambda x: TextBlob(str(x)).sentiment.polarity if str(x).strip() else 0.0
        )
        return df
    except Exception as e:
        print(f"Error fetching watch logs from Supabase: {e}")
        return pd.DataFrame(columns=DEFAULT_COLUMNS)

def fetch_user_watchlist(username: str = "zatuzo") -> pd.DataFrame:
    """Fetches persistent watchlist titles and joined movie metadata from Supabase."""
    try:
        supabase = get_supabase_client()
        user_id = get_or_create_user(username)
        
        try:
            res = supabase.table("watchlists").select("*, movies(*)").eq("user_id", user_id).execute()
        except Exception:
            res = supabase.table("watchlists").select("*, movies(*)").execute()

        if not res.data:
            return pd.DataFrame(columns=['Name', 'Year', 'Director', 'Genre', 'Overview', 'Poster'])

        records = []
        for row in res.data:
            movie = row.get("movies") or {}
            records.append({
                "Name": movie.get("name", "Untitled"),
                "Year": movie.get("year"),
                "Director": movie.get("director") or "Unknown",
                "Genre": movie.get("genre") or "Cinema",
                "Overview": movie.get("overview") or "",
                "Poster": movie.get("poster")
            })

        df = pd.DataFrame(records)
        df['Year'] = pd.to_numeric(df['Year'], errors='coerce')
        return df
    except Exception as e:
        print(f"Error fetching watchlist from Supabase: {e}")
        return pd.DataFrame(columns=['Name', 'Year', 'Director', 'Genre', 'Overview', 'Poster'])

def save_watch_log(username: str = "zatuzo", movie_data: dict = None, rating: float = None, review: str = "", watched_at: str = None) -> bool:
    """Saves or quick-logs a film to Supabase."""
    try:
        supabase = get_supabase_client()
        user_id = get_or_create_user(username)
        movie_id = upsert_movie_record(movie_data)
        
        if not movie_id:
            return False

        if not watched_at:
            watched_at = datetime.now().strftime("%Y-%m-%d")

        log_payload = {
            "user_id": user_id,
            "movie_id": movie_id,
            "rating": rating,
            "review": review or "",
            "watched_at": watched_at
        }
        supabase.table("watch_logs").insert(log_payload).execute()
        return True
    except Exception as e:
        print(f"Error saving watch log to Supabase: {e}")
        return False
