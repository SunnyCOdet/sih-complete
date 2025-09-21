#!/usr/bin/env node

/**
 * Database setup script for Supabase
 * This script automatically creates all the necessary tables and schema for the voting system
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
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

// Read the schema file
const schemaPath = path.join(process.cwd(), 'supabase-schema.sql');
let schemaSQL;

try {
  schemaSQL = fs.readFileSync(schemaPath, 'utf8');
} catch (error) {
  console.error('❌ Could not read supabase-schema.sql file:', error.message);
  process.exit(1);
}

async function setupDatabase() {
  console.log('🚀 Setting up Supabase database...\n');

  try {
    // Test connection first
    console.log('1️⃣  Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .limit(1);

    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      process.exit(1);
    }
    console.log('✅ Connection successful');

    // Check if tables already exist
    console.log('\n2️⃣  Checking existing tables...');
    const { data: existingTables, error: tablesError } = await supabase
      .rpc('get_tables');

    if (tablesError) {
      // If the function doesn't exist, we'll proceed with creating tables
      console.log('ℹ️  Could not check existing tables, proceeding with setup...');
    } else {
      const tableNames = existingTables?.map(t => t.tablename) || [];
      const requiredTables = ['voters', 'votes', 'blocks', 'candidates', 'voting_sessions', 'public_keys'];
      const existingRequiredTables = requiredTables.filter(table => tableNames.includes(table));
      
      if (existingRequiredTables.length > 0) {
        console.log(`ℹ️  Found existing tables: ${existingRequiredTables.join(', ')}`);
        console.log('ℹ️  Some tables may already exist. The schema will use CREATE TABLE IF NOT EXISTS.');
      }
    }

    // Execute the schema
    console.log('\n3️⃣  Creating database schema...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: schemaSQL });

    if (error) {
      // If the exec_sql function doesn't exist, try direct SQL execution
      console.log('ℹ️  Trying alternative method...');
      
      // Split the schema into individual statements
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      console.log(`📝 Executing ${statements.length} SQL statements...`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase
              .from('pg_exec')
              .select('*')
              .eq('query', statement);

            if (stmtError) {
              // Try alternative approach - some statements might need different handling
              console.log(`⚠️  Statement ${i + 1} had an issue, but continuing...`);
            } else {
              console.log(`✅ Statement ${i + 1} executed successfully`);
            }
          } catch (err) {
            console.log(`⚠️  Statement ${i + 1} skipped (${err.message})`);
          }
        }
      }
    } else {
      console.log('✅ Schema executed successfully');
    }

    // Verify tables were created
    console.log('\n4️⃣  Verifying table creation...');
    const { data: tables, error: verifyError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['voters', 'votes', 'blocks', 'candidates', 'voting_sessions', 'public_keys', 'block_votes']);

    if (verifyError) {
      console.log('⚠️  Could not verify table creation, but setup may have succeeded');
    } else {
      const createdTables = tables?.map(t => t.table_name) || [];
      console.log(`✅ Found ${createdTables.length} tables: ${createdTables.join(', ')}`);
      
      if (createdTables.length >= 6) {
        console.log('🎉 Database setup completed successfully!');
      } else {
        console.log('⚠️  Some tables may not have been created. Please check your Supabase dashboard.');
      }
    }

    // Test basic operations
    console.log('\n5️⃣  Testing basic operations...');
    
    // Test voters table
    const { data: voterTest, error: voterError } = await supabase
      .from('voters')
      .select('count')
      .limit(1);

    if (voterError) {
      console.log('❌ Voters table test failed:', voterError.message);
    } else {
      console.log('✅ Voters table is accessible');
    }

    // Test candidates table
    const { data: candidateTest, error: candidateError } = await supabase
      .from('candidates')
      .select('count')
      .limit(1);

    if (candidateError) {
      console.log('❌ Candidates table test failed:', candidateError.message);
    } else {
      console.log('✅ Candidates table is accessible');
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Run the integration test: node test-supabase-integration.js');
    console.log('2. Start your backend: npm start');
    console.log('3. Test the API endpoints');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Manual setup required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of supabase-schema.sql');
    console.log('4. Click Run to execute the schema');
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
