# Server API deploy

Express backend for TRUSTPRIME admin + public CMS reads + contacts.

## Env
Copy `.env.example` → `.env` / host env:

| Key | Required | Notes |
|-----|----------|-------|
| `MONGO_URI` | yes | Same Atlas cluster as website |
| `MONGO_DB_NAME` | yes | Use `thailandKitchen` (must match client) |
| `JWT_SECRET` | yes | Long random string |
| `ADMIN_EMAIL` | yes | Default login email |
| `ADMIN_PASSWORD` | yes | Default login password |
| `ADMIN_URL` | yes | Deployed admin origin |
| `CLIENT_URL` | yes | Deployed website origin |
| `CORS_ORIGINS` | yes | Comma-separated admin + client URLs |
| `PORT` | no | Default `5000` |

## Scripts
- `npm run dev` — local with nodemon
- `npm start` — production
- `npm run seed:admin` — create admin if missing (also auto on boot)

## Endpoints
- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me` (JWT)
- `GET|POST|DELETE /api/auth/users` (JWT)
- `GET /api/cms/sites`
- `GET|PUT /api/cms/:siteId/home` (+ reset)
- CRUD `/api/cms/:siteId/{categories,products,blogs}`
- `GET|PUT /api/cms/:siteId/legal/:type`
- `POST /api/contact/post` (public)
- `GET|DELETE /api/contact/*` (JWT)

## Separate deploy notes
1. Deploy this API first and confirm `/api/health`.
2. Point admin `NEXT_PUBLIC_API_URL` to `https://API/api`.
3. Point website `NEXT_PUBLIC_CMS_API_URL` to the same API.
4. Keep website `MONGO_URI` + `MONGO_DB_NAME=thailandKitchen` for contact forms (`contacts` collection).
