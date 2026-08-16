import streamlit as st
import plotly.express as px
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from data_pipeline import load_letterboxd_bundle, load_watchlist_data

# Page Setup
st.set_page_config(page_title="CineMetrics | Film Diary Engine", layout="wide", page_icon="🎬")

st.title("🎬 CineMetrics — Personal Film Diary & Taste Engine")
st.caption("Deep analytical breakdown of personal viewing logs, director distributions, and rating profiles.")

# Multi-file uploader component
uploaded_files = st.file_uploader(
    "Upload Letterboxd Bundle (`diary.csv`, `ratings.csv`, `reviews.csv`, `watchlist.csv`)", 
    type=['csv'], 
    accept_multiple_files=True,
    help="Select and drop multiple CSV files at once from your extracted Letterboxd export folder."
)

# Load data (falls back to starter dataset if no files are uploaded)
df = load_letterboxd_bundle(uploaded_files)
df_watch = load_watchlist_data(uploaded_files)

if uploaded_files:
    st.success(f"Successfully processed and merged {len(uploaded_files)} file(s): {[f.name for f in uploaded_files]}")

# Only show analytics if we have data
if not df.empty:
    st.markdown("---")
    
    # Top KPIs
    k1, k2, k3, k4 = st.columns(4)
    k1.metric("Total Films Logged", len(df))
    
    mean_rating = df['Rating'].mean()
    k2.metric("Mean Rating", f"★ {mean_rating:.2f}" if not pd.isna(mean_rating) else "N/A")
    
    top_decade = df['Decade'].mode()
    k3.metric("Top Decade", top_decade[0] if not top_decade.empty else "N/A")
    
    top_director = df['Director'].mode()
    k4.metric("Top Director", top_director[0] if not top_director.empty else "N/A")

    st.markdown("---")

    # Visual Analytics Charts
    col_left, col_right = st.columns([1, 1])

    with col_left:
        st.subheader("📊 Viewing Distribution by Decade")
        decade_counts = df['Decade'].value_counts().sort_index().reset_index()
        decade_counts.columns = ['Decade', 'Count']
        fig_dec = px.bar(decade_counts, x='Decade', y='Count', color_discrete_sequence=['#38bdf8'])
        fig_dec.update_layout(height=350, margin=dict(l=10, r=10, t=20, b=10))
        st.plotly_chart(fig_dec, use_container_width=True)

    with col_right:
        st.subheader("🎥 Top Directors by Volume & Rating")
        # Filter out unknown or placeholder directors if needed, but keeping simple for now
        dir_summary = df.groupby('Director').agg(
            Film_Count=('Name', 'count'),
            Avg_Rating=('Rating', 'mean')
        ).reset_index().sort_values(by='Film_Count', ascending=False).head(8)
        
        fig_dir = px.bar(
            dir_summary, 
            x='Director', 
            y='Film_Count', 
            color='Avg_Rating',
            color_continuous_scale='Viridis',
            labels={'Avg_Rating': 'Mean ★'}
        )
        fig_dir.update_layout(height=350, margin=dict(l=10, r=10, t=20, b=10))
        st.plotly_chart(fig_dir, use_container_width=True)

# ----------------------------------------------------
# SMART WATCHLIST RECOMMENDER
# ----------------------------------------------------
st.markdown("---")
st.subheader("🎯 Watchlist Matchmaker")

if df_watch.empty:
    st.info("💡 Upload your `watchlist.csv` file to enable smart un-watched film recommendations.")
else:
    st.caption(f"Scoring **{len(df_watch)}** unwatched films against your top-rated cinema profile.")
    
    # User selects a benchmark 5-star / favorite film
    top_films = df[df['Rating'] >= 4.0]['Name'].unique()
    if len(top_films) == 0:
        top_films = df['Name'].unique()
        
    selected_favorite = st.selectbox("Pick a favorite film you love:", top_films)
    
    if selected_favorite:
        # Build feature strings
        df_watched_calc = df.copy()
        df_watched_calc['features'] = df_watched_calc['Director'].fillna('') + " " + df_watched_calc['Genre'].fillna('')
        
        df_watch_calc = df_watch.copy()
        df_watch_calc['features'] = df_watch_calc['Director'].fillna('') + " " + df_watch_calc['Genre'].fillna('')
        
        # Fit vectorizer across all known film text
        all_features = pd.concat([df_watched_calc['features'], df_watch_calc['features']])
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf.fit(all_features)
        
        fav_vec = tfidf.transform([df_watched_calc[df_watched_calc['Name'] == selected_favorite]['features'].iloc[0]])
        watchlist_vecs = tfidf.transform(df_watch_calc['features'])
        
        sim_scores = cosine_similarity(fav_vec, watchlist_vecs)[0]
        df_watch_calc['match_score'] = (sim_scores * 100).round(1)
        
        # Top 4 recommendations from watchlist
        recs = df_watch_calc.sort_values(by='match_score', ascending=False).head(4)
        
        st.write(f"Top picks from your watchlist matching the style of **{selected_favorite}**:")
        
        cols = st.columns(4)
        for idx, (_, movie) in enumerate(recs.iterrows()):
            with cols[idx]:
                if movie['Poster']:
                    st.image(movie['Poster'], use_container_width=True)
                st.markdown(f"**{movie['Name']}** ({int(movie['Year']) if pd.notna(movie['Year']) else 'N/A'})")
                st.caption(f"🎬 {movie['Director']}\n\n🏷️ {movie['Genre']}")
                st.metric("Taste Match", f"{movie['match_score']}%")

    # ----------------------------------------------------
    # Recommendation Vector Engine Section
    # ----------------------------------------------------
    st.markdown("---")
    st.subheader("🎯 Recommendation Vector Engine")
    st.caption("Finds films from your log with the closest stylistic and thematic similarity.")

    selected_movie = st.selectbox("Pick a benchmark film from your history:", df['Name'].unique())

    if selected_movie:
        # Combine Director + Genres into a single feature vector string
        df_calc = df.copy()
        df_calc['features'] = df_calc['Director'].fillna('') + " " + df_calc['Genre'].fillna('')
        
        tfidf = TfidfVectorizer(stop_words='english')
        tfidf_matrix = tfidf.fit_transform(df_calc['features'])
        
        target_idx = df_calc[df_calc['Name'] == selected_movie].index[0]
        sim_scores = list(enumerate(cosine_similarity(tfidf_matrix[target_idx], tfidf_matrix)[0]))
        
        # Sort and take top 3 matches (excluding the movie itself at rank 0)
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:4]
        
        rec_indices = [i[0] for i in sim_scores]
        recommendations = df.iloc[rec_indices][['Name', 'Director', 'Year', 'Genre', 'Rating']]
        
        st.write(f"Films stylistically closest to **{selected_movie}**:")
        # Using newer 'width' argument where available, otherwise fallback is handled
        st.dataframe(recommendations, use_container_width=True, hide_index=True)
    else:
        st.info("Upload your Letterboxd export CSVs above to begin analysis.")