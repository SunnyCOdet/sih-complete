@echo off
REM Secure Voting System Deployment Script for Windows
REM This script deploys the system to various platforms

echo 🚀 Secure Voting System Deployment Script
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [INFO] All dependencies are installed

REM Build the application
echo [INFO] Building the application...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Failed to build application
    pause
    exit /b 1
)

echo [SUCCESS] Application built successfully

REM Display deployment options
echo.
echo Select deployment platform:
echo 1) Vercel (Recommended for quick deployment)
echo 2) Railway
echo 3) Heroku
echo 4) Deploy all components (Backend + Frontend + Mobile)
echo 5) Custom deployment
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" goto deploy_vercel
if "%choice%"=="2" goto deploy_railway
if "%choice%"=="3" goto deploy_heroku
if "%choice%"=="4" goto deploy_all
if "%choice%"=="5" goto custom_deployment
goto invalid_choice

:deploy_vercel
echo [INFO] Deploying to Vercel...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Vercel CLI not found. Installing...
    call npm install -g vercel
)
call vercel --prod
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy to Vercel
    pause
    exit /b 1
)
echo [SUCCESS] Deployed to Vercel successfully
goto end

:deploy_railway
echo [INFO] Deploying to Railway...
where railway >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Railway CLI not found. Installing...
    call npm install -g @railway/cli
)
call railway login
call railway up
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy to Railway
    pause
    exit /b 1
)
echo [SUCCESS] Deployed to Railway successfully
goto end

:deploy_heroku
echo [INFO] Deploying to Heroku...
where heroku >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Heroku CLI not found. Please install from https://devcenter.heroku.com/articles/heroku-cli
    pause
    exit /b 1
)
call heroku login
call heroku create secure-voting-system
call heroku config:set NODE_ENV=production
call heroku config:set SUPABASE_URL=%SUPABASE_URL%
call heroku config:set SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY%
call heroku config:set SUPABASE_SERVICE_ROLE_KEY=%SUPABASE_SERVICE_ROLE_KEY%
call git push heroku main
if %errorlevel% neq 0 (
    echo [ERROR] Failed to deploy to Heroku
    pause
    exit /b 1
)
echo [SUCCESS] Deployed to Heroku successfully
goto end

:deploy_all
echo [INFO] Deploying all components...
call vercel --prod
cd frontend
call npm install
call npm run build
call vercel --prod
cd ..
cd voting-app
call npm install
call npx expo build:android --type apk
call npx expo build:ios --type archive
cd ..
echo [SUCCESS] All components deployed successfully
goto end

:custom_deployment
echo [INFO] Custom deployment selected
echo Please follow the deployment instructions for your chosen platform
goto end

:invalid_choice
echo [ERROR] Invalid choice. Please run the script again.
pause
exit /b 1

:end
echo.
echo [SUCCESS] Deployment completed!
echo [INFO] Don't forget to:
echo [INFO] 1. Set up your Supabase database
echo [INFO] 2. Configure environment variables
echo [INFO] 3. Test the deployed application
echo [INFO] 4. Set up monitoring and logging
echo.
pause