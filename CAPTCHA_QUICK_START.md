# CAPTCHA Quick Start Guide

Get CAPTCHA protection running in 5 minutes!

## Step 1: Get Your Keys (2 minutes)

1. Visit **https://hcaptcha.com** and create a free account
2. Go to **Sites** and click **New Site**
3. Add these hostnames:
   - `localhost` (for development)
   - Your production domain (e.g., `youtubedubber.com`)
4. Copy your **Site Key** and **Secret Key**

## Step 2: Configure Environment (1 minute)

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_site_key_here
```

### Backend (`backend_hidden/.env`)
```env
HCAPTCHA_SECRET_KEY=your_secret_key_here
```

## Step 3: Restart Services (2 minutes)

### Backend
```bash
cd backend_hidden
source venv/bin/activate  # Mac/Linux
# or: venv\Scripts\activate  # Windows
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm run dev
```

## Step 4: Test It!

1. Open **http://localhost:3000**
2. Click **Sign Up** or **Sign In**
3. Fill in the form
4. You'll see the hCaptcha widget appear
5. Complete the challenge
6. Submit the form

**That's it!** Your forms are now protected from bots.

## What Happens Under the Hood

```
User fills form
    ↓
CAPTCHA appears
    ↓
User solves challenge
    ↓
Token generated (client-side)
    ↓
Form submitted with token
    ↓
Backend verifies with hCaptcha API
    ↓
If valid → Allow signup/login
If invalid → Reject with error
```

## Development Without CAPTCHA

Don't have hCaptcha keys yet? No problem!

Just leave the environment variables empty:
- Forms work normally
- No CAPTCHA shown
- Backend skips verification

This is perfect for local development.

## Troubleshooting

### CAPTCHA not showing?
- ✓ Check `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` is set
- ✓ Restart Next.js dev server
- ✓ Clear browser cache

### "Verification failed" error?
- ✓ Check `HCAPTCHA_SECRET_KEY` is set in backend
- ✓ Restart backend server
- ✓ Verify keys are from the same hCaptcha site

### Still stuck?
See the full guide: **CAPTCHA_SETUP.md**

## Customization

Want to change how it looks?

Edit `frontend/components/ui/captcha.tsx`:

```typescript
<Captcha
  theme="dark"        // or "light"
  size="compact"      // or "normal" or "invisible"
  onVerify={handleVerify}
  onError={handleError}
/>
```

## Production Deployment

### Vercel (Frontend)
1. Go to project settings
2. Add environment variable: `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`
3. Redeploy

### Render/Railway (Backend)
1. Go to environment variables
2. Add: `HCAPTCHA_SECRET_KEY`
3. Restart service

**Important**: Make sure your production domain is added to hCaptcha site settings!

## Need Help?

- **Setup issues**: See `CAPTCHA_SETUP.md`
- **Integration questions**: See `CAPTCHA_IMPLEMENTATION_SUMMARY.md`
- **hCaptcha docs**: https://docs.hcaptcha.com

---

**Pro Tip**: The CAPTCHA is already integrated into your signup and login forms. You just need to add the API keys!
