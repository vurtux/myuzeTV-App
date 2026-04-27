export interface Drama {
  id: string
  title: string
  image: string
  genre: string
  episode?: string
  progress?: number
  watching?: string
  releasedAgo?: string
  isNew?: boolean
}

export const heroFeatured: Drama[] = [
  {
    id: "love-in-accra",
    title: "Love in Accra",
    image: "/images/hero-love-in-accra.jpg",
    genre: "Romance",
  },
  {
    id: "ceo-secret",
    title: "The CEO's Secret",
    image: "/images/drama-ceo-secret.jpg",
    genre: "Thriller",
  },
  {
    id: "gold-coast",
    title: "Gold Coast Legacy",
    image: "/images/drama-gold-coast.jpg",
    genre: "Family",
  },
  {
    id: "juju-rising",
    title: "Juju Rising",
    image: "/images/drama-juju-rising.jpg",
    genre: "Supernatural",
  },
  {
    id: "sisters-war",
    title: "Sisters at War",
    image: "/images/drama-sisters-war.jpg",
    genre: "Drama",
  },
  {
    id: "midnight-call",
    title: "Midnight Call",
    image: "/images/drama-midnight-call.jpg",
    genre: "Thriller",
  },
  {
    id: "enchanted",
    title: "Enchanted Hearts",
    image: "/images/drama-enchanted.jpg",
    genre: "Fantasy",
  },
]

export const continueWatching: Drama[] = [
  {
    id: "ceo-secret",
    title: "The CEO's Secret",
    image: "/images/drama-ceo-secret.jpg",
    genre: "Thriller",
    episode: "Ep 12 of 60",
    progress: 73,
  },
  {
    id: "broken-vows",
    title: "Broken Vows",
    image: "/images/drama-broken-vows.jpg",
    genre: "Drama",
    episode: "Ep 8 of 45",
    progress: 45,
  },
  {
    id: "market-queen",
    title: "Market Queen",
    image: "/images/drama-market-queen.jpg",
    genre: "Drama",
    episode: "Ep 22 of 50",
    progress: 88,
  },
  {
    id: "midnight-call",
    title: "Midnight Call",
    image: "/images/drama-midnight-call.jpg",
    genre: "Thriller",
    episode: "Ep 5 of 40",
    progress: 30,
  },
  {
    id: "palace-wife",
    title: "The Palace Wife",
    image: "/images/drama-palace-wife.jpg",
    genre: "Historical",
    episode: "Ep 15 of 55",
    progress: 62,
  },
]

export const trendingNow: Drama[] = [
  {
    id: "gold-coast",
    title: "Gold Coast Legacy",
    image: "/images/drama-gold-coast.jpg",
    genre: "Family Drama",
    watching: "12K",
  },
  {
    id: "sisters-war",
    title: "Sisters at War",
    image: "/images/drama-sisters-war.jpg",
    genre: "Family Drama",
    watching: "8.5K",
  },
  {
    id: "midnight-call",
    title: "Midnight Call",
    image: "/images/drama-midnight-call.jpg",
    genre: "Thriller",
    watching: "6.2K",
  },
  {
    id: "market-queen",
    title: "Market Queen",
    image: "/images/drama-market-queen.jpg",
    genre: "Drama",
    watching: "5.8K",
  },
  {
    id: "ceo-secret",
    title: "The CEO's Secret",
    image: "/images/drama-ceo-secret.jpg",
    genre: "Romance",
    watching: "4.1K",
  },
  {
    id: "palace-wife",
    title: "The Palace Wife",
    image: "/images/drama-palace-wife.jpg",
    genre: "Historical",
    watching: "3.7K",
  },
]

export const newThisWeek: Drama[] = [
  {
    id: "last-born",
    title: "The Last Born",
    image: "/images/drama-last-born.jpg",
    genre: "Family Drama",
    releasedAgo: "Released 2 days ago",
    isNew: true,
  },
  {
    id: "enchanted",
    title: "Enchanted Hearts",
    image: "/images/drama-enchanted.jpg",
    genre: "Fantasy Romance",
    releasedAgo: "Released 1 day ago",
    isNew: true,
  },
  {
    id: "juju-rising",
    title: "Juju Rising",
    image: "/images/drama-juju-rising.jpg",
    genre: "Supernatural",
    releasedAgo: "Released 3 days ago",
    isNew: true,
  },
  {
    id: "street-heart",
    title: "Street Heart",
    image: "/images/drama-street-heart.jpg",
    genre: "Romance",
    releasedAgo: "Released today",
    isNew: true,
  },
  {
    id: "spirit-realm",
    title: "Spirit Realm",
    image: "/images/drama-spirit-realm.jpg",
    genre: "Fantasy",
    releasedAgo: "Released 5 days ago",
    isNew: true,
  },
  {
    id: "broken-vows",
    title: "Broken Vows S2",
    image: "/images/drama-broken-vows.jpg",
    genre: "Drama",
    releasedAgo: "Released 4 days ago",
    isNew: true,
  },
]

export const romanceDramas: Drama[] = [
  {
    id: "love-in-accra",
    title: "Love in Accra",
    image: "/images/hero-love-in-accra.jpg",
    genre: "Romance",
  },
  {
    id: "street-heart",
    title: "Street Heart",
    image: "/images/drama-street-heart.jpg",
    genre: "Romance",
  },
  {
    id: "enchanted",
    title: "Enchanted Hearts",
    image: "/images/drama-enchanted.jpg",
    genre: "Fantasy Romance",
  },
  {
    id: "broken-vows",
    title: "Broken Vows",
    image: "/images/drama-broken-vows.jpg",
    genre: "Drama",
  },
  {
    id: "palace-wife",
    title: "The Palace Wife",
    image: "/images/drama-palace-wife.jpg",
    genre: "Historical Romance",
  },
  {
    id: "ceo-secret",
    title: "The CEO's Secret",
    image: "/images/drama-ceo-secret.jpg",
    genre: "Corporate Romance",
  },
]

export const fantasyDramas: Drama[] = [
  {
    id: "juju-rising",
    title: "Juju Rising",
    image: "/images/drama-juju-rising.jpg",
    genre: "Supernatural",
  },
  {
    id: "spirit-realm",
    title: "Spirit Realm",
    image: "/images/drama-spirit-realm.jpg",
    genre: "Fantasy",
  },
  {
    id: "enchanted",
    title: "Enchanted Hearts",
    image: "/images/drama-enchanted.jpg",
    genre: "Fantasy Romance",
  },
  {
    id: "midnight-call",
    title: "Midnight Call",
    image: "/images/drama-midnight-call.jpg",
    genre: "Thriller",
  },
  {
    id: "sisters-war",
    title: "Sisters at War",
    image: "/images/drama-sisters-war.jpg",
    genre: "Drama",
  },
  {
    id: "last-born",
    title: "The Last Born",
    image: "/images/drama-last-born.jpg",
    genre: "Family Drama",
  },
]
