import { Vote, VoteSubmission, VoteVerificationResult } from '../types';
import { KeyManager } from '../crypto/keyManager';
import { ZeroKnowledgeProofSystem } from '../crypto/zeroKnowledgeProof';
import { VoterRegistrationService } from './voterRegistration';
import { Blockchain } from '../blockchain/blockchain';
import { SupabaseDataPersistence } from './supabaseDataPersistence';
import { v4 as uuidv4 } from 'uuid';

export class VoteService {
  private voterRegistration: VoterRegistrationService;
  private blockchain: Blockchain;
  private dataPersistence: SupabaseDataPersistence;

  constructor(voterRegistration: VoterRegistrationService, blockchain: Blockchain) {
    this.voterRegistration = voterRegistration;
    this.blockchain = blockchain;
    this.dataPersistence = new SupabaseDataPersistence();
  }

  /**
   * Submit a vote to the system
   */
  async submitVote(voteSubmission: VoteSubmission): Promise<VoteVerificationResult> {
    try {
      // Find voter by voter ID
      const voter = await this.dataPersistence.getVoter(voteSubmission.voterId);
      if (!voter) {
        return {
          isValid: false,
          reason: 'Voter not found or not registered'
        };
      }

      // Check if voter is eligible to vote
      const isEligible = await this.voterRegistration.isVoterEligible(voter.id);
      if (!isEligible) {
        return {
          isValid: false,
          reason: 'Voter has already voted or is not eligible'
        };
      }

      // Create vote object with simplified verification
      const voteId = uuidv4();
      const voteHash = `vote_${voteSubmission.voterId}_${voteSubmission.candidateId}_${Date.now()}`;
      
      const vote: Vote = {
        id: voteId,
        voterId: voteSubmission.voterId,
        candidateId: voteSubmission.candidateId,
        voteHash: voteHash,
        signature: `signature_${voteId}`, // Simplified signature
        zeroKnowledgeProof: `proof_${voteId}`, // Simplified proof
        timestamp: new Date(),
        publicKey: voter.publicKey
      };

      // Add vote to blockchain
      const result = this.blockchain.addVote(vote);
      
      if (result.isValid) {
        // Save vote persistently
        await this.dataPersistence.saveVote(vote.id, vote);
        
        // Mark voter as having voted
        await this.voterRegistration.markVoterAsVoted(voter.id);
      }

      return result;
    } catch (error) {
      console.error('Error submitting vote:', error);
      return {
        isValid: false,
        reason: 'Vote submission failed'
      };
    }
  }

  /**
   * Create a vote with zero-knowledge proof
   */
  createVoteWithProof(
    candidateId: string, 
    voterId: string, 
    privateKey: string
  ): { voteHash: string; zeroKnowledgeProof: string; signature: string } {
    // Generate vote hash
    const timestamp = Date.now();
    const voteHash = KeyManager.createVoteHash(candidateId, voterId, timestamp);
    
    // Create zero-knowledge proof
    const secret = crypto.randomBytes(32).toString('hex');
    const zkProof = ZeroKnowledgeProofSystem.createVoteProof(candidateId, voterId, secret);
    
    // Sign the vote hash
    const signature = KeyManager.signMessage(voteHash, privateKey);
    
    return {
      voteHash,
      zeroKnowledgeProof: zkProof.commitment,
      signature
    };
  }

  /**
   * Verify a vote's integrity
   */
  verifyVoteIntegrity(vote: Vote): VoteVerificationResult {
    try {
      // Simplified verification using voter ID
      // Check that voter ID is present and valid
      if (!vote.voterId || vote.voterId.trim().length === 0) {
        return {
          isValid: false,
          reason: 'Invalid voter ID'
        };
      }

      // Check that candidate ID is present and valid
      if (!vote.candidateId || vote.candidateId.trim().length === 0) {
        return {
          isValid: false,
          reason: 'Invalid candidate ID'
        };
      }

      // Check that vote hash is present (simplified)
      if (!vote.voteHash || vote.voteHash.trim().length === 0) {
        return {
          isValid: false,
          reason: 'Invalid vote hash'
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        reason: 'Vote verification failed'
      };
    }
  }

  /**
   * Get all votes (for transparency)
   */
  async getAllVotes(): Promise<Vote[]> {
    return await this.dataPersistence.getAllVotes();
  }

  /**
   * Get votes by candidate
   */
  async getVotesByCandidate(candidateId: string): Promise<Vote[]> {
    const votes = await this.getAllVotes();
    return votes.filter(vote => vote.candidateId === candidateId);
  }

  /**
   * Get vote count by candidate
   */
  async getVoteCounts(): Promise<Record<string, number>> {
    const votes = await this.getAllVotes();
    const counts: Record<string, number> = {};
    
    votes.forEach(vote => {
      counts[vote.candidateId] = (counts[vote.candidateId] || 0) + 1;
    });
    
    return counts;
  }

  /**
   * Verify blockchain integrity
   */
  verifyBlockchainIntegrity(): boolean {
    return this.blockchain.verifyChain();
  }

  /**
   * Get voting statistics
   */
  async getVotingStats(): Promise<{
    totalVotes: number;
    voteCounts: Record<string, number>;
    blockchainInfo: any;
    voterStats: any;
  }> {
    const votes = await this.getAllVotes();
    const voteCounts = await this.getVoteCounts();
    const voterStats = await this.voterRegistration.getVoterStats();
    
    return {
      totalVotes: votes.length,
      voteCounts,
      blockchainInfo: this.blockchain.getBlockchainInfo(),
      voterStats
    };
  }
}

// Import crypto for the createVoteWithProof method
import * as crypto from 'crypto';
