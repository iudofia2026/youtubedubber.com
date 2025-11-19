# Frontend Deployment Trigger

This file triggers a frontend redeployment to fix critical issues:

## Issues Being Fixed
1. **Mixed Content Security Error**: Frontend making HTTP requests to HTTPS backend
2. **Stripe Integration Error**: Missing Stripe publishable key configuration
3. **Root Directory Configuration**: Frontend service using wrong build path

## Expected Results After Deployment
- ✅ All API calls will use HTTPS (no Mixed Content errors)
- ✅ Stripe will gracefully degrade when not configured
- ✅ Terms & conditions checkbox will work properly
- ✅ Authentication flow will function correctly

## Environment Variables (from render.yaml)
```
NEXT_PUBLIC_API_URL=https://youtubedubber-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://youtubedubber.com
NEXT_PUBLIC_DEV_MODE=false
```

**Deployment triggered at**: 2025-11-19 07:45:00 UTC