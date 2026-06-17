const { Blockchain } = require('./blockchain');

class VotingSystem {
  constructor(candidates) {
    this.blockchain = new Blockchain();
    this.candidates = candidates;
    this.voters = new Set(); // tracks who has already voted (by voter ID)
  }

  registerCandidate(name) {
    if (!this.candidates.includes(name)) {
      this.candidates.push(name);
      console.log(`Candidate "${name}" registered.`);
    } else {
      console.log(`Candidate "${name}" already exists.`);
    }
  }

  castVote(voterId, candidate) {
    if (this.voters.has(voterId)) {
      throw new Error(`Voter "${voterId}" has already voted.`);
    }
    if (!this.candidates.includes(candidate)) {
      throw new Error(`Candidate "${candidate}" does not exist.`);
    }

    this.voters.add(voterId);
    const block = this.blockchain.addBlock({ voterId, candidate, timestamp: new Date().toISOString() });
    console.log(`Vote cast by "${voterId}" for "${candidate}". Block #${block.index}`);
    return block;
  }

  getResults() {
    const tally = {};
    this.candidates.forEach(c => (tally[c] = 0));

    // Skip genesis block (index 0)
    this.blockchain.getChain().slice(1).forEach(block => {
      const { candidate } = block.data;
      if (tally[candidate] !== undefined) {
        tally[candidate]++;
      }
    });

    return tally;
  }

  getWinner() {
    const results = this.getResults();
    const winner = Object.entries(results).sort((a, b) => b[1] - a[1])[0];
    return { candidate: winner[0], votes: winner[1] };
  }

  isValid() {
    return this.blockchain.isChainValid();
  }

  getChain() {
    return this.blockchain.getChain();
  }
}

module.exports = VotingSystem;
