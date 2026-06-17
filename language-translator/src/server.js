const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const https = require('https');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Supported languages map
const LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ja: 'Japanese',
  zh: 'Chinese',
  ar: 'Arabic',
  hi: 'Hindi',
  ru: 'Russian',
  ko: 'Korean',
};

// Real translation using MyMemory API (free, no API key needed)
function translateText(text, targetLang, sourceLang = 'en') {
  return new Promise((resolve) => {
    if (targetLang === sourceLang) return resolve(text);

    const langPair = `${sourceLang}|${targetLang}`;
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=${langPair}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const translated = json.responseData?.translatedText || text;
          resolve(translated);
        } catch {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

// REST endpoint for single translation
app.post('/api/translate', async (req, res) => {
  const { text, targetLang, sourceLang = 'en' } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'text and targetLang are required.' });
  }
  const translated = await translateText(text, targetLang, sourceLang);
  res.json({ original: text, translated, sourceLang, targetLang, language: LANGUAGES[targetLang] });
});

// GET supported languages
app.get('/api/languages', (req, res) => {
  res.json({ languages: LANGUAGES });
});

// Socket.IO for real-time translation
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('translate', async ({ text, targetLang, sourceLang = 'en' }) => {
    if (!text || !targetLang) return;
    const translated = await translateText(text, targetLang, sourceLang);
    socket.emit('translation', {
      original: text,
      translated,
      sourceLang,
      targetLang,
      language: LANGUAGES[targetLang],
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`Real-Time Language Translator running on http://localhost:${PORT}`));
