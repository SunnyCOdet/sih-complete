#!/usr/bin/env node

/**
 * Migration script to move data from file-based storage to Supabase
 * Run this script after setting up your Supabase project and schema
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Data file path
const dataFile = path.join(process.cwd(), 'data', 'voting-data.json');

async function migrateData() {
  try {
    console.log('🚀 Starting migration to Supabase...');

    // Check if data file exists
    if (!fs.existsSync(dataFile)) {
      console.log('ℹ️  No existing data file found. Skipping migration.');
      return;
    }

    // Load existing data
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    console.log(`📊 Found data: ${Object.keys(data.voters).length} voters, ${Object.keys(data.votes).length} votes, ${data.blocks.length} blocks`);

    // Migrate voters
    console.log('👥 Migrating voters...');
    const voterPromises = Object.values(data.voters).map(async (voter) => {
      const { error } = await supabase
        .from('voters')
        .upsert({
          voter_id: voter.id,
          public_key: voter.publicKey,
          is_registered: voter.isRegistered,
          has_voted: voter.hasVoted,
          registration_date: new Date(voter.registrationDate).toISOString()
        });

      if (error) {
        console.error(`Error migrating voter ${voter.id}:`, error);
        return false;
      }
      return true;
    });

    const voterResults = await Promise.all(voterPromises);
    const successfulVoters = voterResults.filter(Boolean).length;
    console.log(`✅ Migrated ${successfulVoters}/${Object.keys(data.voters).length} voters`);

    // Migrate public keys
    console.log('🔑 Migrating public keys...');
    const publicKeyPromises = data.publicKeys.map(async (publicKey) => {
      const { error } = await supabase
        .from('public_keys')
        .upsert({
          public_key: publicKey
        });

      if (error) {
        console.error(`Error migrating public key ${publicKey.substring(0, 20)}...:`, error);
        return false;
      }
      return true;
    });

    const publicKeyResults = await Promise.all(publicKeyPromises);
    const successfulKeys = publicKeyResults.filter(Boolean).length;
    console.log(`✅ Migrated ${successfulKeys}/${data.publicKeys.length} public keys`);

    // Migrate votes
    console.log('🗳️  Migrating votes...');
    const votePromises = Object.values(data.votes).map(async (vote) => {
      const { error } = await supabase
        .from('votes')
        .upsert({
          id: vote.id,
          voter_id: vote.voterId,
          candidate_id: vote.candidateId,
          vote_hash: vote.voteHash,
          signature: vote.signature,
          zero_knowledge_proof: vote.zeroKnowledgeProof,
          public_key: vote.publicKey,
          timestamp: new Date(vote.timestamp).toISOString(),
          block_index: vote.blockIndex
        });

      if (error) {
        console.error(`Error migrating vote ${vote.id}:`, error);
        return false;
      }
      return true;
    });

    const voteResults = await Promise.all(votePromises);
    const successfulVotes = voteResults.filter(Boolean).length;
    console.log(`✅ Migrated ${successfulVotes}/${Object.keys(data.votes).length} votes`);

    // Migrate blocks
    console.log('⛓️  Migrating blocks...');
    const blockPromises = data.blocks.map(async (block) => {
      const { error } = await supabase
        .from('blocks')
        .upsert({
          block_index: block.index,
          timestamp: new Date(block.timestamp).toISOString(),
          previous_hash: block.previousHash,
          hash: block.hash,
          merkle_root: block.merkleRoot
        });

      if (error) {
        console.error(`Error migrating block ${block.index}:`, error);
        return false;
      }
      return true;
    });

    const blockResults = await Promise.all(blockPromises);
    const successfulBlocks = blockResults.filter(Boolean).length;
    console.log(`✅ Migrated ${successfulBlocks}/${data.blocks.length} blocks`);

    // Migrate block-vote relationships
    console.log('🔗 Migrating block-vote relationships...');
    const blockVotePromises = data.blocks.flatMap(block => 
      block.votes.map(vote => ({
        block_id: block.index,
        vote_id: vote.id
      }))
    );

    if (blockVotePromises.length > 0) {
      const { error } = await supabase
        .from('block_votes')
        .upsert(blockVotePromises);

      if (error) {
        console.error('Error migrating block-vote relationships:', error);
      } else {
        console.log(`✅ Migrated ${blockVotePromises.length} block-vote relationships`);
      }
    }

    console.log('🎉 Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Voters: ${successfulVoters}/${Object.keys(data.voters).length}`);
    console.log(`- Public Keys: ${successfulKeys}/${data.publicKeys.length}`);
    console.log(`- Votes: ${successfulVotes}/${Object.keys(data.votes).length}`);
    console.log(`- Blocks: ${successfulBlocks}/${data.blocks.length}`);

    // Verify migration
    console.log('\n🔍 Verifying migration...');
    const [votersCount, votesCount, blocksCount] = await Promise.all([
      supabase.from('voters').select('*', { count: 'exact', head: true }),
      supabase.from('votes').select('*', { count: 'exact', head: true }),
      supabase.from('blocks').select('*', { count: 'exact', head: true })
    ]);

    console.log(`✅ Verification complete:`);
    console.log(`- Voters in Supabase: ${votersCount.count}`);
    console.log(`- Votes in Supabase: ${votesCount.count}`);
    console.log(`- Blocks in Supabase: ${blocksCount.count}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();
