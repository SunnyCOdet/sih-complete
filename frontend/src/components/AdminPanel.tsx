import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { VotingService } from '../services/VotingService';
import { FingerprintService } from '../services/FingerprintService';

const AdminContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const AdminCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.2em;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 40px;
  font-size: 1.1em;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 30px 0;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  font-size: 1em;
  opacity: 0.9;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin: 40px 0 20px 0;
  font-size: 1.5em;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
`;

const VotersList = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
`;

const VoterItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const VoterInfo = styled.div`
  flex: 1;
`;

const VoterId = styled.div`
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const VoterStatus = styled.div<{ hasVoted: boolean }>`
  font-size: 0.9em;
  color: ${props => props.hasVoted ? '#28a745' : '#6c757d'};
  font-weight: 600;
`;

const VoterDate = styled.div`
  font-size: 0.8em;
  color: #666;
`;

const VoterKey = styled.div`
  font-size: 0.8em;
  color: #666;
  margin-top: 5px;
  font-family: monospace;
  background: #f8f9fa;
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #007bff;
`;

const RefreshButton = styled.button`
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 20px 0;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  text-align: center;
`;

const IntegrityStatus = styled.div<{ isIntact: boolean }>`
  background: ${props => props.isIntact ? '#d4edda' : '#f8d7da'};
  color: ${props => props.isIntact ? '#155724' : '#721c24'};
  border: 1px solid ${props => props.isIntact ? '#c3e6cb' : '#f5c6cb'};
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  text-align: center;
  font-weight: 600;
`;

const TamperStats = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
`;

const TamperTitle = styled.h3`
  color: #856404;
  margin-bottom: 10px;
`;

const TamperItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 5px 0;
  color: #856404;
`;

const AdminPanel: React.FC = () => {
  const [voters, setVoters] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [integrity, setIntegrity] = useState<any>({});
  const [tamperStats, setTamperStats] = useState<any>({});
  const [fingerprintUsers, setFingerprintUsers] = useState<any[]>([]);
  const [fingerprintStats, setFingerprintStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [votersData, statsData, integrityData, tamperData] = await Promise.all([
        VotingService.getAllVoters(),
        VotingService.getStats(),
        VotingService.verifyBlockchainIntegrity(),
        VotingService.getTamperStats()
      ]);
      
      // Get fingerprint data
      const fingerprintUsersData = FingerprintService.getAllUsers();
      const fingerprintStatsData = FingerprintService.getFingerprintStats();
      
      setVoters(votersData);
      setStats(statsData);
      setIntegrity(integrityData);
      setTamperStats(tamperData);
      setFingerprintUsers(fingerprintUsersData);
      setFingerprintStats(fingerprintStatsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to fetch admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <AdminContainer>
        <AdminCard>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <LoadingSpinner />
            <div style={{ marginTop: '20px', color: '#666' }}>Loading admin data...</div>
          </div>
        </AdminCard>
      </AdminContainer>
    );
  }

  if (error) {
    return (
      <AdminContainer>
        <AdminCard>
          <ErrorMessage>{error}</ErrorMessage>
          <div style={{ textAlign: 'center' }}>
            <RefreshButton onClick={fetchAdminData}>
              Try Again
            </RefreshButton>
          </div>
        </AdminCard>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <AdminCard>
        <Title>Admin Panel</Title>
        <Subtitle>System monitoring and voter management</Subtitle>

        <StatsGrid>
          <StatCard>
            <StatValue>{stats.voterStats?.total || 0}</StatValue>
            <StatLabel>Total Voters</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.voterStats?.voted || 0}</StatValue>
            <StatLabel>Votes Cast</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.voterStats?.remaining || 0}</StatValue>
            <StatLabel>Remaining</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalVotes || 0}</StatValue>
            <StatLabel>Total Votes</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{fingerprintStats.totalUsers || 0}</StatValue>
            <StatLabel>Fingerprint Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{fingerprintStats.newUsers || 0}</StatValue>
            <StatLabel>New Today</StatLabel>
          </StatCard>
        </StatsGrid>

        <SectionTitle>Blockchain Integrity</SectionTitle>
        <IntegrityStatus isIntact={integrity.isIntact}>
          {integrity.isIntact ? '✅ Blockchain is intact' : '❌ Blockchain integrity compromised'}
        </IntegrityStatus>
        
        {integrity.issues && integrity.issues.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <strong>Issues detected:</strong>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              {integrity.issues.map((issue: string, index: number) => (
                <li key={index} style={{ color: '#721c24', marginBottom: '5px' }}>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        <SectionTitle>Tamper Detection</SectionTitle>
        <TamperStats>
          <TamperTitle>Security Statistics</TamperTitle>
          <TamperItem>
            <span>Total Activities:</span>
            <span>{tamperStats.totalActivities || 0}</span>
          </TamperItem>
          <TamperItem>
            <span>Recent Activities:</span>
            <span>{tamperStats.recentActivities || 0}</span>
          </TamperItem>
          {tamperStats.bySeverity && (
            <div style={{ marginTop: '10px' }}>
              <strong>By Severity:</strong>
              {Object.entries(tamperStats.bySeverity).map(([severity, count]) => (
                <TamperItem key={severity}>
                  <span>{severity}:</span>
                  <span>{count as number}</span>
                </TamperItem>
              ))}
            </div>
          )}
        </TamperStats>

        <SectionTitle>Fingerprint Users ({fingerprintUsers.length})</SectionTitle>
        <VotersList>
          {fingerprintUsers.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No fingerprint users registered yet
            </div>
          ) : (
            fingerprintUsers.map((user, index) => (
              <VoterItem key={index}>
                <VoterInfo>
                  <VoterId>{user.name}</VoterId>
                  <VoterStatus hasVoted={user.hasVoted}>
                    {user.hasVoted ? '✅ Voted' : '⏳ Pending'}
                  </VoterStatus>
                  <VoterDate>
                    Registered: {new Date(user.registrationDate).toLocaleString()}
                  </VoterDate>
                  <VoterDate>
                    Last Login: {new Date(user.lastLogin).toLocaleString()}
                  </VoterDate>
                </VoterInfo>
                <VoterKey>
                  <div>Voter ID: {user.voterId}</div>
                  <div>Fingerprint: {user.fingerprint.substring(0, 20)}...</div>
                </VoterKey>
              </VoterItem>
            ))
          )}
        </VotersList>

        <SectionTitle>Backend Registered Voters ({voters.length})</SectionTitle>
        <VotersList>
          {voters.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
              No voters registered yet
            </div>
          ) : (
            voters.map((voter) => (
              <VoterItem key={voter.id}>
                <VoterInfo>
                  <VoterId>{voter.id}</VoterId>
                  <VoterStatus hasVoted={voter.hasVoted}>
                    {voter.hasVoted ? '✅ Voted' : '⏳ Pending'}
                  </VoterStatus>
                  <VoterDate>
                    Registered: {new Date(voter.registrationDate).toLocaleString()}
                  </VoterDate>
                </VoterInfo>
              </VoterItem>
            ))
          )}
        </VotersList>

        <div style={{ textAlign: 'center' }}>
          <RefreshButton onClick={fetchAdminData}>
            Refresh Data
          </RefreshButton>
        </div>
      </AdminCard>
    </AdminContainer>
  );
};

export default AdminPanel;
