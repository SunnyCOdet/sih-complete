#!/usr/bin/env node

/**
 * Simple database setup script for Supabase
 * This script provides the SQL commands and guides you through the setup
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

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...\n');

  try {
    // Test connection
    console.log('1️⃣  Testing Supabase connection...');
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(5);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }

    console.log('✅ Connection successful');
    console.log(`📊 Found ${data.length} tables in public schema`);

    // Check for required tables
    const requiredTables = ['voters', 'votes', 'blocks', 'candidates', 'voting_sessions', 'public_keys'];
    const existingTables = data.map(t => t.tablename);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    if (missingTables.length === 0) {
      console.log('✅ All required tables exist!');
      return true;
    } else {
      console.log(`❌ Missing tables: ${missingTables.join(', ')}`);
      return false;
    }

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    return false;
  }
}

async function createTablesIndividually() {
  console.log('\n🔧 Attempting to create tables individually...\n');

  const statements = [
    // Enable extensions
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";',
    
    // Create voters table
    `CREATE TABLE IF NOT EXISTS voters (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      voter_id VARCHAR(255) UNIQUE NOT NULL,
      public_key TEXT UNIQUE NOT NULL,
      is_registered BOOLEAN DEFAULT true,
      has_voted BOOLEAN DEFAULT false,
      registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Create votes table
    `CREATE TABLE IF NOT EXISTS votes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      voter_id VARCHAR(255) NOT NULL,
      candidate_id VARCHAR(255) NOT NULL,
      vote_hash TEXT NOT NULL,
      signature TEXT NOT NULL,
      zero_knowledge_proof TEXT NOT NULL,
      public_key TEXT,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      block_index INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Create blocks table
    `CREATE TABLE IF NOT EXISTS blocks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      block_index INTEGER UNIQUE NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      previous_hash TEXT,
      hash TEXT UNIQUE NOT NULL,
      merkle_root TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Create candidates table
    `CREATE TABLE IF NOT EXISTS candidates (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      candidate_id VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Create voting_sessions table
    `CREATE TABLE IF NOT EXISTS voting_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      session_name VARCHAR(255) NOT NULL,
      description TEXT,
      start_time TIMESTAMP WITH TIME ZONE,
      end_time TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Create public_keys table
    `CREATE TABLE IF NOT EXISTS public_keys (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      public_key TEXT UNIQUE NOT NULL,
      voter_id VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    // Create block_votes junction table
    `CREATE TABLE IF NOT EXISTS block_votes (
      block_id UUID,
      vote_id UUID,
      PRIMARY KEY (block_id, vote_id)
    );`
  ];

  let successCount = 0;
  let totalCount = statements.length;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    console.log(`📝 Executing statement ${i + 1}/${totalCount}...`);
    
    try {
      // Try using the REST API to execute SQL
      const { data, error } = await supabase
        .from('pg_exec')
        .select('*')
        .eq('query', statement);

      if (error) {
        console.log(`⚠️  Statement ${i + 1} failed: ${error.message}`);
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
        successCount++;
      }
    } catch (err) {
      console.log(`⚠️  Statement ${i + 1} failed: ${err.message}`);
    }
  }

  console.log(`\n📊 Results: ${successCount}/${totalCount} statements executed successfully`);
  return successCount > 0;
}

function displayManualInstructions() {
  console.log('\n📋 Manual Setup Instructions:');
  console.log('================================');
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Navigate to "SQL Editor" in the left sidebar');
  console.log('4. Click "New Query"');
  console.log('5. Copy and paste the following SQL:');
  console.log('\n' + '='.repeat(50));
  
  // Read and display the schema file
  const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
  try {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    console.log(schema);
  } catch (error) {
    console.log('Could not read schema file. Please check supabase-schema.sql exists.');
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('6. Click "Run" to execute the schema');
  console.log('7. Verify tables were created in the "Table Editor"');
  console.log('8. Run the integration test: node test-supabase-integration.js');
}

async function main() {
  console.log('🚀 Supabase Database Setup Script\n');
  
  // Check if database is already set up
  const isSetup = await checkDatabaseStatus();
  
  if (isSetup) {
    console.log('\n🎉 Database is already set up!');
    console.log('You can now run: node test-supabase-integration.js');
    return;
  }

  // Try to create tables automatically
  console.log('\n🔧 Attempting automatic setup...');
  const autoSuccess = await createTablesIndividually();
  
  if (autoSuccess) {
    // Check again
    const isNowSetup = await checkDatabaseStatus();
    if (isNowSetup) {
      console.log('\n🎉 Automatic setup successful!');
      console.log('You can now run: node test-supabase-integration.js');
      return;
    }
  }

  // If automatic setup failed, show manual instructions
  console.log('\n❌ Automatic setup failed or incomplete.');
  displayManualInstructions();
}

// Run the script
main().catch(console.error);
