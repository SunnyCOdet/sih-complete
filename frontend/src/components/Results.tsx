import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { VotingService } from '../services/VotingService';

const ResultsContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const ResultsCard = styled.div`
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

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin: 40px 0;
`;

const ResultCard = styled.div<{ party: 'bjp' | 'congress' }>`
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;

  ${props => props.party === 'bjp' && `
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
  `}

  ${props => props.party === 'congress' && `
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  `}
`;

const PartySymbol = styled.div`
  font-size: 3em;
  margin-bottom: 15px;
`;

const PartyName = styled.h2`
  font-size: 1.5em;
  margin-bottom: 10px;
  font-weight: bold;
`;

const PartyFullName = styled.p`
  font-size: 1em;
  margin-bottom: 20px;
  opacity: 0.9;
`;

const VoteCount = styled.div`
  font-size: 3em;
  font-weight: bold;
  margin: 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const VoteLabel = styled.div`
  font-size: 1em;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  margin: 20px 0;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  width: ${props => props.percentage}%;
  border-radius: 4px;
  transition: width 0.5s ease;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 30px 0;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
`;

const StatValue = styled.div`
  font-size: 2.5em;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 10px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 1em;
  font-weight: 600;
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

const WinnerCard = styled.div`
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border-radius: 20px;
  padding: 30px;
  text-align: center;
  margin: 30px 0;
  box-shadow: 0 15px 30px rgba(40, 167, 69, 0.3);
`;

const WinnerTitle = styled.h2`
  font-size: 1.8em;
  margin-bottom: 15px;
  font-weight: bold;
`;

const WinnerParty = styled.div`
  font-size: 2.5em;
  font-weight: bold;
  margin: 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Results: React.FC = () => {
  const [results, setResults] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parties = [
    { id: 'bjp', name: 'BJP', fullName: 'Bharatiya Janata Party', symbol: '🕉️' },
    { id: 'congress', name: 'Congress', fullName: 'Indian National Congress', symbol: '✋' }
  ];

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [resultsData, statsData] = await Promise.all([
        VotingService.getResults(),
        VotingService.getStats()
      ]);
      
      setResults(resultsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching results:', error);
      setError('Failed to fetch results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const totalVotes = Object.values(results).reduce((sum, count) => sum + count, 0);
  const winner = Object.entries(results).reduce((a, b) => results[a[0]] > results[b[0]] ? a : b, ['', 0]);

  if (loading) {
    return (
      <ResultsContainer>
        <ResultsCard>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <LoadingSpinner />
            <div style={{ marginTop: '20px', color: '#666' }}>Loading results...</div>
          </div>
        </ResultsCard>
      </ResultsContainer>
    );
  }

  if (error) {
    return (
      <ResultsContainer>
        <ResultsCard>
          <ErrorMessage>{error}</ErrorMessage>
          <div style={{ textAlign: 'center' }}>
            <RefreshButton onClick={fetchResults}>
              Try Again
            </RefreshButton>
          </div>
        </ResultsCard>
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      <ResultsCard>
        <Title>Election Results</Title>
        <Subtitle>Live voting results and statistics</Subtitle>

        {totalVotes > 0 && (
          <WinnerCard>
            <WinnerTitle>Current Leader</WinnerTitle>
            <WinnerParty>
              {parties.find(p => p.id === winner[0])?.symbol} {parties.find(p => p.id === winner[0])?.fullName}
            </WinnerParty>
            <div style={{ fontSize: '1.2em', opacity: 0.9 }}>
              {winner[1]} votes ({Math.round((winner[1] / totalVotes) * 100)}%)
            </div>
          </WinnerCard>
        )}

        <ResultsGrid>
          {parties.map((party) => {
            const votes = results[party.id] || 0;
            const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
            
            return (
              <ResultCard key={party.id} party={party.id as 'bjp' | 'congress'}>
                <PartySymbol>{party.symbol}</PartySymbol>
                <PartyName>{party.name}</PartyName>
                <PartyFullName>{party.fullName}</PartyFullName>
                <VoteCount>{votes}</VoteCount>
                <VoteLabel>Votes</VoteLabel>
                <ProgressBar>
                  <ProgressFill percentage={percentage} />
                </ProgressBar>
                <div style={{ fontSize: '1.1em', fontWeight: 'bold', marginTop: '10px' }}>
                  {percentage.toFixed(1)}%
                </div>
              </ResultCard>
            );
          })}
        </ResultsGrid>

        <StatsGrid>
          <StatCard>
            <StatValue>{totalVotes}</StatValue>
            <StatLabel>Total Votes</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.voterStats?.total || 0}</StatValue>
            <StatLabel>Registered Voters</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.voterStats?.voted || 0}</StatValue>
            <StatLabel>Votes Cast</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.voterStats?.remaining || 0}</StatValue>
            <StatLabel>Remaining</StatLabel>
          </StatCard>
        </StatsGrid>

        <div style={{ textAlign: 'center' }}>
          <RefreshButton onClick={fetchResults}>
            Refresh Results
          </RefreshButton>
        </div>
      </ResultsCard>
    </ResultsContainer>
  );
};

export default Results;
