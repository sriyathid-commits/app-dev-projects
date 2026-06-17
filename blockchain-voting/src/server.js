const express = require('express');
const path = require('path');
const VotingSystem = require('./voting');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize with default candidates
const voting = new VotingSystem(['Alice', 'Bob', 'Charlie']);

// GET all candidates
app.get('/api/candidates', (req, res) => {
  res.json({ candidates: voting.candidates });
});

// POST cast a vote
app.post('/api/vote', (req, res) => {
  const { voterId, candidate } = req.body;
  if (!voterId || !candidate) {
    return res.status(400).json({ error: 'voterId and candidate are required.' });
  }
  try {
    const block = voting.castVote(voterId, candidate);
    res.json({ success: true, block });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET voting results
app.get('/api/results', (req, res) => {
  res.json({
    results: voting.getResults(),
    winner: voting.getWinner(),
    chainValid: voting.isValid(),
    totalVotes: voting.voters.size,
  });
});

// GET full blockchain
app.get('/api/chain', (req, res) => {
  res.json({ chain: voting.getChain() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Blockchain Voting System running on http://localhost:${PORT}`));
