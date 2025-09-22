import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, Card, Surface, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useVoting } from '../context/VotingContext';
import VotingService from '../services/VotingService';
import { FingerprintService } from '../services/FingerprintService';

interface VotingScreenProps {
  navigation: any;
  route?: {
    params?: {
      userData?: any;
      isNewUser?: boolean;
    };
  };
}

const VotingScreen: React.FC<VotingScreenProps> = ({ navigation, route }) => {
  const { user, updateUser } = useAuth();
  const { candidates, submitVote, isLoading, error, clearError, refreshData } = useVoting();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.hasVoted) {
      Alert.alert(
        'Already Voted',
        'You have already voted in this election.',
        [{ text: 'OK', onPress: () => navigation.navigate('Results') }]
      );
    }
    // Load initial data
    refreshData();
  }, [user, navigation, refreshData]);

  const handleVote = async (candidateId: string) => {
    if (user?.hasVoted) {
      Alert.alert('Already Voted', 'You have already voted in this election.');
      return;
    }

    Alert.alert(
      'Confirm Vote',
      `Are you sure you want to vote for ${candidates.find(c => c.id === candidateId)?.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Vote', onPress: () => submitVoteConfirmation(candidateId) },
      ]
    );
  };

  const submitVoteConfirmation = async (candidateId: string) => {
    setIsSubmitting(true);
    clearError();

    try {
      const success = await submitVote(candidateId);
      
      if (success) {
        // Update user as voted
        if (user) {
          await updateUser({ hasVoted: true });
          await FingerprintService.markUserAsVoted(user.fingerprint);
        }

        Alert.alert(
          'Vote Submitted Successfully!',
          'Thank you for voting. Your vote has been recorded securely.',
          [
            { 
              text: 'View Results', 
              onPress: () => navigation.navigate('Results') 
            }
          ]
        );
      } else {
        Alert.alert('Vote Failed', error || 'Failed to submit vote. Please try again.');
      }
    } catch (error: any) {
      console.error('Vote submission error:', error);
      Alert.alert('Error', error.message || 'Failed to submit vote');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: () => navigation.navigate('FingerprintAuth') },
      ]
    );
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading voting options...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Cast Your Vote</Text>
          <Text style={styles.subtitle}>
            Welcome, {user?.name}! Select your preferred candidate
          </Text>
        </View>

        <View style={styles.candidatesContainer}>
          {candidates.map((candidate) => (
            <Card
              key={candidate.id}
              style={[
                styles.candidateCard,
                selectedCandidate === candidate.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedCandidate(candidate.id)}
            >
              <Card.Content style={styles.candidateContent}>
                <View style={styles.candidateHeader}>
                  <View style={[styles.partyColor, { backgroundColor: candidate.color }]} />
                  <View style={styles.candidateInfo}>
                    <Text style={styles.candidateName}>{candidate.name}</Text>
                    <Text style={styles.partyName}>{candidate.party}</Text>
                  </View>
                  <Ionicons
                    name={selectedCandidate === candidate.id ? 'radio-button-on' : 'radio-button-off'}
                    size={24}
                    color={selectedCandidate === candidate.id ? candidate.color : '#ccc'}
                  />
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {selectedCandidate && (
          <Button
            mode="contained"
            onPress={() => handleVote(selectedCandidate)}
            disabled={isSubmitting || user?.hasVoted}
            loading={isSubmitting}
            style={styles.voteButton}
            contentStyle={styles.buttonContent}
          >
            {isSubmitting ? 'Submitting Vote...' : 'Submit Vote'}
          </Button>
        )}

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Results')}
            style={styles.actionButton}
            icon="chart-bar"
          >
            View Results
          </Button>
          
          <Button
            mode="outlined"
            onPress={refreshData}
            style={styles.actionButton}
            icon="refresh"
            loading={isLoading}
          >
            Refresh
          </Button>
          
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.actionButton}
            icon="logout"
          >
            Logout
          </Button>
        </View>

        {error && (
          <Surface style={styles.errorContainer}>
            <Ionicons name="warning" size={24} color="#e74c3c" />
            <Text style={styles.errorText}>{error}</Text>
            <Button
              mode="text"
              onPress={clearError}
              style={styles.dismissButton}
            >
              Dismiss
            </Button>
          </Surface>
        )}

        {user?.hasVoted && (
          <Surface style={styles.votedContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#27ae60" />
            <Text style={styles.votedText}>You have already voted!</Text>
          </Surface>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
  },
  candidatesContainer: {
    marginBottom: 30,
  },
  candidateCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#667eea',
  },
  candidateContent: {
    padding: 20,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyColor: {
    width: 8,
    height: 40,
    borderRadius: 4,
    marginRight: 16,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  partyName: {
    fontSize: 14,
    color: '#666',
  },
  voteButton: {
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 25,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    color: '#721c24',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  },
  dismissButton: {
    marginLeft: 8,
  },
  votedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  votedText: {
    color: '#155724',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VotingScreen;
