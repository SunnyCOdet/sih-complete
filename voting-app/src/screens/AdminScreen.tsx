import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, Card, Surface, Button, ActivityIndicator, List, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useVoting } from '../context/VotingContext';
import { useAuth } from '../context/AuthContext';
import { FingerprintService, UserData } from '../services/FingerprintService';

interface AdminScreenProps {
  navigation: any;
}

const AdminScreen: React.FC<AdminScreenProps> = ({ navigation }) => {
  const { candidates, votes, loadResults, isLoading } = useVoting();
  const { user } = useAuth();
  const [fingerprintUsers, setFingerprintUsers] = useState<UserData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVoted: 0,
    newUsers: 0,
    returningUsers: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([
      loadResults(),
      loadFingerprintUsers(),
    ]);
  };

  const loadFingerprintUsers = async () => {
    try {
      const users = await FingerprintService.getAllUsers();
      setFingerprintUsers(users);
      
      // Calculate statistics
      const totalUsers = users.length;
      const totalVoted = users.filter(user => user.hasVoted).length;
      const today = new Date().toDateString();
      const newToday = users.filter(user => 
        new Date(user.registrationDate).toDateString() === today
      ).length;
      
      setStats({
        totalUsers,
        totalVoted,
        newUsers: newToday,
        returningUsers: totalUsers - newToday,
      });
    } catch (error) {
      console.error('Error loading fingerprint users:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const exportData = async () => {
    try {
      const data = {
        candidates,
        votes,
        fingerprintUsers,
        stats,
        exportDate: new Date().toISOString(),
      };
      
      // In a real app, you would save this to a file or send to server
      Alert.alert(
        'Data Export',
        `Exported data for ${stats.totalUsers} users and ${votes.length} votes`,
        [{ text: 'OK' }]
      );
      
      console.log('Exported data:', JSON.stringify(data, null, 2));
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export data');
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all voting data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => {
            // In a real app, you would clear the data
            Alert.alert('Data Cleared', 'All voting data has been cleared');
          }
        },
      ]
    );
  };

  const getTotalVotes = () => {
    return candidates.reduce((total, candidate) => total + candidate.votes, 0);
  };

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>System monitoring and management</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Loading admin data...</Text>
          </View>
        ) : (
          <>
            {/* Statistics Cards */}
            <View style={styles.statsContainer}>
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Ionicons name="people" size={32} color="#667eea" />
                  <Text style={styles.statValue}>{stats.totalUsers}</Text>
                  <Text style={styles.statLabel}>Total Users</Text>
                </Card.Content>
              </Card>
              
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Ionicons name="checkmark-circle" size={32} color="#27ae60" />
                  <Text style={styles.statValue}>{stats.totalVoted}</Text>
                  <Text style={styles.statLabel}>Voted</Text>
                </Card.Content>
              </Card>
              
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Ionicons name="person-add" size={32} color="#f39c12" />
                  <Text style={styles.statValue}>{stats.newUsers}</Text>
                  <Text style={styles.statLabel}>New Today</Text>
                </Card.Content>
              </Card>
              
              <Card style={styles.statCard}>
                <Card.Content style={styles.statContent}>
                  <Ionicons name="trending-up" size={32} color="#9b59b6" />
                  <Text style={styles.statValue}>{getTotalVotes()}</Text>
                  <Text style={styles.statLabel}>Total Votes</Text>
                </Card.Content>
              </Card>
            </View>

            {/* Fingerprint Users */}
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>
                  Fingerprint Users ({fingerprintUsers.length})
                </Text>
                {fingerprintUsers.length === 0 ? (
                  <Text style={styles.emptyText}>No users registered yet</Text>
                ) : (
                  <View style={styles.usersList}>
                    {fingerprintUsers.slice(0, 5).map((user, index) => (
                      <View key={index}>
                        <List.Item
                          title={user.name}
                          description={`Voted: ${user.hasVoted ? 'Yes' : 'No'} • ${new Date(user.lastLogin).toLocaleDateString()}`}
                          left={() => (
                            <Ionicons 
                              name={user.hasVoted ? "checkmark-circle" : "time"} 
                              size={24} 
                              color={user.hasVoted ? "#27ae60" : "#f39c12"} 
                            />
                          )}
                          right={() => (
                            <Text style={styles.userId}>{user.voterId.substring(0, 8)}...</Text>
                          )}
                        />
                        {index < Math.min(fingerprintUsers.length, 5) - 1 && <Divider />}
                      </View>
                    ))}
                    {fingerprintUsers.length > 5 && (
                      <Text style={styles.moreText}>
                        +{fingerprintUsers.length - 5} more users
                      </Text>
                    )}
                  </View>
                )}
              </Card.Content>
            </Card>

            {/* Voting Results */}
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Voting Results</Text>
                {candidates.map((candidate) => (
                  <View key={candidate.id} style={styles.resultItem}>
                    <View style={styles.resultHeader}>
                      <View style={[styles.partyColor, { backgroundColor: candidate.color }]} />
                      <Text style={styles.candidateName}>{candidate.name}</Text>
                      <Text style={styles.voteCount}>{candidate.votes} votes</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${getTotalVotes() > 0 ? (candidate.votes / getTotalVotes()) * 100 : 0}%`,
                            backgroundColor: candidate.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </Card.Content>
            </Card>

            {/* Admin Actions */}
            <Card style={styles.sectionCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Admin Actions</Text>
                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    onPress={exportData}
                    style={styles.actionButton}
                    icon="download"
                  >
                    Export Data
                  </Button>
                  
                  <Button
                    mode="outlined"
                    onPress={clearAllData}
                    style={styles.actionButton}
                    icon="delete"
                    buttonColor="#ffebee"
                    textColor="#c62828"
                  >
                    Clear Data
                  </Button>
                </View>
              </Card.Content>
            </Card>
          </>
        )}

        <View style={styles.navigationButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Voting')}
            style={styles.navButton}
            icon="vote"
          >
            Voting
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Results')}
            style={styles.navButton}
            icon="chart-bar"
          >
            Results
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    elevation: 4,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 24,
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
  sectionCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  usersList: {
    marginTop: 8,
  },
  userId: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  moreText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  resultItem: {
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  partyColor: {
    width: 8,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  candidateName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  voteCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 25,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
    borderRadius: 25,
  },
});

export default AdminScreen;
