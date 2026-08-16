# 🎬 CineMetrics — Personal Film Diary & Taste Engine

<div align="center">

![CineMetrics Banner](https://raw.githubusercontent.com/Zatuzo/CineMetrics/main/assets/banner.png)

[![Streamlit App](https://static.streamlit.io/badges/streamlit_badge_black_white.svg)](https://streamlit.io/)
![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)
![TMDb API](https://img.shields.io/badge/TMDb-API%20Integrated-01b4e4.svg?logo=themoviedatabase&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/ML-TF--IDF%20%26%20Cosine%20Similarity-orange.svg?logo=scikitlearn&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg)

**Deep analytical breakdown, Spotify Wrapped–style monthly retrospectives, algorithmic Cinema Mixes, and NLP-powered semantic watchlist search for Letterboxd users.**

[Features](#-key-features) • [Installation](#-getting-started) • [Architecture](#-modular-architecture) • [How to Export Letterboxd](#-how-to-export-your-letterboxd-data)

</div>

---

## 🌟 Overview

**CineMetrics** transforms raw [Letterboxd](https://letterboxd.com/) diary data into an interactive, visual analytics dashboard and cinematic taste engine. By pairing your viewing history with TMDb metadata, natural language processing, and automated graphics rendering, CineMetrics delivers insights into your film habits that go far beyond standard stats.

---

## ✨ Key Features

### 📼 1. Monthly Rewind (Spotify Wrapped for Film)
* **Cinematic Personas**: Algorithmic persona classification (e.g., *1990s Gritty Crime Specialist*, *Futuristic Sci-Fi Visionary*) tailored to your monthly genre & decade preferences.
* **Monthly Retrospective**: Track exact watch time in hours/minutes, mean rating velocity, peak viewing days, and top auteur frequency.
* **📲 9:16 Story Card Export**: One-click generation of high-resolution 1080×1920 Instagram Story cards generated dynamically via Pillow.

### 🎧 2. Cinema Mixes (Daily Mix Playlists)
* Algorithmic movie playlists blending your top genres and director signatures into thematic 4-film curated bundles.
* High-res poster tiles, year tagging, and auteur badges.

### 📊 3. Profile Overview & Deep Analytics
* **Decade Breakdown**: Historical volume distribution spanning early cinema to modern releases.
* **Auteur Heatmap**: Volume vs. average rating scatter/bar charts to highlight your favorite and highest-rated directors.

### 📅 4. Viewing Habits & Velocity
* **Day-of-Week Rhythm**: Identify whether you are a weekend binge-watcher or a midweek cinephile.
* **Monthly Velocity**: Trendlines charting films watched over months and years.

### 🔍 5. Semantic Mood Search across Watchlist
* Search your unwatched Letterboxd watchlist using natural-language vibe prompts (e.g., *"atmospheric psychological neo noir with slow burn pacing"*).
* Powered by **TF-IDF Vectorization** and **Cosine Similarity** matched against TMDb synopses.

---

## 🏗️ Modular Architecture

CineMetrics follows a decoupled architecture separating data ingestion, API caching, image generation, ML search, and UI views:

```text
CIneMetrics/
├── app.py                     # Thin entrypoint orchestrator (~55 lines)
├── config.py                  # API endpoints, keys, genre mappings & constants
├── requirements.txt           # Project dependencies
│
├── modules/                   # Core business & processing logic
│   ├── __init__.py            # Module API exports
│   ├── tmdb.py                # TMDb API calls with Streamlit caching
│   ├── loaders.py             # Letterboxd CSV bundle parser & data enrichment
│   ├── personas.py            # Cinematic persona classification engine
│   ├── mixes.py               # Algorithmic daily mixes playlist builder
│   ├── story_card.py          # Pillow 9:16 high-res Story Card renderer
│   └── search.py              # TF-IDF cosine similarity mood matcher
│
└── views/                     # Streamlit UI tab renderers
    ├── __init__.py            # View exports
    ├── rewind_tab.py          # 📼 Monthly Rewind & Story Card Export
    ├── mixes_tab.py           # 🎧 Cinema Mixes tab
    ├── overview_tab.py        # 📊 Profile Overview (Decade & Director Charts)
    ├── habits_tab.py          # 📅 Viewing Habits (Weekly Rhythm & Velocity)
    └── semantic_tab.py        # 🔍 Semantic Mood Search (Watchlist Vibes)
```

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10 or higher
* [TMDb API Key](https://www.themoviedb.org/documentation/api) *(Included in default configuration)*

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Zatuzo/CineMetrics.git
   cd CineMetrics
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Launch the application:**
   ```bash
   streamlit run app.py
   ```

---

## 📥 How to Export Your Letterboxd Data

1. Log into your account at [letterboxd.com](https://letterboxd.com).
2. Navigate to **Settings** → **Import & Export**.
3. Click **Export Your Data** to download your `.zip` archive.
4. Extract the archive and drag-and-drop the following files into CineMetrics:
   * `diary.csv`
   * `ratings.csv`
   * `reviews.csv`
   * `watchlist.csv`

---

## 🛠️ Built With

* **[Streamlit](https://streamlit.io/)** — Reactive web dashboard framework
* **[Plotly Express](https://plotly.com/python/)** — Interactive data visualizations
* **[Pandas](https://pandas.pydata.org/)** & **[NumPy](https://numpy.org/)** — Data manipulation and feature engineering
* **[Scikit-Learn](https://scikit-learn.org/)** — TF-IDF vectorization & Cosine Similarity
* **[Pillow (PIL)](https://python-pillow.org/)** — High-resolution story card rendering
* **[TextBlob](https://textblob.readthedocs.io/)** — Sentiment polarity scoring on film reviews
* **[The Movie Database (TMDb) API](https://www.themoviedb.org/)** — Metadata, posters, directors & synopses

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
