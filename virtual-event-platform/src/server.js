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

// ── In-memory data store ──────────────────────────────────────────────────────
let events = [
  {
    id: 'evt_1',
    title: 'Web3 & Blockchain Summit 2026',
    description: 'Deep-dive into decentralized technologies, smart contracts, and the future of the web.',
    host: 'Alice Johnson',
    date: '2026-07-15T14:00:00Z',
    category: 'Technology',
    capacity: 200,
    attendees: ['user_1', 'user_2'],
    tags: ['blockchain', 'web3', 'defi'],
    status: 'upcoming',
  },
  {
    id: 'evt_2',
    title: 'AI & Machine Learning Workshop',
    description: 'Hands-on workshop covering the latest in neural networks, LLMs, and practical ML deployment.',
    host: 'Bob Chen',
    date: '2026-07-20T10:00:00Z',
    category: 'Technology',
    capacity: 100,
    attendees: ['user_3'],
    tags: ['ai', 'ml', 'deep-learning'],
    status: 'upcoming',
  },
  {
    id: 'evt_3',
    title: 'Global Startup Pitch Night',
    description: 'Watch 10 startups pitch their ideas to a panel of top investors. Live Q&A included.',
    host: 'Sarah Williams',
    date: '2026-07-10T18:00:00Z',
    category: 'Business',
    capacity: 500,
    attendees: [],
    tags: ['startup', 'funding', 'pitch'],
    status: 'live',
  },
];

let chatRooms = {}; // eventId → [messages]
let activeUsers = {}; // socketId → { userId, name, eventId }

// ── REST API ──────────────────────────────────────────────────────────────────

// GET all events (with optional category filter)
app.get('/api/events', (req, res) => {
  const { category, status } = req.query;
  let filtered = [...events];
  if (category) filtered = filtered.filter(e => e.category.toLowerCase() === category.toLowerCase());
  if (status) filtered = filtered.filter(e => e.status === status);
  res.json({ events: filtered });
});

// GET single event
app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  res.json({ event });
});

// POST create event
app.post('/api/events', (req, res) => {
  const { title, description, host, date, category, capacity, tags } = req.body;
  if (!title || !host || !date) {
    return res.status(400).json({ error: 'title, host, and date are required.' });
  }
  const event = {
    id: `evt_${Date.now()}`,
    title, description: description || '', host, date, category: category || 'General',
    capacity: capacity || 100, attendees: [], tags: tags || [], status: 'upcoming',
  };
  events.push(event);
  io.emit('event:created', event);
  res.status(201).json({ event });
});

// POST register for event
app.post('/api/events/:id/register', (req, res) => {
  const { userId } = req.body;
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  if (event.attendees.includes(userId)) {
    return res.status(400).json({ error: 'Already registered.' });
  }
  if (event.attendees.length >= event.capacity) {
    return res.status(400).json({ error: 'Event is at full capacity.' });
  }
  event.attendees.push(userId);
  io.to(event.id).emit('event:attendee_joined', { eventId: event.id, userId, count: event.attendees.length });
  res.json({ success: true, attendees: event.attendees.length });
});

// DELETE unregister
app.delete('/api/events/:id/register/:userId', (req, res) => {
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  event.attendees = event.attendees.filter(u => u !== req.params.userId);
  res.json({ success: true, attendees: event.attendees.length });
});

// GET categories
app.get('/api/categories', (req, res) => {
  const cats = [...new Set(events.map(e => e.category))];
  res.json({ categories: cats });
});

// ── Socket.IO — live event rooms ──────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);

  // Join an event room (live chat + presence)
  socket.on('room:join', ({ eventId, userId, name }) => {
    socket.join(eventId);
    activeUsers[socket.id] = { userId, name, eventId };

    if (!chatRooms[eventId]) chatRooms[eventId] = [];

    // Send chat history
    socket.emit('chat:history', chatRooms[eventId].slice(-50));

    // Broadcast presence
    const roomUsers = Object.values(activeUsers).filter(u => u.eventId === eventId);
    io.to(eventId).emit('room:presence', { count: roomUsers.length, users: roomUsers.map(u => u.name) });

    socket.to(eventId).emit('chat:system', { message: `${name} joined the event`, timestamp: new Date().toISOString() });
  });

  // Chat message
  socket.on('chat:message', ({ eventId, userId, name, message }) => {
    const msg = { id: Date.now(), userId, name, message, timestamp: new Date().toISOString() };
    if (!chatRooms[eventId]) chatRooms[eventId] = [];
    chatRooms[eventId].push(msg);
    io.to(eventId).emit('chat:message', msg);
  });

  // Raise hand / reaction
  socket.on('event:reaction', ({ eventId, name, reaction }) => {
    io.to(eventId).emit('event:reaction', { name, reaction, timestamp: new Date().toISOString() });
  });

  // Leave room
  socket.on('room:leave', ({ eventId, name }) => {
    socket.leave(eventId);
    delete activeUsers[socket.id];
    socket.to(eventId).emit('chat:system', { message: `${name} left the event`, timestamp: new Date().toISOString() });
    const roomUsers = Object.values(activeUsers).filter(u => u.eventId === eventId);
    io.to(eventId).emit('room:presence', { count: roomUsers.length, users: roomUsers.map(u => u.name) });
  });

  socket.on('disconnect', () => {
    const user = activeUsers[socket.id];
    if (user) {
      socket.to(user.eventId).emit('chat:system', { message: `${user.name} disconnected`, timestamp: new Date().toISOString() });
      delete activeUsers[socket.id];
    }
  });
});

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => console.log(`Virtual Event Platform running on http://localhost:${PORT}`));
