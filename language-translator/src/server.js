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

const LANGUAGES = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  it: 'Italian', pt: 'Portuguese', ja: 'Japanese', zh: 'Chinese',
  ar: 'Arabic', hi: 'Hindi', ru: 'Russian', ko: 'Korean',
};

// Google Translate unofficial API (no key needed)
function translateText(text, targetLang, sourceLang = 'en') {
  return new Promise((resolve) => {
    if (targetLang === sourceLang) return resolve(text);

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          // Response format: [[[translatedText, originalText, ...]]]
          const translated = json[0].map(item => item[0]).filter(Boolean).join('');
          resolve(translated || text);
        } catch {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

// REST endpoint
app.post('/api/translate', async (req, res) => {
  const { text, targetLang, sourceLang = 'en' } = req.body;
  if (!text || !targetLang) return res.status(400).json({ error: 'text and targetLang are required.' });
  try {
    const translated = await translateText(text, targetLang, sourceLang);
    res.json({ original: text, translated, sourceLang, targetLang, language: LANGUAGES[targetLang] });
  } catch (err) {
    res.status(500).json({ error: 'Translation failed.' });
  }
});

// GET supported languages
app.get('/api/languages', (req, res) => {
  res.json({ languages: LANGUAGES });
});

// Socket.IO real-time translation
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('translate', async ({ text, targetLang, sourceLang = 'en' }) => {
    if (!text || !targetLang) return;
    try {
      const translated = await translateText(text, targetLang, sourceLang);
      socket.emit('translation', {
        original: text, translated, sourceLang, targetLang,
        language: LANGUAGES[targetLang], timestamp: new Date().toISOString(),
      });
    } catch {
      socket.emit('translation', {
        original: text, translated: text, sourceLang, targetLang,
        language: LANGUAGES[targetLang], timestamp: new Date().toISOString(),
      });
    }
  });

  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`Real-Time Language Translator running on http://localhost:${PORT}`));
