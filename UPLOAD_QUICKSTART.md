# Upload Safety System — Quick Start

## 🚀 Get Started in 5 Minutes

### 1. Verify Installation (1 min)

```bash
cd thailand-kitchen-backend
node scripts/verifyUploadSystem.js
```

Expected output:
```
✅ All verification checks passed!
```

### 2. Run Tests (2 min)

```bash
npm test tests/upload.test.js
```

Expected: 30+ tests passing ✅

### 3. Start Server (1 min)

```bash
npm run dev
```

Expected: Server running on port 5000

### 4. Test Upload (1 min)

```bash
# Create test image
dd if=/dev/urandom of=/tmp/test.png bs=1MB count=1

# Upload (replace TOKEN with real JWT)
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/tmp/test.png" \
  -F "kind=image" \
  http://localhost:5000/api/upload
```

Expected response:
```json
{
  "success": true,
  "file": {
    "url": "/uploads/images/...",
    "storage": "local",
    ...
  }
}
```

---

## 📋 Key Features

### Rate Limiting ✅

```bash
# Try uploading 15 times rapidly (limit is 10/minute)
for i in {1..15}; do
  curl -X POST http://localhost:5000/api/upload ... 
done
# Last 5 will get 429 Too Many Requests
```

### Concurrency Control ✅

```bash
# Try 5 concurrent uploads (limit is 1)
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/upload ... &
done
wait
# Extra requests get 429 Too Many Requests
```

### File Size Limits ✅

```bash
# Create 100MB file
dd if=/dev/urandom of=/tmp/large.png bs=1MB count=100

curl -X POST \
  -F "file=@/tmp/large.png" \
  http://localhost:5000/api/upload
# Get 413 File too large
```

### Request Timeout ✅

```bash
# Stall upload (server timeout is 10 minutes)
# After 10 minutes, get 408 Request Timeout
```

---

## ⚙️ Configuration

### Default Limits (No Changes Needed)

```env
UPLOAD_TIMEOUT_MS=600000         # 10 minutes
UPLOAD_MAX_FILE_SIZE_MB=50       # 50MB
UPLOAD_MAX_CONCURRENT=1          # 1 upload at a time
UPLOAD_RATE_LIMIT=10             # 10 uploads per minute
```

### Customize (Optional)

Edit `.env`:

```env
# Allow 3 concurrent uploads
UPLOAD_MAX_CONCURRENT=3

# Allow 50 uploads per minute
UPLOAD_RATE_LIMIT=50

# 5 minute timeout
UPLOAD_TIMEOUT_MS=300000
```

Restart server for changes to take effect.

---

## 📊 Load Testing

### Quick Test (30 seconds)

```bash
node scripts/loadTestUpload.js
```

Output shows success rate, timing, and any errors.

### Stress Test (3 minutes)

```bash
CONCURRENT_REQUESTS=20 TOTAL_REQUESTS=100 FILE_SIZE_MB=5 \
  node scripts/loadTestUpload.js
```

### Against Real Server

```bash
API_URL=https://your-api.vercel.app \
JWT_TOKEN=your_jwt_token \
CONCURRENT_REQUESTS=10 \
  node scripts/loadTestUpload.js
```

---

## 🔍 Monitoring

### Health Check

```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "message": "API OK",
  "database": "your-db-name"
}
```

**Should always respond in <100ms, even during uploads.**

### Check Upload Status

```bash
# Server logs should show:
[upload-start]          # Request started
[upload-success]        # File saved
[upload-error]          # If failed
[upload-cleanup]        # File cleanup
```

Watch logs:

```bash
# See all upload events
tail -f logs/*.log | grep "upload-\|cloudinary-"

# Count errors
grep "upload-error" logs/*.log | wc -l
```

---

## 🐛 Troubleshooting

### "Upload capacity exceeded" (429)

**Problem**: Too many concurrent uploads

**Solution**:
```bash
# Increase limit in .env
UPLOAD_MAX_CONCURRENT=3

# Restart server
npm run dev
```

### "File too large" (413)

**Problem**: File exceeds 50MB limit

**Solution**:
```bash
# Option 1: Increase limit
UPLOAD_MAX_FILE_SIZE_MB=100

# Option 2: Split into smaller uploads

# Option 3: Use chunked upload (future feature)
```

### "Upload timeout" (408)

**Problem**: Upload took longer than 10 minutes

**Solution**:
```bash
# Increase timeout (in milliseconds)
UPLOAD_TIMEOUT_MS=900000  # 15 minutes

# Or check network speed
# Or reduce file size
```

### Files not cleaned up

**Problem**: Temporary files accumulating

**Solution**:
```bash
# Manual cleanup
find uploads -type f -mtime +7 -delete  # Delete files older than 7 days

# Check logs for cleanup failures
grep "upload-cleanup" logs/*.log
```

---

## 📚 Documentation

### For Operators

- Read: [UPLOAD_SAFETY.md](./UPLOAD_SAFETY.md)
- Topics: Configuration, monitoring, troubleshooting

### For Developers

- Read: [UPLOAD_IMPLEMENTATION.md](./UPLOAD_IMPLEMENTATION.md)
- Topics: Architecture, changes, testing

### For Executives

- Read: [PRODUCTION_READINESS.md](./PRODUCTION_READINESS.md)
- Topics: Benefits, deployment, risks

---

## ✅ Common Tasks

### Increase Upload Limit

```bash
# .env
UPLOAD_RATE_LIMIT=50      # 50 uploads per minute
UPLOAD_MAX_CONCURRENT=5   # 5 at a time
UPLOAD_MAX_FILE_SIZE_MB=200  # 200MB files
```

### Separate AI Image Limits

```bash
# .env
AI_IMAGE_MAX_CONCURRENT=1
AI_IMAGE_RATE_LIMIT=10
AI_IMAGE_RATE_WINDOW_SECONDS=60
```

### Monitor Production

```bash
# Watch upload errors in production
vercel logs --follow | grep upload-error

# Check rate limiting
vercel logs --follow | grep "UPLOAD_RATE"
```

### Deploy Changes

```bash
git add .
git commit -m "chore: adjust upload limits"
git push
# Vercel auto-deploys

# Verify deployment
curl https://api.yoursite.com/api/health
```

---

## 🎯 Next Steps

**For First-Time Setup**:
1. ✅ Run verification: `node scripts/verifyUploadSystem.js`
2. ✅ Run tests: `npm test tests/upload.test.js`
3. ✅ Start server: `npm run dev`
4. ✅ Test locally: Use load test script
5. 👉 Read full docs: [UPLOAD_SAFETY.md](./UPLOAD_SAFETY.md)

**For Production Deployment**:
1. ✅ Review config in `.env.example`
2. ✅ Set any custom limits
3. ✅ Push to Vercel
4. ✅ Verify: `curl /api/health`
5. 👉 Monitor: Watch logs for `[upload-*]`

**For Troubleshooting**:
1. Check: This file's troubleshooting section
2. Check: [UPLOAD_SAFETY.md](./UPLOAD_SAFETY.md#troubleshooting)
3. Check: Server logs with `grep upload-`
4. Run: `node scripts/verifyUploadSystem.js`

---

## 📞 Support

**Questions?**

1. Check relevant documentation file
2. Search code comments for details
3. Review test files for usage examples
4. Check logs for error messages

**Found an issue?**

1. Note error message and status code
2. Check [UPLOAD_SAFETY.md#troubleshooting](./UPLOAD_SAFETY.md#troubleshooting)
3. Run: `node scripts/verifyUploadSystem.js`
4. Share logs with team

---

**Happy uploading! 🎉**
