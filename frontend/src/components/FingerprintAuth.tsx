import React, { useState } from 'react';
import styled from 'styled-components';
import { FingerprintService } from '../services/FingerprintService';

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

const FingerprintScanner = styled.div<{ scanning: boolean }>`
  border: 3px dashed ${props => props.scanning ? '#28a745' : '#667eea'};
  border-radius: 20px;
  padding: 60px 40px;
  margin: 30px 0;
  background: ${props => props.scanning ? '#d4edda' : '#f8f9fa'};
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  ${props => props.scanning && `
    animation: pulse 2s infinite;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(40, 167, 69, 0.3), transparent);
      animation: scan 2s infinite;
    }
  `}

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }

  @keyframes scan {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

const FingerprintIcon = styled.div`
  font-size: 4em;
  margin-bottom: 20px;
  color: #667eea;
`;

const ScanButton = styled.button<{ scanning: boolean }>`
  background: ${props => props.scanning 
    ? 'linear-gradient(45deg, #28a745, #20c997)' 
    : 'linear-gradient(45deg, #667eea, #764ba2)'
  };
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
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

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
`;

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
`;

interface FingerprintAuthProps {
  onAuth: (fingerprint: string) => Promise<void>;
  loading: boolean;
}

const FingerprintAuth: React.FC<FingerprintAuthProps> = ({ onAuth, loading }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deviceCompatible, setDeviceCompatible] = useState<boolean | null>(null);

  // Check device compatibility on component mount
  React.useEffect(() => {
    const checkCompatibility = async () => {
      try {
        // Check if we're in a secure context
        if (!window.isSecureContext) {
          setDeviceCompatible(false);
          return;
        }

        // Check if WebAuthn is supported
        if (!window.PublicKeyCredential) {
          setDeviceCompatible(false);
          return;
        }
        
        // Check if fingerprint scanner is available
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setDeviceCompatible(available);
      } catch (error) {
        console.error('Compatibility check failed:', error);
        setDeviceCompatible(false);
      }
    };

    checkCompatibility();
  }, []);

  const handleScanFingerprint = async () => {
    setScanning(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Starting real fingerprint authentication...');
      
      setSuccess('Initializing fingerprint scanner...');
      
      // Real fingerprint scanning using WebAuthn
      const fingerprint = await FingerprintService.scanFingerprint();
      console.log('Fingerprint authenticated:', fingerprint);
      
      setSuccess('Fingerprint verified successfully! Proceeding to authentication...');
      
      // Wait a moment to show success message, then call onAuth
      setTimeout(() => {
        console.log('Calling onAuth with fingerprint:', fingerprint);
        onAuth(fingerprint);
      }, 1500);

    } catch (error: any) {
      console.error('Fingerprint authentication error:', error);
      setError(error.message || 'Fingerprint authentication failed. Please try again.');
      setScanning(false);
    }
  };

  return (
    <AuthContainer>
      <AuthCard>
        <Title>Fingerprint Authentication</Title>
        <Subtitle>Please scan your fingerprint to verify your identity</Subtitle>

        {deviceCompatible === false && (
          <ErrorMessage>
            <strong>Fingerprint Scanner Not Available:</strong> Your device doesn't have a fingerprint scanner or it's not enabled. 
            Please use a device with Windows Hello, Touch ID, or Android fingerprint support.
          </ErrorMessage>
        )}

        {deviceCompatible === true && (
          <SuccessMessage>
            <strong>✓ Fingerprint Scanner Detected:</strong> Your device has a fingerprint scanner ready! 
            Click the button below to authenticate with your fingerprint.
          </SuccessMessage>
        )}

        <Instructions>
          <InstructionsTitle>Real Fingerprint Authentication:</InstructionsTitle>
          <InstructionsList>
            <InstructionsItem>Click "Start Fingerprint Scan" to begin</InstructionsItem>
            <InstructionsItem>Place your finger on the fingerprint scanner when prompted</InstructionsItem>
            <InstructionsItem>Hold still until authentication is complete</InstructionsItem>
            <InstructionsItem>Enter your name when prompted</InstructionsItem>
            <InstructionsItem>New users will be registered automatically</InstructionsItem>
            <InstructionsItem>Existing users will be logged in</InstructionsItem>
            <InstructionsItem>Each person can only vote once per election</InstructionsItem>
          </InstructionsList>
        </Instructions>

        <FingerprintScanner scanning={scanning}>
          <FingerprintIcon>👆</FingerprintIcon>
          <div style={{ fontSize: '1.2em', marginBottom: '20px', color: '#333' }}>
            {scanning ? 'Scanning...' : 'Ready to Scan'}
          </div>
          <ScanButton 
            scanning={scanning}
            onClick={handleScanFingerprint}
            disabled={loading || scanning || deviceCompatible === false}
          >
            {scanning ? 'Scanning Fingerprint...' : 
             deviceCompatible === false ? 'Device Not Compatible' :
             'Start Fingerprint Scan'}
          </ScanButton>
        </FingerprintScanner>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <div style={{ marginTop: '30px', fontSize: '0.9em', color: '#666' }}>
          <strong>Security Note:</strong> Your fingerprint data is encrypted and stored securely. 
          It will only be used to verify that you haven't voted before.
        </div>
      </AuthCard>
    </AuthContainer>
  );
};

export default FingerprintAuth;
