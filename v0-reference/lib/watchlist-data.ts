export interface WatchlistDrama {
  id: string
  title: string
  image: string
  genre: string
  episodeCount: number
  watchedEpisodes?: number
  addedAt: string
}

export const watchlistDramas: WatchlistDrama[] = [
  {
    id: "ceo-secret",
    title: "The CEO's Secret",
    image: "/images/drama-ceo-secret.jpg",
    genre: "Thriller",
    episodeCount: 60,
    watchedEpisodes: 18,
    addedAt: "2 days ago",
  },
  {
    id: "broken-vows",
    title: "Broken Vows",
    image: "/images/drama-broken-vows.jpg",
    genre: "Drama",
    episodeCount: 45,
    watchedEpisodes: 8,
    addedAt: "1 week ago",
  },
  {
    id: "love-in-accra",
    title: "Love in Accra",
    image: "/images/hero-love-in-accra.jpg",
    genre: "Romance",
    episodeCount: 60,
    addedAt: "3 days ago",
  },
  {
    id: "juju-rising",
    title: "Juju Rising",
    image: "/images/drama-juju-rising.jpg",
    genre: "Supernatural",
    episodeCount: 50,
    addedAt: "5 days ago",
  },
  {
    id: "gold-coast",
    title: "Gold Coast Legacy",
    image: "/images/drama-gold-coast.jpg",
    genre: "Family",
    episodeCount: 55,
    addedAt: "1 day ago",
  },
  {
    id: "palace-wife",
    title: "The Palace Wife",
    image: "/images/drama-palace-wife.jpg",
    genre: "Historical",
    episodeCount: 48,
    addedAt: "6 days ago",
  },
  {
    id: "enchanted",
    title: "Enchanted Hearts",
    image: "/images/drama-enchanted.jpg",
    genre: "Fantasy",
    episodeCount: 40,
    addedAt: "2 weeks ago",
  },
  {
    id: "street-heart",
    title: "Street Heart",
    image: "/images/drama-street-heart.jpg",
    genre: "Romance",
    episodeCount: 35,
    addedAt: "4 days ago",
  },
]
