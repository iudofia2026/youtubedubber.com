# How to Get Supabase Service Role Key

## CRITICAL: You're Currently Using the Wrong Key

Your current `SUPABASE_SERVICE_KEY` is an **ANON key** which has limited permissions. For backend authentication to work properly, you need the **SERVICE ROLE key**.

### Current Key Analysis:
```json
{
  "iss": "supabase",
  "ref": "twrehfzfqrgxngsozonh",
  "role": "anon",  ← WRONG! Should be "service_role"
  "iat": 1761428382,
  "exp": 2077004382
}
```

## Steps to Get the Correct Key

### 1. Access Supabase Dashboard
Go to: https://supabase.com/dashboard/project/twrehfzfqrgxngsozonh/settings/api

### 2. Find Project API Settings
- Click on your project: `twrehfzfqrgxngsozonh`
- Navigate to: **Settings** > **API**

### 3. Copy Service Role Key
You'll see two keys:

| Key Type | Description | Use Case |
|----------|-------------|----------|
| **anon / public** | Limited permissions, safe for client-side | Frontend, mobile apps |
| **service_role** | Full admin access, secret | Backend server (YOU NEED THIS!) |

Copy the `service_role` key (it's a long JWT token starting with `eyJ...`)

### 4. Update Render Environment Variable

#### Option A: Using Render Dashboard (Recommended)
1. Go to: https://dashboard.render.com/web/youtubedubber-backend
2. Click on **Environment** tab
3. Find or add `SUPABASE_SERVICE_KEY`
4. Paste the service role key
5. Click **Save Changes**
6. Service will automatically redeploy

#### Option B: Using Render CLI
```bash
# Install Render CLI if needed
brew install render

# Set environment variable
render env set SUPABASE_SERVICE_KEY="eyJ..." --service youtubedubber-backend
```

## Security Warnings

### DO NOT:
- ❌ Commit service role key to git
- ❌ Share service role key publicly
- ❌ Use service role key in frontend/client code
- ❌ Expose service role key in client-side environment variables

### DO:
- ✅ Store in server-side environment variables only
- ✅ Use `sync: false` in render.yaml (already configured)
- ✅ Rotate key if accidentally exposed
- ✅ Monitor Supabase usage for suspicious activity

## Key Differences: Anon vs Service Role

### Anon Key (Current - WRONG for backend):
```
- Read-only access by default
- Respects Row Level Security (RLS) policies
- Safe for client-side use
- Cannot create auth users from backend
- Cannot bypass database permissions
```

### Service Role Key (Required):
```
- Full admin access to database
- Bypasses Row Level Security (RLS)
- MUST be kept secret
- Can create auth users, manage data
- Required for server-side operations
```

## Testing After Update

After updating the key, run:
```bash
./scripts/test_auth_fix.sh
```

Expected result:
```
✅ PASSED: Backend is healthy
✅ PASSED: Signup successful!
✅ PASSED: Login successful!
```

## Troubleshooting

### Still Getting 500 Error?

1. **Verify key is set correctly**:
   - Check Render dashboard environment variables
   - Ensure no extra spaces or quotes

2. **Check Supabase project status**:
   - Go to: https://supabase.com/dashboard/project/twrehfzfqrgxngsozonh
   - Verify project is active (not paused)

3. **Check deployment logs**:
   ```bash
   # In Render dashboard, go to Logs tab
   # Look for:
   # - "Auth health check failed"
   # - "Supabase connection error"
   # - "Invalid JWT"
   ```

4. **Verify environment variable is loaded**:
   - Check Render logs for startup messages
   - Should NOT see "Missing required settings: supabase_service_key"

### Key is Correct but Still Failing?

Check Supabase Auth settings:
1. Go to: https://supabase.com/dashboard/project/twrehfzfqrgxngsozonh/auth/users
2. Verify Auth is enabled
3. Check email provider settings (if using email confirmation)
4. Review Auth policies and rate limits

## Support Resources

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Supabase Status**: https://status.supabase.com/
- **Render Docs**: https://render.com/docs/environment-variables

## Quick Reference

| What | Where |
|------|-------|
| Supabase Dashboard | https://supabase.com/dashboard/project/twrehfzfqrgxngsozonh |
| Render Dashboard | https://dashboard.render.com/web/youtubedubber-backend |
| API Settings | https://supabase.com/dashboard/project/twrehfzfqrgxngsozonh/settings/api |
| Backend Health | https://youtubedubber-backend.onrender.com/health |
| Auth Health | https://youtubedubber-backend.onrender.com/api/auth/health |
