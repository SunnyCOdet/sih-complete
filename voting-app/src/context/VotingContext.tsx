import React, { createContext, useContext, useState, ReactNode } from 'react';
import VotingService from '../services/VotingService';

export interface Vote {
  id: string;
  candidateId: string;
  candidateName: string;
  timestamp: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  color: string;
  votes: number;
}

interface VotingContextType {
  candidates: Candidate[];
  votes: Vote[];
  isLoading: boolean;
  error: string | null;
  submitVote: (candidateId: string) => Promise<boolean>;
  loadResults: () => Promise<void>;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export const useVoting = () => {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
};

interface VotingProviderProps {
  children: ReactNode;
}

export const VotingProvider: React.FC<VotingProviderProps> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: 'bjp', name: 'BJP', party: 'Bharatiya Janata Party', color: '#FF6B35', votes: 0 },
    { id: 'congress', name: 'Congress', party: 'Indian National Congress', color: '#1E88E5', votes: 0 },
    { id: 'aap', name: 'AAP', party: 'Aam Aadmi Party', color: '#2E7D32', votes: 0 },
    { id: 'sp', name: 'SP', party: 'Samajwadi Party', color: '#E91E63', votes: 0 },
    { id: 'bsp', name: 'BSP', party: 'Bahujan Samaj Party', color: '#9C27B0', votes: 0 },
  ]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitVote = async (candidateId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await VotingService.submitVote(candidateId);
      
      if (result.success) {
        // Update local state
        const candidate = candidates.find(c => c.id === candidateId);
        if (candidate) {
          setCandidates(prev => 
            prev.map(c => 
              c.id === candidateId 
                ? { ...c, votes: c.votes + 1 }
                : c
            )
          );
        }

        // Add vote to local list
        const newVote: Vote = {
          id: Date.now().toString(),
          candidateId,
          candidateName: candidate?.name || 'Unknown',
          timestamp: new Date().toISOString(),
        };
        setVotes(prev => [...prev, newVote]);

        return true;
      } else {
        setError(result.error || 'Failed to submit vote');
        return false;
      }
    } catch (error: any) {
      setError(error.message || 'Failed to submit vote');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await VotingService.getResults();
      if (results.success) {
        // Update candidates with vote counts from API
        if (results.candidates && results.candidates.length > 0) {
          setCandidates(prevCandidates => 
            prevCandidates.map(candidate => {
              const apiCandidate = results.candidates?.find(c => c.id === candidate.id);
              return apiCandidate ? { ...candidate, votes: apiCandidate.votes } : candidate;
            })
          );
        }
        
        // Update votes list
        if (results.votes) {
          setVotes(results.votes);
        }
      } else {
        setError(results.error || 'Failed to load results');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const refreshData = async () => {
    await loadResults();
  };

  const value: VotingContextType = {
    candidates,
    votes,
    isLoading,
    error,
    submitVote,
    loadResults,
    clearError,
    refreshData,
  };

  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  );
};
