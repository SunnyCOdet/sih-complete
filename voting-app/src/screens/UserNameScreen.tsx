import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FingerprintService, UserData } from '../services/FingerprintService';
import VotingService from '../services/VotingService';
import { useAuth } from '../context/AuthContext';

interface UserNameScreenProps {
  navigation: any;
  route: {
    params: {
      fingerprintId: string;
      isNewUser: boolean;
      userData?: UserData;
    };
  };
}

const UserNameScreen: React.FC<UserNameScreenProps> = ({ navigation, route }) => {
  const { fingerprintId, isNewUser, userData: existingUserData } = route.params;
  const { login } = useAuth();
  const [userName, setUserName] = useState(existingUserData?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (userName.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isNewUser) {
        // Register new user
        const voterId = `voter_${fingerprintId.substring(0, 8)}_${Date.now()}`;
        const keyPair = await VotingService.generateKeyPair();
        
        // Register with backend
        const registrationResult = await VotingService.registerVoter({
          id: voterId,
          publicKey: keyPair.publicKey,
          registrationData: {
            fingerprint: fingerprintId,
            registrationTime: new Date().toISOString(),
          },
        });

        if (!registrationResult.success) {
          console.log('Backend registration failed:', registrationResult.error);
          setError(`Backend registration failed: ${registrationResult.error}. Continuing with local registration.`);
        }

        // Create user data
        const userData: UserData = {
          fingerprint: fingerprintId,
          name: userName.trim(),
          voterId,
          publicKey: keyPair.publicKey,
          privateKey: keyPair.privateKey,
          registrationDate: new Date().toISOString(),
          hasVoted: false,
          lastLogin: new Date().toISOString(),
        };

        // Store in local database
        await FingerprintService.registerUser(userData);
        
        // Convert UserData to User format for AuthContext
        const userForAuth = {
          id: userData.voterId,
          name: userData.name,
          fingerprint: userData.fingerprint,
          publicKey: userData.publicKey,
          privateKey: userData.privateKey,
          registrationDate: userData.registrationDate,
          hasVoted: userData.hasVoted,
          lastLogin: userData.lastLogin,
        };
        
        // Login user
        await login(userForAuth);
        
        Alert.alert(
          'Registration Successful',
          `Welcome ${userName}! You can now vote.`,
          [{ text: 'OK', onPress: () => navigation.navigate('Voting') }]
        );
        } else {
          // Existing user - update last login
          if (existingUserData) {
            await FingerprintService.updateUser(fingerprintId, {
              lastLogin: new Date().toISOString(),
            });
            
            // Convert UserData to User format for AuthContext
            const userForAuth = {
              id: existingUserData.voterId,
              name: existingUserData.name,
              fingerprint: existingUserData.fingerprint,
              publicKey: existingUserData.publicKey,
              privateKey: existingUserData.privateKey,
              registrationDate: existingUserData.registrationDate,
              hasVoted: existingUserData.hasVoted,
              lastLogin: new Date().toISOString(),
            };
            
            // Login user
            await login(userForAuth);
          
          Alert.alert(
            'Welcome Back',
            `Welcome back ${userName}!`,
            [{ text: 'OK', onPress: () => navigation.navigate('Voting') }]
          );
        }
      }
    } catch (error: any) {
      console.error('Error processing user:', error);
      setError(error.message || 'Failed to process user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.header}>
              <Ionicons 
                name={isNewUser ? "person-add" : "person"} 
                size={60} 
                color="#667eea" 
              />
              
              <Text style={styles.title}>
                {isNewUser ? 'Welcome!' : 'Welcome Back!'}
              </Text>
              <Text style={styles.subtitle}>
                {isNewUser 
                  ? 'Please enter your name to complete registration'
                  : 'Please confirm your name to continue'
                }
              </Text>
            </View>

            {existingUserData && (
              <Surface style={styles.userInfoContainer}>
                <Text style={styles.userInfoTitle}>User Information:</Text>
                <Text style={styles.userInfoText}>
                  <Text style={styles.bold}>Name:</Text> {existingUserData.name}
                </Text>
                <Text style={styles.userInfoText}>
                  <Text style={styles.bold}>Last Login:</Text> {new Date(existingUserData.lastLogin).toLocaleString()}
                </Text>
                <Text style={styles.userInfoText}>
                  <Text style={styles.bold}>Voting Status:</Text> {existingUserData.hasVoted ? 'Already Voted' : 'Not Voted Yet'}
                </Text>
              </Surface>
            )}

            <View style={styles.inputContainer}>
              <TextInput
                label={isNewUser ? 'Enter your full name' : 'Confirm your name'}
                value={userName}
                onChangeText={setUserName}
                mode="outlined"
                style={styles.textInput}
                disabled={isLoading}
                autoFocus
                placeholder={isNewUser ? 'e.g., John Doe' : 'Enter your name'}
              />
            </View>

            {error && (
              <Surface style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </Surface>
            )}

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleBack}
                disabled={isLoading}
                style={styles.backButton}
              >
                Back
              </Button>
              
              <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={isLoading || !userName.trim()}
                loading={isLoading}
                style={styles.submitButton}
              >
                {isLoading 
                  ? (isNewUser ? 'Registering...' : 'Logging in...')
                  : (isNewUser ? 'Complete Registration' : 'Continue')
                }
              </Button>
            </View>

            <View style={styles.securityNote}>
              <Text style={styles.securityText}>
                <Text style={styles.bold}>Security Note:</Text> Your name and fingerprint data are stored securely 
                and will only be used for voting verification.
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 20,
    elevation: 8,
  },
  cardContent: {
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  userInfoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  userInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  userInfoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#fff',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 25,
  },
  submitButton: {
    flex: 2,
    marginLeft: 8,
    borderRadius: 25,
  },
  securityNote: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default UserNameScreen;
