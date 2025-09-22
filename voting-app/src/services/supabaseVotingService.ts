import { supabase } from './supabaseClient';

export interface Voter {
  id: string;
  publicKey: string;
  isRegistered: boolean;
  hasVoted: boolean;
  registrationDate: string;
}

export interface Vote {
  id: string;
  voterId: string;
  candidateId: string;
  voteHash: string;
  signature: string;
  zeroKnowledgeProof: string;
  timestamp: string;
  publicKey?: string;
}

export interface Candidate {
  id: string;
  candidateId: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export class SupabaseVotingService {
  /**
   * Get all voters directly from Supabase
   */
  static async getVoters(): Promise<Voter[]> {
    try {
      const { data, error } = await supabase
        .from('voters')
        .select('*')
        .order('registration_date', { ascending: true });

      if (error) {
        console.error('Error fetching voters:', error);
        return [];
      }

      return data.map(voter => ({
        id: voter.voter_id,
        publicKey: voter.public_key,
        isRegistered: voter.is_registered,
        hasVoted: voter.has_voted,
        registrationDate: voter.registration_date
      }));
    } catch (error) {
      console.error('Error in getVoters:', error);
      return [];
    }
  }

  /**
   * Get voter by ID directly from Supabase
   */
  static async getVoter(voterId: string): Promise<Voter | null> {
    try {
      const { data, error } = await supabase
        .from('voters')
        .select('*')
        .eq('voter_id', voterId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null;
        }
        console.error('Error fetching voter:', error);
        return null;
      }

      return {
        id: data.voter_id,
        publicKey: data.public_key,
        isRegistered: data.is_registered,
        hasVoted: data.has_voted,
        registrationDate: data.registration_date
      };
    } catch (error) {
      console.error('Error in getVoter:', error);
      return null;
    }
  }

  /**
   * Get all votes directly from Supabase
   */
  static async getVotes(): Promise<Vote[]> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching votes:', error);
        return [];
      }

      return data.map(vote => ({
        id: vote.id,
        voterId: vote.voter_id,
        candidateId: vote.candidate_id,
        voteHash: vote.vote_hash,
        signature: vote.signature,
        zeroKnowledgeProof: vote.zero_knowledge_proof,
        timestamp: vote.timestamp,
        publicKey: vote.public_key
      }));
    } catch (error) {
      console.error('Error in getVotes:', error);
      return [];
    }
  }

  /**
   * Get votes by candidate directly from Supabase
   */
  static async getVotesByCandidate(candidateId: string): Promise<Vote[]> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('candidate_id', candidateId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching votes by candidate:', error);
        return [];
      }

      return data.map(vote => ({
        id: vote.id,
        voterId: vote.voter_id,
        candidateId: vote.candidate_id,
        voteHash: vote.vote_hash,
        signature: vote.signature,
        zeroKnowledgeProof: vote.zero_knowledge_proof,
        timestamp: vote.timestamp,
        publicKey: vote.public_key
      }));
    } catch (error) {
      console.error('Error in getVotesByCandidate:', error);
      return [];
    }
  }

  /**
   * Get all candidates directly from Supabase
   */
  static async getCandidates(): Promise<Candidate[]> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching candidates:', error);
        return [];
      }

      return data.map(candidate => ({
        id: candidate.id,
        candidateId: candidate.candidate_id,
        name: candidate.name,
        description: candidate.description,
        isActive: candidate.is_active
      }));
    } catch (error) {
      console.error('Error in getCandidates:', error);
      return [];
    }
  }

  /**
   * Get vote counts by candidate directly from Supabase
   */
  static async getVoteCounts(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('candidate_id');

      if (error) {
        console.error('Error fetching vote counts:', error);
        return {};
      }

      const counts: Record<string, number> = {};
      data.forEach(vote => {
        counts[vote.candidate_id] = (counts[vote.candidate_id] || 0) + 1;
      });

      return counts;
    } catch (error) {
      console.error('Error in getVoteCounts:', error);
      return {};
    }
  }

  /**
   * Get voting statistics directly from Supabase
   */
  static async getVotingStats(): Promise<{
    totalVoters: number;
    totalVotes: number;
    votedVoters: number;
    remainingVoters: number;
    voteCounts: Record<string, number>;
  }> {
    try {
      const [votersResult, votesResult, voteCounts] = await Promise.all([
        supabase.from('voters').select('*', { count: 'exact', head: true }),
        supabase.from('votes').select('*', { count: 'exact', head: true }),
        this.getVoteCounts()
      ]);

      const voters = await this.getVoters();
      const votedVoters = voters.filter(v => v.hasVoted).length;

      return {
        totalVoters: votersResult.count || 0,
        totalVotes: votesResult.count || 0,
        votedVoters,
        remainingVoters: (votersResult.count || 0) - votedVoters,
        voteCounts
      };
    } catch (error) {
      console.error('Error in getVotingStats:', error);
      return {
        totalVoters: 0,
        totalVotes: 0,
        votedVoters: 0,
        remainingVoters: 0,
        voteCounts: {}
      };
    }
  }

  /**
   * Subscribe to real-time vote updates
   */
  static subscribeToVotes(callback: (votes: Vote[]) => void) {
    return supabase
      .channel('votes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' },
        async () => {
          const votes = await this.getVotes();
          callback(votes);
        }
      )
      .subscribe();
  }

  /**
   * Subscribe to real-time voter updates
   */
  static subscribeToVoters(callback: (voters: Voter[]) => void) {
    return supabase
      .channel('voters')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'voters' },
        async () => {
          const voters = await this.getVoters();
          callback(voters);
        }
      )
      .subscribe();
  }

  /**
   * Subscribe to real-time vote count updates
   */
  static subscribeToVoteCounts(callback: (counts: Record<string, number>) => void) {
    return supabase
      .channel('vote_counts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'votes' },
        async () => {
          const counts = await this.getVoteCounts();
          callback(counts);
        }
      )
      .subscribe();
  }
}
