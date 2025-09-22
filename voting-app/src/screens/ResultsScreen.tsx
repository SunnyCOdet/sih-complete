import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Surface, Button, ActivityIndicator } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useVoting } from '../context/VotingContext';
import { useAuth } from '../context/AuthContext';

interface ResultsScreenProps {
  navigation: any;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigation }) => {
  const { candidates, votes, loadResults, isLoading, error } = useVoting();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResults();
    setRefreshing(false);
  };

  const getTotalVotes = () => {
    return candidates.reduce((total, candidate) => total + candidate.votes, 0);
  };

  const getPercentage = (votes: number) => {
    const total = getTotalVotes();
    return total > 0 ? ((votes / total) * 100).toFixed(1) : '0.0';
  };

  const getWinner = () => {
    return candidates.reduce((winner, candidate) => 
      candidate.votes > winner.votes ? candidate : winner
    );
  };

  const totalVotes = getTotalVotes();
  const winner = getWinner();

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Election Results</Text>
          <Text style={styles.subtitle}>
            {totalVotes} total votes cast
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading results...</Text>
          </View>
        ) : (
          <>
            {/* Winner Card */}
            {totalVotes > 0 && (
              <Card style={styles.winnerCard}>
                <Card.Content style={styles.winnerContent}>
                  <View style={styles.winnerHeader}>
                    <Ionicons name="trophy" size={40} color="#FFD700" />
                    <Text style={styles.winnerTitle}>Winner</Text>
                  </View>
                  <Text style={styles.winnerName}>{winner.name}</Text>
                  <Text style={styles.winnerParty}>{winner.party}</Text>
                  <Text style={styles.winnerVotes}>
                    {winner.votes} votes ({getPercentage(winner.votes)}%)
                  </Text>
                </Card.Content>
              </Card>
            )}

            {/* Results List */}
            <View style={styles.resultsContainer}>
              {candidates.map((candidate, index) => (
                <Card key={candidate.id} style={styles.resultCard}>
                  <Card.Content style={styles.resultContent}>
                    <View style={styles.resultHeader}>
                      <View style={styles.rankContainer}>
                        <Text style={styles.rank}>#{index + 1}</Text>
                      </View>
                      <View style={styles.candidateInfo}>
                        <View style={styles.candidateHeader}>
                          <View style={[styles.partyColor, { backgroundColor: candidate.color }]} />
                          <View style={styles.candidateDetails}>
                            <Text style={styles.candidateName}>{candidate.name}</Text>
                            <Text style={styles.partyName}>{candidate.party}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.voteStats}>
                      <View style={styles.voteBarContainer}>
                        <View style={styles.voteBarBackground}>
                          <View
                            style={[
                              styles.voteBar,
                              {
                                width: `${getPercentage(candidate.votes)}%` as any,
                                backgroundColor: candidate.color,
                              },
                            ]}
                          />
                        </View>
                      </View>
                      <View style={styles.voteNumbers}>
                        <Text style={styles.voteCount}>{candidate.votes} votes</Text>
                        <Text style={styles.votePercentage}>
                          {getPercentage(candidate.votes)}%
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))}
            </View>

            {/* Statistics */}
            <Card style={styles.statsCard}>
              <Card.Content>
                <Text style={styles.statsTitle}>Election Statistics</Text>
                <View style={styles.statsGrid}>
                  <Surface style={styles.statItem}>
                    <Ionicons name="people" size={24} color="#667eea" />
                    <Text style={styles.statValue}>{totalVotes}</Text>
                    <Text style={styles.statLabel}>Total Votes</Text>
                  </Surface>
                  <Surface style={styles.statItem}>
                    <Ionicons name="person" size={24} color="#667eea" />
                    <Text style={styles.statValue}>{candidates.length}</Text>
                    <Text style={styles.statLabel}>Candidates</Text>
                  </Surface>
                  <Surface style={styles.statItem}>
                    <Ionicons name="time" size={24} color="#667eea" />
                    <Text style={styles.statValue}>
                      {new Date().toLocaleDateString()}
                    </Text>
                    <Text style={styles.statLabel}>Election Date</Text>
                  </Surface>
                </View>
              </Card.Content>
            </Card>

            {/* User Vote Status */}
            {user && (
              <Surface style={styles.userStatusContainer}>
                <Ionicons 
                  name={user.hasVoted ? "checkmark-circle" : "time"} 
                  size={24} 
                  color={user.hasVoted ? "#27ae60" : "#f39c12"} 
                />
                <Text style={styles.userStatusText}>
                  {user.hasVoted 
                    ? `You voted for ${user.name}` 
                    : 'You have not voted yet'
                  }
                </Text>
              </Surface>
            )}
          </>
        )}

        {error && (
          <Surface style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </Surface>
        )}

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Voting')}
            style={styles.actionButton}
            icon="vote"
          >
            Vote
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Admin')}
            style={styles.actionButton}
            icon="settings"
          >
            Admin
          </Button>
        </View>
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
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  winnerCard: {
    backgroundColor: '#FFD700',
    marginBottom: 20,
    borderRadius: 12,
    elevation: 8,
  },
  winnerContent: {
    alignItems: 'center',
    padding: 20,
  },
  winnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  winnerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  winnerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  winnerParty: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  winnerVotes: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resultsContainer: {
    marginBottom: 20,
  },
  resultCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
  },
  resultContent: {
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankContainer: {
    backgroundColor: '#667eea',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rank: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  candidateInfo: {
    flex: 1,
  },
  candidateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyColor: {
    width: 6,
    height: 30,
    borderRadius: 3,
    marginRight: 12,
  },
  candidateDetails: {
    flex: 1,
  },
  candidateName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  partyName: {
    fontSize: 14,
    color: '#666',
  },
  voteStats: {
    marginTop: 8,
  },
  voteBarContainer: {
    marginBottom: 8,
  },
  voteBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  voteBar: {
    height: '100%',
    borderRadius: 4,
  },
  voteNumbers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  voteCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  votePercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statsCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  userStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  userStatusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 25,
  },
});

export default ResultsScreen;
