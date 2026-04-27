/**
 * Image helper: maps v0 paths to placeholder URLs for RN.
 * Replace with require() or real URLs when assets are available.
 */
const img = (path: string, text?: string) => {
  const name = text || path.replace("/images/", "").replace(/\.[^.]+$/, "");
  return `https://placehold.co/200x356/1a1a2e/8b5cf6?text=${encodeURIComponent(name)}`;
};

export type { Drama } from "./types";

export const heroFeatured: Drama[] = [
  { id: "love-in-accra", title: "Love in Accra", image: img("/images/hero-love-in-accra.jpg", "Love in Accra"), genre: "Romance", insertedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "ceo-secret", title: "The CEO's Secret", image: img("/images/drama-ceo-secret.jpg", "CEO Secret"), genre: "Thriller" },
  { id: "gold-coast", title: "Gold Coast Legacy", image: img("/images/drama-gold-coast.jpg", "Gold Coast"), genre: "Family", insertedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "juju-rising", title: "Juju Rising", image: img("/images/drama-juju-rising.jpg", "Juju Rising"), genre: "Supernatural" },
  { id: "sisters-war", title: "Sisters at War", image: img("/images/drama-sisters-war.jpg", "Sisters"), genre: "Drama" },
  { id: "midnight-call", title: "Midnight Call", image: img("/images/drama-midnight-call.jpg", "Midnight"), genre: "Thriller" },
  { id: "enchanted", title: "Enchanted Hearts", image: img("/images/drama-enchanted.jpg", "Enchanted"), genre: "Fantasy" },
];

export const continueWatching: Drama[] = [
  { id: "ceo-secret", title: "The CEO's Secret", image: img("/images/drama-ceo-secret.jpg", "CEO"), genre: "Thriller", episode: "Ep 12 of 60", progress: 73 },
  { id: "broken-vows", title: "Broken Vows", image: img("/images/drama-broken-vows.jpg", "Broken"), genre: "Drama", episode: "Ep 8 of 45", progress: 45 },
  { id: "market-queen", title: "Market Queen", image: img("/images/drama-market-queen.jpg", "Market"), genre: "Drama", episode: "Ep 22 of 50", progress: 88 },
  { id: "midnight-call", title: "Midnight Call", image: img("/images/drama-midnight-call.jpg", "Midnight"), genre: "Thriller", episode: "Ep 5 of 40", progress: 30 },
  { id: "palace-wife", title: "The Palace Wife", image: img("/images/drama-palace-wife.jpg", "Palace"), genre: "Historical", episode: "Ep 15 of 55", progress: 62 },
];

export const trendingNow: Drama[] = [
  { id: "gold-coast", title: "Gold Coast Legacy", image: img("/images/drama-gold-coast.jpg", "Gold"), genre: "Family Drama", watching: "12K" },
  { id: "sisters-war", title: "Sisters at War", image: img("/images/drama-sisters-war.jpg", "Sisters"), genre: "Family Drama", watching: "8.5K" },
  { id: "midnight-call", title: "Midnight Call", image: img("/images/drama-midnight-call.jpg", "Midnight"), genre: "Thriller", watching: "6.2K" },
  { id: "market-queen", title: "Market Queen", image: img("/images/drama-market-queen.jpg", "Market"), genre: "Drama", watching: "5.8K" },
  { id: "ceo-secret", title: "The CEO's Secret", image: img("/images/drama-ceo-secret.jpg", "CEO"), genre: "Romance", watching: "4.1K" },
  { id: "palace-wife", title: "The Palace Wife", image: img("/images/drama-palace-wife.jpg", "Palace"), genre: "Historical", watching: "3.7K" },
];

export const newThisWeek: Drama[] = [
  { id: "last-born", title: "The Last Born", image: img("/images/drama-last-born.jpg", "Last Born"), genre: "Family Drama", releasedAgo: "Released 2 days ago", insertedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "enchanted", title: "Enchanted Hearts", image: img("/images/drama-enchanted.jpg", "Enchanted"), genre: "Fantasy Romance", releasedAgo: "Released 1 day ago", insertedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "juju-rising", title: "Juju Rising", image: img("/images/drama-juju-rising.jpg", "Juju"), genre: "Supernatural", releasedAgo: "Released 3 days ago", insertedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "street-heart", title: "Street Heart", image: img("/images/drama-street-heart.jpg", "Street"), genre: "Romance", releasedAgo: "Released today", isNew: true },
  { id: "spirit-realm", title: "Spirit Realm", image: img("/images/drama-spirit-realm.jpg", "Spirit"), genre: "Fantasy", releasedAgo: "Released 5 days ago", isNew: true },
  { id: "broken-vows", title: "Broken Vows S2", image: img("/images/drama-broken-vows.jpg", "Broken"), genre: "Drama", releasedAgo: "Released 4 days ago", isNew: true },
];

export const romanceDramas: Drama[] = [
  { id: "love-in-accra", title: "Love in Accra", image: img("/images/hero-love-in-accra.jpg", "Love"), genre: "Romance" },
  { id: "street-heart", title: "Street Heart", image: img("/images/drama-street-heart.jpg", "Street"), genre: "Romance" },
  { id: "enchanted", title: "Enchanted Hearts", image: img("/images/drama-enchanted.jpg", "Enchanted"), genre: "Fantasy Romance" },
  { id: "broken-vows", title: "Broken Vows", image: img("/images/drama-broken-vows.jpg", "Broken"), genre: "Drama" },
  { id: "palace-wife", title: "The Palace Wife", image: img("/images/drama-palace-wife.jpg", "Palace"), genre: "Historical Romance" },
  { id: "ceo-secret", title: "The CEO's Secret", image: img("/images/drama-ceo-secret.jpg", "CEO"), genre: "Corporate Romance" },
];

export const fantasyDramas: Drama[] = [
  { id: "juju-rising", title: "Juju Rising", image: img("/images/drama-juju-rising.jpg", "Juju"), genre: "Supernatural" },
  { id: "spirit-realm", title: "Spirit Realm", image: img("/images/drama-spirit-realm.jpg", "Spirit"), genre: "Fantasy" },
  { id: "enchanted", title: "Enchanted Hearts", image: img("/images/drama-enchanted.jpg", "Enchanted"), genre: "Fantasy Romance" },
  { id: "midnight-call", title: "Midnight Call", image: img("/images/drama-midnight-call.jpg", "Midnight"), genre: "Thriller" },
  { id: "sisters-war", title: "Sisters at War", image: img("/images/drama-sisters-war.jpg", "Sisters"), genre: "Drama" },
  { id: "last-born", title: "The Last Born", image: img("/images/drama-last-born.jpg", "Last Born"), genre: "Family Drama" },
];

export const LOGO_IMAGE = require("../assets/myuzeTV.png");
