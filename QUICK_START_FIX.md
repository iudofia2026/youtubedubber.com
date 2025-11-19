# Quick Start: Fix Signup in 5 Minutes

## Problem
Signup endpoint returns 500 error. Users can't register.

## Solution (3 Commands)

### 1. Get Supabase Service Key
Go here: https://supabase.com/dashboard/project/twrehfzfqrgxngsozonh/settings/api

Copy the **service_role** key (the long one, NOT the anon key)

### 2. Set Environment Variable
Go here: https://dashboard.render.com/web/youtubedubber-backend

Click **Environment** tab → Add/Update:
```
SUPABASE_SERVICE_KEY = <paste the service_role key>
```

Click **Save Changes**

### 3. Deploy the Fix
```bash
cd /Users/briandibassinga/Github-Projects/youtubedubber.com
./scripts/deploy_auth_fix.sh
```

## Wait 5 Minutes
Render will automatically redeploy with the new configuration.

## Test It Works
```bash
./scripts/test_auth_fix.sh
```

Should see:
```
✅ PASSED: Backend is healthy
✅ PASSED: Signup successful!
✅ PASSED: Login successful!
```

## Done!
Signup is now working. Users can register and login.

---

## Need More Details?
- Read: **CRITICAL_SIGNUP_FIX.md** for full explanation
- Read: **GET_SUPABASE_SERVICE_KEY.md** for key setup
- Read: **DEPLOYMENT_CHECKLIST.md** for complete process
