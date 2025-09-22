import { SupabaseClient } from '@supabase/supabase-js';
import { Voter, Vote, Block } from '../types';
import { getSupabaseService } from './supabaseService';

export interface StoredData {
  voters: Record<string, any>;
  publicKeys: string[];
  votes: Record<string, any>;
  blocks: any[];
  lastUpdated: string;
}

export class SupabaseDataPersistence {
  private client: SupabaseClient;

  constructor() {
    const supabaseService = getSupabaseService();
    this.client = supabaseService.getServiceClient();
  }

  // Voter management
  async saveVoter(voterId: string, voter: Voter): Promise<void> {
    try {
      const { error } = await this.client
        .from('voters')
        .upsert({
          voter_id: voterId,
          public_key: voter.publicKey,
          is_registered: voter.isRegistered,
          has_voted: voter.hasVoted,
          registration_date: voter.registrationDate.toISOString()
        }, {
          onConflict: 'voter_id'
        });

      if (error) {
        console.error('Error saving voter:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in saveVoter:', error);
      throw error;
    }
  }

  async getVoter(voterId: string): Promise<Voter | null> {
    try {
      const { data, error } = await this.client
        .from('voters')
        .select('*')
        .eq('voter_id', voterId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        console.error('Error getting voter:', error);
        throw error;
      }

      return {
        id: data.voter_id,
        publicKey: data.public_key,
        isRegistered: data.is_registered,
        hasVoted: data.has_voted,
        registrationDate: new Date(data.registration_date)
      };
    } catch (error) {
      console.error('Error in getVoter:', error);
      return null;
    }
  }

  async getAllVoters(): Promise<Voter[]> {
    try {
      const { data, error } = await this.client
        .from('voters')
        .select('*')
        .order('registration_date', { ascending: true });

      if (error) {
        console.error('Error getting all voters:', error);
        throw error;
      }

      return data.map(voter => ({
        id: voter.voter_id,
        publicKey: voter.public_key,
        isRegistered: voter.is_registered,
        hasVoted: voter.has_voted,
        registrationDate: new Date(voter.registration_date)
      }));
    } catch (error) {
      console.error('Error in getAllVoters:', error);
      return [];
    }
  }

  async deleteVoter(voterId: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('voters')
        .delete()
        .eq('voter_id', voterId);

      if (error) {
        console.error('Error deleting voter:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteVoter:', error);
      return false;
    }
  }

  // Public key management
  async addPublicKey(publicKey: string, voterId?: string): Promise<void> {
    try {
      const { error } = await this.client
        .from('public_keys')
        .upsert({
          public_key: publicKey,
          voter_id: voterId
        }, {
          onConflict: 'public_key'
        });

      if (error) {
        console.error('Error adding public key:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in addPublicKey:', error);
      throw error;
    }
  }

  async hasPublicKey(publicKey: string): Promise<boolean> {
    try {
      const { data, error } = await this.client
        .from('public_keys')
        .select('id')
        .eq('public_key', publicKey)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return false;
        }
        console.error('Error checking public key:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in hasPublicKey:', error);
      return false;
    }
  }

  async removePublicKey(publicKey: string): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('public_keys')
        .delete()
        .eq('public_key', publicKey);

      if (error) {
        console.error('Error removing public key:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removePublicKey:', error);
      return false;
    }
  }

  // Vote management
  async saveVote(voteId: string, vote: Vote): Promise<void> {
    try {
      const { error } = await this.client
        .from('votes')
        .upsert({
          id: voteId,
          voter_id: vote.voterId,
          candidate_id: vote.candidateId,
          vote_hash: vote.voteHash,
          signature: vote.signature,
          zero_knowledge_proof: vote.zeroKnowledgeProof,
          public_key: vote.publicKey,
          timestamp: vote.timestamp.toISOString(),
          block_index: vote.blockIndex
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Error saving vote:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in saveVote:', error);
      throw error;
    }
  }

  async getVote(voteId: string): Promise<Vote | null> {
    try {
      const { data, error } = await this.client
        .from('votes')
        .select('*')
        .eq('id', voteId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        console.error('Error getting vote:', error);
        throw error;
      }

      return {
        id: data.id,
        voterId: data.voter_id,
        candidateId: data.candidate_id,
        voteHash: data.vote_hash,
        signature: data.signature,
        zeroKnowledgeProof: data.zero_knowledge_proof,
        timestamp: new Date(data.timestamp),
        blockIndex: data.block_index,
        publicKey: data.public_key
      };
    } catch (error) {
      console.error('Error in getVote:', error);
      return null;
    }
  }

  async getAllVotes(): Promise<Vote[]> {
    try {
      const { data, error } = await this.client
        .from('votes')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error getting all votes:', error);
        throw error;
      }

      return data.map(vote => ({
        id: vote.id,
        voterId: vote.voter_id,
        candidateId: vote.candidate_id,
        voteHash: vote.vote_hash,
        signature: vote.signature,
        zeroKnowledgeProof: vote.zero_knowledge_proof,
        timestamp: new Date(vote.timestamp),
        blockIndex: vote.block_index,
        publicKey: vote.public_key
      }));
    } catch (error) {
      console.error('Error in getAllVotes:', error);
      return [];
    }
  }

  async getVotesByCandidate(candidateId: string): Promise<Vote[]> {
    try {
      const { data, error } = await this.client
        .from('votes')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error getting votes by candidate:', error);
        throw error;
      }

      return data.map(vote => ({
        id: vote.id,
        voterId: vote.voter_id,
        candidateId: vote.candidate_id,
        voteHash: vote.vote_hash,
        signature: vote.signature,
        zeroKnowledgeProof: vote.zero_knowledge_proof,
        timestamp: new Date(vote.timestamp),
        blockIndex: vote.block_index,
        publicKey: vote.public_key
      }));
    } catch (error) {
      console.error('Error in getVotesByCandidate:', error);
      return [];
    }
  }

  // Block management
  async saveBlock(block: Block): Promise<void> {
    try {
      const { error } = await this.client
        .from('blocks')
        .upsert({
          block_index: block.index,
          timestamp: block.timestamp.toISOString(),
          previous_hash: block.previousHash,
          hash: block.hash,
          merkle_root: block.merkleRoot
        }, {
          onConflict: 'block_index'
        });

      if (error) {
        console.error('Error saving block:', error);
        throw error;
      }

      // Save block-vote relationships
      if (block.votes && block.votes.length > 0) {
        const blockVotes = block.votes.map(vote => ({
          block_id: block.index, // Using block index as reference
          vote_id: vote.id
        }));

        const { error: blockVotesError } = await this.client
          .from('block_votes')
          .upsert(blockVotes);

        if (blockVotesError) {
          console.error('Error saving block votes:', blockVotesError);
        }
      }
    } catch (error) {
      console.error('Error in saveBlock:', error);
      throw error;
    }
  }

  async getAllBlocks(): Promise<Block[]> {
    try {
      const { data, error } = await this.client
        .from('blocks')
        .select(`
          *,
          block_votes (
            vote_id,
            votes (*)
          )
        `)
        .order('block_index', { ascending: true });

      if (error) {
        console.error('Error getting all blocks:', error);
        throw error;
      }

      return data.map(block => ({
        index: block.block_index,
        timestamp: new Date(block.timestamp),
        previousHash: block.previous_hash,
        hash: block.hash,
        merkleRoot: block.merkle_root,
        votes: block.block_votes?.map((bv: any) => bv.votes) || []
      }));
    } catch (error) {
      console.error('Error in getAllBlocks:', error);
      return [];
    }
  }

  async getLastBlock(): Promise<Block | null> {
    try {
      const { data, error } = await this.client
        .from('blocks')
        .select(`
          *,
          block_votes (
            vote_id,
            votes (*)
          )
        `)
        .order('block_index', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        console.error('Error getting last block:', error);
        throw error;
      }

      return {
        index: data.block_index,
        timestamp: new Date(data.timestamp),
        previousHash: data.previous_hash,
        hash: data.hash,
        merkleRoot: data.merkle_root,
        votes: data.block_votes?.map((bv: any) => bv.votes) || []
      };
    } catch (error) {
      console.error('Error in getLastBlock:', error);
      return null;
    }
  }

  // Statistics
  async getStats(): Promise<{
    totalVoters: number;
    totalVotes: number;
    votedVoters: number;
    remainingVoters: number;
    lastUpdated: string;
  }> {
    try {
      const [votersResult, votesResult] = await Promise.all([
        this.client.from('voters').select('*', { count: 'exact', head: true }),
        this.client.from('votes').select('*', { count: 'exact', head: true })
      ]);

      const voters = await this.getAllVoters();
      const votedCount = voters.filter(v => v.hasVoted).length;

      return {
        totalVoters: votersResult.count || 0,
        totalVotes: votesResult.count || 0,
        votedVoters: votedCount,
        remainingVoters: (votersResult.count || 0) - votedCount,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalVoters: 0,
        totalVotes: 0,
        votedVoters: 0,
        remainingVoters: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Backup and restore (simplified for Supabase)
  async backup(): Promise<string> {
    try {
      const [voters, votes, blocks] = await Promise.all([
        this.getAllVoters(),
        this.getAllVotes(),
        this.getAllBlocks()
      ]);

      const backupData = {
        voters: voters.reduce((acc, voter) => ({ ...acc, [voter.id]: voter }), {}),
        votes: votes.reduce((acc, vote) => ({ ...acc, [vote.id]: vote }), {}),
        blocks,
        lastUpdated: new Date().toISOString(),
        backupDate: new Date().toISOString()
      };

      return JSON.stringify(backupData, null, 2);
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  // Clear all data (use with caution!)
  async clearAll(): Promise<void> {
    try {
      // Delete in order to respect foreign key constraints
      await this.client.from('block_votes').delete().neq('block_id', '');
      await this.client.from('votes').delete().neq('id', '');
      await this.client.from('blocks').delete().neq('id', '');
      await this.client.from('public_keys').delete().neq('id', '');
      await this.client.from('voters').delete().neq('voter_id', '');
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}
