# config.py

TMDB_API_KEY = "76a327a724de6563297b5a4d68a6fcc4"
TMDB_BASE_URL = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

# Mapping from dominant genres to persona titles
GENRE_PERSONAS = {
    'Crime': 'Gritty Crime Specialist',
    'Thriller': 'Suspense & Neo-Noir Devotee',
    'Mystery': 'Enigmatic Mystery Seeker',
    'Drama': 'Introspective Drama Purist',
    'Science Fiction': 'Futuristic Sci-Fi Visionary',
    'Sci-Fi': 'Futuristic Sci-Fi Visionary',
    'Action': 'High-Octane Adrenaline Junkie',
    'Comedy': 'Feel-Good Comedy Enthusiast',
    'Horror': 'Midnight Horror Aficionado',
    'Romance': 'Hopeless Romantic Cinephile',
    'Animation': 'Whimsical Animation Explorer',
    'Adventure': 'Epic Quest Adventurer',
    'Fantasy': 'Mythic World Dreamer',
    'Documentary': 'Realist Truth Seeker'
}

# Calendar distribution order
DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
