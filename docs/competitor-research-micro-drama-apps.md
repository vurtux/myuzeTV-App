# Competitor Research: Micro-Drama / Short-Form Drama Streaming Apps

**Date:** March 21, 2026
**Purpose:** Research key UX flows, features, and patterns of leading micro-drama apps to inform myuzeTV's subscription-based product design.
**Note:** myuzeTV will use a **subscription-only model** (no coins, no gamification, no pay-per-episode).

---

## Table of Contents

1. [Market Overview](#1-market-overview)
2. [App Profiles](#2-app-profiles)
   - [ReelShort](#reelshort)
   - [DramaBox](#dramabox)
   - [MyDrama](#mydrama)
3. [Feature Comparison Matrix](#3-feature-comparison-matrix)
4. [Deep Dive: UX Flows & Patterns](#4-deep-dive-ux-flows--patterns)
   - [Home Screen Layout](#home-screen-layout)
   - [Content Discovery](#content-discovery)
   - [Drama Detail Page](#drama-detail-page)
   - [Video Player UX](#video-player-ux)
   - [User Engagement Features](#user-engagement-features)
   - [Subscription & Monetization](#subscription--monetization)
   - [Onboarding Flow](#onboarding-flow)
   - [Social Features](#social-features)
   - [Personalization](#personalization)
   - [Notifications](#notifications)
   - [Offline Viewing](#offline-viewing)
   - [UI/UX Patterns](#uiux-patterns)
5. [Key Takeaways for myuzeTV](#5-key-takeaways-for-myuzetv)
6. [Sources](#6-sources)

---

## 1. Market Overview

The micro-drama / short-form drama streaming market has experienced explosive growth:

- **Global revenue:** $11B in 2025; projected $14B by end of 2026
- **Q1 2025 in-app revenue:** ~$700M globally (nearly 4x year-on-year growth)
- **Global downloads Q1 2025:** 370M+ (6.2x increase year-on-year)
- **Cumulative downloads (as of March 2025):** ~950M
- **U.S. market share:** 49% of total global revenue ($350M in Q1 2025)
- **Daily engagement:** ReelShort users average 35.7 min/day (vs Netflix 24.8 min, Disney+ 23 min)
- **Primary audience:** Women comprise 70% of ReelShort's 45M monthly active users
- **Content format:** 1-3 minute vertically-filmed episodes; series are typically 60-100+ episodes (movie-length total)

**Market leaders:** ReelShort (#1), DramaBox (#2), with rising players NetShort, FlickReels, DramaWave, ShortMax, and GoodShort.

---

## 2. App Profiles

### ReelShort

| Attribute | Details |
|-----------|---------|
| **Developer** | Crazy Maple Studio (backed by COL Group, Beijing) |
| **Founded** | August 2022 |
| **Downloads** | 370M+ |
| **MAU** | 50M+ |
| **Cumulative Revenue** | $490M+ (as of March 2025) |
| **Rating** | 4.5 stars (App Store) |
| **Content Focus** | Western-audience micro-dramas: billionaire romances, werewolf tales, mafia stories, revenge arcs, supernatural twists |
| **Episode Length** | 1-2 minutes |
| **Recognition** | TIME100 Most Influential Companies 2024 |

**Key differentiators:**
- First-ever interactive live action short movies (choose-your-own-adventure branching)
- Tinder-like swiping to start playback from trailer browsing
- Gamified interface with highest daily engagement in streaming
- AI-powered recommendation engine using ML for personalized content

### DramaBox

| Attribute | Details |
|-----------|---------|
| **Developer** | STORYMATRIX PTE. LTD. |
| **Downloads** | 100M+ (Google Play alone) |
| **MAU** | 44M |
| **Cumulative Revenue** | $450M+ (as of March 2025) |
| **Rating** | 4.8 stars (App Store, 642K ratings) |
| **Content Focus** | Most diverse genre library: romance, fantasy, supernatural, thriller, suspense, modern slice-of-life, comedy |
| **Episode Length** | 1-3 minutes |

**Key differentiators:**
- Most diverse genre library in the short-drama space
- More polished interface than competitors
- Better pricing flexibility and more free content
- Excellent English dubbing and subtitles
- Curated "mood-based" collections and themed playlists
- Up to 10GB offline downloads

### MyDrama

| Attribute | Details |
|-----------|---------|
| **Developer** | Holywater (Ukraine-based media tech startup) |
| **Founded** | April 2024 |
| **Users** | 40M+ lifetime users (as of September 2025) |
| **Revenue** | Millions in annual revenue |
| **Rating** | 4.2 stars (Trustpilot, 2,622 reviews); Webby Awards 2025 Winner for Best Streaming Service |
| **Content Focus** | "One-minute movies" and doramas, novel-based film adaptations |
| **Episode Length** | ~1 minute |

**Key differentiators:**
- AI companion chatbots that let users interact with fictional characters from shows (e.g., chat with "Jaxon the billionaire" or "Hayden the mafia heir")
- Gamified trust meters and engagement mechanics within AI companion chats
- Actors receive royalties based on AI chat engagement (up to $10K/month)
- Positioned as "premium, story-driven TikToks" rather than traditional streaming
- Standalone "My Imagination" companion app for deeper character interactions

---

## 3. Feature Comparison Matrix

| Feature | ReelShort | DramaBox | MyDrama |
|---------|-----------|----------|---------|
| **Vertical video player** | Yes | Yes | Yes |
| **Swipe navigation (TikTok-style)** | Yes (+ Tinder-style for discovery) | Yes (swipe up for next ep) | Yes |
| **Autoplay next episode** | Yes | Yes | Yes |
| **Continue watching** | Yes | Yes | Yes |
| **Watchlist / Favorites** | Yes (dedicated section) | Yes (library feature) | Yes (collect with a tap) |
| **Watch history** | Yes | Yes | Yes |
| **Offline downloads** | Yes | Yes (up to 10GB) | Unknown |
| **Search** | Yes | Yes (with genre filters) | Yes |
| **Genre filtering** | Yes | Yes (genre chips) | Yes |
| **Personalized "For You" feed** | Yes (AI-driven) | Yes (smart recommendations) | Yes |
| **Push notifications** | Yes | Yes (new episodes, trending) | Yes |
| **Comments / Reviews** | Yes (community forums) | Yes (built-in community) | Limited |
| **Social sharing** | Yes (Instagram, WhatsApp, links) | Yes | Yes |
| **Quality settings** | 1080p (VIP only) | 480p to 1080p (adaptive) | HD |
| **Skip intro** | Yes | Yes | Yes |
| **Dark mode** | Yes (default) | Yes (optional) | Yes (default) |
| **Interactive / branching stories** | Yes | No | Yes (via AI companions) |
| **Multilingual subtitles** | Yes | Yes (excellent dubbing) | Yes |
| **AI recommendations** | Yes (ML-based) | Yes | Yes |
| **Subscription available** | Yes (VIP) | Yes (Premium) | Yes (VIP) |
| **Coin/pay-per-episode system** | Yes (primary model) | Yes (primary model) | Yes (primary model) |
| **Ad-supported free tier** | Yes (watch ads for coins) | Yes | Limited |

---

## 4. Deep Dive: UX Flows & Patterns

### Home Screen Layout

**Common pattern across all three apps:**

1. **Hero banner / Featured content area** at the top -- showcases trending, new, or editorially curated dramas with large thumbnails and clear synopses
2. **Horizontal content rails** below the hero -- organized by different categories:
   - "Continue Watching" (resume rail)
   - "Trending Now" / "Hot"
   - "New Releases"
   - "For You" (personalized recommendations)
   - Genre-specific rails (Romance, Thriller, Fantasy, etc.)
   - "Curated Collections" / themed playlists
3. **Bottom tab navigation** (Netflix/Plex-style) -- typically 3-5 tabs:
   - Home / Discover / For You
   - Explore / Search / Browse
   - Store / Coins (monetization-related)
   - Library / My List / Watchlist
   - Profile / Me / Mine
4. **Search bar** at the top or accessible via tab
5. **Genre chips / tags** for quick filtering

**App-specific variations:**

| App | Home Screen Emphasis |
|-----|---------------------|
| **ReelShort** | "Discover" page with popular/recent titles + "For You" personalized page. Gamified with Tinder-like swipe to start from trailers. |
| **DramaBox** | Minimalist design, content-forward. Tags for quick browsing, home "shelves" organized by genre. Mood-based collections. |
| **MyDrama** | Smoother content discovery, collect-with-a-tap UX. Novel-based adaptations featured prominently. AI companions promoted alongside content. |

### Content Discovery

**Mechanisms used across apps:**

1. **Genre categories:** Romance, Thriller, Suspense, Fantasy, Supernatural, Comedy, Modern Urban, Family, Comeback
2. **Trending / Popular:** Algorithmically ranked by views, engagement, completion rates
3. **New Releases:** Chronologically sorted, updated daily (hundreds of new episodes/month)
4. **For You / Personalized feed:** AI/ML-driven based on watch history, completion rates, ratings, genre preferences
5. **Curated Collections:** Editorially grouped playlists by mood, theme, or topic ("Boss Romances," "Revenge Stories," "Feel-Good Picks")
6. **Search:** Text search by title, genre keyword, or creator; some apps support filters by length, popularity, language
7. **Genre chips:** Horizontally scrollable genre tags at the top of browse/discover views

**ReelShort-specific:** Interest selection during onboarding to seed the recommendation engine. Self-select path (similar to Headspace's onboarding) for personalized initial experience.

**DramaBox-specific:** Mood-based browsing and themed channels. Stronger emphasis on genre variety as a discovery lever.

### Drama Detail Page

**Standard elements across apps:**

1. **Large poster/thumbnail image** (vertical, 9:16 aspect ratio)
2. **Title and synopsis** -- concise, often 1-2 sentences emphasizing the hook/cliffhanger
3. **Genre tags / chips** -- tappable for related content
4. **Episode count** -- total episodes in the series (often 60-100+)
5. **Episode list** -- scrollable vertical list with:
   - Episode number
   - Thumbnail (optional)
   - Lock/unlock status indicator (free vs. paid)
   - Duration indicator
   - "Currently watching" highlight
6. **Play / Continue button** -- prominent CTA at the top
7. **Add to favorites / watchlist** button (heart or bookmark icon)
8. **Share button**
9. **Rating / review section** (stars or thumbs)
10. **"Similar dramas" / "You might also like"** rail at the bottom
11. **Cast information** (minimal -- these are mostly unknown actors)
12. **View count / popularity indicator**

**Notable patterns:**
- Episode lists clearly distinguish free (first 5-10) vs. locked episodes
- "Binge" or "Watch All" CTAs for subscribers
- Progress bars on partially-watched episodes

### Video Player UX

**Universal patterns:**

| Feature | Implementation |
|---------|---------------|
| **Orientation** | Vertical (portrait) -- no rotation needed, one-handed viewing |
| **Swipe navigation** | Swipe up = next episode; swipe down = previous episode (TikTok-style) |
| **Autoplay** | Seamless transition to next episode with no loading screens |
| **Tap controls** | Tap center = pause/play; tap sides = skip forward/backward |
| **Progress bar** | Thin bar at bottom, scrubbable |
| **Skip intro** | Button appears during intro sequence |
| **Quality settings** | Adaptive bitrate streaming (480p-1080p based on connection) |
| **Playback speed** | Some apps offer 1x, 1.25x, 1.5x, 2x |
| **Resume playback** | Remembers exact position within episode |
| **Muted autoplay** | For previews/trailers on home screen |
| **Captions/subtitles** | Toggle on/off; multiple languages available |
| **Episode info overlay** | Shows episode title/number, can swipe away |
| **Share from player** | Share button accessible during playback |
| **Lock screen** | Prevents accidental touches |

**Design philosophy:** Remove all friction. The player should feel instant and effortless -- every interaction designed for single-thumb operation. Fast startup times are critical (< 1 second ideal). Adaptive bitrate ensures no buffering even on slower connections.

### User Engagement Features

**Continue Watching / Resume:**
- Prominent "Continue Watching" rail on home screen (typically position 1 or 2)
- Remembers exact playback position per episode
- Syncs across devices via user account
- Shows progress bar on thumbnails

**Favorites / Watchlist:**
- One-tap add to favorites (heart icon)
- Dedicated "My List" or "Library" tab
- Organized by recently added or genre

**Watch History:**
- Chronological list of all viewed content
- Easy to find previously watched or finished shows
- Accessible from profile or library tab

**Daily Rewards / Check-ins (coin-based apps):**
- Daily login rewards (coins/credits)
- Watch ads for bonus coins
- Social media follow rewards
- Referral bonuses

**Binge Mechanics:**
- Auto-play next episode with zero delay
- Episode cliffhangers at the end of every episode by design
- "5 more episodes" progress indicators
- Session time tracking (though not surfaced to users)

### Subscription & Monetization

**Current industry models (what competitors do):**

All three major apps primarily use a **coin/pay-per-episode** model:
- First 5-10 episodes free
- 5 more free via ad-watching
- Remaining episodes cost coins (typically 10-15 coins/episode)
- A full 80+ episode series costs $10-$20 to complete

**VIP/Premium subscription overlay:**

| App | VIP Price | VIP Benefits |
|-----|-----------|--------------|
| **ReelShort** | $20/week or $200/year | Unlimited viewing, 1080p, ad-free, daily VIP reward |
| **DramaBox** | $12.99-$19/week (varies) | Ad-free, premium content, offline downloads, higher resolution |
| **MyDrama** | $11.99-$22.99 (varies) | Exclusive movies/series, early access, unlimited ad-free viewing |

**Critical insight for myuzeTV:** Even apps that offer "VIP/Premium" subscriptions often still require coins for some content, creating user frustration. This is the #1 complaint across all three apps on review platforms. A truly **unlimited subscription model** would be a significant competitive differentiator.

**Recommended subscription tiers for myuzeTV (based on market research):**

| Tier | Price Range | Features |
|------|-------------|----------|
| **Free** | $0 | Limited catalog (e.g., first 3-5 episodes per series), ad-supported |
| **Standard** | $4.99-$7.99/month | Full unlimited access, 720p, some ads |
| **Premium** | $9.99-$14.99/month | Full unlimited access, 1080p, ad-free, offline downloads, early access |
| **Annual** | $59.99-$99.99/year | Premium benefits at ~50% discount |

### Onboarding Flow

**Common pattern:**

1. **Splash screen** with app logo and tagline
2. **Sign up / Login** -- options: Google, Apple, Facebook, phone number, email. Guest mode often available.
3. **Interest/genre selection** (varies by app):
   - ReelShort: Presents genre cards to select preferences (romance, thriller, comedy, etc.)
   - DramaBox: Less explicit; learns from behavior
   - MyDrama: Quick genre preference selection
4. **Personalized home screen** immediately populated based on selections
5. **First episode auto-play** or featured content trailer to hook the user
6. **Subscription prompt** (after 3-5 free episodes, or deferred until natural paywall)

**Best practices observed:**
- Minimize steps to first content consumption (< 60 seconds from install to watching)
- Genre selection should feel fun, not like a form (use visual cards, not checkboxes)
- Don't gate content discovery behind sign-up (allow browsing first)
- Show a taste of premium content to demonstrate value before asking for payment

### Social Features

| Feature | ReelShort | DramaBox | MyDrama |
|---------|-----------|----------|---------|
| **Episode comments** | Yes | Yes | Limited |
| **User reviews/ratings** | Yes | Yes | Via Trustpilot/stores |
| **Social sharing** | Instagram, WhatsApp, app links | Yes | Yes |
| **Follow creators/authors** | Yes | No | No |
| **Community forums** | Yes (in-app) | Yes (built-in) | No |
| **AI character chat** | No | No | Yes (unique differentiator) |
| **Danmu-style comments** | No | No | No (but DramaWave has this) |
| **Social media follow rewards** | Yes (coins for following) | No | No |

**Emerging patterns:**
- On-screen comments (Danmu-style, as seen on DramaWave) are gaining traction -- viewers react in real-time to plot twists
- AI character interactions (MyDrama's approach) represent a new engagement frontier
- "Binge-hour" events and live community viewing sessions (ShortMax)

### Personalization

**AI/ML-driven recommendation engines:**

All three apps employ machine learning to analyze:
- Watch history and completion rates
- Genre preferences (explicit selections + implicit behavior)
- Time of day viewing patterns
- Similar user behavior (collaborative filtering)
- Episode skip patterns and rewatch behavior

**Personalization surfaces:**
1. **"For You" home feed** -- primary personalized content stream
2. **"Similar to X"** rails on detail pages
3. **Smart push notifications** -- tailored content suggestions
4. **Personalized search results** ranking
5. **Home rail ordering** -- rails reorder based on user preferences

### Notifications

**Types of push notifications used:**

1. **New episode alerts** -- "Episode 45 of [Drama Title] is now available!"
2. **Continue watching reminders** -- "You left off at Episode 23. Keep watching?"
3. **Trending content** -- "This drama is trending right now!"
4. **New series launches** -- "A new thriller just dropped"
5. **Promotional** -- subscription offers, limited-time deals
6. **Daily reward reminders** -- "Claim your daily coins" (coin-based apps)
7. **Personalized recommendations** -- "Based on your taste, you'll love..."
8. **Social** -- "Someone replied to your comment"

**Best practices:**
- Notification frequency management (don't spam)
- User control over notification types
- Deep links directly into content from notifications
- Time-of-day optimization (send when user typically watches)

### Offline Viewing

| App | Offline Support | Storage Limit | Quality Options |
|-----|-----------------|---------------|-----------------|
| **ReelShort** | Yes (download icon per episode) | Not specified | Standard quality |
| **DramaBox** | Yes | Up to 10GB | Multiple quality levels |
| **MyDrama** | Not confirmed | N/A | N/A |

**Implementation notes:**
- Download button appears on episode list and within player
- Downloaded content accessible from Library/My List tab
- Downloads expire based on subscription status
- Quality selection before download to manage storage
- Background downloads supported

### UI/UX Patterns

**Visual design patterns consistent across all apps:**

1. **Dark mode default** -- reduces eye strain for extended viewing; makes video content pop against dark backgrounds
2. **Large thumbnails** -- 9:16 vertical poster art dominates browsing
3. **Minimal text** -- titles and short descriptions only; content speaks through visuals
4. **Genre chips** -- horizontally scrollable colored tags (e.g., "Romance" in pink, "Thriller" in red)
5. **Glass morphism** -- translucent overlays on player controls and navigation
6. **Bottom sheet modals** -- episode lists, comments, and settings slide up from bottom
7. **Progress indicators** -- thin colored bars on thumbnails showing watch progress
8. **Gradient overlays** -- dark gradients over poster images for text readability
9. **Skeleton loading states** -- content-shaped placeholders while loading
10. **Haptic feedback** -- subtle vibration on actions (add to list, like, etc.)

**Navigation patterns:**
- Bottom tab bar (3-5 tabs)
- Swipe gestures for content navigation
- Pull-to-refresh on home/discover
- Floating action buttons for primary actions (play, add)
- Edge swipe to go back

**Typography and spacing:**
- Large, bold titles for section headers
- Medium-weight for drama titles
- Light/regular for descriptions
- Generous padding between content rails
- Card-based layouts with rounded corners

---

## 5. Key Takeaways for myuzeTV

### Competitive Advantages to Pursue

1. **Pure subscription model is the biggest differentiator.** Every major competitor uses coins/pay-per-episode, which is the #1 user complaint. A clean, Netflix-style unlimited subscription eliminates this friction entirely.

2. **"No coins, no surprises" positioning.** Marketing this simplicity is itself a feature. Users are tired of complex monetization that makes them calculate costs mid-binge.

3. **Ad-free premium experience.** While competitors litter the free tier with ads, a clean ad-free experience for subscribers is table stakes for myuzeTV.

### Features to Prioritize (Must-Have)

- Vertical video player with TikTok-style swipe navigation and autoplay
- Continue Watching rail (position 1 on home screen)
- Personalized "For You" feed based on watch history
- Genre-based content discovery (chips, categories, search filters)
- Hero banner/featured content carousel at top of home
- Watchlist/favorites with one-tap add
- Push notifications for new episodes and personalized recommendations
- Offline downloads for subscribers
- 1080p adaptive streaming
- Dark mode (default)

### Features to Consider (Nice-to-Have)

- Episode comments / community features
- Social sharing (deep links into specific episodes)
- Interest selection during onboarding
- AI-powered recommendations (start simple, enhance over time)
- Multiple language/subtitle support
- Quality settings (auto + manual)
- Skip intro button

### Features to Skip (Not Aligned with Subscription Model)

- Coin systems / virtual currency
- Daily check-in rewards
- Ad-watching for content unlock
- Gamified engagement mechanics (trust meters, etc.)
- Interactive branching stories (complex to produce; niche appeal)
- AI character chatbots (novel but tangential to core streaming)

### UX Design Principles (Learned from Competitors)

1. **Minimize time to first video** -- under 60 seconds from app open to watching
2. **Content-forward design** -- let thumbnails and video do the talking
3. **One-thumb operation** -- every interaction reachable with single hand
4. **Zero-delay transitions** -- seamless autoplay between episodes
5. **Remove all monetization friction** -- no coin calculations, no "unlock" prompts mid-binge
6. **Cliffhanger-aware UX** -- the content format creates natural hooks; don't interrupt them
7. **Simple navigation** -- 3-4 bottom tabs max (Home, Search/Explore, Watchlist, Profile)
8. **Dark theme** -- default for extended viewing comfort and visual elegance

### Subscription Pricing Recommendation

Based on competitor analysis, myuzeTV should consider:

| Tier | Monthly | Annual | Features |
|------|---------|--------|----------|
| **Free** | $0 | -- | Limited catalog (first 3-5 eps per series), ad-supported |
| **Premium** | $6.99-$9.99 | $49.99-$69.99 | Full unlimited catalog, 1080p, ad-free, offline downloads |

**Rationale:** Competitors charge $13-$20/week (!) for VIP that still requires coins. A flat $7-$10/month for truly unlimited access is dramatically cheaper and simpler. This creates a strong value proposition: "Watch everything. No coins. No surprises."

---

## 6. Sources

- [DramaBox vs ReelShort: Full Comparison of Features & Pricing](https://yourappland.com/dramabox-vs-reelshort-full-comparison-of-features-and-pricing/)
- [DramaBox App Review 2026: Pricing, Safety, Features](https://en.nadjimtech.com/2025/12/Dramabox%20.html?m=1)
- [ReelShort - Wikipedia](https://en.wikipedia.org/wiki/ReelShort)
- [ReelShort Reviews 2026: Features, Price, Pros & Cons](https://www.hitpaw.com/video-tips/reelshort-reviews.html)
- [My Drama App Review, Pricing, User Experience & Ratings](https://yourappland.com/my-drama-app-review-pricing-user-experience-ratings/)
- [MyDrama Help Center: Web Subscription Benefits](https://intercom.help/mydrama_helpcenter/en/articles/9582348-what-are-the-benefits-of-my-web-subscription)
- [Short series app My Drama takes on Character.AI (TechCrunch)](https://techcrunch.com/2024/09/04/short-series-app-my-drama-launching-ai-companions/)
- [State of Short Drama Apps 2025 Report (Sensor Tower)](https://sensortower.com/blog/state-of-short-drama-apps-2025)
- [Microdrama apps surpass Netflix, Prime Video in US engagement (eMarketer)](https://www.emarketer.com/content/microdrama-apps-surpass-netflix--prime-video-us-mobile-engagement)
- [Told one minute at a time, micro dramas are soap operas (NPR)](https://www.npr.org/2025/03/19/nx-s1-5330470/micro-drama-soap-opera-app)
- [How ReelShort CEO Used a Chinese Trend to Disrupt US Entertainment (TIME)](https://time.com/7173765/reelshort-crazy-maple-studio-joey-jia-interview/)
- [Microdrama Apps: Top Short Drama Platforms 2025](https://www.squareinfosoft.com/best-microdrama-apps-2025/)
- [Top 22 Microdrama Platforms](https://mbrellafilms.com/insights/best-microdrama-short-drama-platforms/)
- [The Vertical Revolution: How Microdramas Became a Multi-Billion Dollar Phenomenon (Variety)](https://variety.com/2025/tv/news/global-microdrama-boom-1236560947/)
- [Microdramas Hit Major US Milestone (Deadline)](https://deadline.com/2026/02/microdrama-more-time-cellphones-streaming-services-omdia-1236732921/)
- [How to Build a Micro Drama App like ReelShort or DramaBox (FastPix)](https://www.fastpix.io/tutorials/how-to-build-a-micro-drama-video-app-like-reelshort-or-dramabox)
- [Build a Vertical Short Drama Streaming App Like DramaBox (Innocrux)](https://www.innocrux.com/blogs/build-vertical-short-drama-streaming-app-like-dramabox/)
- [How to Build an App Like ReelShort (Enveu)](https://www.enveu.com/blog/how-to-build-an-app-like-reelshort)
- [DramaBox App Store Listing](https://apps.apple.com/us/app/dramabox-stream-drama-shorts/id6445905219)
- [ReelShort App Store Listing](https://apps.apple.com/us/app/reelshort-stream-drama-tv/id1636235979)
- [MyDrama App Store Listing](https://apps.apple.com/us/app/my-drama-stream-short-dramas/id6498713494)
- [My Drama Trustpilot Reviews](https://www.trustpilot.com/review/my-drama.com)
- [Video Streaming App Downloads Boomed in 2025, Fueled by Microdramas (Hollywood Reporter)](https://www.hollywoodreporter.com/business/business-news/microdramas-streaming-app-download-boom-2025-1236478966/)
- [What the World Is Actually Watching in 2025's Vertical Micro Drama Boom](https://www.real-reel.com/what-the-world-watches-2025-vertical-micro-drama/)
