# app.py
import io
import streamlit as st
import plotly.express as px
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from data_pipeline import (
    load_letterboxd_bundle, 
    load_watchlist_data, 
    generate_poster_collage
)

st.set_page_config(page_title="CineMetrics | Film Diary Engine", layout="wide", page_icon="🎬")

st.title("🎬 CineMetrics — Personal Film Diary & Taste Engine")
st.caption("Deep analytical breakdown of personal viewing logs, director distributions, and rating profiles.")

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
tab_overview, tab_habits, tab_matrix, tab_nlp, tab_semantic, tab_collage = st.tabs([
    "📊 Profile Overview",
    "📅 Viewing Habits",
    "🎯 Director Quadrant",
    "📝 Review NLP Analysis",
    "🔍 Semantic Mood Search",
    "🖼️ Poster Collage Export"
])

# ----------------------------------------------------
# TAB 1: Profile Overview
# ----------------------------------------------------
with tab_overview:
    c_left, c_right = st.columns(2)
    with c_left:
        st.subheader("Decade Breakdown")
        dec_df = df['Decade'].value_counts().sort_index().reset_index()
        dec_df.columns = ['Decade', 'Count']
        fig_dec = px.bar(dec_df, x='Decade', y='Count', color_discrete_sequence=['#38bdf8'])
        fig_dec.update_layout(height=350, margin=dict(l=10, r=10, t=20, b=10))
        st.plotly_chart(fig_dec, use_container_width=True)
        
    with c_right:
        st.subheader("Top Directors by Volume & Rating")
        dir_summary = df[df['Director'] != 'Unknown Director'].groupby('Director').agg(
            Film_Count=('Name', 'count'),
            Avg_Rating=('Rating', 'mean')
        ).reset_index().query('Film_Count >= 2').sort_values(by='Film_Count', ascending=False).head(10)
        
        fig_dir = px.bar(
            dir_summary, x='Director', y='Film_Count', color='Avg_Rating',
            color_continuous_scale='Viridis', labels={'Avg_Rating': 'Mean ★'}
        )
        fig_dir.update_layout(height=350, margin=dict(l=10, r=10, t=20, b=10))
        st.plotly_chart(fig_dir, use_container_width=True)

# ----------------------------------------------------
# TAB 2: Viewing Habits (Day of Week & Monthly Velocity)
# ----------------------------------------------------
with tab_habits:
    st.subheader("Viewing Velocity & Weekly Rhythm")
    h_col1, h_col2 = st.columns(2)
    
    valid_dates = df.dropna(subset=['Date'])
    
    with h_col1:
        st.write("**Day-of-Week Distribution**")
        day_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        day_counts = valid_dates['Day_of_Week'].value_counts().reindex(day_order).fillna(0).reset_index()
        day_counts.columns = ['Day', 'Count']
        fig_days = px.bar(day_counts, x='Day', y='Count', color_discrete_sequence=['#f59e0b'])
        fig_days.update_layout(height=320, margin=dict(l=10, r=10, t=20, b=10))
        st.plotly_chart(fig_days, use_container_width=True)
        
    with h_col2:
        st.write("**Monthly Watch Volume Trends**")
        month_counts = valid_dates['Month_Year'].value_counts().sort_index().reset_index()
        month_counts.columns = ['Month', 'Count']
        fig_m = px.line(month_counts, x='Month', y='Count', markers=True, color_discrete_sequence=['#10b981'])
        fig_m.update_layout(height=320, margin=dict(l=10, r=10, t=20, b=10))
        st.plotly_chart(fig_m, use_container_width=True)

# ----------------------------------------------------
# TAB 3: Director Quadrant Matrix
# ----------------------------------------------------
with tab_matrix:
    st.subheader("Director Quadrant Matrix (Volume vs. Rating)")
    st.caption("Identify core favorites (top right), hidden gems (top left), and completionist traps (bottom right).")
    
    dir_quad = df[df['Director'] != 'Unknown Director'].groupby('Director').agg(
        Total_Watched=('Name', 'count'),
        Avg_Rating=('Rating', 'mean')
    ).reset_index()
    
    fig_quad = px.scatter(
        dir_quad, 
        x='Total_Watched', 
        y='Avg_Rating', 
        text='Director',
        size='Total_Watched',
        color='Avg_Rating',
        color_continuous_scale='Plasma',
        hover_data=['Total_Watched', 'Avg_Rating']
    )
    fig_quad.update_traces(textposition='top center')
    
    mean_v = dir_quad['Total_Watched'].mean()
    mean_r = dir_quad['Avg_Rating'].mean()
    fig_quad.add_hline(y=mean_r, line_dash="dash", line_color="gray", annotation_text="Avg Rating")
    fig_quad.add_vline(x=mean_v, line_dash="dash", line_color="gray", annotation_text="Avg Volume")
    fig_quad.update_layout(height=480, margin=dict(l=10, r=10, t=30, b=10))
    st.plotly_chart(fig_quad, use_container_width=True)

# ----------------------------------------------------
# TAB 4: Review Sentiment & Keyword Extraction (NLP)
# ----------------------------------------------------
with tab_nlp:
    st.subheader("Written Review NLP Analysis")
    reviewed_df = df[df['Review'].str.strip() != '']
    
    if reviewed_df.empty:
        st.info("No text reviews found in your upload bundle.")
    else:
        nlp_c1, nlp_c2 = st.columns([1, 1])
        
        with nlp_c1:
            st.write(f"**Sentiment Polarity vs. Star Rating** ({len(reviewed_df)} reviews)")
            fig_sent = px.scatter(
                reviewed_df, 
                x='Rating', 
                y='Sentiment_Polarity', 
                hover_data=['Name', 'Director'],
                color='Rating',
                color_continuous_scale='Bluered'
            )
            fig_sent.update_layout(height=350, margin=dict(l=10, r=10, t=20, b=10))
            st.plotly_chart(fig_sent, use_container_width=True)
            
        with nlp_c2:
            st.write("**Top Characteristic Review Vocabulary**")
            vec = TfidfVectorizer(stop_words='english', max_features=10)
            tfidf_mat = vec.fit_transform(reviewed_df['Review'])
            words_df = pd.DataFrame({
                'Keyword': vec.get_feature_names_out(),
                'TF-IDF Importance': tfidf_mat.toarray().sum(axis=0)
            }).sort_values(by='TF-IDF Importance', ascending=True)
            
            fig_words = px.bar(words_df, x='TF-IDF Importance', y='Keyword', orientation='h', color_discrete_sequence=['#a855f7'])
            fig_words.update_layout(height=350, margin=dict(l=10, r=10, t=20, b=10))
            st.plotly_chart(fig_words, use_container_width=True)

# ----------------------------------------------------
# TAB 5: Semantic Mood Search across Watchlist
# ----------------------------------------------------
with tab_semantic:
    st.subheader("Semantic Mood Query (TMDb Overview Matching)")
    st.caption("Search across your watchlist using descriptive mood phrases (e.g., 'gritty slow burn crime thriller').")
    
    if df_watch.empty:
        st.info("Upload `watchlist.csv` to search unwatched film synopses.")
    else:
        query_text = st.text_input("Enter cinematic vibe or plot prompt:", value="atmospheric psychological neo noir")
        
        if query_text.strip():
            watch_synopses = df_watch['Overview'].fillna('') + " " + df_watch['Genre'].fillna('')
            tfidf_syn = TfidfVectorizer(stop_words='english')
            tfidf_matrix_syn = tfidf_syn.fit_transform(watch_synopses)
            
            q_vec = tfidf_syn.transform([query_text])
            scores = cosine_similarity(q_vec, tfidf_matrix_syn)[0]
            df_watch['syn_match'] = (scores * 100).round(1)
            
            top_matches = df_watch.sort_values(by='syn_match', ascending=False).head(4)
            
            w_cols = st.columns(4)
            for idx, (_, mov) in enumerate(top_matches.iterrows()):
                with w_cols[idx]:
                    if mov['Poster']:
                        st.image(mov['Poster'], use_container_width=True)
                    st.markdown(f"**{mov['Name']}** ({int(mov['Year']) if pd.notna(mov['Year']) else 'N/A'})")
                    st.caption(f"🎬 {mov['Director']}\n\n🏷️ {mov['Genre']}")
                    st.metric("Vibe Match", f"{mov['syn_match']}%")
                    with st.expander("Synopsis"):
                        st.write(mov['Overview'] or "No synopsis available.")

# ----------------------------------------------------
# TAB 6: Poster Collage Exporter
# ----------------------------------------------------
with tab_collage:
    st.subheader("High-Resolution Poster Grid Exporter")
    st.caption("Generate an exportable 3x3 graphic of your highest-rated cinema.")
    
    top_posters = df[df['Rating'] >= 4.0].sort_values(by='Rating', ascending=False)['Poster'].dropna().tolist()
    
    if len(top_posters) < 9:
        top_posters = df['Poster'].dropna().tolist()
        
    if len(top_posters) < 9:
        st.warning("Need at least 9 valid posters with TMDb metadata to render a full 3x3 grid.")
    else:
        if st.button("Render 3x3 Poster Grid"):
            with st.spinner("Stitching posters..."):
                collage = generate_poster_collage(top_posters, cols=3, rows=3)
                if collage:
                    st.image(collage, caption="Your 3x3 Cinema Grid", use_container_width=True)
                    buf = io.BytesIO()
                    collage.save(buf, format="PNG")
                    st.download_button(
                        label="⬇️ Download Poster Grid (PNG)",
                        data=buf.getvalue(),
                        file_name="cinemetrics_grid.png",
                        mime="image/png"
                    )