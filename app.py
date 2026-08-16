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
    get_cinematic_persona,
    generate_instagram_story_card
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
tab_rewind, tab_overview, tab_habits, tab_semantic = st.tabs([
    "📼 Monthly Rewind (Wrapped)",
    "📊 Profile Overview",
    "📅 Viewing Habits",
    "🔍 Semantic Mood Search"
])

# ----------------------------------------------------
# TAB 1: Monthly Rewind (Spotify Wrapped Style)
# ----------------------------------------------------
with tab_rewind:
    st.subheader("📼 Monthly Rewind & Instagram Story Exporter")
    st.caption("A Spotify Wrapped–style monthly retrospective of your cinema diary, top directors, and watch time.")

    valid_months = df.dropna(subset=['Month_Year'])
    all_months = sorted(valid_months['Month_Year'].unique(), reverse=True)

    if not all_months:
        st.warning("No dated watch logs found in your diary export. Upload a `diary.csv` with dates to view monthly rewinds.")
    else:
        c_sel1, c_sel2 = st.columns([1, 2])
        with c_sel1:
            selected_month = st.selectbox("Select Month to Rewind:", all_months, index=0)
            
        m_df = df[df['Month_Year'] == selected_month].copy()
        
        if m_df.empty:
            st.info("No films logged for the selected month.")
        else:
            persona = get_cinematic_persona(m_df)
            
            # Spotify Wrapped Persona Banner
            st.markdown(
                f"""
                <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); 
                            border-radius: 16px; padding: 22px; margin: 15px 0 25px 0; border: 1px solid #38bdf8;">
                    <span style="background: #38bdf8; color: #0f172a; padding: 4px 12px; border-radius: 12px; font-weight: bold; font-size: 12px;">
                        CINEMATIC PERSONA
                    </span>
                    <h2 style="color: #f59e0b; margin: 10px 0 4px 0;">✨ {persona}</h2>
                    <p style="color: #94a3b8; margin: 0; font-size: 14px;">Your dominant taste & viewing character for <b>{selected_month}</b>.</p>
                </div>
                """,
                unsafe_allow_html=True
            )
            
            # Monthly KPIs
            mk1, mk2, mk3, mk4 = st.columns(4)
            total_mins = m_df['Runtime'].sum() if 'Runtime' in m_df.columns else len(m_df) * 110
            total_hours = total_mins / 60.0
            
            mk1.metric("⏱️ Watch Time", f"{total_hours:.1f} hrs", help=f"Total: ~{int(total_mins):,} minutes")
            mk2.metric("🍿 Films Logged", f"{len(m_df)} films")
            m_rating = m_df['Rating'].mean()
            mk3.metric("★ Mean Rating", f"{m_rating:.2f}" if pd.notna(m_rating) else "N/A")
            top_day = m_df['Day_of_Week'].mode()
            mk4.metric("📅 Peak Day", top_day[0] if not top_day.empty else "N/A")
            
            st.markdown("---")
            
            # Visual Breakdown Columns
            col_films, col_directors = st.columns([3, 2])
            
            with col_films:
                st.subheader(f"👑 Top Films of {selected_month}")
                top_3 = m_df.sort_values(by=['Rating', 'Name'], ascending=[False, True]).head(3)
                
                spot_cols = st.columns(3)
                for idx, (_, mov) in enumerate(top_3.iterrows()):
                    with spot_cols[idx]:
                        if mov.get('Poster'):
                            st.image(mov['Poster'], use_container_width=True)
                        st.markdown(f"**{mov['Name']}** ({int(mov['Year']) if pd.notna(mov.get('Year')) else 'N/A'})")
                        r_star = f"★ {mov['Rating']:.1f}" if pd.notna(mov.get('Rating')) else "Watched"
                        st.markdown(f"<span style='color: #f59e0b; font-weight: bold;'>{r_star}</span>", unsafe_allow_html=True)
                        st.caption(f"🎬 {mov['Director']}\n\n🏷️ {mov['Genre']}")
                        
            with col_directors:
                st.subheader("🏆 Top Directors & Genres")
                m_dirs = m_df[m_df['Director'] != 'Unknown Director']['Director'].value_counts().head(4).reset_index()
                m_dirs.columns = ['Director', 'Watched']
                if not m_dirs.empty:
                    fig_md = px.bar(m_dirs, x='Watched', y='Director', orientation='h', color_discrete_sequence=['#38bdf8'])
                    fig_md.update_layout(height=220, margin=dict(l=10, r=10, t=10, b=10), yaxis={'autorange': 'reversed'})
                    st.plotly_chart(fig_md, use_container_width=True)
                else:
                    st.caption("No director breakdown available.")

                all_g = [g.strip() for sublist in m_df['Genre'].dropna().str.split(',') for g in sublist if g.strip() and g.strip() != 'Cinema']
                m_genres = pd.Series(all_g).value_counts().head(4).reset_index()
                m_genres.columns = ['Genre', 'Count']
                if not m_genres.empty:
                    fig_mg = px.bar(m_genres, x='Count', y='Genre', orientation='h', color_discrete_sequence=['#10b981'])
                    fig_mg.update_layout(height=220, margin=dict(l=10, r=10, t=10, b=10), yaxis={'autorange': 'reversed'})
                    st.plotly_chart(fig_mg, use_container_width=True)

            # ----------------------------------------------------
            # INSTAGRAM STORY EXPORTER SECTION
            # ----------------------------------------------------
            st.markdown("---")
            st.subheader("📸 Export for Instagram Story (9:16)")
            st.caption("Generate an eye-catching 1080x1920 graphic formatted perfectly for Instagram Stories and social sharing.")
            
            btn_col1, btn_col2 = st.columns([1, 2])
            with btn_col1:
                render_story = st.button("✨ Generate Story Card", use_container_width=True)
                
            if render_story:
                with st.spinner("Rendering 9:16 Instagram Story Card..."):
                    story_img = generate_instagram_story_card(selected_month, m_df)
                    
                    if story_img:
                        buf = io.BytesIO()
                        story_img.save(buf, format="PNG", quality=95)
                        png_bytes = buf.getvalue()
                        
                        st.download_button(
                            label="⬇️ Download Instagram Story (1080x1920 PNG)",
                            data=png_bytes,
                            file_name=f"cinemetrics_rewind_{selected_month}.png",
                            mime="image/png",
                            use_container_width=True
                        )
                        
                        st.image(story_img, caption=f"Instagram Story Preview (9:16) — {selected_month}", width=360)

# ----------------------------------------------------
# TAB 2: Profile Overview
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
# TAB 3: Viewing Habits (Day of Week & Monthly Velocity)
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
# TAB 4: Semantic Mood Search across Watchlist
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
