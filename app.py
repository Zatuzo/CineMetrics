# app.py
import streamlit as st
import pandas as pd
from modules.loaders import load_letterboxd_bundle, load_watchlist_data
from views import (
    render_rewind_tab,
    render_mixes_tab,
    render_overview_tab,
    render_habits_tab,
    render_semantic_tab,
)

st.set_page_config(page_title="CineMetrics | Film Diary Engine", layout="wide", page_icon="🎬")

st.title("🎬 CineMetrics — Personal Film Diary & Taste Engine")
st.caption("Deep analytical breakdown of personal viewing logs, director distributions, and monthly rewind summaries.")

# File Uploader
uploaded_files = st.file_uploader(
    "Upload Letterboxd Export Files (`diary.csv`, `ratings.csv`, `reviews.csv`, `watchlist.csv`)", 
    type=['csv'], 
    accept_multiple_files=True
)

df = load_letterboxd_bundle(uploaded_files)
df_watch = load_watchlist_data(uploaded_files)

if df.empty:
    st.info("👋 Upload your Letterboxd CSV bundle to start exploring your personal analytics.")
    st.stop()

# Top KPIs
k1, k2, k3, k4 = st.columns(4)
k1.metric("Total Films Logged", len(df))
k2.metric("Mean Rating", f"★ {df['Rating'].mean():.2f}")
k3.metric("Top Decade", df['Decade'].mode()[0] if not df['Decade'].dropna().empty else "N/A")
top_dir = df[df['Director'] != 'Unknown Director']['Director'].mode()
k4.metric("Top Director", top_dir[0] if not top_dir.empty else "N/A")

st.markdown("---")

# Feature Tabs
tab_rewind, tab_mixes, tab_overview, tab_habits, tab_semantic = st.tabs([
    "📼 Monthly Rewind (Wrapped)",
    "🎧 Cinema Mixes",
    "📊 Profile Overview",
    "📅 Viewing Habits",
    "🔍 Semantic Mood Search"
])

with tab_rewind:
    render_rewind_tab(df)

with tab_mixes:
    render_mixes_tab(df)

with tab_overview:
    render_overview_tab(df)

with tab_habits:
    render_habits_tab(df)

with tab_semantic:
    render_semantic_tab(df_watch)
