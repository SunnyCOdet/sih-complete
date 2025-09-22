import { User } from '../context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import { ec } from 'elliptic';
import * as Crypto from 'expo-crypto';

const API_BASE_URL = 'https://sih-teal-zeta.vercel.app/api/voting';

export interface VoteSubmission {
  publicKey: string;
  voteHash: string;
  signature: string;
  zeroKnowledgeProof: string;
  candidateId: string;
}

export interface VoteResult {
  success: boolean;
  error?: string;
  message?: string;
}

export interface ResultsData {
  success: boolean;
  candidates?: Array<{
    id: string;
    name: string;
    party: string;
    color: string;
    votes: number;
  }>;
  votes?: Array<{
    id: string;
    candidateId: string;
    candidateName: string;
    timestamp: string;
  }>;
  error?: string;
}

class VotingService {
  /**
   * Register a voter
   */
  static async registerVoter(voterData: {
    id: string;
    publicKey: string;
    registrationData: {
      fingerprint: string;
      registrationTime: string;
    };
  }): Promise<VoteResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voterData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`
        };
      }
      
      return data;
    } catch (error: any) {
      console.error('Error registering voter:', error);
      return {
        success: false,
        error: error.message || 'Failed to register voter'
      };
    }
  }

  /**
   * Submit a vote
   */
  static async submitVote(candidateId: string): Promise<VoteResult> {
    try {
      // Get user data from secure storage
      const userData = await this.getStoredUserData();
      if (!userData) {
        return { success: false, error: 'User not authenticated' };
      }

      // Create vote hash
      const voteHash = await this.createVoteHash(candidateId, userData.id);
      
      // Create signature (simplified for demo)
      const signature = await this.createSignature(voteHash, userData.privateKey);
      
      // Create zero-knowledge proof (simplified for demo)
      const zeroKnowledgeProof = await this.createZeroKnowledgeProof(candidateId, userData.id);

      const voteSubmission: VoteSubmission = {
        publicKey: userData.publicKey,
        voteHash,
        signature,
        zeroKnowledgeProof,
        candidateId,
      };

      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voteSubmission),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP error! status: ${response.status}`
        };
      }
      
      return data;
    } catch (error: any) {
      console.error('Error submitting vote:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit vote'
      };
    }
  }

  /**
   * Get voting results
   */
  static async getResults(): Promise<ResultsData> {
    try {
      const response = await fetch(`${API_BASE_URL}/results`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error getting results:', error);
      return {
        success: false,
        error: error.message || 'Failed to get results'
      };
    }
  }

  /**
   * Get voter information
   */
  static async getVoter(userId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/voter/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('Error getting voter:', error);
      return null;
    }
  }

  /**
   * Check if voter has voted
   */
  static async hasVoted(userId: string): Promise<boolean> {
    try {
      const voter = await this.getVoter(userId);
      return voter ? voter.hasVoted : false;
    } catch (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
  }

  /**
   * Get stored user data
   */
  private static async getStoredUserData(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync('user');
      if (userData) {
        return JSON.parse(userData);
      }
      return null;
    } catch (error) {
      console.error('Error getting stored user data:', error);
      return null;
    }
  }

  /**
   * Generate key pair for voter registration
   */
  static async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate keys');
      }
      
      return data.keyPair;
    } catch (error: any) {
      console.error('Error generating key pair:', error);
      // Fallback to local generation with proper hex format
      const publicKey = '04' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const privateKey = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      return { publicKey, privateKey };
    }
  }

  /**
   * Create vote hash using SHA-256
   */
  private static async createVoteHash(candidateId: string, userId: string): Promise<string> {
    const voteData = `${candidateId}:${userId}:${Date.now()}`;
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      voteData,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
  }

  /**
   * Create signature for vote using elliptic curve cryptography
   */
  private static async createSignature(voteHash: string, privateKey: string): Promise<string> {
    try {
      const elliptic = new ec('secp256k1');
      const keyPair = elliptic.keyFromPrivate(privateKey, 'hex');
      const msgHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        voteHash,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
      const signature = keyPair.sign(msgHash);
      return signature.toDER('hex');
    } catch (error) {
      console.error('Error creating signature:', error);
      // Fallback to simple hash for demo purposes
      return await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${voteHash}:${privateKey}`,
        { encoding: Crypto.CryptoEncoding.HEX }
      );
    }
  }

  /**
   * Create zero-knowledge proof (simplified for demo)
   */
  private static async createZeroKnowledgeProof(candidateId: string, userId: string): Promise<string> {
    const proofData = `zkp:${candidateId}:${userId}:${Date.now()}`;
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      proofData,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
  }
}

export default VotingService;
