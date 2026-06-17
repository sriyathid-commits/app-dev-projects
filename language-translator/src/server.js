const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

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

// Mock translation engine — replaces with real API (LibreTranslate / DeepL / Google) in production
// Uses a simple word-substitution demo so the app works offline out of the box
const mockTranslations = {
  'hello': { es: 'Hola', fr: 'Bonjour', de: 'Hallo', it: 'Ciao', pt: 'Olá', ja: 'こんにちは', zh: '你好', ar: 'مرحبا', hi: 'नमस्ते', ru: 'Привет', ko: '안녕하세요' },
  'goodbye': { es: 'Adiós', fr: 'Au revoir', de: 'Auf Wiedersehen', it: 'Arrivederci', pt: 'Adeus', ja: 'さようなら', zh: '再见', ar: 'وداعا', hi: 'अलविदा', ru: 'До свидания', ko: '안녕히 가세요' },
  'thank you': { es: 'Gracias', fr: 'Merci', de: 'Danke', it: 'Grazie', pt: 'Obrigado', ja: 'ありがとう', zh: '谢谢', ar: 'شكرا', hi: 'धन्यवाद', ru: 'Спасибо', ko: '감사합니다' },
  'yes': { es: 'Sí', fr: 'Oui', de: 'Ja', it: 'Sì', pt: 'Sim', ja: 'はい', zh: '是的', ar: 'نعم', hi: 'हाँ', ru: 'Да', ko: '예' },
  'no': { es: 'No', fr: 'Non', de: 'Nein', it: 'No', pt: 'Não', ja: 'いいえ', zh: '不', ar: 'لا', hi: 'नहीं', ru: 'Нет', ko: '아니요' },
  'how are you': { es: '¿Cómo estás?', fr: 'Comment allez-vous?', de: 'Wie geht es Ihnen?', it: 'Come stai?', pt: 'Como você está?', ja: 'お元気ですか', zh: '你好吗', ar: 'كيف حالك', hi: 'आप कैसे हैं', ru: 'Как дела?', ko: '어떻게 지내세요?' },
  'good morning': { es: 'Buenos días', fr: 'Bonjour', de: 'Guten Morgen', it: 'Buongiorno', pt: 'Bom dia', ja: 'おはようございます', zh: '早上好', ar: 'صباح الخير', hi: 'सुप्रभात', ru: 'Доброе утро', ko: '좋은 아침이에요' },
  'water': { es: 'Agua', fr: 'Eau', de: 'Wasser', it: 'Acqua', pt: 'Água', ja: '水', zh: '水', ar: 'ماء', hi: 'पानी', ru: 'Вода', ko: '물' },
  'food': { es: 'Comida', fr: 'Nourriture', de: 'Essen', it: 'Cibo', pt: 'Comida', ja: '食べ物', zh: '食物', ar: 'طعام', hi: 'खाना', ru: 'Еда', ko: '음식' },
  'help': { es: 'Ayuda', fr: 'Aide', de: 'Hilfe', it: 'Aiuto', pt: 'Ajuda', ja: '助けて', zh: '帮助', ar: 'مساعدة', hi: 'मदद', ru: 'Помощь', ko: '도움' },
};

function translateText(text, targetLang) {
  if (targetLang === 'en') return text;
  const lower = text.toLowerCase().trim();
  // Check exact phrase match first
  if (mockTranslations[lower] && mockTranslations[lower][targetLang]) {
    return mockTranslations[lower][targetLang];
  }
  // Word-by-word fallback
  const words = lower.split(' ');
  const translated = words.map(word => {
    if (mockTranslations[word] && mockTranslations[word][targetLang]) {
      return mockTranslations[word][targetLang];
    }
    return word;
  });
  return translated.join(' ') + ` [${LANGUAGES[targetLang]}]`;
}

// REST endpoint for single translation
app.post('/api/translate', (req, res) => {
  const { text, targetLang, sourceLang = 'en' } = req.body;
  if (!text || !targetLang) {
    return res.status(400).json({ error: 'text and targetLang are required.' });
  }
  const translated = translateText(text, targetLang);
  res.json({ original: text, translated, sourceLang, targetLang, language: LANGUAGES[targetLang] });
});

// GET supported languages
app.get('/api/languages', (req, res) => {
  res.json({ languages: LANGUAGES });
});

// Socket.IO for real-time translation
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('translate', ({ text, targetLang, sourceLang = 'en' }) => {
    if (!text || !targetLang) return;
    // Simulate slight processing delay for realism
    setTimeout(() => {
      const translated = translateText(text, targetLang);
      socket.emit('translation', {
        original: text,
        translated,
        sourceLang,
        targetLang,
        language: LANGUAGES[targetLang],
        timestamp: new Date().toISOString(),
      });
    }, 150);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`Real-Time Language Translator running on http://localhost:${PORT}`));
