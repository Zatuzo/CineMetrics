# views/semantic_tab.py
import pandas as pd
import streamlit as st
from modules.search import search_watchlist_by_vibe

def render_semantic_tab(df_watch: pd.DataFrame):
    """Renders the Semantic Mood Search tab across unwatched watchlist films."""
    st.subheader("Semantic Mood Query (TMDb Overview Matching)")
    st.caption("Search across your watchlist using descriptive mood phrases (e.g., 'gritty slow burn crime thriller').")
    
    if df_watch.empty:
        st.info("Upload `watchlist.csv` to search unwatched film synopses.")
        return
        
    query_text = st.text_input("Enter cinematic vibe or plot prompt:", value="atmospheric psychological neo noir")
    
    if query_text.strip():
        top_matches = search_watchlist_by_vibe(df_watch, query_text, top_n=4)
        
        if top_matches.empty:
            st.info("No matching films found in watchlist.")
            return

        w_cols = st.columns(4)
        for idx, (_, mov) in enumerate(top_matches.iterrows()):
            with w_cols[idx]:
                if mov.get('Poster'):
                    st.image(mov['Poster'], use_container_width=True)
                st.markdown(f"**{mov['Name']}** ({int(mov['Year']) if pd.notna(mov.get('Year')) else 'N/A'})")
                st.caption(f"🎬 {mov.get('Director', 'Auteur')}\n\n🏷️ {mov.get('Genre', 'Cinema')}")
                st.metric("Vibe Match", f"{mov.get('syn_match', 0.0)}%")
                with st.expander("Synopsis"):
                    st.write(mov.get('Overview') or "No synopsis available.")
