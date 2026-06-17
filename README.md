# App Development Projects

4 full-stack Node.js projects built with Express, Socket.IO, and vanilla JavaScript.

---

## Projects

### 1. ⛓️ Blockchain Voting System — `blockchain-voting/` — Port 3001
A tamper-proof voting app built on a local SHA-256 blockchain.

**Features**
- Custom blockchain with genesis block, hash chaining, and chain validation
- Double-vote prevention per voter ID
- Live results with percentage bars and winner tracking
- Full blockchain ledger viewer in the UI

**Run**
```bash
cd blockchain-voting
npm install
npm start
# → http://localhost:3001
```

---

### 2. 🌐 Real-Time Language Translator — `language-translator/` — Port 3002
Instant translation with WebSocket-powered live updates as you type.

**Features**
- 12 supported languages (ES, FR, DE, IT, PT, JA, ZH, AR, HI, RU, KO)
- Real-time translation via Socket.IO (debounced on keypress)
- Translation history (last 20 entries)
- Swap languages, copy to clipboard, connection status indicator
- Plug in LibreTranslate / DeepL / Google Translate API for production

**Run**
```bash
cd language-translator
npm install
npm start
# → http://localhost:3002
```

---

### 3. 🎪 Virtual Event Platform — `virtual-event-platform/` — Port 3003
A full virtual event hosting platform with real-time chat and presence.

**Features**
- Browse, create, and register for events
- Live Socket.IO chat rooms per event
- Real-time attendee presence tracking
- Emoji reactions (👏 🔥 ❤️ 🤔 ✋)
- Category filters, search, status badges (Live / Upcoming)
- Event capacity enforcement

**Run**
```bash
cd virtual-event-platform
npm install
npm start
# → http://localhost:3003
```

---

### 4. 📰 Personalized News Aggregator — `news-aggregator/` — Port 3004
A curated news feed with personalization, search, and bookmarks.

**Features**
- 12 seeded articles across 6 categories (Technology, Crypto, Science, Business, Health, Sports)
- "For You" feed scored by preferred categories and tags
- Trending feed, tag cloud filtering, full-text search
- Article detail modal with read time
- Bookmark articles (persisted in localStorage)
- Sort by Latest / Oldest / Quick Reads
- Connect NewsAPI.org for live articles in production

**Run**
```bash
cd news-aggregator
npm install
npm start
# → http://localhost:3004
```

---

## Quick Start — Install All

From the `app-dev-projects/` root:

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
│   ├── src/server.js         # Express + Socket.IO, 12 languages
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
| Frontend | Vanilla JS, HTML5, CSS3 |
| Storage | In-memory + localStorage |
