#!/bin/bash

# Backend API Test Script using curl
# Test all endpoints of the Secure Voting System API

API_BASE_URL="https://sih-teal-zeta.vercel.app/api/voting"

echo "🚀 Testing Secure Voting System Backend API"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test data
VOTER_ID="test_voter_$(date +%s)"
FINGERPRINT_ID="fingerprint_$(date +%s)"
CANDIDATE_ID="bjp"

echo -e "\n${BLUE}1. Testing API Info${NC}"
echo "GET $API_BASE_URL/"
curl -s -X GET "$API_BASE_URL/" \
  -H "Content-Type: application/json" | jq '.' || echo "Response received"

echo -e "\n${BLUE}2. Testing Key Generation${NC}"
echo "POST $API_BASE_URL/generate-keys"
KEY_RESPONSE=$(curl -s -X POST "$API_BASE_URL/generate-keys" \
  -H "Content-Type: application/json")

echo "$KEY_RESPONSE" | jq '.' || echo "Response received"

# Extract keys from response
PUBLIC_KEY=$(echo "$KEY_RESPONSE" | jq -r '.keyPair.publicKey' 2>/dev/null)
PRIVATE_KEY=$(echo "$KEY_RESPONSE" | jq -r '.keyPair.privateKey' 2>/dev/null)

if [ "$PUBLIC_KEY" != "null" ] && [ "$PUBLIC_KEY" != "" ]; then
  echo -e "${GREEN}✅ Keys generated successfully${NC}"
  echo "Public Key: ${PUBLIC_KEY:0:20}..."
  echo "Private Key: ${PRIVATE_KEY:0:20}..."
else
  echo -e "${RED}❌ Key generation failed${NC}"
  # Use fallback keys
  PUBLIC_KEY="04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6"
  PRIVATE_KEY="076e8e95651d7e81d79f635404276c4a8d435c730f66f9d314745b021aae6ee6"
  echo "Using fallback keys for testing..."
fi

echo -e "\n${BLUE}3. Testing Voter Registration${NC}"
echo "POST $API_BASE_URL/register"
REGISTRATION_DATA=$(cat <<EOF
{
  "voterId": "$VOTER_ID",
  "publicKey": "$PUBLIC_KEY",
  "registrationData": {
    "fingerprint": "$FINGERPRINT_ID",
    "registrationTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  }
}
EOF
)

REGISTRATION_RESPONSE=$(curl -s -X POST "$API_BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "$REGISTRATION_DATA")

echo "$REGISTRATION_RESPONSE" | jq '.' || echo "Response received"

if echo "$REGISTRATION_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Voter registered successfully${NC}"
else
  echo -e "${RED}❌ Voter registration failed${NC}"
fi

echo -e "\n${BLUE}4. Testing Get All Voters${NC}"
echo "GET $API_BASE_URL/voters"
curl -s -X GET "$API_BASE_URL/voters" \
  -H "Content-Type: application/json" | jq '.' || echo "Response received"

echo -e "\n${BLUE}5. Testing Get Specific Voter${NC}"
echo "GET $API_BASE_URL/voter/$VOTER_ID"
curl -s -X GET "$API_BASE_URL/voter/$VOTER_ID" \
  -H "Content-Type: application/json" | jq '.' || echo "Response received"

echo -e "\n${BLUE}6. Testing Vote Submission${NC}"
echo "POST $API_BASE_URL/submit"

# Create vote data
VOTE_HASH=$(echo -n "$CANDIDATE_ID:$VOTER_ID:$(date +%s)" | base64)
SIGNATURE=$(echo -n "$VOTE_HASH:$PRIVATE_KEY" | base64)
ZK_PROOF=$(echo -n "zkp:$CANDIDATE_ID:$VOTER_ID:$(date +%s)" | base64)

VOTE_DATA=$(cat <<EOF
{
  "publicKey": "$PUBLIC_KEY",
  "voteHash": "$VOTE_HASH",
  "signature": "$SIGNATURE",
  "zeroKnowledgeProof": "$ZK_PROOF",
  "candidateId": "$CANDIDATE_ID"
}
EOF
)

VOTE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/submit" \
  -H "Content-Type: application/json" \
  -d "$VOTE_DATA")

echo "$VOTE_RESPONSE" | jq '.' || echo "Response received"

if echo "$VOTE_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Vote submitted successfully${NC}"
else
  echo -e "${RED}❌ Vote submission failed${NC}"
fi

echo -e "\n${BLUE}7. Testing Create Vote${NC}"
echo "POST $API_BASE_URL/create-vote"

CREATE_VOTE_DATA=$(cat <<EOF
{
  "candidateId": "congress",
  "voterId": "$VOTER_ID",
  "privateKey": "$PRIVATE_KEY"
}
EOF
)

curl -s -X POST "$API_BASE_URL/create-vote" \
  -H "Content-Type: application/json" \
  -d "$CREATE_VOTE_DATA" | jq '.' || echo "Response received"

echo -e "\n${BLUE}8. Testing Get All Votes${NC}"
echo "GET $API_BASE_URL/votes"
curl -s -X GET "$API_BASE_URL/votes" \
  -H "Content-Type: application/json" | jq '.' || echo "Response received"

echo -e "\n${BLUE}9. Testing Get Votes by Candidate${NC}"
echo "GET $API_BASE_URL/votes/candidate/$CANDIDATE_ID"
curl -s -X GET "$API_BASE_URL/votes/candidate/$CANDIDATE_ID" \
  -H "Content-Type: application/json" | jq '.' || echo "Response received"

echo -e "\n${BLUE}10. Testing Get Results${NC}"
echo "GET $API_BASE_URL/results"
curl -s -X GET "$API_BASE_URL/results" \
  -H "Content-Type: application/json" | jq '.' || echo "Response received"

echo -e "\n${BLUE}11. Testing Get Stats${NC}"
echo "GET $API_BASE_URL/stats"
curl -s -X GET "$API_BASE_URL/stats" \
  -H "Content-Type: application/json" | jq '.' || echo "Response received"

echo -e "\n${BLUE}12. Testing Blockchain Integrity${NC}"
echo "GET $API_BASE_URL/blockchain/integrity"
curl -s -X GET "$API_BASE_URL/blockchain/integrity" \
  -H "Content-Type: application/json" | jq '.' || echo "Response received"

echo -e "\n${BLUE}13. Testing Tamper Detection Activities${NC}"
echo "GET $API_BASE_URL/tamper-detection/activities"
curl -s -X GET "$API_BASE_URL/tamper-detection/activities" \
  -H "Content-Type: application/json" | jq '.' || echo "Response received"

echo -e "\n${BLUE}14. Testing Tamper Detection Stats${NC}"
echo "GET $API_BASE_URL/tamper-detection/stats"
curl -s -X GET "$API_BASE_URL/tamper-detection/stats" \
  -H "Content-Type: application/json" | jq '.' || echo "Response received"

echo -e "\n${GREEN}✅ All API tests completed!${NC}"
echo "=============================================="
