const API_BASE_URL = 'https://sih-teal-zeta.vercel.app/api/voting';

// Test data
const testVoterId = `test_voter_${Date.now()}`;
let testPublicKey = '';
let testPrivateKey = '';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test functions
async function testAPIInfo() {
  console.log('\n🔍 Testing API Info...');
  const result = await apiCall('/');
  
  if (result.success) {
    console.log('✅ API Info:', result.data.message);
    console.log('📋 Available endpoints:', Object.keys(result.data.endpoints));
  } else {
    console.log('❌ API Info failed:', result.error || result.data);
  }
}

async function testGenerateKeys() {
  console.log('\n🔑 Testing Key Generation...');
  const result = await apiCall('/generate-keys', 'POST');
  
  if (result.success) {
    testPublicKey = result.data.keyPair.publicKey;
    testPrivateKey = result.data.keyPair.privateKey;
    console.log('✅ Keys generated successfully');
    console.log('🔐 Public Key:', testPublicKey.substring(0, 20) + '...');
    console.log('🔐 Private Key:', testPrivateKey.substring(0, 20) + '...');
  } else {
    console.log('❌ Key generation failed:', result.error || result.data);
  }
}

async function testVoterRegistration() {
  console.log('\n👤 Testing Voter Registration...');
  
  if (!testPublicKey) {
    console.log('❌ No public key available. Run key generation first.');
    return;
  }

  const voterData = {
    voterId: testVoterId,
    publicKey: testPublicKey,
    registrationData: {
      fingerprint: `fingerprint_${Date.now()}`,
      registrationTime: new Date().toISOString()
    }
  };

  const result = await apiCall('/register', 'POST', voterData);
  
  if (result.success) {
    console.log('✅ Voter registered successfully');
    console.log('📝 Voter ID:', result.data.voter.id);
    console.log('🔐 Public Key:', result.data.voter.publicKey.substring(0, 20) + '...');
  } else {
    console.log('❌ Voter registration failed:', result.error || result.data);
  }
}

async function testGetVoters() {
  console.log('\n👥 Testing Get Voters...');
  const result = await apiCall('/voters');
  
  if (result.success) {
    console.log('✅ Voters retrieved successfully');
    console.log('📊 Total voters:', result.data.count);
    console.log('👤 Voters:', result.data.voters.map(v => v.id));
  } else {
    console.log('❌ Get voters failed:', result.error || result.data);
  }
}

async function testGetSpecificVoter() {
  console.log('\n🔍 Testing Get Specific Voter...');
  const result = await apiCall(`/voter/${testVoterId}`);
  
  if (result.success) {
    console.log('✅ Voter retrieved successfully');
    console.log('👤 Voter details:', {
      id: result.data.voter.id,
      isRegistered: result.data.voter.isRegistered,
      hasVoted: result.data.voter.hasVoted
    });
  } else {
    console.log('❌ Get specific voter failed:', result.error || result.data);
  }
}

async function testVoteSubmission() {
  console.log('\n🗳️ Testing Vote Submission...');
  
  if (!testPublicKey || !testPrivateKey) {
    console.log('❌ No keys available. Run key generation first.');
    return;
  }

  // Create vote data
  const candidateId = 'bjp';
  const voteHash = btoa(`${candidateId}:${testVoterId}:${Date.now()}`);
  const signature = btoa(`${voteHash}:${testPrivateKey}`);
  const zeroKnowledgeProof = btoa(`zkp:${candidateId}:${testVoterId}:${Date.now()}`);

  const voteSubmission = {
    publicKey: testPublicKey,
    voteHash,
    signature,
    zeroKnowledgeProof,
    candidateId
  };

  const result = await apiCall('/submit', 'POST', voteSubmission);
  
  if (result.success) {
    console.log('✅ Vote submitted successfully');
    console.log('📊 Block Index:', result.data.blockIndex);
  } else {
    console.log('❌ Vote submission failed:', result.error || result.data);
  }
}

async function testCreateVote() {
  console.log('\n🎯 Testing Create Vote...');
  
  if (!testPrivateKey) {
    console.log('❌ No private key available. Run key generation first.');
    return;
  }

  const voteData = {
    candidateId: 'congress',
    voterId: testVoterId,
    privateKey: testPrivateKey
  };

  const result = await apiCall('/create-vote', 'POST', voteData);
  
  if (result.success) {
    console.log('✅ Vote created successfully');
    console.log('🎯 Vote data:', {
      candidateId: result.data.voteData.candidateId,
      voteHash: result.data.voteData.voteHash.substring(0, 20) + '...'
    });
  } else {
    console.log('❌ Vote creation failed:', result.error || result.data);
  }
}

async function testGetVotes() {
  console.log('\n📊 Testing Get Votes...');
  const result = await apiCall('/votes');
  
  if (result.success) {
    console.log('✅ Votes retrieved successfully');
    console.log('📊 Total votes:', result.data.count);
    console.log('🗳️ Votes:', result.data.votes.map(v => ({
      candidateId: v.candidateId,
      timestamp: v.timestamp
    })));
  } else {
    console.log('❌ Get votes failed:', result.error || result.data);
  }
}

async function testGetVotesByCandidate() {
  console.log('\n🎯 Testing Get Votes by Candidate...');
  const result = await apiCall('/votes/candidate/bjp');
  
  if (result.success) {
    console.log('✅ Votes by candidate retrieved successfully');
    console.log('📊 Candidate ID:', result.data.candidateId);
    console.log('🗳️ Vote count:', result.data.count);
  } else {
    console.log('❌ Get votes by candidate failed:', result.error || result.data);
  }
}

async function testGetResults() {
  console.log('\n📈 Testing Get Results...');
  const result = await apiCall('/results');
  
  if (result.success) {
    console.log('✅ Results retrieved successfully');
    console.log('📊 Results:', result.data.results);
  } else {
    console.log('❌ Get results failed:', result.error || result.data);
  }
}

async function testGetStats() {
  console.log('\n📊 Testing Get Stats...');
  const result = await apiCall('/stats');
  
  if (result.success) {
    console.log('✅ Stats retrieved successfully');
    console.log('📈 Stats:', result.data.stats);
  } else {
    console.log('❌ Get stats failed:', result.error || result.data);
  }
}

async function testBlockchainIntegrity() {
  console.log('\n🔗 Testing Blockchain Integrity...');
  const result = await apiCall('/blockchain/integrity');
  
  if (result.success) {
    console.log('✅ Blockchain integrity check completed');
    console.log('🔗 Integrity:', result.data.integrity);
  } else {
    console.log('❌ Blockchain integrity check failed:', result.error || result.data);
  }
}

async function testTamperDetection() {
  console.log('\n🛡️ Testing Tamper Detection...');
  
  // Test activities
  const activitiesResult = await apiCall('/tamper-detection/activities');
  if (activitiesResult.success) {
    console.log('✅ Tamper detection activities retrieved');
    console.log('🛡️ Activities:', activitiesResult.data.activities);
  } else {
    console.log('❌ Tamper detection activities failed:', activitiesResult.error || activitiesResult.data);
  }

  // Test stats
  const statsResult = await apiCall('/tamper-detection/stats');
  if (statsResult.success) {
    console.log('✅ Tamper detection stats retrieved');
    console.log('📊 Stats:', statsResult.data.stats);
  } else {
    console.log('❌ Tamper detection stats failed:', statsResult.error || statsResult.data);
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Backend API Tests');
  console.log('=' .repeat(50));
  
  try {
    // Basic API tests
    await testAPIInfo();
    
    // Key generation and registration
    await testGenerateKeys();
    await testVoterRegistration();
    
    // Voter management
    await testGetVoters();
    await testGetSpecificVoter();
    
    // Voting functionality
    await testVoteSubmission();
    await testCreateVote();
    
    // Results and analytics
    await testGetVotes();
    await testGetVotesByCandidate();
    await testGetResults();
    await testGetStats();
    
    // Security features
    await testBlockchainIntegrity();
    await testTamperDetection();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!');
    
  } catch (error) {
    console.log('\n❌ Test suite failed:', error.message);
  }
}

// Individual test functions for specific testing
async function runQuickTest() {
  console.log('⚡ Running Quick Test...');
  await testAPIInfo();
  await testGenerateKeys();
  await testVoterRegistration();
  await testGetResults();
}

// Export functions for use in browser console or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    runQuickTest,
    testAPIInfo,
    testGenerateKeys,
    testVoterRegistration,
    testVoteSubmission,
    testGetResults
  };
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
  console.log('🌐 Browser environment detected. Run tests manually:');
  console.log('runAllTests() - Run all tests');
  console.log('runQuickTest() - Run quick test');
  console.log('testAPIInfo() - Test API info only');
}

// Run tests if called directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests();
}
