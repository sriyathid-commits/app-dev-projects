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

// Multiple free translation API endpoints — fallback chain
async function translateWithLibre(text, targetLang, sourceLang = 'en') {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ q: text, source: sourceLang, target: targetLang, format: 'text' });
    const options = {
      hostname: 'libretranslate.com',
      path: '/translate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.translatedText || null);
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => { req.destroy(); resolve(null); });
    req.write(postData);
    req.end();
  });
}

async function translateWithMyMemory(text, targetLang, sourceLang = 'en') {
  return new Promise((resolve) => {
    const langPair = `${sourceLang}|${targetLang}`;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const t = json.responseData?.translatedText;
          // Reject if it's the quota warning
          if (t && !t.includes('MYMEMORY WARNING')) resolve(t);
          else resolve(null);
        } catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

// Fallback mock for common phrases
const mockTranslations = {
  'hello': { es: 'Hola', fr: 'Bonjour', de: 'Hallo', it: 'Ciao', pt: 'Olá', ja: 'こんにちは', zh: '你好', ar: 'مرحبا', hi: 'नमस्ते', ru: 'Привет', ko: '안녕하세요' },
  'hi': { es: 'Hola', fr: 'Salut', de: 'Hallo', it: 'Ciao', pt: 'Oi', ja: 'やあ', zh: '嗨', ar: 'مرحبا', hi: 'नमस्ते', ru: 'Привет', ko: '안녕' },
  'goodbye': { es: 'Adiós', fr: 'Au revoir', de: 'Auf Wiedersehen', it: 'Arrivederci', pt: 'Adeus', ja: 'さようなら', zh: '再见', ar: 'وداعا', hi: 'अलविदा', ru: 'До свидания', ko: '안녕히 가세요' },
  'thank you': { es: 'Gracias', fr: 'Merci', de: 'Danke', it: 'Grazie', pt: 'Obrigado', ja: 'ありがとう', zh: '谢谢', ar: 'شكرا', hi: 'धन्यवाद', ru: 'Спасибо', ko: '감사합니다' },
  'thanks': { es: 'Gracias', fr: 'Merci', de: 'Danke', it: 'Grazie', pt: 'Obrigado', ja: 'ありがとう', zh: '谢谢', ar: 'شكرا', hi: 'शुक्रिया', ru: 'Спасибо', ko: '고마워요' },
  'yes': { es: 'Sí', fr: 'Oui', de: 'Ja', it: 'Sì', pt: 'Sim', ja: 'はい', zh: '是的', ar: 'نعم', hi: 'हाँ', ru: 'Да', ko: '예' },
  'no': { es: 'No', fr: 'Non', de: 'Nein', it: 'No', pt: 'Não', ja: 'いいえ', zh: '不', ar: 'لا', hi: 'नहीं', ru: 'Нет', ko: '아니요' },
  'how are you': { es: '¿Cómo estás?', fr: 'Comment allez-vous?', de: 'Wie geht es Ihnen?', it: 'Come stai?', pt: 'Como você está?', ja: 'お元気ですか', zh: '你好吗', ar: 'كيف حالك', hi: 'आप कैसे हैं?', ru: 'Как дела?', ko: '어떻게 지내세요?' },
  'good morning': { es: 'Buenos días', fr: 'Bonjour', de: 'Guten Morgen', it: 'Buongiorno', pt: 'Bom dia', ja: 'おはようございます', zh: '早上好', ar: 'صباح الخير', hi: 'सुप्रभात', ru: 'Доброе утро', ko: '좋은 아침이에요' },
  'good night': { es: 'Buenas noches', fr: 'Bonne nuit', de: 'Gute Nacht', it: 'Buonanotte', pt: 'Boa noite', ja: 'おやすみなさい', zh: '晚安', ar: 'تصبح على خير', hi: 'शुभ रात्रि', ru: 'Спокойной ночи', ko: '잘 자요' },
  'i love you': { es: 'Te quiero', fr: 'Je t\'aime', de: 'Ich liebe dich', it: 'Ti amo', pt: 'Eu te amo', ja: '愛してる', zh: '我爱你', ar: 'أحبك', hi: 'मैं तुमसे प्यार करता हूँ', ru: 'Я тебя люблю', ko: '사랑해요' },
  'my name is': { es: 'Me llamo', fr: 'Je m\'appelle', de: 'Ich heiße', it: 'Mi chiamo', pt: 'Meu nome é', ja: '私の名前は', zh: '我的名字是', ar: 'اسمي', hi: 'मेरा नाम है', ru: 'Меня зовут', ko: '제 이름은' },
  'water': { es: 'Agua', fr: 'Eau', de: 'Wasser', it: 'Acqua', pt: 'Água', ja: '水', zh: '水', ar: 'ماء', hi: 'पानी', ru: 'Вода', ko: '물' },
  'food': { es: 'Comida', fr: 'Nourriture', de: 'Essen', it: 'Cibo', pt: 'Comida', ja: '食べ物', zh: '食物', ar: 'طعام', hi: 'खाना', ru: 'Еда', ko: '음식' },
  'help': { es: 'Ayuda', fr: 'Aide', de: 'Hilfe', it: 'Aiuto', pt: 'Ajuda', ja: '助けて', zh: '帮助', ar: 'مساعدة', hi: 'मदद', ru: 'Помощь', ko: '도움' },
  'where': { es: 'Dónde', fr: 'Où', de: 'Wo', it: 'Dove', pt: 'Onde', ja: 'どこ', zh: '哪里', ar: 'أين', hi: 'कहाँ', ru: 'Где', ko: '어디' },
  'what': { es: 'Qué', fr: 'Quoi', de: 'Was', it: 'Cosa', pt: 'O que', ja: '何', zh: '什么', ar: 'ماذا', hi: 'क्या', ru: 'Что', ko: '무엇' },
  'when': { es: 'Cuándo', fr: 'Quand', de: 'Wann', it: 'Quando', pt: 'Quando', ja: 'いつ', zh: '什么时候', ar: 'متى', hi: 'कब', ru: 'Когда', ko: '언제' },
};

async function translateText(text, targetLang, sourceLang = 'en') {
  if (targetLang === sourceLang) return text;
  const lower = text.toLowerCase().trim();

  // 1. Check mock dictionary first (instant)
  if (mockTranslations[lower]?.[targetLang]) {
    return mockTranslations[lower][targetLang];
  }

  // 2. Try LibreTranslate
  const libreResult = await translateWithLibre(text, targetLang, sourceLang);
  if (libreResult) return libreResult;

  // 3. Try MyMemory as fallback
  const myMemoryResult = await translateWithMyMemory(text, targetLang, sourceLang);
  if (myMemoryResult) return myMemoryResult;

  // 4. Last resort — return original with language label
  return `${text} [${LANGUAGES[targetLang]}]`;
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
