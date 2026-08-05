# Deploy Thailand Kitchens (Frontend) on Vercel

## 1. Import project
- Repo: `SparkbetaT/ThailandKitchens`
- **Root Directory:** `client`
- Framework: Next.js (auto)

## 2. Environment Variables (Production + Preview)

| Name | Value |
|------|--------|
| `MONGO_URI` | Your MongoDB Atlas URI |
| `MONGO_DB_NAME` | `thailandKitchen` |
| `NEXT_PUBLIC_API_URL` | `/api` |

## 3. MongoDB Atlas
1. Create a free cluster
2. Database Access → user with read/write
3. Network Access → Allow from Anywhere (`0.0.0.0/0`)
4. Connect → Drivers → copy URI into `MONGO_URI`

## 4. Deploy
Click Deploy. After deploy, open:

`https://YOUR-APP.vercel.app/api/contact/health`

Expect: `{ "ok": true, "mongoConfigured": true }`

## 5. Contact form
Uses same-origin `POST /api/contact/post` (built into Next.js).  
No separate Express server is required for the contact form.

## Local
```bash
cd client
cp .env.example .env.local
# fill MONGO_URI
npm install
npm run dev
```
