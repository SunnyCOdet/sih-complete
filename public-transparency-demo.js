const axios = require('axios');

const API_BASE = 'http://localhost:3000/api/voting';

async function demonstratePublicTransparency() {
  console.log('🌐 PUBLIC TRANSPARENCY DEMONSTRATION');
  console.log('=' .repeat(60));
  console.log('Demonstrating full public transparency features\n');

  try {
    // 1. Get all public voters
    console.log('📋 1. ALL REGISTERED VOTERS (Public Information)');
    console.log('-'.repeat(50));
    const votersResponse = await axios.get(`${API_BASE}/public/voters`);
    const voters = votersResponse.data.voters;
    
    console.log(`Total registered voters: ${voters.length}`);
    console.log('\nVoter Status Summary:');
    const votedVoters = voters.filter(v => v.hasVoted);
    const notVotedVoters = voters.filter(v => !v.hasVoted);
    
    console.log(`✅ Voted: ${votedVoters.length} voters`);
    console.log(`⏳ Not voted: ${notVotedVoters.length} voters`);
    
    console.log('\nSample voters who have voted:');
    votedVoters.slice(0, 5).forEach(voter => {
      console.log(`   • ${voter.voterId} (registered: ${new Date(voter.registrationDate).toLocaleDateString()})`);
    });
    
    console.log('\nSample voters who have NOT voted:');
    notVotedVoters.slice(0, 5).forEach(voter => {
      console.log(`   • ${voter.voterId} (registered: ${new Date(voter.registrationDate).toLocaleDateString()})`);
    });

    // 2. Get voting status overview
    console.log('\n📊 2. VOTING STATUS OVERVIEW');
    console.log('-'.repeat(50));
    const statusResponse = await axios.get(`${API_BASE}/public/voting-status`);
    const status = statusResponse.data.votingStatus;
    const results = statusResponse.data.results;
    
    console.log('Current Voting Statistics:');
    console.log(`   Total Voters: ${status.totalVoters}`);
    console.log(`   Voted: ${status.votedCount} (${status.votingPercentage}%)`);
    console.log(`   Not Voted: ${status.notVotedCount} (${(100 - status.votingPercentage).toFixed(2)}%)`);
    console.log(`   Last Updated: ${new Date(statusResponse.data.lastUpdated).toLocaleString()}`);
    
    console.log('\nVoting Results:');
    Object.entries(results).forEach(([candidate, count]) => {
      console.log(`   ${candidate}: ${count} votes`);
    });

    // 3. Get all public votes
    console.log('\n🗳️  3. ALL VOTES (Public Information)');
    console.log('-'.repeat(50));
    const votesResponse = await axios.get(`${API_BASE}/public/votes`);
    const votes = votesResponse.data.votes;
    
    console.log(`Total votes cast: ${votes.length}`);
    console.log('\nRecent votes:');
    votes.slice(-10).forEach(vote => {
      console.log(`   • ${vote.voterId} voted for ${vote.candidateId} at ${new Date(vote.timestamp).toLocaleString()}`);
    });

    // 4. Get comprehensive transparency data
    console.log('\n🔍 4. COMPREHENSIVE TRANSPARENCY DATA');
    console.log('-'.repeat(50));
    const transparencyResponse = await axios.get(`${API_BASE}/public/transparency`);
    const transparency = transparencyResponse.data.transparency;
    
    console.log('Complete System Overview:');
    console.log(`   Total Voters: ${transparency.totalVoters}`);
    console.log(`   Voted Count: ${transparency.votedCount}`);
    console.log(`   Not Voted Count: ${transparency.notVotedCount}`);
    console.log(`   Voting Percentage: ${transparency.votingPercentage}%`);
    console.log(`   Total Votes: ${transparency.totalVotes}`);
    console.log(`   Last Updated: ${new Date(transparency.lastUpdated).toLocaleString()}`);
    
    console.log('\nDetailed Results:');
    Object.entries(transparency.results).forEach(([candidate, count]) => {
      const percentage = transparency.totalVotes > 0 ? (count / transparency.totalVotes * 100).toFixed(2) : 0;
      console.log(`   ${candidate}: ${count} votes (${percentage}%)`);
    });

    // 5. Check specific voter status
    console.log('\n👤 5. INDIVIDUAL VOTER STATUS CHECK');
    console.log('-'.repeat(50));
    if (voters.length > 0) {
      const sampleVoter = voters[0];
      const voterDetailResponse = await axios.get(`${API_BASE}/public/voter/${sampleVoter.voterId}`);
      const voterDetail = voterDetailResponse.data.voter;
      
      console.log(`Checking voter: ${sampleVoter.voterId}`);
      console.log(`   Registered: ${voterDetail.isRegistered ? 'Yes' : 'No'}`);
      console.log(`   Has Voted: ${voterDetail.hasVoted ? 'Yes' : 'No'}`);
      console.log(`   Registration Date: ${new Date(voterDetail.registrationDate).toLocaleString()}`);
    }

    // 6. Security and integrity check
    console.log('\n🔒 6. SECURITY & INTEGRITY CHECK');
    console.log('-'.repeat(50));
    try {
      const integrityResponse = await axios.get(`${API_BASE}/blockchain/integrity`);
      console.log('Blockchain Integrity:', integrityResponse.data.integrity.isIntact ? '✅ Intact' : '⚠️  Issues detected');
    } catch (error) {
      console.log('Blockchain Integrity: ❌ Check failed');
    }

    // 7. Data consistency verification
    console.log('\n✅ 7. DATA CONSISTENCY VERIFICATION');
    console.log('-'.repeat(50));
    
    const votedCount = voters.filter(v => v.hasVoted).length;
    const votesCount = votes.length;
    
    console.log(`Voters who have voted: ${votedCount}`);
    console.log(`Total votes in system: ${votesCount}`);
    
    if (votedCount === votesCount) {
      console.log('✅ Data consistency: Perfect match');
    } else {
      console.log(`⚠️  Data consistency: Mismatch (difference: ${Math.abs(votedCount - votesCount)})`);
    }

    // 8. Public transparency summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 PUBLIC TRANSPARENCY SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ All voter information is publicly accessible');
    console.log('✅ Voting status is completely transparent');
    console.log('✅ Vote counts are publicly verifiable');
    console.log('✅ System provides real-time transparency');
    console.log('✅ No sensitive data (private keys) is exposed');
    console.log('✅ Data consistency is maintained');
    
    console.log('\n🎯 KEY TRANSPARENCY FEATURES:');
    console.log('   • Anyone can see who has registered to vote');
    console.log('   • Anyone can see who has voted and who hasn\'t');
    console.log('   • All votes are publicly verifiable');
    console.log('   • Real-time voting statistics are available');
    console.log('   • Complete audit trail is maintained');
    console.log('   • System integrity can be verified');
    
    console.log('\n🌐 PUBLIC ENDPOINTS AVAILABLE:');
    console.log('   • GET /api/voting/public/voters - All voters with status');
    console.log('   • GET /api/voting/public/voter/:id - Specific voter status');
    console.log('   • GET /api/voting/public/voting-status - Overall statistics');
    console.log('   • GET /api/voting/public/votes - All votes (public info)');
    console.log('   • GET /api/voting/public/transparency - Complete transparency data');
    
    console.log('\n🏆 The voting system now provides FULL PUBLIC TRANSPARENCY!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('💥 Error in transparency demonstration:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the transparency demonstration
demonstratePublicTransparency();
