@echo off
echo ========================================
echo    COMPREHENSIVE BACKEND API TESTING
echo    (PowerShell Version - More Reliable)
echo ========================================
echo.

echo Starting comprehensive backend testing...
echo.

powershell -Command "& {
    $API_BASE = 'https://sih-teal-zeta.vercel.app/api/voting'
    $TEST_VOTER_ID = 'test_voter_' + (Get-Random)
    $TEST_PUBLIC_KEY = ''
    $TEST_PRIVATE_KEY = ''
    
    Write-Host '[1/8] Testing Health Check...' -ForegroundColor Yellow
    Write-Host '----------------------------------------' -ForegroundColor Gray
    try {
        $healthResponse = Invoke-RestMethod -Uri ($API_BASE + '/health') -Method GET
        Write-Host 'Health Response:' $healthResponse -ForegroundColor Green
        Write-Host '✅ Health check passed' -ForegroundColor Green
    } catch {
        Write-Host '❌ Health check failed:' $_.Exception.Message -ForegroundColor Red
    }
    Write-Host ''
    
    Write-Host '[2/8] Testing Key Generation...' -ForegroundColor Yellow
    Write-Host '----------------------------------------' -ForegroundColor Gray
    try {
        $keyResponse = Invoke-RestMethod -Uri ($API_BASE + '/generate-keys') -Method POST
        $TEST_PUBLIC_KEY = $keyResponse.keyPair.publicKey
        $TEST_PRIVATE_KEY = $keyResponse.keyPair.privateKey
        Write-Host 'Generated Public Key:' $TEST_PUBLIC_KEY -ForegroundColor Cyan
        Write-Host 'Generated Private Key:' $TEST_PRIVATE_KEY -ForegroundColor Cyan
        Write-Host '✅ Key generation successful' -ForegroundColor Green
    } catch {
        Write-Host '❌ Key generation failed:' $_.Exception.Message -ForegroundColor Red
    }
    Write-Host ''
    
    Write-Host '[3/8] Testing Voter Registration...' -ForegroundColor Yellow
    Write-Host '----------------------------------------' -ForegroundColor Gray
    try {
        $registerBody = @{
            voterId = $TEST_VOTER_ID
            publicKey = $TEST_PUBLIC_KEY
            registrationData = @{
                fingerprint = 'test_fingerprint_' + (Get-Random)
                registrationTime = '2024-01-01T00:00:00Z'
            }
        } | ConvertTo-Json -Depth 3
        
        Write-Host 'Registering voter:' $TEST_VOTER_ID -ForegroundColor Cyan
        $registerResponse = Invoke-RestMethod -Uri ($API_BASE + '/register') -Method POST -Body $registerBody -ContentType 'application/json'
        Write-Host 'Registration Response:' ($registerResponse | ConvertTo-Json -Compress) -ForegroundColor Green
        Write-Host '✅ Voter registration successful' -ForegroundColor Green
    } catch {
        Write-Host '❌ Voter registration failed:' $_.Exception.Message -ForegroundColor Red
    }
    Write-Host ''
    
    Write-Host '[4/8] Testing Voter Retrieval...' -ForegroundColor Yellow
    Write-Host '----------------------------------------' -ForegroundColor Gray
    try {
        $voterResponse = Invoke-RestMethod -Uri ($API_BASE + '/voter/' + $TEST_VOTER_ID) -Method GET
        Write-Host 'Voter Response:' ($voterResponse | ConvertTo-Json -Compress) -ForegroundColor Green
        Write-Host '✅ Voter retrieval successful' -ForegroundColor Green
    } catch {
        Write-Host '❌ Voter retrieval failed:' $_.Exception.Message -ForegroundColor Red
    }
    Write-Host ''
    
    Write-Host '[5/8] Testing All Voters List...' -ForegroundColor Yellow
    Write-Host '----------------------------------------' -ForegroundColor Gray
    try {
        $votersResponse = Invoke-RestMethod -Uri ($API_BASE + '/voters') -Method GET
        Write-Host 'Voters Count:' $votersResponse.voters.Count -ForegroundColor Cyan
        Write-Host 'Voters Response:' ($votersResponse | ConvertTo-Json -Compress) -ForegroundColor Green
        Write-Host '✅ Voters list retrieval successful' -ForegroundColor Green
    } catch {
        Write-Host '❌ Voters list retrieval failed:' $_.Exception.Message -ForegroundColor Red
    }
    Write-Host ''
    
    Write-Host '[6/8] Testing Vote Submission...' -ForegroundColor Yellow
    Write-Host '----------------------------------------' -ForegroundColor Gray
    try {
        $voteBody = @{
            voterId = $TEST_VOTER_ID
            candidateId = 'candidate1'
            proof = 'test_proof_' + (Get-Random)
            timestamp = '2024-01-01T00:00:00Z'
        } | ConvertTo-Json -Depth 2
        
        Write-Host 'Submitting vote for:' $TEST_VOTER_ID -ForegroundColor Cyan
        $voteResponse = Invoke-RestMethod -Uri ($API_BASE + '/submit') -Method POST -Body $voteBody -ContentType 'application/json'
        Write-Host 'Vote Response:' ($voteResponse | ConvertTo-Json -Compress) -ForegroundColor Green
        Write-Host '✅ Vote submission successful' -ForegroundColor Green
    } catch {
        Write-Host '❌ Vote submission failed:' $_.Exception.Message -ForegroundColor Red
    }
    Write-Host ''
    
    Write-Host '[7/8] Testing Vote Retrieval...' -ForegroundColor Yellow
    Write-Host '----------------------------------------' -ForegroundColor Gray
    try {
        $votesResponse = Invoke-RestMethod -Uri ($API_BASE + '/votes') -Method GET
        Write-Host 'Votes Count:' $votesResponse.votes.Count -ForegroundColor Cyan
        Write-Host 'Votes Response:' ($votesResponse | ConvertTo-Json -Compress) -ForegroundColor Green
        Write-Host '✅ Vote retrieval successful' -ForegroundColor Green
    } catch {
        Write-Host '❌ Vote retrieval failed:' $_.Exception.Message -ForegroundColor Red
    }
    Write-Host ''
    
    Write-Host '[8/8] Testing Results...' -ForegroundColor Yellow
    Write-Host '----------------------------------------' -ForegroundColor Gray
    try {
        $resultsResponse = Invoke-RestMethod -Uri ($API_BASE + '/results') -Method GET
        Write-Host 'Results:' ($resultsResponse | ConvertTo-Json -Compress) -ForegroundColor Green
        Write-Host '✅ Results retrieval successful' -ForegroundColor Green
    } catch {
        Write-Host '❌ Results retrieval failed:' $_.Exception.Message -ForegroundColor Red
    }
    Write-Host ''
    
    Write-Host '========================================' -ForegroundColor Yellow
    Write-Host '          TESTING COMPLETE' -ForegroundColor Yellow
    Write-Host '========================================' -ForegroundColor Yellow
    Write-Host ''
    Write-Host 'Test Summary:' -ForegroundColor Cyan
    Write-Host '- Voter ID:' $TEST_VOTER_ID -ForegroundColor White
    Write-Host '- Public Key:' $TEST_PUBLIC_KEY -ForegroundColor White
    Write-Host '- Private Key:' $TEST_PRIVATE_KEY -ForegroundColor White
    Write-Host ''
    Write-Host 'All endpoints have been tested. Check the responses above for any errors.' -ForegroundColor Gray
}"

echo.
echo Testing completed! Press any key to exit...
pause >nul
