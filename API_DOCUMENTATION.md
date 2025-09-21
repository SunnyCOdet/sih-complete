# Secure Voting System API Documentation

## Overview

The Secure Voting System API provides a comprehensive backend for secure, transparent, and tamper-proof electronic voting. It features blockchain-like immutability, zero-knowledge proofs, and cryptographic security.

## Base URL

```
https://sih-teal-zeta.vercel.app/api/voting
```

## Authentication

Currently, the API uses public key cryptography for voter authentication. Each voter must register with a unique public key pair.

## Data Persistence

The API now uses file-based persistence to prevent data loss on server restarts. Data is stored in `data/voting-data.json`.

## Endpoints

### 1. API Information

**GET** `/`

Get general API information and available endpoints.

**Response:**
```json
{
  "success": true,
  "message": "Secure Voting System API",
  "version": "1.0.0",
  "endpoints": {
    "registration": {
      "POST /register": "Register a new voter",
      "POST /generate-keys": "Generate key pair for voter",
      "GET /voters": "Get all registered voters",
      "GET /voter/:voterId": "Get specific voter info"
    },
    "voting": {
      "POST /submit": "Submit a vote",
      "POST /create-vote": "Create vote with ZK proof",
      "GET /votes": "Get all votes",
      "GET /votes/candidate/:candidateId": "Get votes by candidate",
      "GET /results": "Get voting results",
      "GET /stats": "Get comprehensive statistics"
    },
    "security": {
      "GET /blockchain/integrity": "Verify blockchain integrity",
      "GET /tamper-detection/activities": "Get suspicious activities",
      "GET /tamper-detection/stats": "Get tamper detection stats"
    }
  }
}
```

### 2. Key Generation

**POST** `/generate-keys`

Generate a new cryptographic key pair for voter registration.

**Response:**
```json
{
  "success": true,
  "keyPair": {
    "privateKey": "076e8e95651d7e81d79f635404276c4a8d435c730f66f9d314745b021aae6ee6",
    "publicKey": "04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6"
  }
}
```

### 3. Voter Registration

**POST** `/register`

Register a new voter in the system.

**Request Body:**
```json
{
  "voterId": "voter_12345",
  "publicKey": "04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6",
  "registrationData": {
    "fingerprint": "fingerprint_12345",
    "registrationTime": "2024-01-01T00:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Voter registered successfully",
  "voter": {
    "id": "voter_12345",
    "publicKey": "04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6",
    "isRegistered": true,
    "hasVoted": false,
    "registrationDate": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid voter ID or public key
- `400 Bad Request`: Voter already registered
- `400 Bad Request`: Public key already in use
- `400 Bad Request`: Invalid public key format

### 4. Get All Voters

**GET** `/voters`

Retrieve all registered voters.

**Response:**
```json
{
  "success": true,
  "voters": [
    {
      "id": "voter_12345",
      "publicKey": "04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6",
      "isRegistered": true,
      "hasVoted": false,
      "registrationDate": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 5. Get Specific Voter

**GET** `/voter/:voterId`

Get information about a specific voter.

**Response:**
```json
{
  "success": true,
  "voter": {
    "id": "voter_12345",
    "publicKey": "04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6",
    "isRegistered": true,
    "hasVoted": false,
    "registrationDate": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
- `404 Not Found`: Voter not found

### 6. Submit Vote

**POST** `/submit`

Submit a vote to the system.

**Request Body:**
```json
{
  "publicKey": "04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6",
  "voteHash": "dGVzdF92b3Rlcl9iandfMTIzNDU2Nzg5MA==",
  "signature": "dGVzdF9zaWduYXR1cmVfMTIzNDU2Nzg5MA==",
  "zeroKnowledgeProof": "dGVzdF96a3BfMTIzNDU2Nzg5MA==",
  "candidateId": "bjp"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vote submitted successfully",
  "blockIndex": 1
}
```

**Error Responses:**
- `400 Bad Request`: Voter not found or not registered
- `400 Bad Request`: Voter has already voted
- `400 Bad Request`: Invalid signature
- `400 Bad Request`: All vote submission fields are required

### 7. Create Vote

**POST** `/create-vote`

Create a vote with zero-knowledge proof.

**Request Body:**
```json
{
  "candidateId": "congress",
  "voterId": "voter_12345",
  "privateKey": "076e8e95651d7e81d79f635404276c4a8d435c730f66f9d314745b021aae6ee6"
}
```

**Response:**
```json
{
  "success": true,
  "voteData": {
    "candidateId": "congress",
    "voteHash": "dGVzdF92b3Rlcl9iandfMTIzNDU2Nzg5MA==",
    "zeroKnowledgeProof": "dGVzdF96a3BfMTIzNDU2Nzg5MA==",
    "signature": "dGVzdF9zaWduYXR1cmVfMTIzNDU2Nzg5MA=="
  }
}
```

### 8. Get All Votes

**GET** `/votes`

Retrieve all submitted votes.

**Response:**
```json
{
  "success": true,
  "votes": [
    {
      "id": "vote_12345",
      "voterId": "voter_12345",
      "candidateId": "bjp",
      "voteHash": "dGVzdF92b3Rlcl9iandfMTIzNDU2Nzg5MA==",
      "signature": "dGVzdF9zaWduYXR1cmVfMTIzNDU2Nzg5MA==",
      "zeroKnowledgeProof": "dGVzdF96a3BfMTIzNDU2Nzg5MA==",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "publicKey": "04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6"
    }
  ],
  "count": 1
}
```

### 9. Get Votes by Candidate

**GET** `/votes/candidate/:candidateId`

Get all votes for a specific candidate.

**Response:**
```json
{
  "success": true,
  "candidateId": "bjp",
  "votes": [
    {
      "id": "vote_12345",
      "voterId": "voter_12345",
      "candidateId": "bjp",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### 10. Get Results

**GET** `/results`

Get voting results and statistics.

**Response:**
```json
{
  "success": true,
  "results": {
    "bjp": 5,
    "congress": 3,
    "aap": 2
  }
}
```

### 11. Get Statistics

**GET** `/stats`

Get comprehensive voting statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalVotes": 10,
    "voteCounts": {
      "bjp": 5,
      "congress": 3,
      "aap": 2
    },
    "blockchainInfo": {
      "chainLength": 2,
      "totalVotes": 10,
      "pendingVotes": 0,
      "lastBlockHash": "245a04059f7e934b5aaa422b2ce12315c128dd4e42614a87db99153f6f877bcc"
    },
    "voterStats": {
      "total": 15,
      "voted": 10,
      "remaining": 5
    }
  }
}
```

### 12. Blockchain Integrity

**GET** `/blockchain/integrity`

Verify the integrity of the blockchain.

**Response:**
```json
{
  "success": true,
  "integrity": {
    "isIntact": true,
    "issues": []
  }
}
```

### 13. Tamper Detection Activities

**GET** `/tamper-detection/activities`

Get suspicious activities detected by the system.

**Response:**
```json
{
  "success": true,
  "activities": []
}
```

### 14. Tamper Detection Statistics

**GET** `/tamper-detection/stats`

Get tamper detection statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalActivities": 0,
    "bySeverity": {},
    "recentActivities": 0
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200 OK`: Successful GET requests
- `201 Created`: Successful POST requests (registration, voting)
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Security Features

### 1. Cryptographic Security
- **Elliptic Curve Cryptography**: Uses secp256k1 for key generation and signatures
- **Digital Signatures**: All votes are cryptographically signed
- **Hash Verification**: Vote integrity is verified using SHA-256

### 2. Zero-Knowledge Proofs
- **Vote Privacy**: Voters can prove they voted without revealing their choice
- **Eligibility Verification**: Ensures only registered voters can vote

### 3. Blockchain-like Immutability
- **Tamper Detection**: Any modification to the blockchain is detected
- **Audit Trail**: Complete history of all voting activities
- **Data Integrity**: Cryptographic hashing ensures data cannot be altered

### 4. Anti-Fraud Measures
- **One Vote Per Voter**: Each voter can only vote once
- **Public Key Validation**: Ensures only registered voters can participate
- **Signature Verification**: Prevents vote tampering

## Data Models

### Voter
```typescript
interface Voter {
  id: string;
  publicKey: string;
  isRegistered: boolean;
  hasVoted: boolean;
  registrationDate: Date;
}
```

### Vote
```typescript
interface Vote {
  id: string;
  voterId: string;
  candidateId: string;
  voteHash: string;
  signature: string;
  zeroKnowledgeProof: string;
  timestamp: Date;
  blockIndex?: number;
  publicKey?: string;
}
```

### VoteSubmission
```typescript
interface VoteSubmission {
  publicKey: string;
  voteHash: string;
  signature: string;
  zeroKnowledgeProof: string;
  candidateId: string;
}
```

## Rate Limiting

Currently, there are no rate limits implemented. In production, consider implementing rate limiting to prevent abuse.

## CORS

The API is configured to allow all origins (`*`) for development purposes. In production, restrict CORS to specific domains.

## Testing

Use the provided test scripts to verify API functionality:

### PowerShell (Windows)
```powershell
.\test-backend-curl.bat
```

### Bash (Linux/Mac)
```bash
./test-backend-curl.sh
```

### JavaScript/Node.js
```javascript
node test-backend.js
```

## Deployment

The API is deployed on Vercel and automatically rebuilds when changes are pushed to the repository.

## Support

For issues or questions, please refer to the project documentation or create an issue in the repository.