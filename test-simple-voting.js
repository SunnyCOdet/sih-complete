const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/voting';

async function testSimpleVoting() {
  console.log('🧪 Testing Simple Voter ID-based Voting System\n');

  try {
    // 1. Register a voter
    console.log('1. Registering a voter...');
    const voterId = `voter_${Date.now()}`;
    const registrationData = {
      voterId: voterId,
      publicKey: `public_key_${voterId}`,
      registrationData: { name: 'Test Voter' }
    };

    const registerResponse = await axios.post(`${API_BASE}/register`, registrationData);
    console.log('✅ Voter registered:', registerResponse.data);

    // 2. Submit a vote using voter ID
    console.log('\n2. Submitting a vote...');
    const voteData = {
      voterId: voterId,
      candidateId: 'candidate_1'
    };

    const voteResponse = await axios.post(`${API_BASE}/submit`, voteData);
    console.log('✅ Vote submitted:', voteResponse.data);

    // 3. Try to vote again (should fail)
    console.log('\n3. Attempting to vote again (should fail)...');
    try {
      await axios.post(`${API_BASE}/submit`, voteData);
    } catch (error) {
      console.log('✅ Correctly prevented duplicate voting:', error.response.data);
    }

    // 4. Get voting results
    console.log('\n4. Getting voting results...');
    const resultsResponse = await axios.get(`${API_BASE}/results`);
    console.log('✅ Voting results:', resultsResponse.data);

    // 5. Get all votes
    console.log('\n5. Getting all votes...');
    const votesResponse = await axios.get(`${API_BASE}/votes`);
    console.log('✅ All votes:', votesResponse.data);

    console.log('\n🎉 Simple voting system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testSimpleVoting();
