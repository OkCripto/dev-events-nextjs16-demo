# ⚠️ IMPORTANT: API Security Configuration Required

## 🔴 Action Required Before Your Next Deployment Works

Your POST endpoints are now secured! To complete the setup, you **MUST** add the API secret key to Vercel:

### Step 1: Generate an API Key

Run this command to generate a secure API key:

**On Windows PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**On Mac/Linux:**
```bash
openssl rand -base64 32
```

**Copy the output** - it will look something like: `dF3kL9mP2nQ5rT8wX1yZ4bC6vA0sD7eF9gH2jK5lM8nP1qR4tU7vY0zA3bC6dE9f`

### Step 2: Add to Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project: **dev-events-nextjs16-demo**
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Fill in:
   - **Name**: `API_SECRET_KEY`
   - **Value**: Paste the key you generated above
   - **Environments**: Select all (Production, Preview, Development)
6. Click **Save**

### Step 3: Trigger Redeploy

After adding the environment variable, Vercel will automatically redeploy your application.

---

## ✅ What Was Protected

### POST /api/events
- **Before**: Wide open, anyone could spam your API
- **Now**: Requires API key authentication
- **Protection**: 
  - API key validation
  - Rate limiting (10 req/min)
  - Input sanitization
  - File type/size validation
  - Malicious content filtering

### GET /api/events & GET /api/events/[slug]
- **Status**: Remain public (read-only, safe)
- These endpoints are fine to keep open as they only read data

---

## 📱 How to Use the Protected API

When making POST requests, include the API key in headers:

```javascript
fetch('/api/events', {
  method: 'POST',
  headers: {
    'x-api-key': 'your_api_secret_key_here'
  },
  body: formData
});
```

---

## 📚 Full Documentation

See `API_SECURITY.md` for complete documentation including:
- Detailed setup instructions
- Code examples in multiple languages
- Error handling
- Rate limit information
- Security features explained

---

## 🔑 Local Development

Add to your local `.env` file:
```
API_SECRET_KEY=your_generated_key_here
```

⚠️ **Never commit this file to Git!**

---

**Questions?** Check `API_SECURITY.md` for detailed documentation.
