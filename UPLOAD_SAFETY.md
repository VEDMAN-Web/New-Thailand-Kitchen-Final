# Thailand Kitchen Backend — Upload Safety System

## Overview

This document describes the production-safe file/image upload handling system implemented in the Thailand Kitchen backend. The system prioritizes **server stability and resource protection** over maximum throughput.

## Architecture

### Deployment Context

- **Platform**: Vercel serverless (Node.js functions)
- **Storage**: Local disk (`/uploads`) + optional Cloudinary CDN
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT bearer tokens
- **No Redis**: Distributed state is not available

### Key Constraints (Serverless)

1. **Isolated Function Instances**: Each HTTP request may run in a separate isolated Node.js process
2. **No Shared Memory**: In-memory global state cannot be relied upon across requests
3. **Cold Starts**: Functions may need to initialize on each invocation
4. **Function Timeout**: Vercel has a 60-second function timeout; uploads must complete within this window

## Protection Layers

### 1. Authentication & Authorization

All upload endpoints require JWT authentication (`Authorization: Bearer <token>`).

```
POST /api/upload
POST /api/upload
DELETE /api/upload
POST /api/cms/{siteId}/blogs/generate-ai-image
```

### 2. Request Timeout

Each upload request has an explicit timeout to prevent hanging connections.

**Configuration**:

```env
UPLOAD_TIMEOUT_MS=600000  # 10 minutes (default)
```

**Behavior**:

- If upload exceeds timeout, the request is terminated
- Temporary files are cleaned up
- Client receives HTTP 408 (Request Timeout)
- Concurrency slot is released

### 3. Rate Limiting (Per-User/IP)

Uploads are rate-limited to prevent abuse and resource exhaustion.

**Configuration**:

```env
UPLOAD_RATE_LIMIT=10              # max requests per window
UPLOAD_RATE_WINDOW_SECONDS=60     # window size in seconds
AI_IMAGE_RATE_LIMIT=5             # separate limit for AI image generation
AI_IMAGE_RATE_WINDOW_SECONDS=60
```

**Behavior**:

- Tracked per authenticated user ID or per IP
- Returns HTTP 429 (Too Many Requests) when exceeded
- Includes `X-RateLimit-*` headers in response
- Separate limits for normal uploads vs. AI image generation

**Limitations**:

- Rate limit state is **per-instance** only (in-memory)
- On Vercel serverless with multiple instances, each instance has independent rate limit tracking
- For global rate limiting, use Vercel's built-in rate limiting or a reverse proxy

### 4. Concurrency Control

Limits the number of active uploads being processed simultaneously.

**Configuration**:

```env
UPLOAD_MAX_CONCURRENT=1  # max concurrent uploads per instance
```

**Behavior**:

- Attempts to acquire a slot before processing upload
- If capacity is exceeded, request receives HTTP 429 (Too Many Requests)
- Slot is released after upload completes or on error
- Slot also released if client disconnects

**Limitations**:

- Concurrency limit is **per-instance** only
- On Vercel serverless, each isolated function instance has independent slot tracking
- For global concurrency control across instances, would require distributed state (e.g., Redis)
- **Current implementation safe for single-instance deployments**; for multi-instance, Vercel's function concurrency limits provide implicit protection

### 5. Multipart Parsing Limits

Multer is configured with strict limits to prevent multipart bomb attacks.

**Configuration**:

```env
UPLOAD_MAX_FILE_SIZE_MB=50         # file size limit
UPLOAD_MAX_FIELDS=10               # max form fields
UPLOAD_MAX_PARTS=20                # max multipart sections
UPLOAD_MAX_FIELD_SIZE_KB=100       # max single field size
```

**Behavior**:

- Only one file per request (enforced: `files: 1`)
- Excess fields, parts, or field sizes are rejected with HTTP 400
- File exceeding size limit returns HTTP 413 (Payload Too Large)

### 6. File Type Validation

Allowed file types are strictly defined. Client-provided MIME types are not trusted.

**Allowed Image Types**:

- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/webp`
- `image/gif`
- `image/svg+xml`

**Allowed PDF Types**:

- `application/pdf`
- `application/x-pdf`
- `application/acrobat`

**Allowed Video Types**:

- `video/mp4`
- `video/webm`
- `video/ogg`
- `video/quicktime`
- `video/x-msvideo`

**Behavior**:

- Validation occurs in Multer's `fileFilter` callback
- Rejected files return HTTP 400 with descriptive error
- File type is determined by the `kind` query/body parameter

### 7. Storage Fallback

When Cloudinary is configured, uploads are attempted there first, with local storage as fallback.

**Configuration**:

```env
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Behavior**:

- If Cloudinary is unavailable, local storage is used
- Temporary local file is deleted after successful Cloudinary upload
- If Cloudinary upload fails, local file is kept and used
- PDF cover images are generated locally if Cloudinary is unavailable
- Errors are logged but don't crash the request

### 8. Temporary File Cleanup

Uploaded files are cleaned up immediately after processing.

**Cleanup Scenarios**:

1. **Success (Cloudinary)**: Local file deleted after successful Cloudinary upload
2. **Success (Local)**: File retained in appropriate category folder
3. **Failure**: File deleted in catch/finally block
4. **Error Middleware**: Aborted requests don't leave files behind

**Logging**:

- Cleanup failures are logged with `[upload-cleanup]` prefix
- Not fatal; request completes even if cleanup fails

### 9. Client Abort Handling

When client closes connection before upload completes:

**Behavior**:

- Request is detected via `req.aborted` or socket destruction
- No response is sent (client is already gone)
- Temporary file is cleaned up
- Concurrency slot is released
- No unhandled promise rejection

## Error Responses

Upload errors are sanitized and return appropriate HTTP codes:

| Code | Reason | Example |
|------|--------|---------|
| 400 | Invalid upload | Missing file, wrong type, invalid fields |
| 408 | Timeout | Upload exceeded timeout limit |
| 413 | File too large | File exceeds MAX_FILE_SIZE_MB |
| 429 | Rate limited | Too many requests or capacity exceeded |
| 500 | Internal error | Unexpected server error (sanitized message) |
| 503 | Service unavailable | Cloudinary down, storage unreachable |

**Example Error Response**:

```json
{
  "success": false,
  "code": "UPLOAD_RATE_LIMIT_EXCEEDED",
  "message": "Too many upload requests. Please try again later.",
  "retryAfter": 45
}
```

## Monitoring & Logging

### Structured Logging

Upload events are logged with consistent structure:

```
[upload-start]    request initializing
[upload-accepted] rate/concurrency check passed
[upload-rejected] validation failure
[upload-success]  file saved successfully
[upload-error]    processing failed
[upload-timeout]  request timeout
[upload-cleanup]  temporary file cleanup
[cloudinary-...]  Cloudinary-specific events
```

### Log Fields

- `requestId`: unique request identifier
- `userId`: authenticated user ID
- `fileSize`: uploaded file size in bytes
- `mimeType`: validated MIME type
- `uploadKind`: image, pdf, video, etc.
- `duration`: time taken in milliseconds
- `error`: error message if failed

### No Sensitive Data

Never logged:

- File contents
- Full file paths (relative paths only)
- Cloudinary credentials
- JWT tokens
- User passwords
- Authorization headers

## Health & Availability

### Health Endpoint

The health endpoint remains available during uploads:

```
GET /api/health
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "API OK",
  "env": "production",
  "database": "your-db-name"
}
```

**Guarantee**: Health checks are not blocked by upload activity.

### Normal API Availability

While uploads are processing:

- CMS read endpoints (`GET /api/cms/...`) remain responsive
- Authentication endpoints (`POST /api/auth/...`) remain responsive
- Contact endpoints (`POST /api/contact/...`) remain responsive
- Upload activity does not monopolize Node.js event loop

## Configuration Reference

All upload limits are configurable via environment variables:

```env
# Upload request handling
UPLOAD_TIMEOUT_MS=600000                    # Upload timeout in milliseconds
UPLOAD_MAX_FILE_SIZE_MB=50                  # Maximum file size
UPLOAD_MAX_CONCURRENT=1                     # Max concurrent uploads (per instance)

# Rate limiting
UPLOAD_RATE_LIMIT=10                        # Requests per window
UPLOAD_RATE_WINDOW_SECONDS=60               # Window duration

# Multipart limits
UPLOAD_MAX_FIELDS=10                        # Max form fields
UPLOAD_MAX_PARTS=20                         # Max multipart sections
UPLOAD_MAX_FIELD_SIZE_KB=100                # Max field size

# AI Image Generation
AI_IMAGE_MAX_CONCURRENT=1                   # Max concurrent AI requests
AI_IMAGE_RATE_LIMIT=5                       # Requests per window
AI_IMAGE_RATE_WINDOW_SECONDS=60             # Window duration

# Optional storage
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Deployment Considerations

### Vercel Serverless (Current)

✅ **Supported**:

- Per-request file validation
- Per-request timeout
- Per-request Cloudinary upload
- Concurrency limiting within single function instance
- Rate limiting within single function instance
- File cleanup

⚠️ **Limitations**:

- Concurrency limit is per-instance only
- Rate limit is per-instance only
- No distributed state across function invocations
- Function timeout (60s) must accommodate largest upload + processing

**Recommendation**:

- Keep concurrency limit at 1 for single-instance safety
- Use Vercel's built-in rate limiting at reverse proxy level if needed
- Monitor function timeout via Vercel dashboard
- Consider Cloudinary for distributed storage

### Multi-Instance Deployment (Future)

If deploying to multiple server instances without serverless:

❌ **Current Limitation**:

- In-memory semaphore only protects within-instance concurrency
- Across instances, concurrency is additive (not limited)

✅ **Solution**:

- Add Redis for distributed state
- Update `concurrencyLimiter.js` to use Redis atomic operations
- Update `rateLimiter.js` to use Redis with TTL
- Test with Apache JMeter or `k6` under load

## Testing

### Unit Tests

Run upload system tests:

```bash
npm test tests/upload.test.js
```

Tests cover:

- Configuration validation
- Rate limit tracking
- Concurrency slot acquisition/release
- Path safety
- File size limits
- Multipart limits
- Timeout configuration

### Integration Tests

Test with actual Express app (to be added):

```bash
npm test tests/upload.integration.js
```

### Load Testing

Simulate concurrent uploads:

```bash
npm run test:load
```

See [LOAD_TEST.md](./LOAD_TEST.md) for detailed instructions.

## Troubleshooting

### "Upload capacity exceeded" (HTTP 429)

**Cause**: Concurrency limit reached

**Solution**:

- Increase `UPLOAD_MAX_CONCURRENT` if safe for your deployment
- Ensure clients implement backoff/retry logic
- Monitor upload duration; reduce if taking too long

### "File too large" (HTTP 413)

**Cause**: File exceeds `UPLOAD_MAX_FILE_SIZE_MB`

**Solution**:

- Increase limit if business requirement allows
- Ensure frontend validates file size before upload
- Recommend chunked uploads for larger files

### "Upload timeout" (HTTP 408)

**Cause**: Upload exceeded `UPLOAD_TIMEOUT_MS`

**Solution**:

- Increase timeout if network is slow
- Reduce file size limit
- Check network conditions
- Implement chunked uploads

### Files accumulating in `/uploads`

**Cause**: Cleanup failed or was skipped

**Solution**:

- Check logs for `[upload-cleanup]` warnings
- Verify disk space availability
- Run scheduled cleanup: `find uploads -mtime +7 -delete`
- Consider using Cloudinary exclusively

### Cloudinary upload fails silently

**Cause**: Cloudinary credentials invalid or service unavailable

**Solution**:

- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Check Cloudinary dashboard for quota/billing issues
- Fallback to local storage works; check `/uploads` directory
- Monitor logs for `[upload-cloudinary]` errors

## Security Considerations

### Path Traversal Prevention

- All file paths are normalized and validated
- Paths are relative to `UPLOAD_ROOT`
- Filenames are generated by server (not user-controlled)
- Deletion validates path is within upload directory

### MIME Type Spoofing

- Client-provided MIME types are not fully trusted
- File type determined by `kind` parameter
- Extension-based heuristics as secondary check
- Magic byte validation could be added in future

### DOS Prevention

- File size limits prevent resource exhaustion
- Multipart limits prevent bomb attacks
- Rate limiting prevents request floods
- Timeout prevents hanging connections
- Concurrency control prevents simultaneous upload explosions

### Credential Exposure

- Cloudinary credentials not logged or exposed
- Error messages sanitized; no internal paths
- JWT tokens not logged
- File paths relative, not absolute

## Future Improvements

### Potential Enhancements

1. **Redis Integration**: Distributed rate limiting & concurrency for multi-instance
2. **Chunked Uploads**: Resume capability for large files
3. **Virus Scanning**: Integration with ClamAV or similar
4. **Image Optimization**: Automatic resizing/compression on upload
5. **S3 Support**: Alternative to local disk + Cloudinary
6. **Upload Analytics**: Dashboard for upload metrics
7. **Idempotency**: Prevent duplicate uploads via key-based deduplication
8. **Orphan Cleanup**: Scheduled job for temp file cleanup

## References

- [Multer Documentation](https://github.com/expressjs/multer)
- [OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [Vercel Node.js Function Limits](https://vercel.com/docs/functions/limitations)

## Questions & Support

For issues or questions about the upload system:

1. Check logs for `[upload-*]` prefixed messages
2. Review configuration in `.env`
3. Test rate limits with `curl -X POST -H "X-Forwarded-For: 1.1.1.1" ...`
4. Load test with included script
5. Consult this document and code comments
