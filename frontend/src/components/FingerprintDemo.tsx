import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import FingerprintSimulator from './FingerprintSimulator';
import { FingerprintService, UserData } from '../services/FingerprintService';

const DemoContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const DemoCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5em;
`;

const Subtitle = styled.p`
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 1.2em;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin: 30px 0;
`;

const StatCard = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  border: 2px solid #e9ecef;
`;

const StatValue = styled.div`
  font-size: 2em;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9em;
`;

const UserList = styled.div`
  margin: 30px 0;
`;

const UserItem = styled.div<{ hasVoted: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin: 10px 0;
  background: ${props => props.hasVoted ? '#d4edda' : '#f8f9fa'};
  border-radius: 10px;
  border: 1px solid ${props => props.hasVoted ? '#c3e6cb' : '#e9ecef'};
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: bold;
  color: #333;
`;

const UserDetails = styled.div`
  font-size: 0.9em;
  color: #666;
  margin-top: 5px;
`;

const VoteStatus = styled.div<{ hasVoted: boolean }>`
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: bold;
  background: ${props => props.hasVoted ? '#28a745' : '#6c757d'};
  color: white;
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 15px;
  margin: 20px 0;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #5a6268; }
        `;
      default:
        return `
          background: #667eea;
          color: white;
          &:hover { background: #5a6fd8; }
        `;
    }
  }}
`;

const Message = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 15px;
  border-radius: 10px;
  margin: 15px 0;
  font-weight: 500;
  background: ${props => 
    props.type === 'error' ? '#f8d7da' :
    props.type === 'success' ? '#d4edda' :
    '#d1ecf1'
  };
  color: ${props => 
    props.type === 'error' ? '#721c24' :
    props.type === 'success' ? '#155724' :
    '#0c5460'
  };
  border: 1px solid ${props => 
    props.type === 'error' ? '#f5c6cb' :
    props.type === 'success' ? '#c3e6cb' :
    '#bee5eb'
  };
`;

const FingerprintDemo: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVoted: 0,
    newUsers: 0,
    returningUsers: 0
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

  // Load users and stats
  const loadData = () => {
    const allUsers = FingerprintService.getAllUsers();
    setUsers(allUsers);
    setStats(FingerprintService.getFingerprintStats());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFingerprintDetected = async (fingerprint: string) => {
    try {
      setMessage({ type: 'info', text: 'Processing fingerprint...' });
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const isRegistered = FingerprintService.isFingerprintRegistered(fingerprint);
      
      if (isRegistered) {
        const userData = FingerprintService.getUserData(fingerprint);
        if (userData) {
          setMessage({ 
            type: 'success', 
            text: `Welcome back ${userData.name}! ${userData.hasVoted ? 'You have already voted.' : 'You can now vote.'}` 
          });
        }
      } else {
        setMessage({ 
          type: 'info', 
          text: `New fingerprint detected: ${fingerprint.substring(0, 20)}...` 
        });
      }
      
      // Reload data to show updates
      loadData();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
      
    } catch (error) {
      console.error('Error processing fingerprint:', error);
      setMessage({ type: 'error', text: 'Error processing fingerprint' });
    }
  };

  const resetDatabase = () => {
    if (window.confirm('Are you sure you want to reset the fingerprint database? This will delete all user data.')) {
      FingerprintService.resetDatabase();
      loadData();
      setMessage({ type: 'success', text: 'Database reset successfully' });
    }
  };

  const exportData = () => {
    const data = FingerprintService.exportUserData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fingerprint-database.json';
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Database exported successfully' });
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = FingerprintService.importUserData(data);
        if (success) {
          loadData();
          setMessage({ type: 'success', text: 'Database imported successfully' });
        } else {
          setMessage({ type: 'error', text: 'Failed to import database' });
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Invalid file format' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <DemoContainer>
      <DemoCard>
        <Title>🔐 Fingerprint Simulation Demo</Title>
        <Subtitle>Interactive demonstration of the fingerprint authentication system</Subtitle>

        {message && (
          <Message type={message.type}>
            {message.text}
          </Message>
        )}

        <StatsGrid>
          <StatCard>
            <StatValue>{stats.totalUsers}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalVoted}</StatValue>
            <StatLabel>Users Voted</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.newUsers}</StatValue>
            <StatLabel>New Today</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.returningUsers}</StatValue>
            <StatLabel>Returning</StatLabel>
          </StatCard>
        </StatsGrid>

        <FingerprintSimulator
          onFingerprintDetected={handleFingerprintDetected}
        />

        <ControlPanel>
          <Button onClick={loadData}>
            🔄 Refresh Data
          </Button>
          <Button onClick={exportData}>
            📤 Export Database
          </Button>
          <Button variant="secondary" onClick={() => document.getElementById('import-file')?.click()}>
            📥 Import Database
          </Button>
          <Button variant="danger" onClick={resetDatabase}>
            🗑️ Reset Database
          </Button>
        </ControlPanel>

        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={importData}
          style={{ display: 'none' }}
        />

        {users.length > 0 && (
          <UserList>
            <h3>Registered Users ({users.length})</h3>
            {users.map((user, index) => (
              <UserItem key={user.fingerprint} hasVoted={user.hasVoted}>
                <UserInfo>
                  <UserName>{user.name}</UserName>
                  <UserDetails>
                    ID: {user.voterId} | 
                    Registered: {new Date(user.registrationDate).toLocaleDateString()} | 
                    Last Login: {new Date(user.lastLogin).toLocaleString()}
                  </UserDetails>
                </UserInfo>
                <VoteStatus hasVoted={user.hasVoted}>
                  {user.hasVoted ? 'VOTED' : 'NOT VOTED'}
                </VoteStatus>
              </UserItem>
            ))}
          </UserList>
        )}

        <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
          <h4>Demo Features:</h4>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li><strong>Simulation Mode:</strong> Test with pre-configured fingerprints</li>
            <li><strong>Real Hardware Mode:</strong> Use actual fingerprint scanner (if available)</li>
            <li><strong>User Management:</strong> View registered users and their voting status</li>
            <li><strong>Data Export/Import:</strong> Backup and restore fingerprint database</li>
            <li><strong>Real-time Stats:</strong> Track user registration and voting activity</li>
            <li><strong>Visual Feedback:</strong> Realistic scanning animations and progress indicators</li>
          </ul>
        </div>
      </DemoCard>
    </DemoContainer>
  );
};

export default FingerprintDemo;
