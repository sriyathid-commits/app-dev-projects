# App Development Projects

4 full-stack Node.js projects built with Express, Socket.IO, and vanilla JavaScript — all deployed live on Render.

---

## 🚀 Live Demo Links

| # | Project | Live URL |
|---|---------|----------|
| ⛓️ | Blockchain Voting System | [blockchain-voting-ufxr.onrender.com](https://blockchain-voting-ufxr.onrender.com) |
| 🌐 | Real-Time Language Translator | [language-translator-0uqu.onrender.com](https://language-translator-0uqu.onrender.com) |
| 🎪 | Virtual Event Platform | [virtual-event-platform-18j8.onrender.com](https://virtual-event-platform-18j8.onrender.com) |
| 📰 | Personalized News Aggregator | [news-aggregator-y1rn.onrender.com](https://news-aggregator-y1rn.onrender.com) |

> ⚠️ Free Render instances spin down after 15 mins of inactivity. First load may take 30–50 seconds.

---

## Projects

### 1. ⛓️ Blockchain Voting System — `blockchain-voting/` — [Live](https://blockchain-voting-ufxr.onrender.com)
A tamper-proof voting app built on a local SHA-256 blockchain.

**Features**
- Custom blockchain with genesis block, hash chaining, and chain validation
- Double-vote prevention per voter ID
- Live results with percentage bars and winner tracking
- Full blockchain ledger viewer in the UI

**Run Locally**
```bash
cd blockchain-voting
npm install
npm start
# → http://localhost:3001
```

---

### 2. 🌐 Real-Time Language Translator — `language-translator/` — [Live](https://language-translator-0uqu.onrender.com)
Instant translation with WebSocket-powered live updates as you type.

**Features**
- 12 supported languages (ES, FR, DE, IT, PT, JA, ZH, AR, HI, RU, KO)
- Real-time translation via Socket.IO (debounced on keypress)
- Translation history (last 20 entries)
- Swap languages, copy to clipboard, connection status indicator
- Powered by Google Translate unofficial API

**Run Locally**
```bash
cd language-translator
npm install
npm start
# → http://localhost:3002
```

---

### 3. 🎪 Virtual Event Platform — `virtual-event-platform/` — [Live](https://virtual-event-platform-18j8.onrender.com)
A full virtual event hosting platform with real-time chat and presence.

**Features**
- Browse, create, and register for events
- Live Socket.IO chat rooms per event
- Real-time attendee presence tracking
- Emoji reactions (👏 🔥 ❤️ 🤔 ✋)
- Category filters, search, status badges (Live / Upcoming)
- Event capacity enforcement

**Run Locally**
```bash
cd virtual-event-platform
npm install
npm start
# → http://localhost:3003
```

---

### 4. 📰 Personalized News Aggregator — `news-aggregator/` — [Live](https://news-aggregator-y1rn.onrender.com)
A curated news feed with personalization, search, and bookmarks.

**Features**
- 12 seeded articles across 6 categories (Technology, Crypto, Science, Business, Health, Sports)
- "For You" feed scored by preferred categories and tags
- Trending feed, tag cloud filtering, full-text search
- Article detail modal with read time
- Bookmark articles (persisted in localStorage)
- Sort by Latest / Oldest / Quick Reads

**Run Locally**
```bash
cd news-aggregator
npm install
npm start
# → http://localhost:3004
```

---

## Quick Start — Install All

```bash
npm run install:all
```

Then start each project in a separate terminal:

```bash
npm run start:voting      # http://localhost:3001
npm run start:translator  # http://localhost:3002
npm run start:events      # http://localhost:3003
npm run start:news        # http://localhost:3004
```

---

## Project Structure

```
app-dev-projects/
├── blockchain-voting/
│   ├── src/
│   │   ├── blockchain.js     # Block & Blockchain classes (SHA-256)
│   │   ├── voting.js         # VotingSystem with double-vote protection
│   │   └── server.js         # Express REST API
│   ├── public/index.html     # Full voting UI
│   └── package.json
│
├── language-translator/
│   ├── src/server.js         # Express + Socket.IO, Google Translate API
│   ├── public/index.html     # Real-time translation UI
│   └── package.json
│
├── virtual-event-platform/
│   ├── src/server.js         # Express + Socket.IO, event rooms
│   ├── public/index.html     # Event platform UI
│   └── package.json
│
├── news-aggregator/
│   ├── src/server.js         # Express REST API, personalized feed
│   ├── public/index.html     # News feed UI
│   └── package.json
│
├── package.json              # Root scripts
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Server | Express 4 |
| Real-time | Socket.IO 4 |
| Blockchain | Custom SHA-256 (crypto module) |
| Translation | Google Translate API (unofficial) |
| Frontend | Vanilla JS, HTML5, CSS3 |
| Storage | In-memory + localStorage |
| Deployment | Render (free tier) |
