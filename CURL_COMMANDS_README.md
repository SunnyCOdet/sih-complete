# Voting System API - Curl Commands

This document contains all the curl commands needed to test the voting system API endpoints.

## Base URL
```
https://sih-teal-zeta.vercel.app/api/voting
```

## 1. Health Check

### Check API Status
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/health"
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 2. Key Generation

### Generate Cryptographic Key Pair
```bash
curl -X POST "https://sih-teal-zeta.vercel.app/api/voting/generate-keys" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "keyPair": {
    "publicKey": "04a1b2c3d4e5f6...",
    "privateKey": "a1b2c3d4e5f6..."
  }
}
```

## 3. Voter Registration

### Register a New Voter
```bash
curl -X POST "https://sih-teal-zeta.vercel.app/api/voting/register" \
  -H "Content-Type: application/json" \
  -d '{
    "voterId": "voter_12345",
    "publicKey": "04a1b2c3d4e5f6...",
    "registrationData": {
      "fingerprint": "fingerprint_data_123",
      "registrationTime": "2024-01-01T00:00:00.000Z"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Voter registered successfully",
  "voter": {
    "id": "voter_12345",
    "publicKey": "04a1b2c3d4e5f6...",
    "isRegistered": true,
    "hasVoted": false,
    "registrationDate": "2024-01-01T00:00:00.000Z"
  }
}
```

## 4. Voter Management

### Get Specific Voter
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/voter/voter_12345"
```

### Get All Voters
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/voters"
```

### Get Voter by Public Key
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/voter-by-key/04a1b2c3d4e5f6..."
```

## 5. Vote Submission

### Submit a Vote
```bash
curl -X POST "https://sih-teal-zeta.vercel.app/api/voting/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "04a1b2c3d4e5f6...",
    "voteHash": "sha256_hash_of_vote_data",
    "signature": "elliptic_curve_signature",
    "zeroKnowledgeProof": "zkp_proof_data",
    "candidateId": "candidate1"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Vote submitted successfully",
  "blockIndex": 1
}
```

## 6. Vote Retrieval

### Get All Votes
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/votes"
```

### Get Votes by Candidate
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/votes/candidate/candidate1"
```

### Get Vote by ID
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/vote/vote_id_123"
```

## 7. Results and Statistics

### Get Voting Results
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/results"
```

### Get Voting Statistics
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/stats"
```

### Get Vote Counts
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/counts"
```

## 8. Complete Voting Flow Example

### Step 1: Generate Keys
```bash
curl -X POST "https://sih-teal-zeta.vercel.app/api/voting/generate-keys" \
  -H "Content-Type: application/json"
```

### Step 2: Register Voter
```bash
curl -X POST "https://sih-teal-zeta.vercel.app/api/voting/register" \
  -H "Content-Type: application/json" \
  -d '{
    "voterId": "demo_voter_001",
    "publicKey": "GENERATED_PUBLIC_KEY_FROM_STEP_1",
    "registrationData": {
      "fingerprint": "demo_fingerprint_001",
      "registrationTime": "2024-01-01T00:00:00.000Z"
    }
  }'
```

### Step 3: Submit Vote
```bash
curl -X POST "https://sih-teal-zeta.vercel.app/api/voting/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "GENERATED_PUBLIC_KEY_FROM_STEP_1",
    "voteHash": "GENERATED_VOTE_HASH",
    "signature": "GENERATED_SIGNATURE",
    "zeroKnowledgeProof": "GENERATED_ZKP",
    "candidateId": "candidate1"
  }'
```

### Step 4: Check Results
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/results"
```

## 9. Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid request format"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Voter not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## 10. Testing Scripts

### Windows PowerShell Test
```powershell
# Test all endpoints
$API_BASE = "https://sih-teal-zeta.vercel.app/api/voting"

# Health check
Invoke-RestMethod -Uri "$API_BASE/health" -Method GET

# Generate keys
$keyResponse = Invoke-RestMethod -Uri "$API_BASE/generate-keys" -Method POST

# Register voter
$registerBody = @{
    voterId = "test_voter_$(Get-Random)"
    publicKey = $keyResponse.keyPair.publicKey
    registrationData = @{
        fingerprint = "test_fingerprint_$(Get-Random)"
        registrationTime = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
    }
} | ConvertTo-Json -Depth 3

Invoke-RestMethod -Uri "$API_BASE/register" -Method POST -Body $registerBody -ContentType "application/json"
```

### Linux/Mac Bash Test
```bash
#!/bin/bash
API_BASE="https://sih-teal-zeta.vercel.app/api/voting"

# Health check
curl -X GET "$API_BASE/health"

# Generate keys
curl -X POST "$API_BASE/generate-keys" \
  -H "Content-Type: application/json"

# Register voter
curl -X POST "$API_BASE/register" \
  -H "Content-Type: application/json" \
  -d '{
    "voterId": "test_voter_123",
    "publicKey": "GENERATED_PUBLIC_KEY",
    "registrationData": {
      "fingerprint": "test_fingerprint_123",
      "registrationTime": "2024-01-01T00:00:00.000Z"
    }
  }'
```

## 11. Mobile App Integration

### React Native/Expo Integration
```javascript
const API_BASE_URL = 'https://sih-teal-zeta.vercel.app/api/voting';

// Register voter
const registerVoter = async (voterData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(voterData),
  });
  return response.json();
};

// Submit vote
const submitVote = async (voteData) => {
  const response = await fetch(`${API_BASE_URL}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(voteData),
  });
  return response.json();
};
```

## 12. Security Notes

- All API endpoints use HTTPS
- Public keys must be valid elliptic curve format (130+ characters)
- Signatures must be proper DER-encoded elliptic curve signatures
- Vote hashes should be SHA-256 of vote data
- Zero-knowledge proofs are required for vote privacy

## 13. Rate Limiting

- No rate limiting currently implemented
- Consider implementing for production use
- Monitor API usage for abuse

## 14. Data Persistence

- All data is persisted to `data/voting-data.json`
- Data survives server restarts
- Backup data regularly for production use

---

**Note:** Replace placeholder values (like `GENERATED_PUBLIC_KEY`) with actual values from previous API calls.
