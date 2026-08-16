# modules/search.py
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def search_watchlist_by_vibe(df_watch, query_text, top_n=4):
    """Calculates TF-IDF cosine similarity scores matching a mood/vibe query against watchlist synopses."""
    if df_watch.empty or not query_text.strip():
        return pd.DataFrame()
    
    watch_synopses = df_watch['Overview'].fillna('') + " " + df_watch['Genre'].fillna('')
    tfidf_syn = TfidfVectorizer(stop_words='english')
    tfidf_matrix_syn = tfidf_syn.fit_transform(watch_synopses)
    
    q_vec = tfidf_syn.transform([query_text])
    scores = cosine_similarity(q_vec, tfidf_matrix_syn)[0]
    
    df_result = df_watch.copy()
    df_result['syn_match'] = (scores * 100).round(1)
    
    return df_result.sort_values(by='syn_match', ascending=False).head(top_n)
