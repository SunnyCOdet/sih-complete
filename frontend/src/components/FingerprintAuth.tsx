import React, { useState } from 'react';
import styled from 'styled-components';
import FingerprintSimulator from './FingerprintSimulator';

const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

const AuthCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
  width: 100%;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.2em;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1em;
`;

const Instructions = styled.div`
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
`;

const InstructionsTitle = styled.h3`
  color: #1976d2;
  margin-bottom: 10px;
  font-size: 1.1em;
`;

const InstructionsList = styled.ul`
  color: #1976d2;
  margin: 0;
  padding-left: 20px;
`;

const InstructionsItem = styled.li`
  margin-bottom: 5px;
`;

interface FingerprintAuthProps {
  onAuth: (fingerprint: string) => Promise<void>;
  loading: boolean;
}

const FingerprintAuth: React.FC<FingerprintAuthProps> = ({ onAuth, loading }) => {
  const handleFingerprintDetected = async (fingerprint: string) => {
    console.log('Fingerprint detected:', fingerprint);
    await onAuth(fingerprint);
  };

  const handleModeChange = (newMode: 'real' | 'simulation') => {
    console.log('Mode changed to:', newMode);
  };

  return (
    <AuthContainer>
      <AuthCard>
        <Title>Fingerprint Authentication</Title>
        <Subtitle>Please scan your fingerprint to verify your identity</Subtitle>

        <Instructions>
          <InstructionsTitle>Authentication Options:</InstructionsTitle>
          <InstructionsList>
            <InstructionsItem><strong>Simulation Mode:</strong> Test with pre-configured fingerprints</InstructionsItem>
            <InstructionsItem><strong>Real Hardware:</strong> Use actual fingerprint scanner (if available)</InstructionsItem>
            <InstructionsItem>Enter your name when prompted</InstructionsItem>
            <InstructionsItem>New users will be registered automatically</InstructionsItem>
            <InstructionsItem>Existing users will be logged in</InstructionsItem>
            <InstructionsItem>Each person can only vote once per election</InstructionsItem>
          </InstructionsList>
        </Instructions>

        <FingerprintSimulator
          onFingerprintDetected={handleFingerprintDetected}
          onModeChange={handleModeChange}
          disabled={loading}
        />
      </AuthCard>
    </AuthContainer>
  );
};

export default FingerprintAuth;
