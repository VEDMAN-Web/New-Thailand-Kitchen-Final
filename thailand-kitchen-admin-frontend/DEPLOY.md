# Deploy TRUSTPRIME admin separately from the public site.

## Apps
| App | Folder | Port (local) | Deploy root |
|-----|--------|--------------|-------------|
| Website | `client/` | 3000 | Vercel root = `client` |
| Admin | `admin/` | 3001 | Vercel root = `admin` |
| API | `server/` | 5000 | Vercel/Railway/Render root = `server` |

## 1) Deploy API (`server`)
1. Set env vars from `server/.env.example`:
   - `MONGO_URI` (same Atlas DB as website)
   - `JWT_SECRET` (long random string)
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD`
   - `ADMIN_URL` = your admin domain
   - `CLIENT_URL` = your website domain
   - `CORS_ORIGINS` = both domains comma-separated
2. Start command: `npm start`
3. Seed is automatic on boot (creates default admin if missing).
4. Health check: `GET /api/health`

Default login:
- Email: `admin@thailandkitchens.com`
- Password: `admin123`

## 2) Deploy Admin (`admin`)
1. Framework: Next.js
2. Env:
   - `NEXT_PUBLIC_API_URL=https://YOUR-API-DOMAIN/api`
3. Build: `npm run build`
4. Start: `npm start` (port 3001 locally)

## 3) Connect Website (`client`) optional CMS read
1. Keep existing `MONGO_URI` for contact/catalog Next routes.
2. Add:
   - `NEXT_PUBLIC_CMS_API_URL=https://YOUR-API-DOMAIN/api`
3. Website falls back to static content if CMS is empty/offline.

## Local run
```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd admin && npm run dev

# terminal 3
cd client && npm run dev
```

## Admin features (all hit `/api`)
- Auth: `/api/auth/login`, `/me`, `/users`
- CMS: `/api/cms/:siteId/{home,categories,products,blogs,legal}`
- Contacts: `/api/contact/get` (JWT), website posts stay public on `/api/contact/post`
