export interface Episode {
  id: string
  number: number
  title: string
  image: string
  duration: string
  status: "free" | "locked" | "watched"
  watchedAgo?: string
  progress?: number
}

export interface DramaDetail {
  id: string
  title: string
  banner: string
  genre: string[]
  episodeCount: number
  year: string
  country: string
  rating: number
  reviewCount: string
  watchingNow: string
  likes: string
  description: string
  trailerThumbnail: string
  trailerDuration: string
  episodes: Episode[]
}

export const dramaDetails: Record<string, DramaDetail> = {
  "love-in-accra": {
    id: "love-in-accra",
    title: "Love in Accra",
    banner: "/images/hero-love-in-accra.jpg",
    genre: ["Romance", "Heartbreak", "Revenge"],
    episodeCount: 60,
    year: "2024",
    country: "GH",
    rating: 4.8,
    reviewCount: "12.5K",
    watchingNow: "15K",
    likes: "12.5K",
    description:
      "When Adwoa returns to Accra after years abroad, she discovers that the love she left behind has transformed into something far more dangerous. Caught between two worlds and two hearts, she must navigate family secrets, corporate betrayal, and a love triangle that threatens to destroy everything she holds dear. In the bustling streets of Accra, every choice has consequences.",
    trailerThumbnail: "/images/hero-love-in-accra.jpg",
    trailerDuration: "0:45",
    episodes: [
      { id: "e1", number: 1, title: "The Return", image: "/images/hero-love-in-accra.jpg", duration: "2:30", status: "watched", watchedAgo: "2 days ago", progress: 100 },
      { id: "e2", number: 2, title: "Old Flames", image: "/images/drama-street-heart.jpg", duration: "2:45", status: "free" },
      { id: "e3", number: 3, title: "The Confession", image: "/images/drama-broken-vows.jpg", duration: "3:10", status: "free" },
      { id: "e4", number: 4, title: "Betrayal", image: "/images/drama-ceo-secret.jpg", duration: "2:55", status: "free" },
      { id: "e5", number: 5, title: "Secrets Unveiled", image: "/images/drama-midnight-call.jpg", duration: "3:00", status: "locked" },
      { id: "e6", number: 6, title: "Point of No Return", image: "/images/drama-enchanted.jpg", duration: "2:40", status: "locked" },
    ],
  },
  "ceo-secret": {
    id: "ceo-secret",
    title: "The CEO's Secret",
    banner: "/images/drama-ceo-secret.jpg",
    genre: ["Thriller", "Romance", "Corporate"],
    episodeCount: 60,
    year: "2024",
    country: "NG",
    rating: 4.6,
    reviewCount: "8.2K",
    watchingNow: "9.3K",
    likes: "8.2K",
    description:
      "Behind the glass towers of Lagos lies a web of corporate intrigue. When a young intern uncovers the CEO's darkest secret, she's pulled into a dangerous game of power, seduction, and survival. Trust no one, especially not the man who signs your paycheck.",
    trailerThumbnail: "/images/drama-ceo-secret.jpg",
    trailerDuration: "0:52",
    episodes: [
      { id: "e1", number: 1, title: "First Day", image: "/images/drama-ceo-secret.jpg", duration: "2:20", status: "free" },
      { id: "e2", number: 2, title: "The File", image: "/images/drama-midnight-call.jpg", duration: "2:50", status: "free" },
      { id: "e3", number: 3, title: "Eyes Everywhere", image: "/images/drama-gold-coast.jpg", duration: "3:05", status: "free" },
      { id: "e4", number: 4, title: "After Hours", image: "/images/drama-broken-vows.jpg", duration: "2:40", status: "locked" },
      { id: "e5", number: 5, title: "The Confrontation", image: "/images/drama-sisters-war.jpg", duration: "2:55", status: "locked" },
      { id: "e6", number: 6, title: "No Way Out", image: "/images/drama-last-born.jpg", duration: "3:10", status: "locked" },
    ],
  },
}

// Fallback: generate detail for any drama by ID
export function getDramaDetail(id: string): DramaDetail {
  if (dramaDetails[id]) return dramaDetails[id]

  // Generate a default
  const imageMap: Record<string, string> = {
    "broken-vows": "/images/drama-broken-vows.jpg",
    "market-queen": "/images/drama-market-queen.jpg",
    "midnight-call": "/images/drama-midnight-call.jpg",
    "palace-wife": "/images/drama-palace-wife.jpg",
    "street-heart": "/images/drama-street-heart.jpg",
    "juju-rising": "/images/drama-juju-rising.jpg",
    "gold-coast": "/images/drama-gold-coast.jpg",
    "spirit-realm": "/images/drama-spirit-realm.jpg",
    "sisters-war": "/images/drama-sisters-war.jpg",
    "last-born": "/images/drama-last-born.jpg",
    "enchanted": "/images/drama-enchanted.jpg",
  }
  const img = imageMap[id] || "/images/hero-love-in-accra.jpg"
  const titleFromId = id
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  return {
    id,
    title: titleFromId,
    banner: img,
    genre: ["Drama", "Romance"],
    episodeCount: 45,
    year: "2024",
    country: "GH",
    rating: 4.5,
    reviewCount: "5.1K",
    watchingNow: "6.2K",
    likes: "5.1K",
    description:
      "A gripping tale of love, loss, and redemption set in the heart of West Africa. When fate brings two unlikely souls together, their worlds collide in ways neither could have imagined. Every episode will leave you wanting more.",
    trailerThumbnail: img,
    trailerDuration: "0:48",
    episodes: [
      { id: "e1", number: 1, title: "The Beginning", image: img, duration: "2:30", status: "watched", watchedAgo: "3 days ago", progress: 100 },
      { id: "e2", number: 2, title: "Rising Tension", image: "/images/drama-broken-vows.jpg", duration: "2:45", status: "free" },
      { id: "e3", number: 3, title: "The Twist", image: "/images/drama-midnight-call.jpg", duration: "3:00", status: "free" },
      { id: "e4", number: 4, title: "Fallout", image: "/images/drama-sisters-war.jpg", duration: "2:55", status: "free" },
      { id: "e5", number: 5, title: "Breaking Point", image: "/images/drama-ceo-secret.jpg", duration: "2:40", status: "locked" },
      { id: "e6", number: 6, title: "Revelation", image: "/images/drama-enchanted.jpg", duration: "3:10", status: "locked" },
    ],
  }
}
