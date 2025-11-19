# Authentication Fix Deployment Checklist

## Pre-Deployment Status
- ❌ User signup failing with 500 error
- ❌ Missing SUPABASE_URL in render.yaml
- ❌ Missing SUPABASE_SERVICE_KEY in Render environment
- ❌ USE_SUPABASE set to "false" (should be "true")
- ❌ Using anon key instead of service role key

## Deployment Steps

### ✅ Step 1: Update Configuration Files (COMPLETED)
- [x] Updated `render.yaml` with SUPABASE_URL
- [x] Added SUPABASE_SERVICE_KEY placeholder
- [x] Changed USE_SUPABASE to "true"
- [x] Created deployment documentation

### ⬜ Step 2: Get Supabase Service Role Key (REQUIRED)
1. Go to: https://supabase.com/dashboard/project/twrehfzfqrgxngsozonh/settings/api
2. Copy the **service_role** key (NOT the anon key)
3. Keep it secure - do not commit to git

**See: GET_SUPABASE_SERVICE_KEY.md for detailed instructions**

### ⬜ Step 3: Deploy Code Changes
```bash
# Option A: Use automated script
./scripts/deploy_auth_fix.sh

# Option B: Manual deployment
git add render.yaml
git commit -m "fix(auth): add Supabase credentials for authentication"
git push origin main
```

### ⬜ Step 4: Set Environment Variable in Render
1. Go to: https://dashboard.render.com/web/youtubedubber-backend
2. Click **Environment** tab
3. Find or add: `SUPABASE_SERVICE_KEY`
4. Paste the service role key from Step 2
5. Click **Save Changes**
6. Wait for automatic redeployment (~5 minutes)

### ⬜ Step 5: Monitor Deployment
1. Watch deployment logs: https://dashboard.render.com/web/youtubedubber-backend
2. Look for successful startup messages
3. Check for any error messages related to Supabase
4. Verify deployment completes successfully

### ⬜ Step 6: Test the Fix
```bash
# Automated testing
./scripts/test_auth_fix.sh

# Manual testing
curl -X POST https://youtubedubber-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","metadata":{"name":"Test"}}'
```

Expected result: `201 Created` with access_token

### ⬜ Step 7: Verify All Auth Endpoints
- [ ] Signup works (201 Created)
- [ ] Login works (200 OK)
- [ ] JWT tokens are generated
- [ ] Password reset initiates
- [ ] Token refresh works
- [ ] Logout works

## Success Criteria

### Backend Health
```bash
curl https://youtubedubber-backend.onrender.com/health
# Should return: {"status": "healthy"}
```

### Auth Health
```bash
curl https://youtubedubber-backend.onrender.com/api/auth/health
# Should return: {"status": "healthy", "service": "authentication", "supabase_connected": true}
```

### Signup Test
```bash
curl -X POST https://youtubedubber-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
# Should return: 201 with access_token and user data
```

### Login Test
```bash
curl -X POST https://youtubedubber-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
# Should return: 200 with access_token and user data
```

## Rollback Plan

If the fix causes issues:

### Immediate Rollback
```bash
git revert HEAD
git push origin main
```

### Alternative: Disable Auth Temporarily
1. In Render dashboard, set `USE_SUPABASE=false`
2. This will disable authentication but allow backend to start
3. Users won't be able to sign up/login but existing API works

## Post-Deployment Monitoring

### Check Every 15 Minutes (First Hour)
- [ ] Error rate in Render logs
- [ ] Successful signup count
- [ ] Supabase Auth dashboard for new users
- [ ] Response times for auth endpoints

### Check After 24 Hours
- [ ] Total signups successful
- [ ] Any 500 errors in logs
- [ ] Database user count matches Supabase Auth
- [ ] Email verification working (if enabled)

## Troubleshooting Guide

### Issue: Still Getting 500 Error

**Possible Causes:**
1. SUPABASE_SERVICE_KEY not set correctly
2. Using anon key instead of service role key
3. Supabase project is paused/inactive
4. Deployment not complete

**Actions:**
1. Verify environment variable in Render dashboard
2. Check Supabase project status
3. Review deployment logs
4. Test with curl to see exact error

### Issue: 401 Unauthorized

**Possible Causes:**
1. Using correct service key but wrong format
2. Supabase URL incorrect
3. JWT validation failing

**Actions:**
1. Verify SUPABASE_URL matches project
2. Check Supabase API settings
3. Test JWT decode with Supabase JWKS endpoint

### Issue: 429 Too Many Requests

**Expected Behavior:**
- Rate limiting is working correctly
- Signup: 5 per hour per IP
- Login: 10 per minute per IP
- This is normal security behavior

### Issue: Users Created but Can't Login

**Possible Causes:**
1. Email verification required
2. User exists in Auth but not in database
3. Password mismatch

**Actions:**
1. Check Supabase Auth dashboard for user status
2. Verify email confirmation settings
3. Check database users table

## Environment Variables Summary

### Required (Must Be Set):
| Variable | Value | Location |
|----------|-------|----------|
| DATABASE_URL | postgres://... | Render (auto-set) |
| SUPABASE_URL | https://twrehfzfqrgxngsozonh.supabase.co/ | render.yaml |
| SUPABASE_SERVICE_KEY | eyJ... (service role) | Render dashboard |
| USE_SUPABASE | true | render.yaml |
| SECRET_KEY | (auto-generated) | Render (auto-set) |

### Optional (Configure Later):
| Variable | Purpose | Priority |
|----------|---------|----------|
| DEEPGRAM_API_KEY | Audio transcription | Medium |
| OPENAI_API_KEY | AI features | Medium |
| STRIPE_SECRET_KEY | Payments | Low (dummy key exists) |
| HCAPTCHA_SECRET_KEY | Bot protection | Low |

## Documentation References

- **Main Fix Guide**: CRITICAL_SIGNUP_FIX.md
- **Service Key Guide**: GET_SUPABASE_SERVICE_KEY.md
- **Deployment Script**: scripts/deploy_auth_fix.sh
- **Testing Script**: scripts/test_auth_fix.sh

## Support Contacts

- **Supabase Dashboard**: https://supabase.com/dashboard/project/twrehfzfqrgxngsozonh
- **Render Dashboard**: https://dashboard.render.com/web/youtubedubber-backend
- **Backend API Docs**: https://youtubedubber-backend.onrender.com/docs
- **Backend Health**: https://youtubedubber-backend.onrender.com/health

## Timeline

- **Estimated Deployment Time**: 5-10 minutes
- **Estimated Testing Time**: 5 minutes
- **Total Downtime**: 0 (rolling deployment)
- **Verification Window**: 1 hour

## Sign-Off

- [ ] Configuration updated
- [ ] Service role key obtained
- [ ] Code deployed to main
- [ ] Environment variable set in Render
- [ ] Deployment completed successfully
- [ ] All tests passed
- [ ] No errors in logs
- [ ] Production verification complete

Date: _______________
Deployed by: _______________
Verified by: _______________
