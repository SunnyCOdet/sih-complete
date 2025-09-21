import React, { useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';

const VotingContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const VotingCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.2em;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 40px;
  font-size: 1.1em;
`;

const PartiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin: 40px 0;
`;

const PartyCard = styled.div<{ selected: boolean; party: 'bjp' | 'congress' }>`
  border: 3px solid ${props => props.selected ? '#28a745' : '#e9ecef'};
  border-radius: 20px;
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.selected ? '#d4edda' : 'white'};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }

  ${props => props.selected && `
    &::before {
      content: '✓';
      position: absolute;
      top: 15px;
      right: 15px;
      background: #28a745;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.2em;
    }
  `}

  ${props => props.party === 'bjp' && `
    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #e55a2b 0%, #e8851a 100%);
    }
  `}

  ${props => props.party === 'congress' && `
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #1a3462 0%, #254a88 100%);
    }
  `}
`;

const PartySymbol = styled.div`
  font-size: 4em;
  margin-bottom: 20px;
`;

const PartyName = styled.h2`
  font-size: 1.8em;
  margin-bottom: 10px;
  font-weight: bold;
`;

const PartyFullName = styled.p`
  font-size: 1.1em;
  margin-bottom: 20px;
  opacity: 0.9;
`;

const PartyDescription = styled.p`
  font-size: 0.95em;
  opacity: 0.8;
  line-height: 1.5;
`;

const VoteButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled 
    ? 'linear-gradient(45deg, #6c757d, #495057)' 
    : 'linear-gradient(45deg, #28a745, #20c997)'
  };
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 50px;
  font-size: 1.2em;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-top: 30px;
  min-width: 200px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const ConfirmationModal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  color: #333;
  margin-bottom: 20px;
  font-size: 1.8em;
`;

const ModalText = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1em;
  line-height: 1.5;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
`;

const ModalButton = styled.button<{ variant: 'confirm' | 'cancel' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => props.variant === 'confirm' ? `
    background: linear-gradient(45deg, #28a745, #20c997);
    color: white;
  ` : `
    background: #6c757d;
    color: white;
  `}

  &:hover {
    transform: translateY(-1px);
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

interface VotingInterfaceProps {
  onVote: (candidateId: string) => Promise<void>;
  loading: boolean;
}

const VotingInterface: React.FC<VotingInterfaceProps> = ({ onVote, loading }) => {
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const parties = [
    {
      id: 'bjp',
      name: 'BJP',
      fullName: 'Bharatiya Janata Party',
      symbol: '🕉️',
      description: 'A right-wing political party in India, founded in 1980. Known for its nationalist ideology and focus on economic development.'
    },
    {
      id: 'congress',
      name: 'Congress',
      fullName: 'Indian National Congress',
      symbol: '✋',
      description: 'One of the oldest political parties in India, founded in 1885. Known for its secular ideology and social welfare programs.'
    }
  ];

  const handlePartySelect = (partyId: string) => {
    setSelectedParty(partyId);
  };

  const handleVoteClick = () => {
    if (!selectedParty) {
      toast.error('Please select a party to vote for');
      return;
    }
    setShowConfirmation(true);
  };

  const handleConfirmVote = async () => {
    if (!selectedParty) return;
    
    setShowConfirmation(false);
    await onVote(selectedParty);
  };

  const handleCancelVote = () => {
    setShowConfirmation(false);
  };

  const selectedPartyData = parties.find(p => p.id === selectedParty);

  return (
    <VotingContainer>
      <VotingCard>
        <Title>Cast Your Vote</Title>
        <Subtitle>Select the party you want to vote for</Subtitle>

        <PartiesGrid>
          {parties.map((party) => (
            <PartyCard
              key={party.id}
              selected={selectedParty === party.id}
              party={party.id as 'bjp' | 'congress'}
              onClick={() => handlePartySelect(party.id)}
            >
              <PartySymbol>{party.symbol}</PartySymbol>
              <PartyName>{party.name}</PartyName>
              <PartyFullName>{party.fullName}</PartyFullName>
              <PartyDescription>{party.description}</PartyDescription>
            </PartyCard>
          ))}
        </PartiesGrid>

        <VoteButton
          disabled={!selectedParty || loading}
          onClick={handleVoteClick}
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Submitting Vote...
            </>
          ) : (
            'Submit Vote'
          )}
        </VoteButton>

        {selectedParty && (
          <div style={{ marginTop: '20px', color: '#666', fontSize: '0.9em' }}>
            Selected: <strong>{selectedPartyData?.fullName}</strong>
          </div>
        )}
      </VotingCard>

      <ConfirmationModal show={showConfirmation}>
        <ModalContent>
          <ModalTitle>Confirm Your Vote</ModalTitle>
          <ModalText>
            You are about to vote for <strong>{selectedPartyData?.fullName}</strong>.
            <br /><br />
            This action cannot be undone. Are you sure you want to proceed?
          </ModalText>
          <ModalButtons>
            <ModalButton variant="cancel" onClick={handleCancelVote}>
              Cancel
            </ModalButton>
            <ModalButton variant="confirm" onClick={handleConfirmVote}>
              Confirm Vote
            </ModalButton>
          </ModalButtons>
        </ModalContent>
      </ConfirmationModal>
    </VotingContainer>
  );
};

export default VotingInterface;
