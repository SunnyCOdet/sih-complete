import React, { useState } from 'react';
import styled from 'styled-components';

const InputContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
`;

const InputCard = styled.div`
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

const InputGroup = styled.div`
  margin: 20px 0;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 1.1em;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1.1em;
  transition: border-color 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const SubmitButton = styled.button<{ disabled: boolean }>`
  background: ${props => props.disabled 
    ? 'linear-gradient(45deg, #6c757d, #495057)' 
    : 'linear-gradient(45deg, #667eea, #764ba2)'
  };
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-top: 20px;
  min-width: 200px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.6;
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

const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  text-align: center;
`;

const UserInfo = styled.div`
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  text-align: left;
`;

const UserInfoTitle = styled.h3`
  color: #1976d2;
  margin-bottom: 10px;
  font-size: 1.1em;
`;

const UserInfoText = styled.p`
  color: #1976d2;
  margin: 5px 0;
  font-size: 0.95em;
`;

interface UserNameInputProps {
  onComplete: (userName: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
  isNewUser: boolean;
  existingUser?: {
    name: string;
    lastLogin: string;
    hasVoted: boolean;
  };
}

const UserNameInput: React.FC<UserNameInputProps> = ({ 
  onComplete, 
  onBack,
  loading, 
  isNewUser, 
  existingUser 
}) => {
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (userName.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    setError(null);
    await onComplete(userName.trim());
  };

  return (
    <InputContainer>
      <InputCard>
        <Title>
          {isNewUser ? 'Welcome!' : 'Welcome Back!'}
        </Title>
        <Subtitle>
          {isNewUser 
            ? 'Please enter your name to complete registration'
            : 'Please confirm your name to continue'
          }
        </Subtitle>

        {existingUser && (
          <UserInfo>
            <UserInfoTitle>Existing User Information:</UserInfoTitle>
            <UserInfoText><strong>Name:</strong> {existingUser.name}</UserInfoText>
            <UserInfoText><strong>Last Login:</strong> {new Date(existingUser.lastLogin).toLocaleString()}</UserInfoText>
            <UserInfoText><strong>Voting Status:</strong> {existingUser.hasVoted ? 'Already Voted' : 'Not Voted Yet'}</UserInfoText>
          </UserInfo>
        )}

        <form onSubmit={handleSubmit}>
          <InputGroup>
            <Label htmlFor="userName">
              {isNewUser ? 'Enter your full name:' : 'Confirm your name:'}
            </Label>
            <Input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={isNewUser ? "e.g., John Doe" : "Enter your name"}
              disabled={loading}
              autoFocus
            />
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <SubmitButton
              type="button"
              onClick={onBack}
              disabled={loading}
              style={{ 
                background: 'linear-gradient(45deg, #6c757d, #495057)',
                minWidth: '150px'
              }}
            >
              Back to Fingerprint
            </SubmitButton>
            <SubmitButton
              type="submit"
              disabled={loading || !userName.trim()}
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  {isNewUser ? 'Registering...' : 'Logging in...'}
                </>
              ) : (
                isNewUser ? 'Complete Registration' : 'Continue'
              )}
            </SubmitButton>
          </div>
        </form>

        <div style={{ marginTop: '30px', fontSize: '0.9em', color: '#666' }}>
          <strong>Security Note:</strong> Your name and fingerprint data are stored securely 
          and will only be used for voting verification.
        </div>
      </InputCard>
    </InputContainer>
  );
};

export default UserNameInput;
