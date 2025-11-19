#!/bin/bash

# CRITICAL: Deploy Authentication Fix for Signup
# This script helps deploy the Supabase authentication fix to Render

set -e  # Exit on error

echo "================================================"
echo "CRITICAL AUTH FIX DEPLOYMENT SCRIPT"
echo "================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    echo "ERROR: Must run this script from the project root directory"
    exit 1
fi

echo "Step 1: Checking current git status..."
git status --short

echo ""
echo "Step 2: Files that will be committed:"
echo "  - render.yaml (Updated with Supabase credentials)"
echo ""

read -p "Continue with deployment? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "Step 3: Committing changes..."
git add render.yaml
git commit -m "fix(auth): add Supabase credentials for authentication

CRITICAL FIX: Signup endpoint failing with 500 error

Root cause:
- render.yaml had USE_SUPABASE=false but backend depends on Supabase Auth
- Missing SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables

Changes:
- Set SUPABASE_URL in render.yaml
- Added SUPABASE_SERVICE_KEY placeholder (sync: false)
- Changed USE_SUPABASE to true

Action Required:
- Manually set SUPABASE_SERVICE_KEY in Render dashboard
- Use SERVICE ROLE key (not anon key) for production

Testing:
- POST /api/auth/signup should now return 201 with access_token
- POST /api/auth/login should authenticate users successfully
"

echo ""
echo "Step 4: Pushing to main branch..."
git push origin main

echo ""
echo "================================================"
echo "DEPLOYMENT INITIATED"
echo "================================================"
echo ""
echo "Next Steps:"
echo ""
echo "1. SET SUPABASE_SERVICE_KEY IN RENDER DASHBOARD (CRITICAL!)"
echo "   Go to: https://dashboard.render.com/web/youtubedubber-backend"
echo "   Navigate to: Environment tab"
echo "   Add/Update: SUPABASE_SERVICE_KEY"
echo ""
echo "   IMPORTANT: Use the SERVICE ROLE key from Supabase, not the anon key!"
echo "   Get it from: https://supabase.com/dashboard/project/twrehfzfqrgxngsozonh/settings/api"
echo ""
echo "2. WAIT FOR DEPLOYMENT (approximately 5 minutes)"
echo "   Monitor: https://dashboard.render.com/web/youtubedubber-backend"
echo ""
echo "3. TEST THE FIX:"
echo "   Run: ./scripts/test_auth_fix.sh"
echo ""
echo "4. CHECK LOGS:"
echo "   Look for 'New user registered' or 'Signup error' messages"
echo ""
echo "================================================"
echo "Read CRITICAL_SIGNUP_FIX.md for full details"
echo "================================================"
