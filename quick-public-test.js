const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/voting';

async function quickTest() {
  console.log('🧪 Quick Public Endpoints Test');
  console.log('=' .repeat(40));

  try {
    // Test 1: Health check
    console.log('1. Testing health...');
    const health = await axios.get('http://localhost:3000/health');
    console.log('✅ Health:', health.data.status);

    // Test 2: Public voters
    console.log('\n2. Testing public voters...');
    const voters = await axios.get(`${API_BASE}/public/voters`);
    console.log('✅ Public voters:', voters.data.count, 'voters found');

    // Test 3: Voting status
    console.log('\n3. Testing voting status...');
    const status = await axios.get(`${API_BASE}/public/voting-status`);
    console.log('✅ Voting status:', status.data.votingStatus);

    // Test 4: Public votes
    console.log('\n4. Testing public votes...');
    const votes = await axios.get(`${API_BASE}/public/votes`);
    console.log('✅ Public votes:', votes.data.count, 'votes found');

    // Test 5: Transparency
    console.log('\n5. Testing transparency...');
    const transparency = await axios.get(`${API_BASE}/public/transparency`);
    console.log('✅ Transparency data available');
    console.log('   Total voters:', transparency.data.transparency.totalVoters);
    console.log('   Voted count:', transparency.data.transparency.votedCount);
    console.log('   Voting percentage:', transparency.data.transparency.votingPercentage + '%');

    console.log('\n🎉 All public endpoints are working!');
    console.log('✅ Voter data is publicly available');
    console.log('✅ Voting status is transparent');
    console.log('✅ System supports full public transparency');

  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }
}

quickTest();
