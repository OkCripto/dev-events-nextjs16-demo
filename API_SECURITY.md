# API Security Setup

## 🔐 Protected Endpoints

The following POST endpoints are now protected with API key authentication:

- `POST /api/events` - Create new events

## 🔑 Required Environment Variable

Add this to your `.env` file and Vercel environment variables:

```bash
API_SECRET_KEY=your_secure_random_string_here
```

### Generating a Secure API Key

Use one of these methods to generate a strong API key:

**Option 1: OpenSSL (Recommended)**
```bash
openssl rand -base64 32
```

**Option 2: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Online Generator**
Visit: https://randomkeygen.com/ (use CodeIgniter Encryption Keys)

## 📝 Setting Up in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `API_SECRET_KEY`
   - **Value**: Your generated secure key
   - **Environment**: Production, Preview, Development
4. Redeploy your application

## 🛡️ Security Features Implemented

### 1. **API Key Authentication**
- All POST requests must include `x-api-key` header
- Prevents unauthorized event creation

### 2. **Rate Limiting**
- Maximum 10 requests per minute per IP address
- Prevents spam and DoS attacks

### 3. **Input Sanitization**
- Removes malicious scripts and HTML
- Prevents XSS (Cross-Site Scripting) attacks
- Limits input length to prevent memory exhaustion

### 4. **File Validation**
- File type validation (only JPEG, PNG, WebP)
- File size limit (max 5MB)
- Prevents malicious file uploads

### 5. **Data Validation**
- Required field validation
- Field length limits
- Type checking

## 🔌 Making Authenticated Requests

### Example using cURL:
```bash
curl -X POST https://your-app.vercel.app/api/events \
  -H "x-api-key: your_secret_key_here" \
  -F "title=My Event" \
  -F "description=Event description" \
  -F "image=@/path/to/image.jpg" \
  -F "date=2024-05-20" \
  -F "time=10:00 AM" \
  -F "location=New York" \
  -F "tags=[\"tech\",\"conference\"]" \
  -F "agenda=[\"Opening\",\"Talks\",\"Networking\"]"
```

### Example using JavaScript fetch:
```javascript
const formData = new FormData();
formData.append('title', 'My Event');
formData.append('description', 'Event description');
formData.append('image', imageFile);
// ... add other fields

const response = await fetch('/api/events', {
  method: 'POST',
  headers: {
    'x-api-key': process.env.API_SECRET_KEY
  },
  body: formData
});
```

### Example using Postman:
1. Set method to **POST**
2. URL: `https://your-app.vercel.app/api/events`
3. Headers:
   - Key: `x-api-key`
   - Value: `your_secret_key_here`
4. Body: **form-data** with your event fields

## 📊 Rate Limit Headers

API responses include rate limit information:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
```

## ⚠️ Error Responses

### Unauthorized (401)
```json
{
  "error": "Unauthorized",
  "message": "Valid API key required. Please include 'x-api-key' header."
}
```

### Rate Limit Exceeded (429)
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later."
}
```

### Invalid Data (400)
```json
{
  "message": "Invalid event data",
  "errors": ["Missing or invalid field: title", "..."]
}
```

## 🛠️ Local Development

1. Create a `.env` file in the project root:
```bash
API_SECRET_KEY=dev_key_for_local_testing_only
```

2. Use the same key in your API requests during development

⚠️ **Never commit your `.env` file to version control!**
