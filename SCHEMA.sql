-- AI Spend Audit Database Schema
-- Run this in the Supabase SQL Editor

-- 1. Table for storing audit results
CREATE TABLE IF NOT EXISTS audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id TEXT UNIQUE NOT NULL,
    input_data JSONB NOT NULL,
    result_data JSONB NOT NULL,
    ai_summary TEXT,
    ip_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table for lead capture
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    company TEXT,
    role TEXT,
    share_id TEXT REFERENCES audits(share_id),
    monthly_savings NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audits_share_id ON audits(share_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- 4. Row Level Security (RLS) - Basic Public Read for Share IDs
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on share_id" ON audits
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON audits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert leads" ON leads
    FOR INSERT WITH CHECK (true);
