import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Animated } from 'react-native';
import { Text, Button, Card, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FingerprintService } from '../services/FingerprintService';

interface FingerprintAuthScreenProps {
  navigation: any;
}

const FingerprintAuthScreen: React.FC<FingerprintAuthScreenProps> = ({ navigation }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    checkAvailability();
    startPulseAnimation();
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await FingerprintService.isAvailable();
      setIsAvailable(available);
      if (!available) {
        setError('Fingerprint authentication is not available on this device');
      }
    } catch (error) {
      console.error('Error checking fingerprint availability:', error);
      setError('Error checking fingerprint availability');
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleFingerprintAuth = async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const success = await FingerprintService.authenticate();
      
      if (success) {
        // Generate fingerprint ID for this session
        const fingerprintId = FingerprintService.generateFingerprintId();
        
        // Check if this fingerprint is already registered
        const isRegistered = await FingerprintService.isFingerprintRegistered(fingerprintId);
        
        if (isRegistered) {
          // Existing user - get their data
          const userData = await FingerprintService.getUserData(fingerprintId);
          if (userData) {
            // Check if they've already voted
            if (userData.hasVoted) {
              Alert.alert(
                'Already Voted',
                'You have already voted in this election.',
                [{ text: 'OK' }]
              );
              return;
            }
            
            // Navigate to voting screen with existing user data
            navigation.navigate('Voting', { userData, isNewUser: false });
          }
        } else {
          // New user - navigate to name input
          navigation.navigate('UserName', { fingerprintId, isNewUser: true });
        }
      } else {
        setError('Fingerprint authentication failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Fingerprint authentication error:', error);
      setError(error.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
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
              <Animated.View
                style={[
                  styles.iconContainer,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Ionicons name="finger-print" size={80} color="#667eea" />
              </Animated.View>
              
              <Text style={styles.title}>Fingerprint Authentication</Text>
              <Text style={styles.subtitle}>
                {isAvailable 
                  ? 'Place your finger on the scanner to authenticate'
                  : 'Fingerprint authentication is not available'
                }
              </Text>
            </View>

            {error && (
              <Surface style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </Surface>
            )}

            <View style={styles.instructions}>
              <Text style={styles.instructionTitle}>Instructions:</Text>
              <Text style={styles.instructionText}>
                • Place your finger on the fingerprint scanner
              </Text>
              <Text style={styles.instructionText}>
                • Hold still until authentication is complete
              </Text>
              <Text style={styles.instructionText}>
                • Each person can only vote once
              </Text>
            </View>

            <Button
              mode="contained"
              onPress={handleFingerprintAuth}
              disabled={!isAvailable || isAuthenticating}
              loading={isAuthenticating}
              style={styles.authButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              {isAuthenticating ? 'Authenticating...' : 'Start Fingerprint Scan'}
            </Button>

            {!isAvailable && (
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('UserName', { 
                  fingerprintId: FingerprintService.generateFingerprintId(), 
                  isNewUser: true 
                })}
                style={styles.fallbackButton}
              >
                Continue Without Fingerprint
              </Button>
            )}
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
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
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
  instructions: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 30,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  authButton: {
    borderRadius: 25,
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fallbackButton: {
    borderRadius: 25,
    borderColor: '#667eea',
  },
});

export default FingerprintAuthScreen;
