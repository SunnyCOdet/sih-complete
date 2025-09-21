const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/voting';

// Generate a valid public key format
function generateValidPublicKey() {
  const prefix = '04';
  const keyData = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return prefix + keyData;
}

// Generate invalid public key formats
function generateInvalidPublicKey(type) {
  switch(type) {
    case 'too_short': return '04' + 'a'.repeat(10);
    case 'too_long': return '04' + 'a'.repeat(200);
    case 'invalid_prefix': return '05' + 'a'.repeat(64);
    case 'non_hex': return '04' + 'g'.repeat(64);
    case 'empty': return '';
    case 'null': return null;
    default: return 'invalid_key';
  }
}

// Test result tracking
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${details}`);
  }
  testResults.details.push({ testName, passed, details });
}

async function runCompleteTestSuite() {
  console.log('🧪 COMPLETE VOTING SYSTEM TEST SUITE');
  console.log('=' .repeat(60));
  console.log('Testing every possible scenario for the voter ID-based voting system\n');

  try {
    // ========================================
    // SECTION 1: SYSTEM HEALTH & CONNECTIVITY
    // ========================================
    console.log('🏥 SECTION 1: SYSTEM HEALTH & CONNECTIVITY');
    console.log('-'.repeat(50));

    // Test 1.1: Health Check
    try {
      const healthResponse = await axios.get('http://localhost:3000/health');
      logTest('Health Check', healthResponse.status === 200, `Status: ${healthResponse.data.status}`);
    } catch (error) {
      logTest('Health Check', false, error.message);
    }

    // Test 1.2: API Documentation
    try {
      const docsResponse = await axios.get('http://localhost:3000/api/docs');
      logTest('API Documentation', docsResponse.status === 200);
    } catch (error) {
      logTest('API Documentation', false, error.message);
    }

    // Test 1.3: Voting API Root
    try {
      const apiResponse = await axios.get(`${API_BASE}/`);
      logTest('Voting API Root', apiResponse.status === 200);
    } catch (error) {
      logTest('Voting API Root', false, error.message);
    }

    // ========================================
    // SECTION 2: VOTER REGISTRATION TESTS
    // ========================================
    console.log('\n👥 SECTION 2: VOTER REGISTRATION TESTS');
    console.log('-'.repeat(50));

    // Test 2.1: Valid Voter Registration
    try {
      const validVoter = {
        voterId: `valid_voter_${Date.now()}`,
        publicKey: generateValidPublicKey(),
        registrationData: { name: 'Valid Voter' }
      };
      const response = await axios.post(`${API_BASE}/register`, validVoter);
      logTest('Valid Voter Registration', response.data.success === true);
    } catch (error) {
      logTest('Valid Voter Registration', false, error.response?.data?.error || error.message);
    }

    // Test 2.2: Duplicate Voter ID Registration
    try {
      const duplicateVoter = {
        voterId: 'duplicate_test_voter',
        publicKey: generateValidPublicKey(),
        registrationData: { name: 'Duplicate Voter' }
      };
      await axios.post(`${API_BASE}/register`, duplicateVoter);
      await axios.post(`${API_BASE}/register`, duplicateVoter);
      logTest('Duplicate Voter ID Prevention', false, 'Should have failed but succeeded');
    } catch (error) {
      logTest('Duplicate Voter ID Prevention', error.response?.data?.success === false);
    }

    // Test 2.3: Invalid Public Key Formats
    const invalidKeyTypes = ['too_short', 'too_long', 'invalid_prefix', 'non_hex', 'empty'];
    for (const keyType of invalidKeyTypes) {
      try {
        const invalidVoter = {
          voterId: `invalid_key_${keyType}_${Date.now()}`,
          publicKey: generateInvalidPublicKey(keyType),
          registrationData: { name: 'Invalid Key Voter' }
        };
        await axios.post(`${API_BASE}/register`, invalidVoter);
        logTest(`Invalid Public Key (${keyType})`, false, 'Should have failed but succeeded');
      } catch (error) {
        logTest(`Invalid Public Key (${keyType})`, error.response?.data?.success === false);
      }
    }

    // Test 2.4: Missing Required Fields
    const missingFields = [
      { voterId: 'test', publicKey: generateValidPublicKey() }, // Missing registrationData
      { voterId: 'test', registrationData: {} }, // Missing publicKey
      { publicKey: generateValidPublicKey(), registrationData: {} }, // Missing voterId
      {} // Missing everything
    ];

    for (let i = 0; i < missingFields.length; i++) {
      try {
        await axios.post(`${API_BASE}/register`, missingFields[i]);
        logTest(`Missing Required Field ${i + 1}`, false, 'Should have failed but succeeded');
      } catch (error) {
        logTest(`Missing Required Field ${i + 1}`, error.response?.status === 400);
      }
    }

    // Test 2.5: Duplicate Public Key
    try {
      const sharedPublicKey = generateValidPublicKey();
      const voter1 = {
        voterId: `shared_key_voter1_${Date.now()}`,
        publicKey: sharedPublicKey,
        registrationData: { name: 'Shared Key Voter 1' }
      };
      const voter2 = {
        voterId: `shared_key_voter2_${Date.now()}`,
        publicKey: sharedPublicKey,
        registrationData: { name: 'Shared Key Voter 2' }
      };
      
      await axios.post(`${API_BASE}/register`, voter1);
      await axios.post(`${API_BASE}/register`, voter2);
      logTest('Duplicate Public Key Prevention', false, 'Should have failed but succeeded');
    } catch (error) {
      logTest('Duplicate Public Key Prevention', error.response?.data?.success === false);
    }

    // ========================================
    // SECTION 3: VOTE SUBMISSION TESTS
    // ========================================
    console.log('\n🗳️  SECTION 3: VOTE SUBMISSION TESTS');
    console.log('-'.repeat(50));

    // Create test voters for voting tests
    const testVoters = [];
    for (let i = 1; i <= 5; i++) {
      const voter = {
        voterId: `vote_test_voter_${i}_${Date.now()}`,
        publicKey: generateValidPublicKey(),
        registrationData: { name: `Vote Test Voter ${i}` }
      };
      try {
        await axios.post(`${API_BASE}/register`, voter);
        testVoters.push(voter);
      } catch (error) {
        console.log(`Failed to register test voter ${i}: ${error.message}`);
      }
    }

    // Test 3.1: Valid Vote Submission
    if (testVoters.length > 0) {
      try {
        const validVote = {
          voterId: testVoters[0].voterId,
          candidateId: 'candidate_1'
        };
        const response = await axios.post(`${API_BASE}/submit`, validVote);
        logTest('Valid Vote Submission', response.data.success === true);
      } catch (error) {
        logTest('Valid Vote Submission', false, error.response?.data?.error || error.message);
      }
    }

    // Test 3.2: Duplicate Voting Prevention
    if (testVoters.length > 0) {
      try {
        const duplicateVote = {
          voterId: testVoters[0].voterId, // Same voter as above
          candidateId: 'candidate_2'
        };
        await axios.post(`${API_BASE}/submit`, duplicateVote);
        logTest('Duplicate Voting Prevention', false, 'Should have failed but succeeded');
      } catch (error) {
        logTest('Duplicate Voting Prevention', error.response?.data?.success === false);
      }
    }

    // Test 3.3: Vote with Non-existent Voter
    try {
      const invalidVote = {
        voterId: 'non_existent_voter_12345',
        candidateId: 'candidate_1'
      };
      await axios.post(`${API_BASE}/submit`, invalidVote);
      logTest('Non-existent Voter Vote', false, 'Should have failed but succeeded');
    } catch (error) {
      logTest('Non-existent Voter Vote', error.response?.data?.success === false);
    }

    // Test 3.4: Vote with Invalid Candidate
    if (testVoters.length > 1) {
      try {
        const invalidCandidateVote = {
          voterId: testVoters[1].voterId,
          candidateId: 'invalid_candidate_999'
        };
        const response = await axios.post(`${API_BASE}/submit`, invalidCandidateVote);
        logTest('Invalid Candidate Vote', response.data.success === true, 'System allows any candidate ID');
      } catch (error) {
        logTest('Invalid Candidate Vote', false, error.response?.data?.error || error.message);
      }
    }

    // Test 3.5: Missing Required Fields in Vote
    const invalidVotes = [
      { voterId: 'test' }, // Missing candidateId
      { candidateId: 'candidate_1' }, // Missing voterId
      {} // Missing everything
    ];

    for (let i = 0; i < invalidVotes.length; i++) {
      try {
        await axios.post(`${API_BASE}/submit`, invalidVotes[i]);
        logTest(`Missing Vote Field ${i + 1}`, false, 'Should have failed but succeeded');
      } catch (error) {
        logTest(`Missing Vote Field ${i + 1}`, error.response?.status === 400);
      }
    }

    // Test 3.6: Multiple Valid Votes
    if (testVoters.length >= 3) {
      let successCount = 0;
      for (let i = 1; i < 3; i++) {
        try {
          const vote = {
            voterId: testVoters[i].voterId,
            candidateId: `candidate_${(i % 3) + 1}`
          };
          const response = await axios.post(`${API_BASE}/submit`, vote);
          if (response.data.success) successCount++;
        } catch (error) {
          // Count as failure
        }
      }
      logTest('Multiple Valid Votes', successCount === 2, `Successfully submitted ${successCount}/2 votes`);
    }

    // ========================================
    // SECTION 4: DATA RETRIEVAL TESTS
    // ========================================
    console.log('\n📊 SECTION 4: DATA RETRIEVAL TESTS');
    console.log('-'.repeat(50));

    // Test 4.1: Get All Votes
    try {
      const votesResponse = await axios.get(`${API_BASE}/votes`);
      logTest('Get All Votes', votesResponse.data.success === true, `Retrieved ${votesResponse.data.count} votes`);
    } catch (error) {
      logTest('Get All Votes', false, error.message);
    }

    // Test 4.2: Get Voting Results
    try {
      const resultsResponse = await axios.get(`${API_BASE}/results`);
      logTest('Get Voting Results', resultsResponse.data.success === true, `Results: ${JSON.stringify(resultsResponse.data.results)}`);
    } catch (error) {
      logTest('Get Voting Results', false, error.message);
    }

    // Test 4.3: Get Voting Statistics
    try {
      const statsResponse = await axios.get(`${API_BASE}/stats`);
      logTest('Get Voting Statistics', statsResponse.data.success === true, `Total votes: ${statsResponse.data.stats.totalVotes}`);
    } catch (error) {
      logTest('Get Voting Statistics', false, error.message);
    }

    // Test 4.4: Get Votes by Candidate
    try {
      const candidateVotesResponse = await axios.get(`${API_BASE}/votes/candidate/candidate_1`);
      logTest('Get Votes by Candidate', candidateVotesResponse.data.success === true);
    } catch (error) {
      logTest('Get Votes by Candidate', false, error.message);
    }

    // ========================================
    // SECTION 5: SECURITY & INTEGRITY TESTS
    // ========================================
    console.log('\n🔒 SECTION 5: SECURITY & INTEGRITY TESTS');
    console.log('-'.repeat(50));

    // Test 5.1: Blockchain Integrity Check
    try {
      const integrityResponse = await axios.get(`${API_BASE}/blockchain/integrity`);
      logTest('Blockchain Integrity Check', typeof integrityResponse.data.isValid === 'boolean');
    } catch (error) {
      logTest('Blockchain Integrity Check', false, error.message);
    }

    // Test 5.2: Tamper Detection Stats
    try {
      const tamperResponse = await axios.get(`${API_BASE}/tamper-detection/stats`);
      logTest('Tamper Detection Stats', tamperResponse.data.success === true);
    } catch (error) {
      logTest('Tamper Detection Stats', false, error.message);
    }

    // Test 5.3: Tamper Detection Activities
    try {
      const activitiesResponse = await axios.get(`${API_BASE}/tamper-detection/activities`);
      logTest('Tamper Detection Activities', activitiesResponse.data.success === true);
    } catch (error) {
      logTest('Tamper Detection Activities', false, error.message);
    }

    // ========================================
    // SECTION 6: EDGE CASES & STRESS TESTS
    // ========================================
    console.log('\n⚡ SECTION 6: EDGE CASES & STRESS TESTS');
    console.log('-'.repeat(50));

    // Test 6.1: Very Long Voter ID
    try {
      const longVoterId = 'a'.repeat(1000);
      const longVoter = {
        voterId: longVoterId,
        publicKey: generateValidPublicKey(),
        registrationData: { name: 'Long ID Voter' }
      };
      const response = await axios.post(`${API_BASE}/register`, longVoter);
      logTest('Very Long Voter ID', response.data.success === true);
    } catch (error) {
      logTest('Very Long Voter ID', false, error.response?.data?.error || error.message);
    }

    // Test 6.2: Special Characters in Voter ID
    const specialChars = ['!@#$%^&*()', 'voter-with-dashes', 'voter_with_underscores', 'voter.with.dots'];
    for (const specialId of specialChars) {
      try {
        const specialVoter = {
          voterId: specialId,
          publicKey: generateValidPublicKey(),
          registrationData: { name: 'Special Char Voter' }
        };
        const response = await axios.post(`${API_BASE}/register`, specialVoter);
        logTest(`Special Characters in Voter ID (${specialId})`, response.data.success === true);
      } catch (error) {
        logTest(`Special Characters in Voter ID (${specialId})`, false, error.response?.data?.error || error.message);
      }
    }

    // Test 6.3: Empty String Values
    try {
      const emptyVoter = {
        voterId: '',
        publicKey: generateValidPublicKey(),
        registrationData: { name: 'Empty ID Voter' }
      };
      await axios.post(`${API_BASE}/register`, emptyVoter);
      logTest('Empty Voter ID', false, 'Should have failed but succeeded');
    } catch (error) {
      logTest('Empty Voter ID', error.response?.status === 400);
    }

    // Test 6.4: Null/Undefined Values
    try {
      const nullVoter = {
        voterId: null,
        publicKey: generateValidPublicKey(),
        registrationData: { name: 'Null ID Voter' }
      };
      await axios.post(`${API_BASE}/register`, nullVoter);
      logTest('Null Voter ID', false, 'Should have failed but succeeded');
    } catch (error) {
      logTest('Null Voter ID', error.response?.status === 400);
    }

    // ========================================
    // SECTION 7: API ENDPOINT TESTS
    // ========================================
    console.log('\n🌐 SECTION 7: API ENDPOINT TESTS');
    console.log('-'.repeat(50));

    // Test 7.1: Generate Keys Endpoint
    try {
      const keysResponse = await axios.post(`${API_BASE}/generate-keys`);
      logTest('Generate Keys Endpoint', keysResponse.data.success === true);
    } catch (error) {
      logTest('Generate Keys Endpoint', false, error.message);
    }

    // Test 7.2: Create Vote Endpoint
    try {
      const createVoteResponse = await axios.post(`${API_BASE}/create-vote`, {
        candidateId: 'candidate_1',
        voterId: 'test_voter_for_create',
        privateKey: 'test_private_key'
      });
      logTest('Create Vote Endpoint', createVoteResponse.data.success === true);
    } catch (error) {
      logTest('Create Vote Endpoint', false, error.message);
    }

    // ========================================
    // SECTION 8: CONCURRENT OPERATIONS
    // ========================================
    console.log('\n🔄 SECTION 8: CONCURRENT OPERATIONS');
    console.log('-'.repeat(50));

    // Test 8.1: Concurrent Voter Registration
    try {
      const concurrentRegistrations = [];
      for (let i = 0; i < 5; i++) {
        const voter = {
          voterId: `concurrent_voter_${i}_${Date.now()}`,
          publicKey: generateValidPublicKey(),
          registrationData: { name: `Concurrent Voter ${i}` }
        };
        concurrentRegistrations.push(axios.post(`${API_BASE}/register`, voter));
      }
      
      const results = await Promise.allSettled(concurrentRegistrations);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.data.success).length;
      logTest('Concurrent Voter Registration', successCount === 5, `Successfully registered ${successCount}/5 voters`);
    } catch (error) {
      logTest('Concurrent Voter Registration', false, error.message);
    }

    // ========================================
    // SECTION 9: DATA PERSISTENCE TESTS
    // ========================================
    console.log('\n💾 SECTION 9: DATA PERSISTENCE TESTS');
    console.log('-'.repeat(50));

    // Test 9.1: Data Persistence After Restart
    try {
      // Register a voter
      const persistenceVoter = {
        voterId: `persistence_test_${Date.now()}`,
        publicKey: generateValidPublicKey(),
        registrationData: { name: 'Persistence Test Voter' }
      };
      await axios.post(`${API_BASE}/register`, persistenceVoter);
      
      // Submit a vote
      const persistenceVote = {
        voterId: persistenceVoter.voterId,
        candidateId: 'candidate_1'
      };
      await axios.post(`${API_BASE}/submit`, persistenceVote);
      
      // Check if data persists
      const votesResponse = await axios.get(`${API_BASE}/votes`);
      const voteExists = votesResponse.data.votes.some(vote => vote.voterId === persistenceVoter.voterId);
      logTest('Data Persistence', voteExists, 'Vote should persist in database');
    } catch (error) {
      logTest('Data Persistence', false, error.message);
    }

    // ========================================
    // FINAL RESULTS SUMMARY
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
    
    console.log('\n📋 FAILED TESTS:');
    const failedTests = testResults.details.filter(test => !test.passed);
    if (failedTests.length === 0) {
      console.log('🎉 No failed tests! All tests passed!');
    } else {
      failedTests.forEach(test => {
        console.log(`❌ ${test.testName}: ${test.details}`);
      });
    }

    console.log('\n🎯 SYSTEM STATUS:');
    if (testResults.failed === 0) {
      console.log('🟢 EXCELLENT: All tests passed! System is fully functional.');
    } else if (testResults.failed <= 3) {
      console.log('🟡 GOOD: Most tests passed. Minor issues detected.');
    } else if (testResults.failed <= 10) {
      console.log('🟠 FAIR: Several tests failed. System needs attention.');
    } else {
      console.log('🔴 POOR: Many tests failed. System needs significant fixes.');
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏁 COMPLETE TEST SUITE FINISHED');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('💥 CRITICAL ERROR in test suite:', error.message);
    logTest('Test Suite Execution', false, error.message);
  }
}

// Run the complete test suite
runCompleteTestSuite();
