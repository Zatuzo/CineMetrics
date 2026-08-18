# scripts/migrate_csv_to_supabase.py
import os
import sys
import pandas as pd

# Add root directory to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Mock streamlit progress for CLI execution
import streamlit as st
class DummyProgress:
    def __init__(self, *args, **kwargs): pass
    def progress(self, val, text=""): 
        pct = int(val * 100)
        sys.stdout.write(f"\r⏳ TMDb Enrichment: {pct}% complete...")
        sys.stdout.flush()
    def empty(self): 
        print("\n✅ TMDb enrichment complete.")

st.progress = lambda val, text="": DummyProgress()

from modules.loaders import load_letterboxd_bundle, load_watchlist_data
from modules.database import get_or_create_user, upsert_movie_record, get_supabase_client

# Access underlying functions if wrapped by Streamlit caching
_load_bundle = getattr(load_letterboxd_bundle, "__wrapped__", load_letterboxd_bundle)
_load_watch = getattr(load_watchlist_data, "__wrapped__", load_watchlist_data)

def run_migration(csv_folder_path):
    csv_folder_path = os.path.abspath(os.path.expanduser(csv_folder_path.strip()))
    print(f"🚀 Starting Letterboxd -> Supabase Migration from: {csv_folder_path}")
    
    if not os.path.exists(csv_folder_path):
        print(f"❌ Directory '{csv_folder_path}' does not exist.")
        return

    # 1. Read files from local directory
    files = []
    for fname in os.listdir(csv_folder_path):
        if fname.lower().endswith(".csv"):
            fpath = os.path.join(csv_folder_path, fname)
            f_obj = open(fpath, "rb")
            files.append(f_obj)
            
    if not files:
        print(f"❌ No CSV files found in '{csv_folder_path}'. Please ensure diary.csv, ratings.csv, or watchlist.csv are present.")
        return

    print(f"📁 Found {len(files)} CSV files: {[os.path.basename(f.name) for f in files]}")

    # 2. Ingest & Enrich
    print("📥 Ingesting and enriching CSV bundle via TMDb...")
    df_logs = _load_bundle(files)
    
    for f in files:
        f.seek(0)
    df_watch = _load_watch(files)

    for f in files:
        f.close()

    try:
        supabase = get_supabase_client()
        user_id = get_or_create_user("zatuzo")
        print(f"👤 Target User ID: {user_id}")
    except Exception as e:
        print(f"❌ Supabase connection error: {e}")
        return

    # 3. Insert Watch Logs
    if not df_logs.empty:
        print(f"\n📦 Migrating {len(df_logs)} viewing logs into public.watch_logs...")
        for idx, row in df_logs.iterrows():
            try:
                movie_id = upsert_movie_record(row.to_dict())
                if not movie_id:
                    continue
                
                watched_at = None
                if pd.notna(row.get("Date")):
                    if hasattr(row["Date"], "date"):
                        watched_at = str(row["Date"].date())
                    else:
                        watched_at = str(row["Date"])[:10]

                log_payload = {
                    "user_id": user_id,
                    "movie_id": movie_id,
                    "rating": float(row["Rating"]) if pd.notna(row.get("Rating")) else None,
                    "review": str(row.get("Review", "")) if pd.notna(row.get("Review")) else "",
                    "watched_at": watched_at
                }
                supabase.table("watch_logs").insert(log_payload).execute()
                print(f"  [{idx+1}/{len(df_logs)}] Logged: {row.get('Name', 'Unknown')}")
            except Exception as err:
                print(f"  ⚠️ Error logging {row.get('Name')}: {err}")
    else:
        print("ℹ️ No diary/ratings logs found to migrate.")

    # 4. Insert Watchlist
    if not df_watch.empty:
        print(f"\n🎯 Migrating {len(df_watch)} unwatched titles to public.watchlists...")
        for idx, row in df_watch.iterrows():
            try:
                movie_id = upsert_movie_record(row.to_dict())
                if not movie_id:
                    continue
                supabase.table("watchlists").upsert({
                    "user_id": user_id,
                    "movie_id": movie_id
                }).execute()
                print(f"  [{idx+1}/{len(df_watch)}] Watchlist: {row.get('Name', 'Unknown')}")
            except Exception as err:
                print(f"  ⚠️ Error adding to watchlist {row.get('Name')}: {err}")

    print("\n🎉 Migration successfully completed! All records are in Supabase.")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        FOLDER_PATH = sys.argv[1]
    else:
        FOLDER_PATH = input("Enter path to your Letterboxd CSV folder: ").strip() or "."
    run_migration(FOLDER_PATH)