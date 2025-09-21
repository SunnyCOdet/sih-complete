@echo off
setlocal enabledelayedexpansion
echo ========================================
echo    COMPREHENSIVE BACKEND API TESTING
echo ========================================
echo.

set "API_BASE=https://sih-teal-zeta.vercel.app/api/voting"
set "TEST_VOTER_ID=test_voter_%RANDOM%"
set "TEST_PUBLIC_KEY="
set "TEST_PRIVATE_KEY="

echo [1/8] Testing Health Check...
echo ----------------------------------------
curl -s -X GET "%API_BASE%/health" 2>nul
if %errorlevel% neq 0 (
    echo ❌ Health check failed
) else (
    echo ✅ Health check passed
)
echo.

echo [2/8] Testing Key Generation...
echo ----------------------------------------
for /f "tokens=*" %%i in ('curl -s -X POST "%API_BASE%/generate-keys" 2^>nul') do set "KEY_RESPONSE=%%i"
echo Key generation response: !KEY_RESPONSE!

rem Extract keys from JSON response (simplified extraction)
for /f "tokens=2 delims=:" %%a in ("!KEY_RESPONSE!") do (
    for /f "tokens=1 delims=," %%b in ("%%a") do (
        set "TEST_PUBLIC_KEY=%%b"
    )
)
for /f "tokens=4 delims=:" %%a in ("!KEY_RESPONSE!") do (
    for /f "tokens=1 delims=}" %%b in ("%%a") do (
        set "TEST_PRIVATE_KEY=%%b"
    )
)

rem Clean up the keys (remove quotes and extra characters)
set "TEST_PUBLIC_KEY=!TEST_PUBLIC_KEY:"=!"
set "TEST_PUBLIC_KEY=!TEST_PUBLIC_KEY: =!"
set "TEST_PRIVATE_KEY=!TEST_PRIVATE_KEY:"=!"
set "TEST_PRIVATE_KEY=!TEST_PRIVATE_KEY: =!"

echo Generated Public Key: !TEST_PUBLIC_KEY!
echo Generated Private Key: !TEST_PRIVATE_KEY!
echo.

echo [3/8] Testing Voter Registration...
echo ----------------------------------------
set "REGISTER_BODY={\"voterId\":\"!TEST_VOTER_ID!\",\"publicKey\":\"!TEST_PUBLIC_KEY!\",\"registrationData\":{\"fingerprint\":\"test_fingerprint_%RANDOM%\",\"registrationTime\":\"2024-01-01T00:00:00Z\"}}"
echo Registering voter: !TEST_VOTER_ID!
echo Registration body: !REGISTER_BODY!

for /f "tokens=*" %%i in ('curl -s -X POST "%API_BASE%/register" -H "Content-Type: application/json" -d "!REGISTER_BODY!" 2^>nul') do set "REGISTER_RESPONSE=%%i"
echo Registration response: !REGISTER_RESPONSE!

rem Check if registration was successful
echo !REGISTER_RESPONSE! | findstr "success.*true" >nul
if %errorlevel% equ 0 (
    echo ✅ Voter registration successful
) else (
    echo ❌ Voter registration failed
)
echo.

echo [4/8] Testing Voter Retrieval...
echo ----------------------------------------
echo Getting voter: !TEST_VOTER_ID!
for /f "tokens=*" %%i in ('curl -s -X GET "%API_BASE%/voter/!TEST_VOTER_ID!" 2^>nul') do set "VOTER_RESPONSE=%%i"
echo Voter retrieval response: !VOTER_RESPONSE!

rem Check if voter was found
echo !VOTER_RESPONSE! | findstr "success.*true" >nul
if %errorlevel% equ 0 (
    echo ✅ Voter retrieval successful
) else (
    echo ❌ Voter retrieval failed
)
echo.

echo [5/8] Testing All Voters List...
echo ----------------------------------------
for /f "tokens=*" %%i in ('curl -s -X GET "%API_BASE%/voters" 2^>nul') do set "VOTERS_RESPONSE=%%i"
echo All voters response: !VOTERS_RESPONSE!

rem Check if voters list was retrieved
echo !VOTERS_RESPONSE! | findstr "success.*true" >nul
if %errorlevel% equ 0 (
    echo ✅ Voters list retrieval successful
) else (
    echo ❌ Voters list retrieval failed
)
echo.

echo [6/8] Testing Vote Submission...
echo ----------------------------------------
set "VOTE_BODY={\"voterId\":\"!TEST_VOTER_ID!\",\"candidateId\":\"candidate1\",\"proof\":\"test_proof_%RANDOM%\",\"timestamp\":\"2024-01-01T00:00:00Z\"}"
echo Submitting vote for: !TEST_VOTER_ID!
echo Vote body: !VOTE_BODY!

for /f "tokens=*" %%i in ('curl -s -X POST "%API_BASE%/submit" -H "Content-Type: application/json" -d "!VOTE_BODY!" 2^>nul') do set "VOTE_RESPONSE=%%i"
echo Vote submission response: !VOTE_RESPONSE!

rem Check if vote was submitted successfully
echo !VOTE_RESPONSE! | findstr "success.*true" >nul
if %errorlevel% equ 0 (
    echo ✅ Vote submission successful
) else (
    echo ❌ Vote submission failed
)
echo.

echo [7/8] Testing Vote Retrieval...
echo ----------------------------------------
for /f "tokens=*" %%i in ('curl -s -X GET "%API_BASE%/votes" 2^>nul') do set "VOTES_RESPONSE=%%i"
echo Vote retrieval response: !VOTES_RESPONSE!

rem Check if votes were retrieved
echo !VOTES_RESPONSE! | findstr "success.*true" >nul
if %errorlevel% equ 0 (
    echo ✅ Vote retrieval successful
) else (
    echo ❌ Vote retrieval failed
)
echo.

echo [8/8] Testing Results...
echo ----------------------------------------
for /f "tokens=*" %%i in ('curl -s -X GET "%API_BASE%/results" 2^>nul') do set "RESULTS_RESPONSE=%%i"
echo Results response: !RESULTS_RESPONSE!

rem Check if results were retrieved
echo !RESULTS_RESPONSE! | findstr "success.*true" >nul
if %errorlevel% equ 0 (
    echo ✅ Results retrieval successful
) else (
    echo ❌ Results retrieval failed
)
echo.

echo ========================================
echo           TESTING COMPLETE
echo ========================================
echo.
echo Test Summary:
echo - Voter ID: !TEST_VOTER_ID!
echo - Public Key: !TEST_PUBLIC_KEY!
echo - Private Key: !TEST_PRIVATE_KEY!
echo.
echo All endpoints have been tested. Check the responses above for any errors.
echo.
pause
