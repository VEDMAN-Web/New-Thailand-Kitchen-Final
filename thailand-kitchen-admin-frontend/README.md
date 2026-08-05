# Varsovia Design

Marketing website and REST API for **Varsovia Kitchen** — a multilingual luxury interiors brand site with CMS-style content managed through an external admin panel.

| Service | Folder | Port | Stack |
|---------|--------|------|-------|
| **Frontend** | `Varsovia-frontend/` | 3000 | Next.js 16, React 19, Tailwind CSS 4, next-intl |
| **Backend** | `Varsovia-Backend/` | 5000 | Express 5, MongoDB, Zod validation |

**Repository:** [VEDMAN-Web/varsovia.design](https://github.com/VEDMAN-Web/varsovia.design)  
Branches: `main`, `frontend`, `backend`

---

## Table of contents

1. [Quick start](#1-quick-start)
2. [Environment variables](#2-environment-variables)
3. [Internationalization (i18n)](#3-internationalization-i18n)
4. [External admin panel — full guide](#4-external-admin-panel--full-guide)
   - [4.5 Complete dynamic content inventory](#45-complete-dynamic-content-inventory)
   - [4.6 How to READ all content](#46-how-to-read-all-content-admin)
   - [4.7 How to SEND / WRITE all content](#47-how-to-send--write-all-content-admin)
   - [4.8 Complete field reference](#48-complete-field-reference-every-resource)
   - [4.9 Full send examples](#49-full-send-examples-copy-paste-for-every-resource)
5. [API reference](#5-api-reference)
6. [Built-in admin page](#6-built-in-admin-page)
7. [Database seeding](#7-database-seeding)
8. [Media assets](#8-media-assets)
9. [Production deployment](#9-production-deployment)
10. [Troubleshooting](#10-troubleshooting)
11. [Project structure](#11-project-structure)

---

## 1. Quick start

### Prerequisites

- Node.js 20+
- npm
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Terminal 1 — Backend

```bash
cd Varsovia-Backend
cp .env.example .env
npm install
npm run dev
```

Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

On first boot with an empty database, content is auto-seeded via `src/seed/seedIfEmpty.js`.

### Terminal 2 — Frontend

```bash
cd Varsovia-frontend
cp .env.example .env.local
npm install
npm run dev
```

Site: [http://localhost:3000/en](http://localhost:3000/en) (default locale redirects to `/en`)

### Production build

```bash
# Frontend
cd Varsovia-frontend && npm run build && npm run start

# Backend
cd Varsovia-Backend && npm start
```

---

## 2. Environment variables

### Backend — `Varsovia-Backend/.env`

```env
MONGODB_URI=mongodb://127.0.0.1:27017/varsovia-kitchen
PORT=5000
CLIENT_URL=http://localhost:3000
ADMIN_KEY=<your-secret-key>
```

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (Atlas or local) |
| `PORT` | API port (default `5000`) |
| `CLIENT_URL` | Comma-separated allowed frontend origins for CORS |
| `ADMIN_KEY` | Secret for admin API access (sent as `x-admin-key` header) |

Generate a strong admin key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Production `CLIENT_URL` example:**

```env
CLIENT_URL=https://varsoviadesign.com,https://www.varsoviadesign.com,https://admin.yourdomain.com
```

Include your external admin panel origin here if it runs in the browser on a different domain.

### Frontend — `Varsovia-frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Both must be set at **build time** in production (Vercel env panel, etc.):

```env
NEXT_PUBLIC_API_URL=https://api.varsoviadesign.com/api
NEXT_PUBLIC_SITE_URL=https://varsoviadesign.com
```

---

## 3. Internationalization (i18n)

The public site supports three locales:

| Code | Language | URL prefix |
|------|----------|------------|
| `en` | English | `/en/...` |
| `th` | Thai | `/th/...` |
| `pl` | Polish | `/pl/...` |

### How it works

- **UI strings** (navigation, buttons, form labels, static page copy) live in `Varsovia-frontend/messages/{en,th,pl}.json` and are managed in code.
- **CMS content** (products, blogs, FAQs, hero text, etc.) is stored in MongoDB and managed through the API. Text fields accept either a plain string or a `{ en, th, pl }` object (see [Section 4](#4-external-admin-panel--full-guide)).
- The frontend passes `?locale=` and `Accept-Language` on API requests so the backend returns content in the active language.
- `/admin` is excluded from locale routing and has no language prefix.

### Public routes (under `/[locale]/`)

| Page | Path |
|------|------|
| Home | `/` |
| About | `/about` |
| Contact | `/contact` |
| FAQ | `/faq` |
| Blog list & detail | `/blog`, `/blog/[id]` |
| Team | `/team` |
| Showcase list & detail | `/showcase`, `/showcase/[id]` |
| Interior catalog | `/interior`, `/interior/[id]` |
| Product detail | `/product/[slug]` |
| Catalogue | `/catalogue` |
| Quality & after-sales | `/quality-sale` |

---

## 4. External admin panel — full guide

Content is **not** edited inside this repo’s UI (except contact leads). Your separate admin panel talks to the backend API using the `x-admin-key` header.

### 4.1 Authentication

Every **write** request (POST, PUT, PATCH, DELETE) requires:

```http
x-admin-key: YOUR_ADMIN_KEY
Content-Type: application/json
```

The key must match `ADMIN_KEY` in `Varsovia-Backend/.env`.

**Read for editing:** Send the same `x-admin-key` header on GET requests to receive **raw multilingual objects** (all `{ en, th, pl }` fields intact).

**Public site reads:** GET without `x-admin-key` returns text already resolved to one language (via `?locale=en|th|pl` or `Accept-Language` header).

### 4.2 Multilingual field format

Supported locales: **`en`**, **`th`**, **`pl`**.

#### Option A — Full translation object (recommended)

```json
{
  "title": {
    "en": "Modern Kitchen",
    "th": "ครัวสมัยใหม่",
    "pl": "Nowoczesna kuchnia"
  }
}
```

#### Option B — Plain string (legacy / English-only)

```json
{
  "title": "Modern Kitchen"
}
```

A plain string is treated as English and returned for all locales until you migrate it to an object.

#### Validation rules

| Rule | Detail |
|------|--------|
| Required text on **create** | `en` must be present when using an object; or send a non-empty plain string |
| Optional locales | `th` and `pl` may be omitted; site falls back to `en` |
| Max length | 50,000 characters per locale string |
| Non-translated fields | URLs, slugs, images, booleans, numbers, enums — send as normal JSON values |

#### Nested localized fields (site content only)

```json
{
  "vision": {
    "title": { "en": "Our Vision", "th": "...", "pl": "..." },
    "text": { "en": "...", "th": "...", "pl": "..." }
  },
  "stats": [
    { "value": { "en": "500+" }, "label": { "en": "Projects", "th": "...", "pl": "..." } }
  ],
  "processSteps": [
    { "step": "01", "title": { "en": "Consultation" }, "text": { "en": "..." } }
  ]
}
```

### 4.3 Public vs admin API responses

| Request | Response |
|---------|----------|
| `GET /api/faqs?locale=th` | `{ "question": "ข้อความภาษาไทย", ... }` — single strings |
| `GET /api/faqs` + `x-admin-key` | `{ "question": { "en": "...", "th": "...", "pl": "..." }, ... }` — raw objects |

Same behavior applies to `/api/site`, `/api/home`, `/api/products`, `/api/blogs`, etc.

### 4.4 Typical admin workflow

```
┌─────────────────┐     GET + x-admin-key      ┌──────────────────┐
│  Admin Panel    │ ─────────────────────────► │  Backend API     │
│  (your app)     │ ◄───────────────────────── │  (raw {en,th,pl})│
└─────────────────┘                            └──────────────────┘
         │
         │  User edits EN / TH / PL tabs
         ▼
┌─────────────────┐     PUT/POST + x-admin-key ┌──────────────────┐
│  Admin Panel    │ ─────────────────────────► │  MongoDB         │
└─────────────────┘                            └──────────────────┘
                                                        │
                                                        ▼
                                               ┌──────────────────┐
                                               │  Public site     │
                                               │  GET ?locale=th  │
                                               │  → Thai strings  │
                                               └──────────────────┘
```

1. **Load** — `GET` the resource with `x-admin-key` to receive full locale objects for the edit form.
2. **Edit** — Show EN / TH / PL fields in your UI; build the JSON body with `{ en, th, pl }` objects.
3. **Save** — `POST` (create) or `PUT` (update) with `x-admin-key` and `Content-Type: application/json`.
4. **Verify** — `GET` the same public URL with `?locale=th` (no admin key) and confirm the Thai text appears.

### 4.5 Complete dynamic content inventory

Everything below is stored in **MongoDB** and managed through the API.  
**Not API-managed:** UI labels and static page chrome in `Varsovia-frontend/messages/{en,th,pl}.json` (nav, buttons, quality-sale page copy, etc.) — those are edited in code, not via admin API.

| # | Content | Shown on website | Admin READ (GET + `x-admin-key`) | Admin WRITE |
|---|---------|------------------|----------------------------------|-------------|
| 1 | **Site settings** | Home hero, About, Contact, Footer (all locales) | `GET /site` | `PUT /site` |
| 2 | **Home bundle** | Home page (site + featured lists) | `GET /home` | Use rows 1–8 below |
| 3 | **Products** | Home, `/product/[slug]` | `GET /products`, `GET /products/:slug` | `POST/PUT/DELETE /products/:id` |
| 4 | **Projects** | Home featured, `/interior`, `/interior/[id]` | `GET /projects`, `GET /projects/:id` | `POST/PUT/DELETE /projects/:id` |
| 5 | **Blogs** | `/blog`, `/blog/[id]` | `GET /blogs`, `GET /blogs/:id` | `POST/PUT/DELETE /blogs/:id` |
| 6 | **FAQs** | `/faq` | `GET /faqs` | `POST/PUT/DELETE /faqs/:id` |
| 7 | **Testimonials** | Home testimonials carousel | `GET /testimonials` | `POST/PUT/DELETE /testimonials/:id` |
| 8 | **Catalogues** | Home + `/catalogue` | `GET /catalogues` | `POST/PUT/DELETE /catalogues/:id` |
| 9 | **Showcases** | `/showcase`, `/showcase/[id]` | `GET /showcases` | `POST/PUT/DELETE /showcases/:id` |
| 10 | **Team members** | `/team` | `GET /team` | `POST/PUT/DELETE /team-members/:id` |
| 11 | **Partners** | Stored in API (`GET /home` includes them)* | `GET /partners` | `POST/PUT/DELETE /partners/:id` |
| 12 | **Showrooms** | API-ready (component exists) | `GET /showrooms` | `POST/PUT/DELETE /showrooms/:id` |
| 13 | **Contact leads** | `/admin` inbox only | `GET /contacts` | `PATCH /contacts/:id` (status only) |

\*Partner **names** come from the API, but the homepage partner **logos** are currently hardcoded SVGs in the frontend. Updating partner records still matters if you wire logos to the API later.

**Important:** Public list URL for team is `GET /team`, but create/update/delete use `/team-members` (with a hyphen).

---

### 4.6 How to READ all content (admin)

Use the same header on every read request:

```http
x-admin-key: YOUR_ADMIN_KEY
```

Do **not** pass `?locale=` when loading data for your edit forms — you need the full `{ en, th, pl }` objects.

#### Read cheat sheet

| What you need | Request | Response shape |
|---------------|---------|----------------|
| Entire site copy (hero, about, footer…) | `GET /site` | Single object |
| Dashboard bundle (site + products + projects + testimonials + catalogues + partners + showrooms) | `GET /home` | `{ site, products, projects, testimonials, catalogues, partners, showrooms }` |
| All products | `GET /products` | Array of products |
| One product | `GET /products/:slugOrId` | Single product |
| All interior projects | `GET /projects` | Array of projects |
| One project | `GET /projects/:idOrSlug` | Single project |
| All blogs | `GET /blogs` | Array of blogs |
| One blog | `GET /blogs/:mongoIdOrOrderNumber` | Single blog |
| All FAQs | `GET /faqs` | Array of FAQs |
| All testimonials | `GET /testimonials` | Array |
| All catalogues | `GET /catalogues` | Array |
| All showcases | `GET /showcases` | Array (use `_id` for detail page URLs) |
| All team members | `GET /team` | Array |
| All partners | `GET /partners` | Array |
| All showrooms | `GET /showrooms` | Array |
| Contact form submissions | `GET /contacts` | Array (admin-only route) |

#### Pagination (optional on list endpoints)

```http
GET /products?page=1&limit=20
x-admin-key: YOUR_ADMIN_KEY
```

Response:

```json
{
  "data": [ /* raw multilingual items */ ],
  "pagination": { "total": 42, "page": 1, "limit": 20, "totalPages": 3, "hasNext": true, "hasPrev": false }
}
```

Without `page` and `limit`, lists return a plain array.

#### Example — load everything for an admin dashboard

```bash
# One call for homepage-related content
curl "http://localhost:5000/api/home" -H "x-admin-key: YOUR_ADMIN_KEY"

# Or load each section separately
curl "http://localhost:5000/api/site" -H "x-admin-key: YOUR_ADMIN_KEY"
curl "http://localhost:5000/api/faqs" -H "x-admin-key: YOUR_ADMIN_KEY"
curl "http://localhost:5000/api/showcases" -H "x-admin-key: YOUR_ADMIN_KEY"
curl "http://localhost:5000/api/team" -H "x-admin-key: YOUR_ADMIN_KEY"
curl "http://localhost:5000/api/contacts" -H "x-admin-key: YOUR_ADMIN_KEY"
```

#### Example — admin read response (raw multilingual)

```json
{
  "_id": "679abc123...",
  "question": {
    "en": "How long does installation take?",
    "th": "การติดตั้งใช้เวลานานแค่ไหน?",
    "pl": "Ile trwa instalacja?"
  },
  "answer": {
    "en": "Typically 2–4 weeks.",
    "th": "...",
    "pl": "..."
  },
  "category": { "en": "Kitchen Interior" },
  "order": 1,
  "createdAt": "2026-01-15T10:00:00.000Z",
  "updatedAt": "2026-01-15T10:00:00.000Z"
}
```

Save the `_id` from each item — you need it for `PUT` and `DELETE`.

#### Verify what the public site shows (after saving)

```bash
curl "http://localhost:5000/api/faqs?locale=th"
# No x-admin-key → strings already resolved to Thai
```

---

### 4.7 How to SEND / WRITE all content (admin)

| Action | Method | Path | Body |
|--------|--------|------|------|
| Update site copy | `PUT` | `/site` | Partial or full site object (see 4.9) |
| Create item | `POST` | `/{resource}` | Full create payload |
| Update item | `PUT` | `/{resource}/:id` | Partial or full fields |
| Delete item | `DELETE` | `/{resource}/:id` | *(no body)* |
| Update lead status | `PATCH` | `/contacts/:id` | `{ "status": "new" \| "contacted" \| "closed" }` |

**Resources for POST/PUT/DELETE:** `products`, `projects`, `blogs`, `faqs`, `testimonials`, `catalogues`, `showcases`, `team-members`, `partners`, `showrooms`.

**Rules:**

- `PUT /site` upserts the single document with `key: "main"` — send only fields you want to change.
- `PUT /{resource}/:id` accepts partial updates (only changed fields).
- On **create**, required text fields need `en` in `{ en, th, pl }` or a plain string.
- Image paths are site-relative, e.g. `"/home/product/product-1.png"`.
- `slug` on products/projects should be URL-safe (used in public URLs).

---

### 4.8 Complete field reference (every resource)

Legend: **L** = localized (`string` or `{ en, th, pl }`), **S** = plain string/number/boolean (same all locales).

#### Site — `PUT /site` (single document, no `_id` in URL)

| Field | Type | Notes |
|-------|------|-------|
| `heroEyebrow` | L | Top line above headline |
| `heroHeadline` | L | Main hero title |
| `heroSubtitle` | L | Hero subtext |
| `heroImage` | S | e.g. `"/home/home-front-page.png"` |
| `heroPrimaryCtaLabel` | L | Primary button text |
| `heroPrimaryCtaHref` | S | e.g. `"#products"` or `"/en/contact"` |
| `heroSecondaryCtaLabel` | L | Secondary button text |
| `heroSecondaryCtaHref` | S | Secondary button link |
| `aboutTitle` | L | About section title |
| `aboutText` | L | About body (home) |
| `aboutIntro` | L | About page intro |
| `aboutStory` | L | About page story |
| `aboutHeroSubtitle` | L | About page subtitle |
| `aboutImages` | S[] | Array of image paths |
| `stats` | array | `[{ value: L, label: L }, ...]` |
| `statsImage` | S | Stats section image |
| `vision` | object | `{ title: L, text: L }` |
| `mission` | object | `{ title: L, text: L }` |
| `values` | object | `{ title: L, text: L }` |
| `processSteps` | array | `[{ step: S, title: L, text: L }, ...]` |
| `contactImages` | S[] | Contact page gallery |
| `footerBio` | L | Footer description |
| `phone` | S | Contact phone |
| `email` | S | Contact email |
| `address` | L | Contact address |

#### Product — `/products`

| Field | Type | Required on create |
|-------|------|-------------------|
| `title` | L | Yes |
| `slug` | S | No (auto from title if omitted) |
| `description` | L | No |
| `image` | S | No |
| `category` | S | No (default `"Kitchen"`) |
| `featured` | boolean | No |
| `order` | number | No |

#### Project — `/projects` (interior catalog)

| Field | Type | Required on create |
|-------|------|-------------------|
| `title` | L | Yes |
| `slug` | S | No |
| `description` | L | No |
| `location` | L | No |
| `coverImage` | S | No |
| `gallery` | S[] | No |
| `category` | S | No — one of: `Kitchen`, `Bedroom`, `Bathroom`, `Door & Windows`, `Whole House Solutions`, `Furniture` |
| `featured` | boolean | No |
| `interiorCatalog` | boolean | No (default `true` — must be `true` to appear on `/interior`) |
| `subcategory` | S | No |
| `shape`, `style`, `color`, `material`, `finish` | S | No (filter metadata) |
| `price` | number | No |
| `isNew` | boolean | No |
| `order` | number | No |

#### Blog — `/blogs`

| Field | Type | Required on create |
|-------|------|-------------------|
| `title` | L | Yes |
| `excerpt` | L | No |
| `content` | L | No |
| `date` | S | No e.g. `"12 Jun 2026"` |
| `readTime` | L | No |
| `author.name` | L | No |
| `author.avatar` | S | No |
| `image` | S | No |
| `views` | number | No |
| `order` | number | No — also used as public URL fallback (`/blog/1`) |

#### FAQ — `/faqs`

| Field | Type | Required on create |
|-------|------|-------------------|
| `question` | L | Yes |
| `answer` | L | Yes |
| `category` | L | No (e.g. `"Kitchen Interior"`, `"Bedroom Interior"`) |
| `order` | number | No |

#### Testimonial — `/testimonials`

| Field | Type | Required on create |
|-------|------|-------------------|
| `name` | L | Yes |
| `role` | L | No |
| `quote` | L | Yes |
| `rating` | number 1–5 | No |
| `image` | S | No |
| `order` | number | No |

#### Catalogue — `/catalogues`

| Field | Type | Required on create |
|-------|------|-------------------|
| `title` | L | Yes |
| `coverImage` | S | No |
| `downloadUrl` | S | No (PDF or external link) |
| `order` | number | No |

#### Showcase — `/showcases`

| Field | Type | Required on create |
|-------|------|-------------------|
| `title` | L | Yes |
| `category` | L | No — tab filter: `Home case`, `Commercial Project`, `Europe`, `Asia`, `North America`, `Middle East` |
| `image` | S | No |
| `location` | L | No |
| `typeLabel` | L | No (default `"Type"`) |
| `typeValue` | L | No e.g. `"Villa(1 Floor)"` |
| `supplyArea` | L | No e.g. `"Kitchen, Bedroom, Living Room"` |
| `gallery` | S[] | No |
| `order` | number | No |

Public detail URL uses MongoDB `_id`: `/en/showcase/679abc...`

#### Team member — `/team-members` (read via `GET /team`)

| Field | Type | Required on create |
|-------|------|-------------------|
| `name` | L | Yes |
| `role` | L | No |
| `image` | S | No |
| `teamType` | S | No — `"Italian"` or `"Headquarter"` |
| `order` | number | No |

#### Partner — `/partners`

| Field | Type | Required on create |
|-------|------|-------------------|
| `name` | L | Yes |
| `logo` | S | No |
| `website` | S | No |
| `order` | number | No |

#### Showroom — `/showrooms`

| Field | Type | Required on create |
|-------|------|-------------------|
| `name` | L | Yes |
| `location` | L | No |
| `image` | S | No |
| `address` | L | No |
| `order` | number | No |

#### Contact lead — `/contacts` (read-only content from users)

| Field | Type | Notes |
|-------|------|-------|
| `name`, `email`, `phone` | S | Required when user submits form |
| `whatsapp`, `city`, `country`, `projectType`, `budget`, `message` | S | Optional from form |
| `status` | S | Admin sets via PATCH: `new`, `contacted`, `closed` |

Users submit via public `POST /contact` (no admin key). Admin reads via `GET /contacts`.

---

### 4.9 Full send examples (copy-paste for every resource)

Base URL: `http://localhost:5000/api` — replace `YOUR_ADMIN_KEY` and `MONGODB_ID`.

#### 1. Site — complete update

```bash
curl -X PUT "http://localhost:5000/api/site" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "heroEyebrow": { "en": "VARSOVIA DESIGN", "th": "...", "pl": "..." },
    "heroHeadline": { "en": "Crafted for Life", "th": "...", "pl": "..." },
    "heroSubtitle": { "en": "Italian kitchens, tailored to your home", "th": "...", "pl": "..." },
    "heroImage": "/home/home-front-page.png",
    "heroPrimaryCtaLabel": { "en": "Explore Kitchens", "th": "...", "pl": "..." },
    "heroPrimaryCtaHref": "#products",
    "heroSecondaryCtaLabel": { "en": "Free Consultation", "th": "...", "pl": "..." },
    "heroSecondaryCtaHref": "#contact",
    "aboutTitle": { "en": "ABOUT VARSOVIA", "th": "...", "pl": "..." },
    "aboutText": { "en": "Short about text for home.", "th": "...", "pl": "..." },
    "aboutIntro": { "en": "About page intro.", "th": "...", "pl": "..." },
    "aboutStory": { "en": "Longer brand story.", "th": "...", "pl": "..." },
    "aboutHeroSubtitle": { "en": "TWELVE YEARS OF ROOMS BUILT TO LAST", "th": "...", "pl": "..." },
    "aboutImages": ["/home/about-1.png", "/home/about-2.png"],
    "stats": [
      { "value": { "en": "+12", "th": "...", "pl": "..." }, "label": { "en": "Years Experience", "th": "...", "pl": "..." } }
    ],
    "statsImage": "/home/counting.png",
    "vision": { "title": { "en": "Our Vision", "th": "...", "pl": "..." }, "text": { "en": "...", "th": "...", "pl": "..." } },
    "mission": { "title": { "en": "Our Mission", "th": "...", "pl": "..." }, "text": { "en": "...", "th": "...", "pl": "..." } },
    "values": { "title": { "en": "Our Values", "th": "...", "pl": "..." }, "text": { "en": "...", "th": "...", "pl": "..." } },
    "processSteps": [
      { "step": "01", "title": { "en": "Consultation", "th": "...", "pl": "..." }, "text": { "en": "...", "th": "...", "pl": "..." } }
    ],
    "contactImages": ["/home/featured-project/feature-1.jpg"],
    "footerBio": { "en": "Premium modular kitchens.", "th": "...", "pl": "..." },
    "phone": "+91 98765 43210",
    "email": "hello@varsoviakitchen.com",
    "address": { "en": "12 Design Avenue, Mumbai", "th": "...", "pl": "..." }
  }'
```

#### 2. Product

```bash
curl -X POST "http://localhost:5000/api/products" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "title": { "en": "Luna Collection", "th": "คอลเลกชัน Luna", "pl": "Kolekcja Luna" },
    "slug": "luna-collection",
    "description": { "en": "Handleless matte finish", "th": "...", "pl": "..." },
    "image": "/home/product/product-1.png",
    "category": "Kitchen",
    "featured": true,
    "order": 1
  }'
```

#### 3. Project (interior)

```bash
curl -X POST "http://localhost:5000/api/projects" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "title": { "en": "Warm Walnut Kitchen", "th": "...", "pl": "..." },
    "slug": "warm-walnut",
    "description": { "en": "Rich walnut tones with marble accents.", "th": "...", "pl": "..." },
    "location": { "en": "Bangalore", "th": "...", "pl": "..." },
    "coverImage": "/home/featured-project/feature-3.jpg",
    "gallery": ["/home/featured-project/feature-3.jpg"],
    "category": "Kitchen",
    "featured": true,
    "interiorCatalog": true,
    "style": "Modern",
    "order": 3
  }'
```

#### 4. Blog

```bash
curl -X POST "http://localhost:5000/api/blogs" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "title": { "en": "Kitchen Trends 2026", "th": "...", "pl": "..." },
    "excerpt": { "en": "Short summary", "th": "...", "pl": "..." },
    "content": { "en": "Full article body...", "th": "...", "pl": "..." },
    "date": "12 Jun 2026",
    "readTime": { "en": "5 min read", "th": "...", "pl": "..." },
    "author": { "name": { "en": "Design Team", "th": "...", "pl": "..." }, "avatar": "/team/team.png" },
    "image": "/blog/blog1.png",
    "views": 0,
    "order": 1
  }'
```

#### 5. FAQ

```bash
curl -X POST "http://localhost:5000/api/faqs" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "question": { "en": "How long does installation take?", "th": "...", "pl": "..." },
    "answer": { "en": "Typically 2–4 weeks.", "th": "...", "pl": "..." },
    "category": { "en": "Kitchen Interior", "th": "...", "pl": "..." },
    "order": 1
  }'
```

#### 6. Testimonial

```bash
curl -X POST "http://localhost:5000/api/testimonials" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "name": { "en": "Ananya Mehta", "th": "...", "pl": "..." },
    "role": { "en": "Homeowner, Mumbai", "th": "...", "pl": "..." },
    "quote": { "en": "Varsovia transformed our kitchen.", "th": "...", "pl": "..." },
    "rating": 5,
    "image": "/team/team.png",
    "order": 1
  }'
```

#### 7. Catalogue

```bash
curl -X POST "http://localhost:5000/api/catalogues" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "title": { "en": "Classic Collection 2026", "th": "...", "pl": "..." },
    "coverImage": "/home/catalog.png",
    "downloadUrl": "https://example.com/catalog.pdf",
    "order": 1
  }'
```

#### 8. Showcase

```bash
curl -X POST "http://localhost:5000/api/showcases" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "title": { "en": "Custom Villa Project", "th": "...", "pl": "..." },
    "category": { "en": "Home case", "th": "...", "pl": "..." },
    "image": "/home/featured-project/feature-1.jpg",
    "location": { "en": "Europe", "th": "...", "pl": "..." },
    "typeLabel": { "en": "Type", "th": "...", "pl": "..." },
    "typeValue": { "en": "Villa(1 Floor)", "th": "...", "pl": "..." },
    "supplyArea": { "en": "Kitchen, Bedroom, Living Room", "th": "...", "pl": "..." },
    "gallery": ["/home/featured-project/feature-1.jpg", "/home/featured-project/feature-2.jpg"],
    "order": 1
  }'
```

#### 9. Team member

```bash
curl -X POST "http://localhost:5000/api/team-members" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "name": { "en": "John Smith", "th": "...", "pl": "..." },
    "role": { "en": "Founder & Creative Director", "th": "...", "pl": "..." },
    "image": "/team/team.png",
    "teamType": "Italian",
    "order": 1
  }'
```

#### 10. Partner

```bash
curl -X POST "http://localhost:5000/api/partners" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "name": { "en": "Hettich", "th": "...", "pl": "..." },
    "logo": "/partners/hettich.svg",
    "website": "https://www.hettich.com",
    "order": 1
  }'
```

#### 11. Showroom

```bash
curl -X POST "http://localhost:5000/api/showrooms" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{
    "name": { "en": "Varsovia Flagship", "th": "...", "pl": "..." },
    "location": { "en": "Bandra, Mumbai", "th": "...", "pl": "..." },
    "image": "/home/about-1.png",
    "address": { "en": "42 Linking Road, Bandra West", "th": "...", "pl": "..." },
    "order": 1
  }'
```

#### 12. Update any item (partial)

```bash
curl -X PUT "http://localhost:5000/api/faqs/MONGODB_ID" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{ "answer": { "en": "Updated answer", "th": "...", "pl": "..." } }'
```

#### 13. Delete any item

```bash
curl -X DELETE "http://localhost:5000/api/products/MONGODB_ID" \
  -H "x-admin-key: YOUR_ADMIN_KEY"
```

#### 14. Contact lead status

```bash
curl -X PATCH "http://localhost:5000/api/contacts/MONGODB_ID" \
  -H "Content-Type: application/json" \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -d '{ "status": "contacted" }'
```

---

### 4.10 Validation errors

Invalid bodies return **422** with structured errors:

```json
{
  "message": "Validation failed.",
  "errors": [
    { "field": "title.en", "message": "String must contain at least 1 character(s)" }
  ]
}
```

Common fixes:

- On **create**, always include `en` inside localized objects (or use a plain string).
- Use `Content-Type: application/json`.
- Check field names match the schemas in `Varsovia-Backend/src/middleware/validate.js`.

### 4.11 JavaScript fetch helper (for your admin app)

```javascript
const API_URL = "http://localhost:5000/api";
const ADMIN_KEY = process.env.ADMIN_KEY;

async function adminRequest(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": ADMIN_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── READ (raw multilingual for edit forms) ──
const site = await adminRequest("/site");
const home = await adminRequest("/home");           // bundle: site + lists
const products = await adminRequest("/products");
const projects = await adminRequest("/projects");
const blogs = await adminRequest("/blogs");
const faqs = await adminRequest("/faqs");
const testimonials = await adminRequest("/testimonials");
const catalogues = await adminRequest("/catalogues");
const showcases = await adminRequest("/showcases");
const team = await adminRequest("/team");           // read path (not /team-members)
const partners = await adminRequest("/partners");
const showrooms = await adminRequest("/showrooms");
const contacts = await adminRequest("/contacts");

// ── WRITE ──
await adminRequest("/faqs", {
  method: "POST",
  body: {
    question: { en: "...", th: "...", pl: "..." },
    answer: { en: "...", th: "...", pl: "..." },
    order: 1,
  },
});

await adminRequest(`/faqs/${faqs[0]._id}`, {
  method: "PUT",
  body: { answer: { en: "Updated", th: "...", pl: "..." } },
});

await adminRequest(`/products/${products[0]._id}`, { method: "DELETE" });
```

### 4.12 CORS note for browser-based admin panels

The backend only allows origins listed in `CLIENT_URL`. Add your admin panel URL to `CLIENT_URL` in production. Allowed request headers: `Content-Type`, `x-admin-key`. Use `?locale=` query params for locale testing rather than custom headers from the browser.

---

## 5. API reference

Base path: `/api`

### Public (no auth)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/home` | Homepage bundle (site + featured content) |
| GET | `/site` | Site-wide copy and settings |
| POST | `/contact` | Submit contact form |
| GET | `/products` | List products |
| GET | `/products/:slug` | Product by slug or ID |
| GET | `/projects` | List projects |
| GET | `/projects/:id` | Project by ID or slug |
| GET | `/blogs` | List blogs |
| GET | `/blogs/:id` | Blog by MongoDB ID or `order` number |
| GET | `/faqs` | List FAQs |
| GET | `/testimonials` | List testimonials |
| GET | `/catalogues` | List catalogues |
| GET | `/showcases` | List showcases (no single-item route — filter by `_id` client-side) |
| GET | `/team` | List team members |
| GET | `/partners` | List partners |
| GET | `/showrooms` | List showrooms |

**Locale:** append `?locale=en|th|pl` or send `Accept-Language: th`.

**Pagination (list endpoints):** `?page=1&limit=20` returns `{ data, pagination }`.

### Admin (requires `x-admin-key`)

| Method | Path | Description |
|--------|------|-------------|
| PUT | `/site` | Update site content |
| GET | `/contacts` | List contact form submissions |
| PATCH | `/contacts/:id` | Update lead status (`new`, `contacted`, etc.) |
| POST | `/{resource}` | Create item |
| PUT | `/{resource}/:id` | Update item |
| DELETE | `/{resource}/:id` | Delete item |

**Admin GET with `x-admin-key`:** All public GET routes above also return raw multilingual data when the admin key header is present (same paths, no extra prefix).

**Resources for CRUD:** `products`, `projects`, `blogs`, `faqs`, `testimonials`, `catalogues`, `showcases`, `team-members`, `partners`, `showrooms`.

---

## 6. Built-in admin page

URL: **`/admin`** on the frontend (no locale prefix).

This page is **contact leads only** — login with your admin key, view submissions, update status. It does **not** edit site content, products, or blogs.

Content management is intended for your **external admin panel** via the API ([Section 4](#4-external-admin-panel--full-guide)).

The built-in page stores the key in `localStorage` and calls the same `x-admin-key` API pattern as your external app.

---

## 7. Database seeding

| Command | When to use |
|---------|-------------|
| Auto on API boot | Empty database — runs `seedIfEmpty.js` automatically |
| `npm run seed` | **Reset everything** — wipes all collections and re-seeds |

```bash
cd Varsovia-Backend
npm run seed
```

Seed data uses plain English strings; the API accepts both plain strings and `{ en, th, pl }` objects.

---

## 8. Media assets

Images are self-hosted under `Varsovia-frontend/public/` (e.g. `/home/`, `/team/`).

Reference paths in API payloads as site-relative URLs:

```json
{ "image": "/home/product/product-1.png" }
```

To re-download placeholder assets:

```powershell
cd Varsovia-frontend
powershell -ExecutionPolicy Bypass -File scripts/download-media.ps1
```

Replace files with brand photography when ready. Static fallbacks in `Varsovia-frontend/lib/fallbackData.ts` keep the site usable if the API is unreachable.

---

## 9. Production deployment

### Checklist

- [ ] `npm run build` passes in `Varsovia-frontend`
- [ ] `NEXT_PUBLIC_API_URL` points to production API (set at build time)
- [ ] `NEXT_PUBLIC_SITE_URL` is the canonical public URL
- [ ] `CLIENT_URL` includes all frontend and admin-panel origins
- [ ] `ADMIN_KEY` is a strong random value (not the example from `.env.example`)
- [ ] MongoDB Atlas network access / IP allowlist configured
- [ ] HTTPS on frontend and API
- [ ] `.env` and `.env.local` are not committed

### Suggested hosting

| Service | Role |
|---------|------|
| Vercel | Frontend (Next.js) |
| Railway / Render / VPS + PM2 | Backend API |
| MongoDB Atlas | Database |

Use a process manager (PM2, systemd) for the backend on a VPS.

---

## 10. Troubleshooting

### Frontend dev: `@swc/helpers` or Turbopack cache errors

```bash
cd Varsovia-frontend
# Stop the dev server first, then:
npm run dev:clean
```

### API returns 401 Unauthorized

- Confirm `x-admin-key` header matches `ADMIN_KEY` in backend `.env`
- Restart the backend after changing `ADMIN_KEY`

### API returns 403 CORS error

- Add your frontend or admin origin to `CLIENT_URL` in backend `.env`
- Origins must match exactly (including `https://` and no trailing slash)

### Content shows in English on `/th` pages

- Ensure the field was saved as `{ en, th, pl }` with Thai text in `th`
- Plain strings display the same text for every locale
- Verify with `GET /api/faqs?locale=th` (no admin key)

### Validation 422 on create

- Required localized fields need `en` when using an object: `{ "en": "text" }`
- Or send a plain string for English-only content

---

## 11. Project structure

```
Varsovia.design/
├── README.md                 ← this file (single project documentation)
├── Varsovia-frontend/
│   ├── app/
│   │   ├── [locale]/         ← public pages (en, th, pl)
│   │   └── admin/            ← contact leads inbox
│   ├── components/
│   ├── lib/
│   │   ├── api.ts            ← API client + adminFetch
│   │   └── i18n/             ← next-intl routing & navigation
│   ├── messages/             ← UI translations (en.json, th.json, pl.json)
│   └── public/               ← static images
└── Varsovia-Backend/
    └── src/
        ├── controllers/apiController.js
        ├── middleware/
        │   ├── adminAuth.js
        │   └── validate.js   ← Zod schemas for all resources
        ├── models/           ← Mongoose models with localized fields
        ├── routes/api.js     ← route definitions
        ├── seed/             ← database seed scripts
        └── utils/locale.js   ← locale resolution helpers
```

### Architecture summary

- Homepage and pages fetch CMS data from the backend API with the active locale.
- UI chrome (nav, footer, forms) comes from `messages/*.json` via next-intl.
- CMS text fields in MongoDB store `{ en, th, pl }` objects (or plain strings for legacy data).
- Public GET requests resolve to one language; admin GET requests return raw objects for editing.
- Contact form posts to `POST /api/contact` and shows a friendly message if the API is unreachable.
