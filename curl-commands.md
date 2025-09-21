# Backend API Test Commands

## Base URL
```
https://sih-teal-zeta.vercel.app/api/voting
```

## 1. API Info
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/" \
  -H "Content-Type: application/json"
```

## 2. Generate Keys
```bash
curl -X POST "https://sih-teal-zeta.vercel.app/api/voting/generate-keys" \
  -H "Content-Type: application/json"
```

## 3. Register Voter
```bash
curl -X POST "https://sih-teal-zeta.vercel.app/api/voting/register" \
  -H "Content-Type: application/json" \
  -d '{
    "voterId": "test_voter_123",
    "publicKey": "04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6",
    "registrationData": {
      "fingerprint": "test_fingerprint_123",
      "registrationTime": "2024-01-01T00:00:00Z"
    }
  }'
```

## 4. Get All Voters
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/voters" \
  -H "Content-Type: application/json"
```

## 5. Get Specific Voter
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/voter/test_voter_123" \
  -H "Content-Type: application/json"
```

## 6. Submit Vote
```bash
curl -X POST "https://sih-teal-zeta.vercel.app/api/voting/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6",
    "voteHash": "dGVzdF92b3Rlcl9iandfMTIzNDU2Nzg5MA==",
    "signature": "dGVzdF9zaWduYXR1cmVfMTIzNDU2Nzg5MA==",
    "zeroKnowledgeProof": "dGVzdF96a3BfMTIzNDU2Nzg5MA==",
    "candidateId": "bjp"
  }'
```

## 7. Create Vote
```bash
curl -X POST "https://sih-teal-zeta.vercel.app/api/voting/create-vote" \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "congress",
    "voterId": "test_voter_123",
    "privateKey": "076e8e95651d7e81d79f635404276c4a8d435c730f66f9d314745b021aae6ee6"
  }'
```

## 8. Get All Votes
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/votes" \
  -H "Content-Type: application/json"
```

## 9. Get Votes by Candidate
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/votes/candidate/bjp" \
  -H "Content-Type: application/json"
```

## 10. Get Results
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/results" \
  -H "Content-Type: application/json"
```

## 11. Get Stats
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/stats" \
  -H "Content-Type: application/json"
```

## 12. Blockchain Integrity
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/blockchain/integrity" \
  -H "Content-Type: application/json"
```

## 13. Tamper Detection Activities
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/tamper-detection/activities" \
  -H "Content-Type: application/json"
```

## 14. Tamper Detection Stats
```bash
curl -X GET "https://sih-teal-zeta.vercel.app/api/voting/tamper-detection/stats" \
  -H "Content-Type: application/json"
```

## Quick Test Sequence

Run these commands in order to test the complete flow:

1. **Generate Keys** (get fresh keys)
2. **Register Voter** (use the public key from step 1)
3. **Submit Vote** (use the keys from step 1)
4. **Get Results** (verify the vote was recorded)

## PowerShell Commands (Windows)

If you're using PowerShell, use these instead:

```powershell
# API Info
Invoke-RestMethod -Uri "https://sih-teal-zeta.vercel.app/api/voting/" -Method GET

# Generate Keys
Invoke-RestMethod -Uri "https://sih-teal-zeta.vercel.app/api/voting/generate-keys" -Method POST

# Register Voter
$body = @{
    voterId = "test_voter_123"
    publicKey = "04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6"
    registrationData = @{
        fingerprint = "test_fingerprint_123"
        registrationTime = "2024-01-01T00:00:00Z"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://sih-teal-zeta.vercel.app/api/voting/register" -Method POST -Body $body -ContentType "application/json"
```

## Expected Responses

- **200 OK**: Successful GET requests
- **201 Created**: Successful POST requests (registration, voting)
- **400 Bad Request**: Invalid data format
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Notes

- Replace `test_voter_123` with unique voter IDs for each test
- Use fresh keys from the generate-keys endpoint for each registration
- The API expects proper hex-formatted public keys (starting with '04')
- All timestamps should be in ISO 8601 format
