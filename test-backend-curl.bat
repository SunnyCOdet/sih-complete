@echo off
REM apii test


set API_BASE_URL=https://sih-teal-zeta.vercel.app/api/voting

REM Random for testing
set VOTER_ID=testvoter_%RANDOM%_%TIME:~6,5%
set FINGERPRINT_ID=fingerprint_%RANDOM%_%TIME:~6,5%
set CANDIDATE_ID=bjp

echo.
echo Checking base route
curl -s -X GET "%API_BASE_URL%/"

echo.
echo Generating keys
curl -s -X POST "%API_BASE_URL%/generate-keys" -H "Content-Type: application/json"

echo.
echo Registering voter
set REGISTRATION_DATA={"voterId":"%VOTER_ID%","publicKey":"04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6","registrationData":{"fingerprint":"%FINGERPRINT_ID%","registrationTime":"2024-01-01T00:00:00Z"}}
curl -s -X POST "%API_BASE_URL%/register" -H "Content-Type: application/json" -d "%REGISTRATION_DATA%"

echo.
echo Getting all voters
curl -s -X GET "%API_BASE_URL%/voters"

echo.
echo Getting voter by ID
curl -s -X GET "%API_BASE_URL%/voter/%VOTER_ID%"

echo.
echo Submitting vote
set VOTE_DATA={"publicKey":"04c1d38837905ffab36c84fa513f8e6911e47679a3d4763abd24472934af59e5622ed16efb4bb4f6","voteHash":"dGVzdF92b3Rlcl9iandfMTIzNDU2Nzg5MA==","signature":"dGVzdF9zaWduYXR1cmVfMTIzNDU2Nzg5MA==","zeroKnowledgeProof":"dGVzdF96a3BfMTIzNDU2Nzg5MA==","candidateId":"%CANDIDATE_ID%"}
curl -s -X POST "%API_BASE_URL%/submit" -H "Content-Type: application/json" -d "%VOTE_DATA%"

echo.
echo Creating vote
set CREATE_VOTE_DATA={"candidateId":"congress","voterId":"%VOTER_ID%","privateKey":"076e8e95651d7e81d79f635404276c4a8d435c730f66f9d314745b021aae6ee6"}
curl -s -X POST "%API_BASE_URL%/create-vote" -H "Content-Type: application/json" -d "%CREATE_VOTE_DATA%"

echo.
echo Getting all votes
curl -s -X GET "%API_BASE_URL%/votes"

echo.
echo Getting votes by candidate
curl -s -X GET "%API_BASE_URL%/votes/candidate/%CANDIDATE_ID%"

echo.
echo Getting results
curl -s -X GET "%API_BASE_URL%/results"

echo.
echo Getting voting stats
curl -s -X GET "%API_BASE_URL%/stats"

echo.
echo Checking blockchain integrity
curl -s -X GET "%API_BASE_URL%/blockchain/integrity"

echo.
echo Tamper detection activities
curl -s -X GET "%API_BASE_URL%/tamper-detection/activities"

echo.
echo Tamper detection stats
curl -s -X GET "%API_BASE_URL%/tamper-detection/stats"

echo.
echo Done.
pause
