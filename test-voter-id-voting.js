const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/voting';

// Generate a valid public key format (simplified for testing)
function generateValidPublicKey() {
  const prefix = '04'; // Uncompressed public key prefix
  const keyData = Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return prefix + keyData;
}

async function testVoterIdVoting() {
  console.log('🧪 Testing Voter ID-based Voting System\n');

  try {
    // 1. Register a voter with valid public key
    console.log('1. Registering a voter...');
    const voterId = `voter_${Date.now()}`;
    const publicKey = generateValidPublicKey();
    
    const registrationData = {
      voterId: voterId,
      publicKey: publicKey,
      registrationData: { name: 'Test Voter' }
    };

    const registerResponse = await axios.post(`${API_BASE}/register`, registrationData);
    console.log('✅ Voter registered:', registerResponse.data);

    // 2. Submit a vote using voter ID (simplified format)
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

    // 4. Register another voter and vote
    console.log('\n4. Registering second voter and voting...');
    const voterId2 = `voter_${Date.now() + 1}`;
    const publicKey2 = generateValidPublicKey();
    
    const registrationData2 = {
      voterId: voterId2,
      publicKey: publicKey2,
      registrationData: { name: 'Test Voter 2' }
    };

    await axios.post(`${API_BASE}/register`, registrationData2);
    console.log('✅ Second voter registered');

    const voteData2 = {
      voterId: voterId2,
      candidateId: 'candidate_2'
    };

    const voteResponse2 = await axios.post(`${API_BASE}/submit`, voteData2);
    console.log('✅ Second vote submitted:', voteResponse2.data);

    // 5. Get voting results
    console.log('\n5. Getting voting results...');
    const resultsResponse = await axios.get(`${API_BASE}/results`);
    console.log('✅ Voting results:', resultsResponse.data);

    // 6. Get all votes
    console.log('\n6. Getting all votes...');
    const votesResponse = await axios.get(`${API_BASE}/votes`);
    console.log('✅ All votes:', votesResponse.data);

    // 7. Get voting statistics
    console.log('\n7. Getting voting statistics...');
    const statsResponse = await axios.get(`${API_BASE}/stats`);
    console.log('✅ Voting statistics:', statsResponse.data);

    console.log('\n🎉 Voter ID-based voting system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testVoterIdVoting();
