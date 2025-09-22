import express from 'express';
import { VoterRegistrationService } from '../../services/voterRegistration';
import { VoteService } from '../../services/voteService';
import { TamperDetectionService } from '../../services/tamperDetection';
import { Blockchain } from '../../blockchain/blockchain';
import { VoteSubmission, VoterRegistration } from '../../types';

const router = express.Router();

// Service instances (initialized lazily)
let voterRegistration: VoterRegistrationService;
let blockchain: Blockchain;
let tamperDetection: TamperDetectionService;
let voteService: VoteService;

// Initialize services function
function initializeServices() {
  if (!voterRegistration) {
    voterRegistration = new VoterRegistrationService();
    blockchain = new Blockchain();
    tamperDetection = new TamperDetectionService(blockchain);
    voteService = new VoteService(voterRegistration, blockchain);
  }
}

/**
 * GET /api/voting
 * Get voting system information
 */
router.get('/', (req, res) => {
  initializeServices();
  res.json({
    success: true,
    message: 'Secure Voting System API',
    version: '1.0.0',
    endpoints: {
      registration: {
        'POST /register': 'Register a new voter',
        'POST /generate-keys': 'Generate key pair for voter',
        'GET /voters': 'Get all registered voters',
        'GET /voter/:voterId': 'Get specific voter info'
      },
      voting: {
        'POST /submit': 'Submit a vote',
        'POST /create-vote': 'Create vote with ZK proof',
        'GET /votes': 'Get all votes',
        'GET /votes/candidate/:candidateId': 'Get votes by candidate',
        'GET /results': 'Get voting results',
        'GET /stats': 'Get comprehensive statistics'
      },
      public: {
        'GET /public/voters': 'Get all voters with public info (voting status)',
        'GET /public/voter/:voterId': 'Get public info for specific voter',
        'GET /public/voting-status': 'Get overall voting status and statistics',
        'GET /public/votes': 'Get all votes with public information',
        'GET /public/transparency': 'Get comprehensive transparency data'
      },
      security: {
        'GET /blockchain/integrity': 'Verify blockchain integrity',
        'GET /tamper-detection/activities': 'Get suspicious activities',
        'GET /tamper-detection/stats': 'Get tamper detection stats'
      }
    }
  });
});

/**
 * POST /api/voting/register
 * Register a new voter
 */
router.post('/register', async (req, res) => {
  initializeServices();
  try {
    const { voterId, publicKey, registrationData } = req.body;
    
    if (!voterId || !publicKey) {
      return res.status(400).json({
        success: false,
        error: 'Voter ID and public key are required'
      });
    }

    const result = await voterRegistration.registerVoter({
      voterId,
      publicKey,
      registrationData
    });

    if (result.success) {
      res.status(201).json({
        success: true,
        message: 'Voter registered successfully',
        voter: result.voter
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

/**
 * POST /api/voting/generate-keys
 * Generate key pair for voter registration
 */
router.post('/generate-keys', (req, res) => {
  initializeServices();
  try {
    const keyPair = voterRegistration.generateVoterKeyPair();
    res.json({
      success: true,
      keyPair
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Key generation failed'
    });
  }
});

/**
 * POST /api/voting/submit
 * Submit a vote
 */
router.post('/submit', async (req, res) => {
  initializeServices();
  try {
    const voteSubmission = req.body as VoteSubmission;
    
    if (!voteSubmission.voterId || !voteSubmission.candidateId) {
      return res.status(400).json({
        success: false,
        error: 'Voter ID and candidate ID are required'
      });
    }

    const result = await voteService.submitVote(voteSubmission);
    
    if (result.isValid) {
      res.status(201).json({
        success: true,
        message: 'Vote submitted successfully',
        blockIndex: result.blockIndex
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.reason
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Vote submission failed'
    });
  }
});

/**
 * POST /api/voting/create-vote
 * Create a vote with zero-knowledge proof
 */
router.post('/create-vote', (req, res) => {
  initializeServices();
  try {
    const { candidateId, voterId, privateKey } = req.body;
    
    if (!candidateId || !voterId || !privateKey) {
      return res.status(400).json({
        success: false,
        error: 'Candidate ID, voter ID, and private key are required'
      });
    }

    const voteData = voteService.createVoteWithProof(candidateId, voterId, privateKey);
    
    res.json({
      success: true,
      voteData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Vote creation failed'
    });
  }
});

/**
 * GET /api/voting/votes
 * Get all votes (for transparency)
 */
router.get('/votes', async (req, res) => {
  initializeServices();
  try {
    const votes = await voteService.getAllVotes();
    res.json({
      success: true,
      votes,
      count: votes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve votes'
    });
  }
});

/**
 * GET /api/voting/votes/candidate/:candidateId
 * Get votes by candidate
 */
router.get('/votes/candidate/:candidateId', async (req, res) => {
  initializeServices();
  try {
    const { candidateId } = req.params;
    const votes = await voteService.getVotesByCandidate(candidateId);
    
    res.json({
      success: true,
      candidateId,
      votes,
      count: votes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve votes by candidate'
    });
  }
});

/**
 * GET /api/voting/results
 * Get voting results
 */
router.get('/results', async (req, res) => {
  initializeServices();
  try {
    const results = await voteService.getVoteCounts();
    res.json({
      success: true,
      results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve results'
    });
  }
});

/**
 * GET /api/voting/stats
 * Get comprehensive voting statistics
 */
router.get('/stats', async (req, res) => {
  initializeServices();
  try {
    const stats = await voteService.getVotingStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve statistics'
    });
  }
});

/**
 * GET /api/voting/voters
 * Get all registered voters
 */
router.get('/voters', async (req, res) => {
  initializeServices();
  try {
    const voters = await voterRegistration.getAllVoters();
    res.json({
      success: true,
      voters,
      count: voters.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve voters'
    });
  }
});

/**
 * GET /api/voting/voter/:voterId
 * Get specific voter information
 */
router.get('/voter/:voterId', async (req, res) => {
  initializeServices();
  try {
    const { voterId } = req.params;
    const voter = await voterRegistration.getVoter(voterId);
    
    if (voter) {
      res.json({
        success: true,
        voter
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve voter information'
    });
  }
});

/**
 * GET /api/voting/public/voters
 * Get all voters with public information (voting status, registration date)
 * This endpoint provides transparency about who has voted
 */
router.get('/public/voters', async (req, res) => {
  initializeServices();
  try {
    const voters = await voterRegistration.getAllVoters();
    
    // Return only public information (no private keys)
    const publicVoters = voters.map(voter => ({
      voterId: voter.id,
      isRegistered: voter.isRegistered,
      hasVoted: voter.hasVoted,
      registrationDate: voter.registrationDate
    }));
    
    res.json({
      success: true,
      voters: publicVoters,
      count: publicVoters.length,
      message: 'Public voter information retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve public voter information'
    });
  }
});

/**
 * GET /api/voting/public/voter/:voterId
 * Get public information for a specific voter
 */
router.get('/public/voter/:voterId', async (req, res) => {
  initializeServices();
  try {
    const { voterId } = req.params;
    const voter = await voterRegistration.getVoter(voterId);
    
    if (voter) {
      // Return only public information
      const publicVoter = {
        voterId: voter.id,
        isRegistered: voter.isRegistered,
        hasVoted: voter.hasVoted,
        registrationDate: voter.registrationDate
      };
      
      res.json({
        success: true,
        voter: publicVoter
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Voter not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve public voter information'
    });
  }
});

/**
 * GET /api/voting/public/voting-status
 * Get overall voting status and statistics
 */
router.get('/public/voting-status', async (req, res) => {
  initializeServices();
  try {
    const voters = await voterRegistration.getAllVoters();
    const votes = await voteService.getAllVotes();
    
    const totalVoters = voters.length;
    const votedCount = voters.filter(voter => voter.hasVoted).length;
    const notVotedCount = totalVoters - votedCount;
    const votingPercentage = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;
    
    // Get voting results
    const results = await voteService.getVoteCounts();
    
    res.json({
      success: true,
      votingStatus: {
        totalVoters,
        votedCount,
        notVotedCount,
        votingPercentage: Math.round(votingPercentage * 100) / 100
      },
      results,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve voting status'
    });
  }
});

/**
 * GET /api/voting/public/votes
 * Get all votes with public information (no private data)
 */
router.get('/public/votes', async (req, res) => {
  initializeServices();
  try {
    const votes = await voteService.getAllVotes();
    
    // Return only public vote information
    const publicVotes = votes.map(vote => ({
      id: vote.id,
      voterId: vote.voterId,
      candidateId: vote.candidateId,
      timestamp: vote.timestamp,
      blockIndex: vote.blockIndex
    }));
    
    res.json({
      success: true,
      votes: publicVotes,
      count: publicVotes.length,
      message: 'Public vote information retrieved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve public vote information'
    });
  }
});

/**
 * GET /api/voting/public/transparency
 * Get comprehensive transparency data
 */
router.get('/public/transparency', async (req, res) => {
  initializeServices();
  try {
    const voters = await voterRegistration.getAllVoters();
    const votes = await voteService.getAllVotes();
    const results = await voteService.getVoteCounts();
    const stats = await voteService.getVotingStats();
    
    // Calculate transparency metrics
    const totalVoters = voters.length;
    const votedCount = voters.filter(voter => voter.hasVoted).length;
    const votingPercentage = totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0;
    
    // Get voter list with voting status
    const voterList = voters.map(voter => ({
      voterId: voter.id,
      hasVoted: voter.hasVoted,
      registrationDate: voter.registrationDate
    }));
    
    res.json({
      success: true,
      transparency: {
        totalVoters,
        votedCount,
        notVotedCount: totalVoters - votedCount,
        votingPercentage: Math.round(votingPercentage * 100) / 100,
        totalVotes: votes.length,
        results,
        voterList,
        statistics: stats,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve transparency data'
    });
  }
});

/**
 * GET /api/voting/blockchain/integrity
 * Verify blockchain integrity
 */
router.get('/blockchain/integrity', (req, res) => {
  initializeServices();
  try {
    const integrity = tamperDetection.verifyBlockchainIntegrity();
    res.json({
      success: true,
      integrity
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to verify blockchain integrity'
    });
  }
});

/**
 * GET /api/voting/tamper-detection/activities
 * Get suspicious activities
 */
router.get('/tamper-detection/activities', (req, res) => {
  initializeServices();
  try {
    const activities = tamperDetection.getSuspiciousActivities();
    res.json({
      success: true,
      activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve suspicious activities'
    });
  }
});

/**
 * GET /api/voting/tamper-detection/stats
 * Get tamper detection statistics
 */
router.get('/tamper-detection/stats', (req, res) => {
  initializeServices();
  try {
    const stats = tamperDetection.getTamperStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve tamper detection statistics'
    });
  }
});

export default router;
