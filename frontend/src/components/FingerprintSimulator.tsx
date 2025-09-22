import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';

// Animation keyframes
const scanLine = keyframes`
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(100%); opacity: 0; }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const ripple = keyframes`
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px #00ff00; }
  50% { box-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00; }
  100% { box-shadow: 0 0 5px #00ff00; }
`;

// Styled components
const SimulatorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
`;

const SimulatorCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 600px;
  width: 100%;
  margin: 20px 0;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5em;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 1.2em;
`;

const ModeToggle = styled.div`
  display: flex;
  background: #f0f0f0;
  border-radius: 25px;
  padding: 5px;
  margin: 20px 0;
  width: 300px;
  align-self: center;
`;

const ModeButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
`;

const ScannerContainer = styled.div<{ scanning: boolean; success: boolean; error: boolean }>`
  position: relative;
  width: 200px;
  height: 200px;
  margin: 30px auto;
  border: 3px solid ${props => 
    props.error ? '#ff4444' : 
    props.success ? '#00aa00' : 
    props.scanning ? '#667eea' : '#ddd'
  };
  border-radius: 50%;
  background: ${props => 
    props.error ? '#ffe6e6' : 
    props.success ? '#e6ffe6' : 
    props.scanning ? '#f0f8ff' : '#f9f9f9'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: all 0.3s ease;
  ${props => props.scanning && css`
    animation: ${pulse} 1.5s infinite;
  `}
  ${props => props.success && css`
    animation: ${glow} 0.5s ease-in-out;
  `}
`;

const ScannerIcon = styled.div<{ scanning: boolean }>`
  font-size: 4em;
  color: #667eea;
  transition: all 0.3s ease;
  ${props => props.scanning && css`
    animation: ${pulse} 1s infinite;
  `}
`;

const ScanLine = styled.div<{ scanning: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #00ff00, transparent);
  opacity: 0;
  ${props => props.scanning && css`
    animation: ${scanLine} 2s infinite;
  `}
`;

const RippleEffect = styled.div<{ show: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: #00ff00;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  ${props => props.show && css`
    animation: ${ripple} 0.6s ease-out;
  `}
`;

const ControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 30px 0;
`;

const ScanButton = styled.button<{ scanning: boolean; disabled: boolean }>`
  background: ${props => 
    props.disabled ? '#ccc' :
    props.scanning ? 'linear-gradient(45deg, #ff6b6b, #ee5a24)' :
    'linear-gradient(45deg, #667eea, #764ba2)'
  };
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  min-width: 200px;
  align-self: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const TestFingerprints = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin: 20px 0;
`;

const TestFingerprintButton = styled.button`
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  padding: 10px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9em;

  &:hover {
    background: #e9ecef;
    border-color: #667eea;
  }
`;

const StatusMessage = styled.div<{ type: 'info' | 'success' | 'error' }>`
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

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 4px;
  background: #e9ecef;
  border-radius: 2px;
  overflow: hidden;
  margin: 10px 0;

  &::after {
    content: '';
    display: block;
    width: ${props => props.progress}%;
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    transition: width 0.3s ease;
  }
`;

interface FingerprintSimulatorProps {
  onFingerprintDetected: (fingerprint: string) => void;
  onModeChange?: (mode: 'real' | 'simulation') => void;
  disabled?: boolean;
}

// Pre-configured test fingerprints for simulation
const TEST_FINGERPRINTS = [
  { id: 'test_fp_001', name: 'John Doe', description: 'New User' },
  { id: 'test_fp_002', name: 'Jane Smith', description: 'Returning User' },
  { id: 'test_fp_003', name: 'Bob Johnson', description: 'Admin User' },
  { id: 'test_fp_004', name: 'Alice Brown', description: 'Test User' },
  { id: 'test_fp_005', name: 'Charlie Wilson', description: 'Demo User' },
];

const FingerprintSimulator: React.FC<FingerprintSimulatorProps> = ({
  onFingerprintDetected,
  onModeChange,
  disabled = false
}) => {
  const [mode, setMode] = useState<'real' | 'simulation'>('simulation');
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [showRipple, setShowRipple] = useState(false);
  const [deviceCompatible, setDeviceCompatible] = useState<boolean | null>(null);

  // Check device compatibility on mount
  useEffect(() => {
    const checkCompatibility = async () => {
      try {
        if (!window.isSecureContext || !window.PublicKeyCredential) {
          setDeviceCompatible(false);
          return;
        }
        
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setDeviceCompatible(available);
      } catch (error) {
        setDeviceCompatible(false);
      }
    };

    checkCompatibility();
  }, []);

  const handleModeChange = (newMode: 'real' | 'simulation') => {
    setMode(newMode);
    onModeChange?.(newMode);
    resetState();
  };

  const resetState = () => {
    setScanning(false);
    setSuccess(false);
    setError(false);
    setStatusMessage('');
    setProgress(0);
    setShowRipple(false);
  };

  const simulateScan = async (fingerprintId: string) => {
    setScanning(true);
    setError(false);
    setSuccess(false);
    setStatusMessage('Initializing fingerprint scanner...');
    setProgress(10);

    // Simulate scanning process
    const steps = [
      { message: 'Calibrating scanner...', progress: 25 },
      { message: 'Detecting fingerprint...', progress: 50 },
      { message: 'Analyzing patterns...', progress: 75 },
      { message: 'Verifying identity...', progress: 90 },
      { message: 'Authentication complete!', progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setStatusMessage(step.message);
      setProgress(step.progress);
    }

    // Show success animation
    setSuccess(true);
    setShowRipple(true);
    setStatusMessage('Fingerprint verified successfully!');
    
    // Reset ripple after animation
    setTimeout(() => setShowRipple(false), 600);

    // Call callback after a delay
    setTimeout(() => {
      onFingerprintDetected(fingerprintId);
      resetState();
    }, 1500);
  };

  const handleRealScan = async () => {
    setScanning(true);
    setError(false);
    setSuccess(false);
    setStatusMessage('Initializing real fingerprint scanner...');
    setProgress(10);

    try {
      if (!window.PublicKeyCredential) {
        throw new Error('WebAuthn not supported');
      }

      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        throw new Error('No fingerprint scanner available');
      }

      setStatusMessage('Place your finger on the scanner...');
      setProgress(30);

      const credentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [],
        userVerification: 'required',
        timeout: 60000,
        rpId: window.location.hostname,
      };

      setStatusMessage('Scanning fingerprint...');
      setProgress(60);

      const credential = await navigator.credentials.get({
        publicKey: credentialRequestOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Fingerprint authentication failed');
      }

      setProgress(90);
      setStatusMessage('Processing fingerprint data...');

      // Generate fingerprint ID from credential
      const credentialId = Array.from(new Uint8Array(credential.rawId))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      const fingerprintId = `fp_real_${credentialId.substring(0, 16)}_${Date.now()}`;

      setProgress(100);
      setSuccess(true);
      setShowRipple(true);
      setStatusMessage('Real fingerprint verified successfully!');

      setTimeout(() => {
        onFingerprintDetected(fingerprintId);
        resetState();
      }, 1500);

    } catch (error: any) {
      console.error('Real fingerprint scan failed:', error);
      setError(true);
      setStatusMessage(error.message || 'Fingerprint authentication failed');
      setScanning(false);
    }
  };

  const handleTestFingerprint = (fingerprint: typeof TEST_FINGERPRINTS[0]) => {
    if (scanning) return;
    simulateScan(fingerprint.id);
  };

  const handleScan = () => {
    if (mode === 'real') {
      handleRealScan();
    } else {
      // For simulation mode, use a random test fingerprint
      const randomFingerprint = TEST_FINGERPRINTS[Math.floor(Math.random() * TEST_FINGERPRINTS.length)];
      simulateScan(randomFingerprint.id);
    }
  };

  return (
    <SimulatorContainer>
      <SimulatorCard>
        <Title>🔐 Fingerprint Authentication</Title>
        <Subtitle>Secure biometric verification system</Subtitle>

        <ModeToggle>
          <ModeButton 
            active={mode === 'simulation'} 
            onClick={() => handleModeChange('simulation')}
          >
            Simulation Mode
          </ModeButton>
          <ModeButton 
            active={mode === 'real'} 
            onClick={() => handleModeChange('real')}
            disabled={deviceCompatible === false}
          >
            Real Hardware
          </ModeButton>
        </ModeToggle>

        {deviceCompatible === false && mode === 'real' && (
          <StatusMessage type="error">
            <strong>⚠️ Real Hardware Not Available:</strong> Your device doesn't support fingerprint scanning. 
            Use simulation mode for testing.
          </StatusMessage>
        )}

        {deviceCompatible === true && mode === 'real' && (
          <StatusMessage type="success">
            <strong>✅ Real Hardware Detected:</strong> Your device supports fingerprint scanning!
          </StatusMessage>
        )}

        <ScannerContainer scanning={scanning} success={success} error={error}>
          <ScannerIcon scanning={scanning}>
            {error ? '❌' : success ? '✅' : scanning ? '👆' : '🔍'}
          </ScannerIcon>
          <ScanLine scanning={scanning} />
          <RippleEffect show={showRipple} />
        </ScannerContainer>

        <ProgressBar progress={progress} />

        <ControlPanel>
          <ScanButton 
            scanning={scanning}
            disabled={disabled || (mode === 'real' && deviceCompatible === false)}
            onClick={handleScan}
          >
            {scanning ? 'Scanning...' : 
             mode === 'real' && deviceCompatible === false ? 'Hardware Not Available' :
             mode === 'real' ? 'Scan Real Fingerprint' :
             'Simulate Fingerprint Scan'}
          </ScanButton>

          {mode === 'simulation' && (
            <div>
              <h4>Test Fingerprints:</h4>
              <TestFingerprints>
                {TEST_FINGERPRINTS.map((fp) => (
                  <TestFingerprintButton
                    key={fp.id}
                    onClick={() => handleTestFingerprint(fp)}
                    disabled={scanning}
                  >
                    <div><strong>{fp.name}</strong></div>
                    <div style={{ fontSize: '0.8em', color: '#666' }}>{fp.description}</div>
                  </TestFingerprintButton>
                ))}
              </TestFingerprints>
            </div>
          )}
        </ControlPanel>

        {statusMessage && (
          <StatusMessage type={error ? 'error' : success ? 'success' : 'info'}>
            {statusMessage}
          </StatusMessage>
        )}

        <div style={{ marginTop: '20px', fontSize: '0.9em', color: '#666' }}>
          <strong>Security Note:</strong> {mode === 'real' 
            ? 'Your fingerprint data is processed securely using WebAuthn standards.'
            : 'Simulation mode generates test fingerprints for development and testing purposes.'
          }
        </div>
      </SimulatorCard>
    </SimulatorContainer>
  );
};

export default FingerprintSimulator;
