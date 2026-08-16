# data_pipeline.py
import pandas as pd
import numpy as np

def load_letterboxd_bundle(uploaded_files=None):
    """
    Accepts a list of uploaded CSV files (diary.csv, ratings.csv, reviews.csv)
    and merges them into a unified analysis DataFrame.
    """
    if not uploaded_files:
        return get_starter_dataset()
    
    file_map = {}
    for f in uploaded_files:
        name = f.name.lower()
        if 'diary' in name:
            file_map['diary'] = pd.read_csv(f)
        elif 'rating' in name:
            file_map['ratings'] = pd.read_csv(f)
        elif 'review' in name:
            file_map['reviews'] = pd.read_csv(f)
        else:
            # Fallback generic CSV
            file_map[name] = pd.read_csv(f)

    # Base selection priority: diary -> ratings -> reviews
    if 'diary' in file_map:
        base_df = file_map['diary']
    elif 'ratings' in file_map:
        base_df = file_map['ratings']
    elif 'reviews' in file_map:
        base_df = file_map['reviews']
    else:
        base_df = list(file_map.values())[0]

    # Standardize Base Columns
    if 'Watched Date' in base_df.columns:
        base_df['Date'] = pd.to_datetime(base_df['Watched Date'], errors='coerce')
    elif 'Date' in base_df.columns:
        base_df['Date'] = pd.to_datetime(base_df['Date'], errors='coerce')
    else:
        base_df['Date'] = pd.NaT

    # Merge Reviews if available
    if 'reviews' in file_map and file_map['reviews'] is not base_df:
        rev_df = file_map['reviews'][['Name', 'Year', 'Review']].dropna(subset=['Review'])
        base_df = pd.merge(base_df, rev_df, on=['Name', 'Year'], how='left')

    # Merge Ratings if base was diary and missing rating column
    if 'ratings' in file_map and 'Rating' not in base_df.columns:
        rat_df = file_map['ratings'][['Name', 'Year', 'Rating']]
        base_df = pd.merge(base_df, rat_df, on=['Name', 'Year'], how='left')

    # Data Cleaning & Feature Extraction
    base_df['Year'] = pd.to_numeric(base_df['Year'], errors='coerce')
    base_df['Decade'] = (base_df['Year'] // 10 * 10).dropna().astype(int).astype(str) + 's'
    base_df['Rating'] = pd.to_numeric(base_df['Rating'], errors='coerce')
    
    # Placeholders for Director/Genre before TMDb enrichment
    if 'Director' not in base_df.columns:
        base_df['Director'] = 'Unknown Director'
    if 'Genre' not in base_df.columns:
        base_df['Genre'] = 'Cinema'
    if 'Review' not in base_df.columns:
        base_df['Review'] = ''

    return base_df.drop_duplicates(subset=['Name', 'Year']).reset_index(drop=True)


def get_starter_dataset():
    """Default fallback sample if no files are uploaded."""
    df = pd.DataFrame({
        'Date': pd.date_range(start='2024-01-01', periods=25, freq='W'),
        'Name': [
            'Nightcrawler', 'The Remains of the Day', 'Zodiac', 'Memories of Murder',
            'Drive', 'Taxi Driver', 'No Country for Old Men', 'There Will Be Blood',
            'Blade Runner 2049', 'Arrival', 'Sicario', 'Prisoners',
            'Fargo', 'The Big Lebowski', 'Chinatown', 'Heat',
            'Cure', 'High and Low', 'Ran', 'Seven Samurai',
            'Yi Yi', 'A Brighter Summer Day', 'Burning', 'Parasite', 'Decision to Leave'
        ],
        'Year': [
            2014, 1993, 2007, 2003, 2011, 1976, 2007, 2007,
            2017, 2016, 2015, 2013, 1996, 1998, 1974, 1995,
            1997, 1963, 1985, 1954, 2000, 1991, 2018, 2019, 2022
        ],
        'Rating': [
            4.5, 5.0, 4.5, 5.0, 4.0, 4.5, 5.0, 5.0,
            4.5, 4.5, 4.0, 4.5, 4.0, 4.0, 4.5, 4.5,
            5.0, 4.5, 4.5, 5.0, 5.0, 5.0, 4.5, 4.5, 4.5
        ],
        'Director': [
            'Dan Gilroy', 'James Ivory', 'David Fincher', 'Bong Joon-ho',
            'Nicolas Winding Refn', 'Martin Scorsese', 'Coen Brothers', 'Paul Thomas Anderson',
            'Denis Villeneuve', 'Denis Villeneuve', 'Denis Villeneuve', 'Denis Villeneuve',
            'Coen Brothers', 'Coen Brothers', 'Roman Polanski', 'Michael Mann',
            'Kiyoshi Kurosawa', 'Akira Kurosawa', 'Akira Kurosawa', 'Akira Kurosawa',
            'Edward Yang', 'Edward Yang', 'Lee Chang-dong', 'Bong Joon-ho', 'Park Chan-wook'
        ],
        'Genre': [
            'Crime, Thriller', 'Drama, Romance', 'Crime, Mystery, Thriller', 'Crime, Drama, Mystery',
            'Crime, Drama', 'Crime, Drama', 'Crime, Drama, Thriller', 'Drama',
            'Sci-Fi, Drama', 'Sci-Fi, Drama', 'Action, Crime, Thriller', 'Crime, Drama, Mystery',
            'Crime, Thriller', 'Comedy, Crime', 'Mystery, Thriller', 'Action, Crime, Drama',
            'Crime, Horror, Mystery', 'Crime, Drama, Mystery', 'Action, Drama', 'Action, Drama',
            'Drama, Romance', 'Crime, Drama, Romance', 'Drama, Mystery', 'Comedy, Drama, Thriller', 'Mystery, Romance, Thriller'
        ],
        'Review': [''] * 25
    })
    df['Year'] = pd.to_numeric(df['Year'], errors='coerce')
    df['Decade'] = (df['Year'] // 10 * 10).astype(str) + 's'
    df['Rating'] = pd.to_numeric(df['Rating'], errors='coerce')
    return df