-- Complete Supabase Database Setup for Secure Voting System
-- Copy and paste this entire script into your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create voters table
CREATE TABLE IF NOT EXISTS voters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voter_id VARCHAR(255) UNIQUE NOT NULL,
    public_key TEXT UNIQUE NOT NULL,
    is_registered BOOLEAN DEFAULT true,
    has_voted BOOLEAN DEFAULT false,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
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
);

-- Create blocks table (for blockchain-like structure)
CREATE TABLE IF NOT EXISTS blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    block_index INTEGER UNIQUE NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    previous_hash TEXT,
    hash TEXT UNIQUE NOT NULL,
    merkle_root TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voting_sessions table
CREATE TABLE IF NOT EXISTS voting_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create public_keys table for tracking used public keys
CREATE TABLE IF NOT EXISTS public_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_key TEXT UNIQUE NOT NULL,
    voter_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create block_votes junction table
CREATE TABLE IF NOT EXISTS block_votes (
    block_id UUID,
    vote_id UUID,
    PRIMARY KEY (block_id, vote_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_voters_voter_id ON voters(voter_id);
CREATE INDEX IF NOT EXISTS idx_voters_public_key ON voters(public_key);
CREATE INDEX IF NOT EXISTS idx_voters_has_voted ON voters(has_voted);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX IF NOT EXISTS idx_votes_timestamp ON votes(timestamp);
CREATE INDEX IF NOT EXISTS idx_blocks_block_index ON blocks(block_index);
CREATE INDEX IF NOT EXISTS idx_blocks_hash ON blocks(hash);
CREATE INDEX IF NOT EXISTS idx_public_keys_public_key ON public_keys(public_key);
CREATE INDEX IF NOT EXISTS idx_candidates_candidate_id ON candidates(candidate_id);
CREATE INDEX IF NOT EXISTS idx_voting_sessions_active ON voting_sessions(is_active);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_voters_updated_at BEFORE UPDATE ON voters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votes_updated_at BEFORE UPDATE ON votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voting_sessions_updated_at BEFORE UPDATE ON voting_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE voters ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE voting_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to voters" ON voters
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to voters" ON voters
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to voters" ON voters
    FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to votes" ON votes
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to votes" ON votes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to blocks" ON blocks
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to blocks" ON blocks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to public_keys" ON public_keys
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to public_keys" ON public_keys
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to candidates" ON candidates
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to candidates" ON candidates
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to candidates" ON candidates
    FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to voting_sessions" ON voting_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to voting_sessions" ON voting_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to voting_sessions" ON voting_sessions
    FOR UPDATE USING (true);

-- Insert default candidates
INSERT INTO candidates (candidate_id, name, description) VALUES
    ('candidate_1', 'Candidate A', 'First candidate for the election'),
    ('candidate_2', 'Candidate B', 'Second candidate for the election'),
    ('candidate_3', 'Candidate C', 'Third candidate for the election')
ON CONFLICT (candidate_id) DO NOTHING;

-- Insert a default voting session
INSERT INTO voting_sessions (session_name, description, start_time, end_time, is_active) VALUES
    ('General Election 2024', 'Main voting session for the general election', NOW(), NOW() + INTERVAL '24 hours', true)
ON CONFLICT DO NOTHING;

-- Verify tables were created
SELECT 'Database setup completed successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
