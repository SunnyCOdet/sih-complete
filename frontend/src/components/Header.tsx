import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 20px 0;
  margin-bottom: 30px;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  color: white;
  font-size: 1.8em;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }
`;

const UserInfo = styled.div`
  color: white;
  display: flex;
  align-items: center;
  gap: 15px;
`;

const VoterId = styled.span`
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9em;
`;

const StatusBadge = styled.span<{ status: 'authenticated' | 'voted' | 'pending' }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8em;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'authenticated':
        return `
          background: #28a745;
          color: white;
        `;
      case 'voted':
        return `
          background: #17a2b8;
          color: white;
        `;
      case 'pending':
        return `
          background: #ffc107;
          color: #333;
        `;
      default:
        return '';
    }
  }}
`;

const LogoutButton = styled.button`
  background: rgba(220, 53, 69, 0.8);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(220, 53, 69, 1);
    transform: translateY(-1px);
  }
`;

interface HeaderProps {
  isAuthenticated: boolean;
  voterId: string | null;
  hasVoted: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, voterId, hasVoted, onLogout }) => {
  const getStatus = () => {
    if (!isAuthenticated) return 'pending';
    if (hasVoted) return 'voted';
    return 'authenticated';
  };

  const getStatusText = () => {
    if (!isAuthenticated) return 'Not Authenticated';
    if (hasVoted) return 'Voted';
    return 'Ready to Vote';
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>🗳️ Secure Voting System</Logo>
        
        <Nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/results">Results</NavLink>
          <NavLink to="/admin">Admin</NavLink>
          
          {isAuthenticated && (
            <UserInfo>
              <VoterId>ID: {voterId}</VoterId>
              <StatusBadge status={getStatus()}>
                {getStatusText()}
              </StatusBadge>
              <LogoutButton onClick={onLogout}>
                Logout
              </LogoutButton>
            </UserInfo>
          )}
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
