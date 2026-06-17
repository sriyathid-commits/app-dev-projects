const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// ── Mock news data (replace with real API like NewsAPI.org in production) ─────
const NEWS_DB = [
  {
    id: 1, title: 'OpenAI releases GPT-5 with multimodal reasoning',
    summary: 'The latest model from OpenAI demonstrates breakthrough reasoning abilities across text, image, and audio modalities.',
    source: 'TechCrunch', category: 'Technology', tags: ['ai', 'openai', 'gpt'],
    image: 'https://picsum.photos/seed/ai1/600/300',
    url: '#', publishedAt: '2026-06-17T08:00:00Z', readTime: 4, trending: true,
  },
  {
    id: 2, title: 'Bitcoin surpasses $150,000 amid institutional demand',
    summary: 'Major financial institutions continue to accumulate Bitcoin as a reserve asset, pushing prices to new all-time highs.',
    source: 'CoinDesk', category: 'Crypto', tags: ['bitcoin', 'crypto', 'finance'],
    image: 'https://picsum.photos/seed/btc2/600/300',
    url: '#', publishedAt: '2026-06-17T07:30:00Z', readTime: 3, trending: true,
  },
  {
    id: 3, title: 'NASA confirms water ice found on Mars south pole',
    summary: 'New data from the Perseverance rover confirms substantial deposits of water ice beneath the Martian surface.',
    source: 'NASA', category: 'Science', tags: ['nasa', 'mars', 'space'],
    image: 'https://picsum.photos/seed/mars3/600/300',
    url: '#', publishedAt: '2026-06-16T15:00:00Z', readTime: 5, trending: false,
  },
  {
    id: 4, title: 'React 20 announced with zero-bundle server components',
    summary: 'The React team unveils version 20, featuring native server components with zero client-side JavaScript overhead.',
    source: 'Dev.to', category: 'Technology', tags: ['react', 'javascript', 'frontend'],
    image: 'https://picsum.photos/seed/react4/600/300',
    url: '#', publishedAt: '2026-06-16T12:00:00Z', readTime: 6, trending: true,
  },
  {
    id: 5, title: 'Global EV sales top 30 million units in first half of 2026',
    summary: 'Electric vehicle adoption accelerates globally, with China and Europe leading the charge in sustainable transport.',
    source: 'Reuters', category: 'Business', tags: ['ev', 'tesla', 'climate'],
    image: 'https://picsum.photos/seed/ev5/600/300',
    url: '#', publishedAt: '2026-06-16T09:00:00Z', readTime: 3, trending: false,
  },
  {
    id: 6, title: 'New study links daily walking to 40% lower dementia risk',
    summary: 'Researchers found that walking 8,000 steps per day significantly reduces the likelihood of developing dementia.',
    source: 'Health Journal', category: 'Health', tags: ['health', 'fitness', 'research'],
    image: 'https://picsum.photos/seed/health6/600/300',
    url: '#', publishedAt: '2026-06-15T14:00:00Z', readTime: 4, trending: false,
  },
  {
    id: 7, title: 'World Cup 2026: USA advances to semifinals',
    summary: 'In a thrilling match, the US national team defeated France 3-2, booking their place in the World Cup semifinals.',
    source: 'ESPN', category: 'Sports', tags: ['worldcup', 'soccer', 'usa'],
    image: 'https://picsum.photos/seed/soccer7/600/300',
    url: '#', publishedAt: '2026-06-15T22:00:00Z', readTime: 2, trending: true,
  },
  {
    id: 8, title: 'Quantum computing achieves 10,000-qubit milestone',
    summary: 'IBM announces their new quantum processor with 10,000 qubits, opening the door to real-world quantum advantage.',
    source: 'IEEE Spectrum', category: 'Science', tags: ['quantum', 'ibm', 'computing'],
    image: 'https://picsum.photos/seed/quantum8/600/300',
    url: '#', publishedAt: '2026-06-15T11:00:00Z', readTime: 7, trending: false,
  },
  {
    id: 9, title: 'Apple unveils Vision Pro 2 with all-day battery life',
    summary: 'The second generation of Apple\'s spatial computing headset features a slimmer design, better resolution, and full-day use.',
    source: 'The Verge', category: 'Technology', tags: ['apple', 'visionpro', 'ar'],
    image: 'https://picsum.photos/seed/apple9/600/300',
    url: '#', publishedAt: '2026-06-14T18:00:00Z', readTime: 5, trending: true,
  },
  {
    id: 10, title: 'Global inflation hits 2-year low as central banks ease rates',
    summary: 'Inflation across G20 nations has fallen to its lowest level in two years, prompting several central banks to cut interest rates.',
    source: 'Financial Times', category: 'Business', tags: ['economy', 'inflation', 'finance'],
    image: 'https://picsum.photos/seed/econ10/600/300',
    url: '#', publishedAt: '2026-06-14T10:00:00Z', readTime: 4, trending: false,
  },
  {
    id: 11, title: 'Ethereum ETF approvals spark new DeFi rally',
    summary: 'Following spot Ethereum ETF approvals, DeFi protocols see record inflows as institutional capital enters the ecosystem.',
    source: 'CoinDesk', category: 'Crypto', tags: ['ethereum', 'defi', 'etf'],
    image: 'https://picsum.photos/seed/eth11/600/300',
    url: '#', publishedAt: '2026-06-13T16:00:00Z', readTime: 3, trending: false,
  },
  {
    id: 12, title: 'SpaceX Starship completes first crewed orbital mission',
    summary: 'Four astronauts returned safely after completing a 3-day orbit aboard SpaceX\'s fully reusable Starship vehicle.',
    source: 'Space.com', category: 'Science', tags: ['spacex', 'starship', 'space'],
    image: 'https://picsum.photos/seed/spacex12/600/300',
    url: '#', publishedAt: '2026-06-13T08:00:00Z', readTime: 6, trending: true,
  },
];

const CATEGORIES = ['Technology', 'Crypto', 'Science', 'Business', 'Health', 'Sports'];

// ── API Routes ────────────────────────────────────────────────────────────────

// GET all articles (supports ?category=, ?tags=, ?search=, ?trending=, ?sort=)
app.get('/api/news', (req, res) => {
  const { category, tags, search, trending, sort = 'latest' } = req.query;
  let articles = [...NEWS_DB];

  if (category) {
    articles = articles.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }
  if (tags) {
    const tagList = tags.split(',').map(t => t.trim().toLowerCase());
    articles = articles.filter(a => tagList.some(t => a.tags.includes(t)));
  }
  if (search) {
    const q = search.toLowerCase();
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some(t => t.includes(q))
    );
  }
  if (trending === 'true') {
    articles = articles.filter(a => a.trending);
  }

  // Sort
  if (sort === 'latest') articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  else if (sort === 'oldest') articles.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
  else if (sort === 'readtime') articles.sort((a, b) => a.readTime - b.readTime);

  res.json({ articles, total: articles.length });
});

// GET single article
app.get('/api/news/:id', (req, res) => {
  const article = NEWS_DB.find(a => a.id === parseInt(req.params.id));
  if (!article) return res.status(404).json({ error: 'Article not found.' });
  res.json({ article });
});

// GET categories
app.get('/api/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

// GET trending
app.get('/api/trending', (req, res) => {
  res.json({ articles: NEWS_DB.filter(a => a.trending) });
});

// POST personalized feed — pass preferred categories and tags
app.post('/api/feed', (req, res) => {
  const { categories = [], tags = [], excludeRead = [] } = req.body;
  let feed = NEWS_DB.filter(a => !excludeRead.includes(a.id));

  if (categories.length > 0 || tags.length > 0) {
    feed = feed.filter(a =>
      categories.includes(a.category) ||
      tags.some(t => a.tags.includes(t.toLowerCase()))
    );
  }

  // Score by relevance
  feed = feed.map(a => {
    let score = 0;
    if (categories.includes(a.category)) score += 10;
    a.tags.forEach(t => { if (tags.includes(t)) score += 5; });
    if (a.trending) score += 3;
    return { ...a, score };
  }).sort((a, b) => b.score - a.score);

  res.json({ feed, total: feed.length });
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Personalized News Aggregator running on http://localhost:${PORT}`));
