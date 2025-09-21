@echo off
echo ========================================
echo    COMPREHENSIVE BACKEND API TESTING
echo ========================================
echo.

set "API_BASE=https://sih-teal-zeta.vercel.app/api/voting"
set "TEST_VOTER_ID=test_voter_%RANDOM%"

echo [1/8] Testing Health Check...
echo ----------------------------------------
powershell -Command "try { $response = Invoke-RestMethod -Uri '%API_BASE%/health' -Method GET; Write-Host 'Health Response:' $response -ForegroundColor Green; Write-Host '✅ Health check passed' -ForegroundColor Green } catch { Write-Host '❌ Health check failed:' $_.Exception.Message -ForegroundColor Red }"
echo.

echo [2/8] Testing Key Generation...
echo ----------------------------------------
powershell -Command "try { $response = Invoke-RestMethod -Uri '%API_BASE%/generate-keys' -Method POST; Write-Host 'Generated Public Key:' $response.keyPair.publicKey -ForegroundColor Cyan; Write-Host 'Generated Private Key:' $response.keyPair.privateKey -ForegroundColor Cyan; Write-Host '✅ Key generation successful' -ForegroundColor Green; $response.keyPair.publicKey | Out-File -FilePath 'temp_public_key.txt' -Encoding ASCII -NoNewline; $response.keyPair.privateKey | Out-File -FilePath 'temp_private_key.txt' -Encoding ASCII -NoNewline } catch { Write-Host '❌ Key generation failed:' $_.Exception.Message -ForegroundColor Red }"
echo.

echo [3/8] Testing Voter Registration...
echo ----------------------------------------
powershell -Command "try { $publicKey = Get-Content 'temp_public_key.txt' -Raw; $publicKey = $publicKey.Trim(); $body = @{ voterId = '%TEST_VOTER_ID%'; publicKey = $publicKey; registrationData = @{ fingerprint = 'test_fingerprint_%RANDOM%'; registrationTime = '2024-01-01T00:00:00Z' } } | ConvertTo-Json -Depth 3; Write-Host 'Registering voter: %TEST_VOTER_ID%' -ForegroundColor Cyan; $response = Invoke-RestMethod -Uri '%API_BASE%/register' -Method POST -Body $body -ContentType 'application/json'; Write-Host 'Registration Response:' ($response | ConvertTo-Json -Compress) -ForegroundColor Green; Write-Host '✅ Voter registration successful' -ForegroundColor Green } catch { Write-Host '❌ Voter registration failed:' $_.Exception.Message -ForegroundColor Red }"
echo.

echo [4/8] Testing Voter Retrieval...
echo ----------------------------------------
powershell -Command "try { $response = Invoke-RestMethod -Uri '%API_BASE%/voter/%TEST_VOTER_ID%' -Method GET; Write-Host 'Voter Response:' ($response | ConvertTo-Json -Compress) -ForegroundColor Green; Write-Host '✅ Voter retrieval successful' -ForegroundColor Green } catch { Write-Host '❌ Voter retrieval failed:' $_.Exception.Message -ForegroundColor Red }"
echo.

echo [5/8] Testing All Voters List...
echo ----------------------------------------
powershell -Command "try { $response = Invoke-RestMethod -Uri '%API_BASE%/voters' -Method GET; Write-Host 'Voters Count:' $response.voters.Count -ForegroundColor Cyan; Write-Host 'Voters Response:' ($response | ConvertTo-Json -Compress) -ForegroundColor Green; Write-Host '✅ Voters list retrieval successful' -ForegroundColor Green } catch { Write-Host '❌ Voters list retrieval failed:' $_.Exception.Message -ForegroundColor Red }"
echo.

echo [6/8] Testing Vote Submission...
echo ----------------------------------------
powershell -Command "try { $publicKey = Get-Content 'temp_public_key.txt' -Raw; $publicKey = $publicKey.Trim(); $privateKey = Get-Content 'temp_private_key.txt' -Raw; $privateKey = $privateKey.Trim(); $voteHash = 'test_vote_hash_%RANDOM%'; $signature = [System.Convert]::ToHexString([System.Text.Encoding]::UTF8.GetBytes($voteHash + $privateKey)); $body = @{ publicKey = $publicKey; voteHash = $voteHash; signature = $signature; zeroKnowledgeProof = 'test_zkp_%RANDOM%'; candidateId = 'candidate1' } | ConvertTo-Json -Depth 2; Write-Host 'Submitting vote for: %TEST_VOTER_ID%' -ForegroundColor Cyan; $response = Invoke-RestMethod -Uri '%API_BASE%/submit' -Method POST -Body $body -ContentType 'application/json'; Write-Host 'Vote Response:' ($response | ConvertTo-Json -Compress) -ForegroundColor Green; Write-Host '✅ Vote submission successful' -ForegroundColor Green } catch { Write-Host '❌ Vote submission failed:' $_.Exception.Message -ForegroundColor Red }"
echo.

echo [7/8] Testing Vote Retrieval...
echo ----------------------------------------
powershell -Command "try { $response = Invoke-RestMethod -Uri '%API_BASE%/votes' -Method GET; Write-Host 'Votes Count:' $response.votes.Count -ForegroundColor Cyan; Write-Host 'Votes Response:' ($response | ConvertTo-Json -Compress) -ForegroundColor Green; Write-Host '✅ Vote retrieval successful' -ForegroundColor Green } catch { Write-Host '❌ Vote retrieval failed:' $_.Exception.Message -ForegroundColor Red }"
echo.

echo [8/8] Testing Results...
echo ----------------------------------------
powershell -Command "try { $response = Invoke-RestMethod -Uri '%API_BASE%/results' -Method GET; Write-Host 'Results:' ($response | ConvertTo-Json -Compress) -ForegroundColor Green; Write-Host '✅ Results retrieval successful' -ForegroundColor Green } catch { Write-Host '❌ Results retrieval failed:' $_.Exception.Message -ForegroundColor Red }"
echo.

echo ========================================
echo           TESTING COMPLETE
echo ========================================
echo.
echo Test Summary:
echo - Voter ID: %TEST_VOTER_ID%
echo - API Base: %API_BASE%
echo.
echo All endpoints have been tested. Check the responses above for any errors.
echo.

rem Clean up temporary files
if exist temp_public_key.txt del temp_public_key.txt
if exist temp_private_key.txt del temp_private_key.txt

echo Testing completed! Press any key to exit...
pause >nul
