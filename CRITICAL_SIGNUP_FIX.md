# CRITICAL: Signup Authentication Fix

## Problem Summary
User signup is failing with 500 error because the Render deployment is missing Supabase authentication credentials.

## Root Cause
- `render.yaml` had `USE_SUPABASE=false` but the entire authentication system depends on Supabase Auth
- Missing `SUPABASE_SERVICE_KEY` environment variable on Render
- Backend code has no fallback authentication mechanism

## Solution Implemented
Updated `render.yaml` to include Supabase credentials and changed `USE_SUPABASE=true`

## IMMEDIATE ACTIONS REQUIRED

### Step 1: Set Supabase Service Key on Render
You MUST manually set the SUPABASE_SERVICE_KEY in the Render dashboard:

```bash
# Go to: https://dashboard.render.com/web/youtubedubber-backend
# Navigate to: Environment tab
# Add/Update the following environment variable:

SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3cmVoZnpmcXJneG5nc296b25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MjgzODIsImV4cCI6MjA3NzAwNDM4Mn0.cq750RyXVYfSZ2xdmq-PYeewgbotEbsowJuxT_vqL04
```

### Step 2: Deploy the Fix
```bash
cd /Users/briandibassinga/Github-Projects/youtubedubber.com

# Commit the changes
git add render.yaml
git commit -m "fix: add Supabase credentials for authentication"
git push origin main
```

### Step 3: Verify the Fix
After deployment completes (approximately 5 minutes):

```bash
# Test signup endpoint
curl -X POST https://youtubedubber-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "metadata": {"name": "Test User"}
  }'

# Expected response (201 Created):
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "created_at": "..."
  },
  "expires_in": 3600
}
```

### Step 4: Test Login
```bash
curl -X POST https://youtubedubber-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

## Environment Variables Status

### Required Variables (Now Set):
- ✅ `DATABASE_URL` - Connected to Render PostgreSQL
- ✅ `SUPABASE_URL` - Set in render.yaml
- ⚠️ `SUPABASE_SERVICE_KEY` - **MUST BE SET MANUALLY IN RENDER DASHBOARD**
- ✅ `USE_SUPABASE` - Changed to "true"

### Optional Variables (Configure Later):
- `DEEPGRAM_API_KEY` - For audio transcription (AI features)
- `OPENAI_API_KEY` - For AI-powered features

## Technical Details

### What Changed:
1. **render.yaml** (lines 25-31):
   - Added `SUPABASE_URL` with production URL
   - Added `SUPABASE_SERVICE_KEY` placeholder (sync: false)
   - Changed `USE_SUPABASE` from "false" to "true"

### Why This Fixes Signup:
1. Authentication endpoints (`/api/auth/signup`, `/api/auth/login`) call `get_supabase_client()`
2. `get_supabase_client()` requires both `settings.supabase_url` and `settings.supabase_service_key`
3. Without these variables, Supabase client creation fails → 500 error
4. With proper credentials, Supabase Auth can create users and issue JWT tokens

### Architecture Notes:
- **Supabase Auth**: Handles user authentication, JWT tokens, password reset
- **Render PostgreSQL**: Stores application data (jobs, tasks, audit logs)
- **Dual Database Setup**: Supabase Auth for users + Render PostgreSQL for app data

## Security Considerations

### IMPORTANT:
The SUPABASE_SERVICE_KEY in your `.env` file appears to be an **ANON key** (not a service role key). This is a security issue:

- **Current Key**: `eyJ...` (role: "anon")
- **Required for Production**: Service role key with admin privileges

### To Get Service Role Key:
1. Go to: https://supabase.com/dashboard/project/twrehfzfqrgxngsozonh/settings/api
2. Copy the `service_role` key (NOT the `anon` key)
3. Update environment variable in Render dashboard

## Monitoring After Deployment

### Check Health Status:
```bash
curl https://youtubedubber-backend.onrender.com/health
curl https://youtubedubber-backend.onrender.com/api/auth/health
```

### Check Logs:
```bash
# In Render dashboard, go to Logs tab and look for:
- "New user registered: test@example.com" (signup success)
- "Signup error: ..." (if still failing)
```

## Rollback Plan (If Needed)

If this fix causes issues:

```bash
# Revert render.yaml changes
git revert HEAD
git push origin main
```

Then investigate alternative authentication approaches (PostgreSQL-based auth).

## Next Steps After Fix

1. ✅ Verify signup works
2. ✅ Verify login works
3. ✅ Test password reset flow
4. Test email verification (may require Supabase email settings)
5. Monitor error rates and user registrations
6. Consider implementing rate limiting monitoring

## Support Information

- **Supabase Project**: https://supabase.com/dashboard/project/twrehfzfqrgxngsozonh
- **Render Backend**: https://dashboard.render.com/web/youtubedubber-backend
- **Backend Health**: https://youtubedubber-backend.onrender.com/health
- **API Docs**: https://youtubedubber-backend.onrender.com/docs

## Contact
If signup still fails after following these steps, check:
1. Render deployment logs for errors
2. Supabase project status and quotas
3. Environment variables are correctly set
4. Service role key has proper permissions
