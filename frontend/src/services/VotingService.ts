import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/voting';

export interface VoterRegistration {
  voterId: string;
  publicKey: string;
  registrationData: any;
}

export interface VoteSubmission {
  voterId: string;
  candidateId: string;
}

export interface VoteData {
  voteHash: string;
  signature: string;
  zeroKnowledgeProof: string;
}

export interface Voter {
  id: string;
  publicKey: string;
  isRegistered: boolean;
  hasVoted: boolean;
  registrationDate: string;
}

export class VotingService {
  /**
   * Generate key pair for voter
   */
  static async generateKeys(): Promise<{ privateKey: string; publicKey: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/generate-keys`);
      return response.data.keyPair;
    } catch (error) {
      console.error('Error generating keys:', error);
      throw new Error('Failed to generate keys');
    }
  }

  /**
   * Register a new voter
   */
  static async registerVoter(registration: VoterRegistration): Promise<boolean> {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, registration);
      return response.data.success;
    } catch (error) {
      console.error('Error registering voter:', error);
      throw new Error('Failed to register voter');
    }
  }

  /**
   * Get voter information
   */
  static async getVoter(voterId: string): Promise<Voter | null> {
    try {
      const response = await axios.get(`${API_BASE_URL}/voter/${voterId}`);
      return response.data.voter;
    } catch (error) {
      console.error('Error getting voter:', error);
      return null;
    }
  }

  /**
   * Check if fingerprint has already voted
   */
  static async checkFingerprintVoted(fingerprint: string): Promise<boolean> {
    try {
      // In a real implementation, this would check against the backend
      // For now, we'll use localStorage to simulate this
      const votedFingerprints = JSON.parse(localStorage.getItem('votedFingerprints') || '[]');
      return votedFingerprints.includes(fingerprint);
    } catch (error) {
      console.error('Error checking fingerprint:', error);
      return false;
    }
  }

  /**
   * Mark fingerprint as voted
   */
  static async markFingerprintAsVoted(fingerprint: string): Promise<void> {
    try {
      const votedFingerprints = JSON.parse(localStorage.getItem('votedFingerprints') || '[]');
      votedFingerprints.push(fingerprint);
      localStorage.setItem('votedFingerprints', JSON.stringify(votedFingerprints));
    } catch (error) {
      console.error('Error marking fingerprint as voted:', error);
    }
  }

  /**
   * Create vote with zero-knowledge proof (deprecated - using simple API now)
   */
  static async createVote(candidateId: string, voterId: string, privateKey: string): Promise<VoteData> {
    // This method is deprecated - we now use the simple API
    throw new Error('createVote method is deprecated. Use submitVote directly.');
  }

  /**
   * Submit a vote
   */
  static async submitVote(voteSubmission: VoteSubmission): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      console.log('Submitting vote to:', `${API_BASE_URL}/submit`);
      console.log('Vote submission data:', voteSubmission);
      
      const response = await axios.post(`${API_BASE_URL}/submit`, voteSubmission);
      console.log('Vote submission response:', response.data);
      
      // Handle the response based on the API documentation
      if (response.data.success) {
        return { 
          success: true, 
          message: response.data.message || 'Vote submitted successfully' 
        };
      } else {
        return { 
          success: false, 
          error: response.data.error || 'Failed to submit vote' 
        };
      }
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.error || error.response.data?.message || 'Server error';
        return { success: false, error: errorMessage };
      } else if (error.request) {
        // Request was made but no response received
        return { success: false, error: 'No response from server. Please check if backend is running.' };
      } else {
        // Something else happened
        return { success: false, error: error.message || 'Failed to submit vote' };
      }
    }
  }

  /**
   * Get all votes
   */
  static async getAllVotes(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/votes`);
      return response.data.votes;
    } catch (error) {
      console.error('Error getting votes:', error);
      return [];
    }
  }

  /**
   * Get voting results
   */
  static async getResults(): Promise<Record<string, number>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/results`);
      return response.data.results;
    } catch (error) {
      console.error('Error getting results:', error);
      return {};
    }
  }

  /**
   * Get comprehensive statistics
   */
  static async getStats(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      return response.data.stats;
    } catch (error) {
      console.error('Error getting stats:', error);
      return {};
    }
  }

  /**
   * Get all voters
   */
  static async getAllVoters(): Promise<Voter[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/voters`);
      return response.data.voters;
    } catch (error) {
      console.error('Error getting voters:', error);
      return [];
    }
  }

  /**
   * Verify blockchain integrity
   */
  static async verifyBlockchainIntegrity(): Promise<{ isIntact: boolean; issues: string[] }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/blockchain/integrity`);
      return response.data.integrity;
    } catch (error) {
      console.error('Error verifying blockchain:', error);
      return { isIntact: false, issues: ['Failed to verify blockchain'] };
    }
  }

  /**
   * Get tamper detection statistics
   */
  static async getTamperStats(): Promise<any> {
    try {
      const response = await axios.get(`${API_BASE_URL}/tamper-detection/stats`);
      return response.data.stats;
    } catch (error) {
      console.error('Error getting tamper stats:', error);
      return {};
    }
  }
}
