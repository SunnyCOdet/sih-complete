#!/usr/bin/env node

/**
 * Test script to verify Supabase integration
 * Run this after setting up your Supabase project and environment variables
 */

const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000/api/voting';

async function testSupabaseIntegration() {
  console.log('🧪 Testing Supabase Integration...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣  Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health check passed:', healthResponse.data.status);

    // Test 2: Generate keys
    console.log('\n2️⃣  Testing key generation...');
    const keysResponse = await axios.post(`${API_BASE_URL}/generate-keys`);
    const { privateKey, publicKey } = keysResponse.data.keyPair;
    console.log('✅ Key generation successful');
    console.log(`   Private Key: ${privateKey.substring(0, 20)}...`);
    console.log(`   Public Key: ${publicKey.substring(0, 20)}...`);

    // Test 3: Register voter
    console.log('\n3️⃣  Testing voter registration...');
    const voterId = `test_voter_${Date.now()}`;
    const registrationResponse = await axios.post(`${API_BASE_URL}/register`, {
      voterId,
      publicKey,
      registrationData: { test: true }
    });
    console.log('✅ Voter registration successful:', registrationResponse.data.message);

    // Test 4: Get voter info
    console.log('\n4️⃣  Testing voter retrieval...');
    const voterResponse = await axios.get(`${API_BASE_URL}/voter/${voterId}`);
    console.log('✅ Voter retrieval successful:', voterResponse.data.voter.id);

    // Test 5: Create vote
    console.log('\n5️⃣  Testing vote creation...');
    const voteResponse = await axios.post(`${API_BASE_URL}/create-vote`, {
      candidateId: 'candidate_1',
      voterId,
      privateKey
    });
    console.log('✅ Vote creation successful');

    // Test 6: Submit vote
    console.log('\n6️⃣  Testing vote submission...');
    const voteSubmission = {
      publicKey,
      voteHash: voteResponse.data.voteData.voteHash,
      signature: voteResponse.data.voteData.signature,
      zeroKnowledgeProof: voteResponse.data.voteData.zeroKnowledgeProof,
      candidateId: 'candidate_1'
    };
    const submitResponse = await axios.post(`${API_BASE_URL}/submit`, voteSubmission);
    console.log('✅ Vote submission successful:', submitResponse.data.message);

    // Test 7: Get votes
    console.log('\n7️⃣  Testing vote retrieval...');
    const votesResponse = await axios.get(`${API_BASE_URL}/votes`);
    console.log(`✅ Vote retrieval successful: ${votesResponse.data.count} votes found`);

    // Test 8: Get results
    console.log('\n8️⃣  Testing results retrieval...');
    const resultsResponse = await axios.get(`${API_BASE_URL}/results`);
    console.log('✅ Results retrieval successful:', resultsResponse.data.results);

    // Test 9: Get statistics
    console.log('\n9️⃣  Testing statistics retrieval...');
    const statsResponse = await axios.get(`${API_BASE_URL}/stats`);
    console.log('✅ Statistics retrieval successful');
    console.log(`   Total Votes: ${statsResponse.data.stats.totalVotes}`);
    console.log(`   Total Voters: ${statsResponse.data.stats.voterStats.total}`);

    // Test 10: Get all voters
    console.log('\n🔟 Testing voters retrieval...');
    const votersResponse = await axios.get(`${API_BASE_URL}/voters`);
    console.log(`✅ Voters retrieval successful: ${votersResponse.data.count} voters found`);

    // Test 11: Blockchain integrity
    console.log('\n1️⃣1️⃣  Testing blockchain integrity...');
    const integrityResponse = await axios.get(`${API_BASE_URL}/blockchain/integrity`);
    console.log('✅ Blockchain integrity check passed:', integrityResponse.data.integrity);

    console.log('\n🎉 All tests passed! Supabase integration is working correctly.');
    console.log('\n📊 Test Summary:');
    console.log('- ✅ Backend API is running');
    console.log('- ✅ Supabase connection is working');
    console.log('- ✅ Voter registration is working');
    console.log('- ✅ Vote creation and submission is working');
    console.log('- ✅ Data retrieval is working');
    console.log('- ✅ Blockchain integration is working');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      console.error('No response received. Make sure the backend is running on port 3000.');
    }
    
    process.exit(1);
  }
}

// Run tests
testSupabaseIntegration();
