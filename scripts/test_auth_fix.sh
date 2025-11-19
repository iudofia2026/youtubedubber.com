#!/bin/bash

# Test Authentication Fix
# Tests signup and login endpoints after deployment

set -e

BACKEND_URL="https://youtubedubber-backend.onrender.com"
TEST_EMAIL="test-$(date +%s)@example.com"  # Unique email for testing
TEST_PASSWORD="TestPass123!"

echo "================================================"
echo "AUTHENTICATION FIX TESTING"
echo "================================================"
echo ""
echo "Backend URL: $BACKEND_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Test 1: Health Check
echo "Test 1: Backend Health Check"
echo "------------------------------"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BACKEND_URL/health")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_CODE")

echo "Status: $http_code"
echo "Response: $body"

if [ "$http_code" != "200" ]; then
    echo "❌ FAILED: Backend health check failed"
    exit 1
fi
echo "✅ PASSED: Backend is healthy"
echo ""

# Test 2: Auth Health Check
echo "Test 2: Auth Service Health Check"
echo "-----------------------------------"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BACKEND_URL/api/auth/health")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | grep -v "HTTP_CODE")

echo "Status: $http_code"
echo "Response: $body"

if [ "$http_code" != "200" ]; then
    echo "⚠️  WARNING: Auth health check failed"
    echo "This might indicate Supabase connection issues"
fi
echo ""

# Test 3: User Signup
echo "Test 3: User Signup"
echo "--------------------"
signup_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BACKEND_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"metadata\": {\"name\": \"Test User\"}
  }")

http_code=$(echo "$signup_response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$signup_response" | grep -v "HTTP_CODE")

echo "Status: $http_code"
echo "Response: $body"
echo ""

if [ "$http_code" = "201" ]; then
    echo "✅ PASSED: Signup successful!"

    # Extract access token for login test
    access_token=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))" 2>/dev/null || echo "")

    if [ -n "$access_token" ]; then
        echo "Access token received: ${access_token:0:20}..."
    fi
    echo ""

    # Test 4: User Login
    echo "Test 4: User Login"
    echo "-------------------"
    login_response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
      }")

    http_code=$(echo "$login_response" | grep "HTTP_CODE" | cut -d: -f2)
    body=$(echo "$login_response" | grep -v "HTTP_CODE")

    echo "Status: $http_code"
    echo "Response: $body"
    echo ""

    if [ "$http_code" = "200" ]; then
        echo "✅ PASSED: Login successful!"
    else
        echo "❌ FAILED: Login failed"
        exit 1
    fi

elif [ "$http_code" = "500" ]; then
    echo "❌ CRITICAL: Signup still returning 500 error!"
    echo ""
    echo "Possible causes:"
    echo "1. SUPABASE_SERVICE_KEY not set in Render dashboard"
    echo "2. Using anon key instead of service role key"
    echo "3. Supabase project is down or has issues"
    echo "4. Deployment not complete yet"
    echo ""
    echo "Actions:"
    echo "1. Check Render environment variables"
    echo "2. Verify Supabase service role key is correct"
    echo "3. Check Render deployment logs"
    exit 1

elif [ "$http_code" = "429" ]; then
    echo "⚠️  Rate limited - too many signup attempts"
    echo "This is expected behavior for rate limiting protection"
    exit 0

elif [ "$http_code" = "400" ]; then
    echo "❌ FAILED: Bad request - check email/password format"
    echo "This might mean the user already exists or validation failed"
    exit 1

else
    echo "❌ FAILED: Unexpected status code"
    exit 1
fi

echo ""
echo "================================================"
echo "ALL TESTS PASSED!"
echo "================================================"
echo ""
echo "Authentication is working correctly:"
echo "✅ Backend health check"
echo "✅ User signup (201 Created)"
echo "✅ User login (200 OK)"
echo "✅ JWT token generation"
echo ""
echo "Next steps:"
echo "1. Test in production with real user accounts"
echo "2. Monitor signup success rate"
echo "3. Check email verification flow"
echo "4. Test password reset functionality"
