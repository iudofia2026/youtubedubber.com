# CAPTCHA Protection Setup Guide

This guide will help you set up hCaptcha protection for the YT Dubber authentication forms to prevent bot attacks.

## Overview

The application uses **hCaptcha** for bot protection on signup and login forms. hCaptcha is a privacy-friendly, accessible CAPTCHA solution that provides:

- Better privacy than reCAPTCHA (doesn't track users)
- Generous free tier (1 million requests/month)
- Accessibility compliance (WCAG 2.1 AA)
- Easy integration

## Features

- Seamless integration with signup and login forms
- Invisible until user interaction is required
- Automatic retry on error
- Graceful degradation (works without CAPTCHA in dev mode)
- Backend validation for security
- Mobile-friendly and accessible

## Setup Instructions

### 1. Get hCaptcha Credentials

1. Visit [hCaptcha](https://www.hcaptcha.com)
2. Sign up for a free account
3. Navigate to **Settings** > **Sites**
4. Click **New Site** and fill in:
   - **Site Name**: YT Dubber
   - **Hostnames**: Add your domains:
     - `localhost` (for development)
     - `youtubedubber.com` (for production)
     - Your Vercel preview URLs if needed
5. Click **Save**
6. Copy your **Site Key** and **Secret Key**

### 2. Configure Frontend (Next.js)

Add to your `frontend/.env.local`:

```env
# hCaptcha Site Key (public key - visible in frontend)
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=your_site_key_here
```

### 3. Configure Backend (FastAPI)

Add to your `backend_hidden/.env`:

```env
# hCaptcha Secret Key (private key - server-side only)
HCAPTCHA_SECRET_KEY=your_secret_key_here
```

### 4. Test the Implementation

1. **Start the backend**:
   ```bash
   cd backend_hidden
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   uvicorn app.main:app --reload
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Visit** `http://localhost:3000` and navigate to login or signup
4. You should see the hCaptcha widget appear when needed
5. Complete the CAPTCHA and submit the form

## Development Mode

During development, you can disable CAPTCHA by:

1. **Leaving the environment variables empty** (recommended for local dev)
2. The system will gracefully skip CAPTCHA verification
3. Forms will work normally without CAPTCHA

## Production Deployment

### Frontend (Vercel)

Add environment variable in Vercel dashboard:
- Go to **Project Settings** > **Environment Variables**
- Add `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` with your site key
- Redeploy the application

### Backend (Render/Railway)

Add environment variable in your hosting platform:
- Add `HCAPTCHA_SECRET_KEY` with your secret key
- Restart the service

## How It Works

### Frontend Flow

1. User fills in signup/login form
2. Before submission, CAPTCHA widget appears
3. User completes CAPTCHA challenge
4. CAPTCHA token is added to form submission
5. Form is submitted to backend with token

### Backend Flow

1. Backend receives form data with CAPTCHA token
2. Token is sent to hCaptcha API for verification
3. If valid, authentication proceeds
4. If invalid, request is rejected with error

## Security Best Practices

1. **Always use CAPTCHA in production**
2. **Keep secret key secure** - never commit to version control
3. **Use environment variables** for all keys
4. **Monitor CAPTCHA failures** in logs for bot attack patterns
5. **Consider rate limiting** in addition to CAPTCHA

## Customization

### Change CAPTCHA Theme

Edit `/frontend/components/ui/captcha.tsx`:

```typescript
<Captcha
  theme="dark"  // or "light"
  size="compact"  // or "normal" or "invisible"
/>
```

### Disable CAPTCHA for Testing

Set empty environment variable:

```env
# Frontend
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=

# Backend
HCAPTCHA_SECRET_KEY=
```

## Troubleshooting

### CAPTCHA Not Showing

- Check that `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` is set
- Verify the key starts with proper format
- Check browser console for errors
- Ensure you're accessing from allowed domain

### Verification Failing

- Check that `HCAPTCHA_SECRET_KEY` is set correctly in backend
- Verify backend has internet access to reach hCaptcha API
- Check backend logs for specific error codes
- Ensure site key and secret key are from the same hCaptcha site

### CAPTCHA Expired

- CAPTCHA tokens expire after 2 minutes
- If user waits too long, they'll need to re-verify
- This is normal security behavior

## Error Codes

Common hCaptcha error codes:

- `missing-input-secret`: Backend secret key not configured
- `invalid-input-secret`: Backend secret key is invalid
- `missing-input-response`: CAPTCHA token not provided
- `invalid-input-response`: CAPTCHA token is invalid or expired
- `timeout-or-duplicate`: CAPTCHA already used or expired

## Rate Limiting

CAPTCHA works best with rate limiting. The backend includes:

- **10 requests/minute** per IP for auth endpoints
- **50 requests/hour** per IP for auth endpoints
- **5 signups/hour** per IP
- **3 password resets/hour** per IP

## Accessibility

hCaptcha is WCAG 2.1 AA compliant and includes:

- Screen reader support
- Keyboard navigation
- Audio challenges for visually impaired users
- Adjustable difficulty based on user behavior

## Privacy

hCaptcha respects user privacy:

- No user tracking across sites
- GDPR compliant
- CCPA compliant
- Data minimization
- Transparent data practices

## Support

For issues with:

- **hCaptcha service**: Visit [hCaptcha Docs](https://docs.hcaptcha.com)
- **Integration**: Check this README or create an issue
- **Security concerns**: Contact your security team

## Additional Resources

- [hCaptcha Documentation](https://docs.hcaptcha.com)
- [React hCaptcha](https://github.com/hCaptcha/react-hcaptcha)
- [hCaptcha Dashboard](https://dashboard.hcaptcha.com)
