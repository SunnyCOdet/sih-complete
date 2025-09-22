import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import Header from './components/Header';
import FingerprintAuth from './components/FingerprintAuth';
import VotingInterface from './components/VotingInterface';
import Results from './components/Results';
import AdminPanel from './components/AdminPanel';
import FingerprintDemo from './components/FingerprintDemo';
import { VotingService } from './services/VotingService';
import { FingerprintService, UserData } from './services/FingerprintService';
import UserNameInput from './components/UserNameInput';
import ApiExplorer from './components/ApiExplorer';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [voterId, setVoterId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentFingerprint, setCurrentFingerprint] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    // Initialize fingerprint database
    FingerprintService.initializeDatabase();
    
    // Check if user is already authenticated
    const savedVoterId = localStorage.getItem('voterId');
    if (savedVoterId) {
      setVoterId(savedVoterId);
      setIsAuthenticated(true);
      checkVotingStatus(savedVoterId);
    }
  }, []);

  const checkVotingStatus = async (voterId: string) => {
    try {
      const voter = await VotingService.getVoter(voterId);
      if (voter && voter.hasVoted) {
        setHasVoted(true);
      }
    } catch (error) {
      console.error('Error checking voting status:', error);
    }
  };

  const handleFingerprintAuth = async (fingerprint: string) => {
    setLoading(true);
    setCurrentFingerprint(fingerprint);
    
    // Reset any previous state
    setIsAuthenticated(false);
    setVoterId(null);
    setHasVoted(false);
    
    try {
      console.log('Processing fingerprint:', fingerprint);
      
      // Check if fingerprint is registered
      const isRegistered = FingerprintService.isFingerprintRegistered(fingerprint);
      console.log('Fingerprint registered:', isRegistered);
      
      if (isRegistered) {
        // Existing user - get their data
        const userData = FingerprintService.getUserData(fingerprint);
        if (userData) {
          console.log('Found existing user data:', userData);
          setExistingUser({
            name: userData.name,
            lastLogin: userData.lastLogin,
            hasVoted: userData.hasVoted
          });
          setIsNewUser(false);
        } else {
          console.error('User data not found for registered fingerprint');
          throw new Error('User data not found');
        }
      } else {
        // New user
        console.log('New user detected');
        setIsNewUser(true);
        setExistingUser(null);
      }
      
      // Show name input screen
      setShowNameInput(true);
      
    } catch (error) {
      console.error('Fingerprint check error:', error);
      toast.error('Fingerprint verification failed. Please try again.');
      setShowNameInput(false);
    } finally {
      setLoading(false);
    }
  };

  const handleUserNameComplete = async (userName: string) => {
    if (!currentFingerprint) return;
    
    setLoading(true);
    try {
      if (isNewUser) {
        // Register new user
        const generatedVoterId = `voter_${currentFingerprint.substring(0, 8)}_${Date.now()}`;
        const keyPair = await VotingService.generateKeys();
        
        console.log('Registering new user:', {
          voterId: generatedVoterId,
          fingerprint: currentFingerprint,
          userName: userName
        });
        
        // Register with backend
        try {
          await VotingService.registerVoter({
            voterId: generatedVoterId,
            publicKey: keyPair.publicKey,
            registrationData: {
              fingerprint: currentFingerprint,
              registrationTime: new Date().toISOString()
            }
          });
          console.log('Backend registration successful');
        } catch (backendError) {
          console.error('Backend registration failed:', backendError);
          // Continue with local registration even if backend fails
          console.log('Continuing with local registration only');
        }

        // Store in local fingerprint database
        const userData: UserData = {
          fingerprint: currentFingerprint,
          name: userName,
          voterId: generatedVoterId,
          publicKey: keyPair.publicKey,
          privateKey: keyPair.privateKey,
          registrationDate: new Date().toISOString(),
          hasVoted: false,
          lastLogin: new Date().toISOString()
        };
        
        FingerprintService.registerUser(userData);
        
        setVoterId(generatedVoterId);
        setIsAuthenticated(true);
        localStorage.setItem('voterId', generatedVoterId);
        localStorage.setItem('privateKey', keyPair.privateKey);
        localStorage.setItem('publicKey', keyPair.publicKey);
        localStorage.setItem('fingerprint', currentFingerprint);
        
        toast.success(`Welcome ${userName}! Registration successful. You can now vote.`);
      } else {
        // Existing user - update last login
        const userData = FingerprintService.getUserData(currentFingerprint);
        if (userData) {
          console.log('Logging in existing user:', {
            name: userData.name,
            voterId: userData.voterId,
            hasVoted: userData.hasVoted
          });
          
          FingerprintService.updateUser(currentFingerprint, {
            lastLogin: new Date().toISOString()
          });
          
          setVoterId(userData.voterId);
          setIsAuthenticated(true);
          setHasVoted(userData.hasVoted);
          localStorage.setItem('voterId', userData.voterId);
          localStorage.setItem('privateKey', userData.privateKey);
          localStorage.setItem('publicKey', userData.publicKey);
          localStorage.setItem('fingerprint', currentFingerprint);
          
          toast.success(`Welcome back ${userName}!`);
        } else {
          throw new Error('User data not found for existing fingerprint');
        }
      }
      
      setShowNameInput(false);
      
    } catch (error) {
      console.error('User completion error:', error);
      toast.error('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (candidateId: string) => {
    if (!voterId) return;

    setLoading(true);
    try {
      console.log('Submitting vote for candidate:', candidateId);
      console.log('Voter ID:', voterId);

      // Submit vote using the simple API format
      const voteSubmission = {
        voterId: voterId,
        candidateId: candidateId
      };
      
      console.log('Submitting vote:', voteSubmission);
      const result = await VotingService.submitVote(voteSubmission);
      console.log('Vote submission result:', result);

      if (result.success) {
        setHasVoted(true);
        
        // Update fingerprint database
        if (currentFingerprint) {
          FingerprintService.markFingerprintAsVoted(currentFingerprint);
        }
        
        toast.success('Vote submitted successfully!');
      } else {
        toast.error(result.error || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Voting error:', error);
      toast.error('Failed to submit vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setVoterId(null);
    setHasVoted(false);
    setCurrentFingerprint(null);
    setIsNewUser(false);
    setExistingUser(null);
    setShowNameInput(false);
    localStorage.removeItem('voterId');
    localStorage.removeItem('privateKey');
    localStorage.removeItem('publicKey');
    localStorage.removeItem('fingerprint');
    toast.info('Logged out successfully');
  };

  return (
    <AppContainer>
      <Header 
        isAuthenticated={isAuthenticated}
        voterId={voterId}
        hasVoted={hasVoted}
        onLogout={handleLogout}
      />
      
      <MainContent>
        <Routes>
          <Route 
            path="/" 
            element={
              !isAuthenticated ? (
                showNameInput ? (
                  <UserNameInput
                    onComplete={handleUserNameComplete}
                    onBack={() => setShowNameInput(false)}
                    loading={loading}
                    isNewUser={isNewUser}
                    existingUser={existingUser}
                  />
                ) : (
                  <FingerprintAuth 
                    onAuth={handleFingerprintAuth}
                    loading={loading}
                  />
                )
              ) : hasVoted ? (
                <Results />
              ) : (
                <VotingInterface 
                  onVote={handleVote}
                  loading={loading}
                  voterId={voterId}
                />
              )
            } 
          />
          <Route path="/results" element={<Results />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/demo" element={<FingerprintDemo />} />
          <Route path="/api-explorer" element={<ApiExplorer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainContent>
    </AppContainer>
  );
}

export default App;
