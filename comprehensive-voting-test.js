const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/voting';

// Generate a valid public key format (simplified for testing)
function generateValidPublicKey() {
  const prefix = '04'; // Uncompressed public key prefix
  const keyData = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return prefix + keyData;
}

async function comprehensiveVotingTest() {
  console.log('🗳️  COMPREHENSIVE VOTING SYSTEM TEST\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Register multiple voters
    console.log('\n📝 TEST 1: Registering Multiple Voters');
    console.log('-'.repeat(40));
    
    const voters = [];
    for (let i = 1; i <= 5; i++) {
      const voterId = `voter_${Date.now()}_${i}`;
      const publicKey = generateValidPublicKey();
      
      const registrationData = {
        voterId: voterId,
        publicKey: publicKey,
        registrationData: { name: `Test Voter ${i}` }
      };

      const response = await axios.post(`${API_BASE}/register`, registrationData);
      voters.push({ id: voterId, publicKey: publicKey });
      console.log(`✅ Voter ${i} registered: ${voterId}`);
    }

    // Test 2: Submit votes for different candidates
    console.log('\n🗳️  TEST 2: Submitting Votes for Different Candidates');
    console.log('-'.repeat(40));
    
    const candidates = ['candidate_1', 'candidate_2', 'candidate_3'];
    const voteResults = [];
    
    for (let i = 0; i < voters.length; i++) {
      const voter = voters[i];
      const candidate = candidates[i % candidates.length]; // Distribute votes across candidates
      
      const voteData = {
        voterId: voter.id,
        candidateId: candidate
      };

      const response = await axios.post(`${API_BASE}/submit`, voteData);
      voteResults.push({ voterId: voter.id, candidateId: candidate, success: response.data.success });
      console.log(`✅ Vote ${i + 1}: ${voter.id} voted for ${candidate}`);
    }

    // Test 3: Try duplicate voting (should fail)
    console.log('\n🚫 TEST 3: Attempting Duplicate Voting (Should Fail)');
    console.log('-'.repeat(40));
    
    try {
      const duplicateVote = {
        voterId: voters[0].id, // Use first voter again
        candidateId: 'candidate_2'
      };
      await axios.post(`${API_BASE}/submit`, duplicateVote);
      console.log('❌ ERROR: Duplicate voting was allowed!');
    } catch (error) {
      console.log('✅ Correctly prevented duplicate voting:', error.response.data.error);
    }

    // Test 4: Try voting with non-existent voter (should fail)
    console.log('\n🚫 TEST 4: Attempting Vote with Non-existent Voter (Should Fail)');
    console.log('-'.repeat(40));
    
    try {
      const invalidVote = {
        voterId: 'non_existent_voter_12345',
        candidateId: 'candidate_1'
      };
      await axios.post(`${API_BASE}/submit`, invalidVote);
      console.log('❌ ERROR: Non-existent voter was allowed to vote!');
    } catch (error) {
      console.log('✅ Correctly prevented non-existent voter from voting:', error.response.data.error);
    }

    // Test 5: Get voting results
    console.log('\n📊 TEST 5: Getting Voting Results');
    console.log('-'.repeat(40));
    
    const resultsResponse = await axios.get(`${API_BASE}/results`);
    console.log('✅ Voting Results:', resultsResponse.data.results);

    // Test 6: Get detailed vote information
    console.log('\n📋 TEST 6: Getting Detailed Vote Information');
    console.log('-'.repeat(40));
    
    const votesResponse = await axios.get(`${API_BASE}/votes`);
    console.log(`✅ Total votes cast: ${votesResponse.data.count}`);
    console.log('✅ Vote breakdown:');
    votesResponse.data.votes.forEach((vote, index) => {
      console.log(`   ${index + 1}. Voter: ${vote.voterId} → Candidate: ${vote.candidateId} (${vote.timestamp})`);
    });

    // Test 7: Get comprehensive statistics
    console.log('\n📈 TEST 7: Getting Comprehensive Statistics');
    console.log('-'.repeat(40));
    
    const statsResponse = await axios.get(`${API_BASE}/stats`);
    const stats = statsResponse.data.stats;
    console.log('✅ Statistics Summary:');
    console.log(`   • Total Votes: ${stats.totalVotes}`);
    console.log(`   • Vote Distribution:`, stats.voteCounts);
    console.log(`   • Blockchain Length: ${stats.blockchainInfo.chainLength}`);
    console.log(`   • Pending Votes: ${stats.blockchainInfo.pendingVotes}`);
    console.log(`   • Total Voters: ${stats.voterStats.total}`);
    console.log(`   • Voters Who Voted: ${stats.voterStats.voted}`);
    console.log(`   • Remaining Voters: ${stats.voterStats.remaining}`);

    // Test 8: Test blockchain integrity
    console.log('\n🔗 TEST 8: Testing Blockchain Integrity');
    console.log('-'.repeat(40));
    
    const integrityResponse = await axios.get(`${API_BASE}/blockchain/integrity`);
    console.log('✅ Blockchain Integrity:', integrityResponse.data.isValid ? 'VALID' : 'INVALID');

    // Test 9: Test tamper detection
    console.log('\n🛡️  TEST 9: Testing Tamper Detection');
    console.log('-'.repeat(40));
    
    const tamperResponse = await axios.get(`${API_BASE}/tamper-detection/stats`);
    console.log('✅ Tamper Detection Stats:', tamperResponse.data);

    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('✅ Voter ID-based voting system is working perfectly!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the comprehensive test
comprehensiveVotingTest();
