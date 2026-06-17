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

// Helper: make HTTPS GET request
function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}

// Helper: make HTTPS POST request
function httpsPost(hostname, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = typeof body === 'string' ? body : JSON.stringify(body);
    const options = {
      hostname, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData), ...headers },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
    req.write(postData);
    req.end();
  });
}

// --- Translation methods (tried in order) ---

// 1. MyMemory (5000 chars/day free per IP — resets daily)
async function tryMyMemory(text, targetLang, sourceLang) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    const { body } = await httpsGet(url);
    const json = JSON.parse(body);
    const t = json.responseData?.translatedText;
    if (t && !t.toUpperCase().includes('MYMEMORY WARNING') && t !== text) return t;
  } catch {}
  return null;
}

// 2. Lingva Translate (open source Google Translate mirror)
async function tryLingva(text, targetLang, sourceLang) {
  try {
    const url = `https://lingva.ml/api/v1/${sourceLang}/${targetLang}/${encodeURIComponent(text)}`;
    const { body } = await httpsGet(url, { 'User-Agent': 'Mozilla/5.0' });
    const json = JSON.parse(body);
    if (json.translation && json.translation !== text) return json.translation;
  } catch {}
  return null;
}

// 3. Google Translate unofficial
async function tryGoogle(text, targetLang, sourceLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const { body } = await httpsGet(url, { 'User-Agent': 'Mozilla/5.0' });
    const json = JSON.parse(body);
    const translated = json[0].map(item => item[0]).filter(Boolean).join('');
    if (translated && translated !== text) return translated;
  } catch {}
  return null;
}

// 4. LibreTranslate public instance
async function tryLibre(text, targetLang, sourceLang) {
  try {
    const { body } = await httpsPost('libretranslate.com', '/translate',
      { q: text, source: sourceLang, target: targetLang, format: 'text' });
    const json = JSON.parse(body);
    if (json.translatedText && json.translatedText !== text) return json.translatedText;
  } catch {}
  return null;
}

// Master translate — tries all 4 in order
async function translateText(text, targetLang, sourceLang = 'en') {
  if (targetLang === sourceLang) return text;

  const result =
    await tryMyMemory(text, targetLang, sourceLang) ||
    await tryLingva(text, targetLang, sourceLang) ||
    await tryGoogle(text, targetLang, sourceLang) ||
    await tryLibre(text, targetLang, sourceLang);

  return result || text;
}

// REST endpoint
app.post('/api/translate', async (req, res) => {
  const { text, targetLang, sourceLang = 'en' } = req.body;
  if (!text || !targetLang) return res.status(400).json({ error: 'text and targetLang are required.' });
  const translated = await translateText(text, targetLang, sourceLang);
  res.json({ original: text, translated, sourceLang, targetLang, language: LANGUAGES[targetLang] });
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
    const translated = await translateText(text, targetLang, sourceLang);
    socket.emit('translation', {
      original: text, translated, sourceLang, targetLang,
      language: LANGUAGES[targetLang], timestamp: new Date().toISOString(),
    });
  });
  socket.on('disconnect', () => console.log(`Client disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`Real-Time Language Translator running on http://localhost:${PORT}`));
