# Recommendations

## 1. Missing tables / fields (UI does not have them yet)

| Item | Why |
|------|-----|
| `websites` | Hardcoded 2 sites in AdminShell; need 8+ brands without code deploys for structure. |
| `user_websites` | Users are global; multi-brand ops need per-site ACL. |
| `media_assets` | Uploads return bare URLs; no ownership, MIME, or cleanup metadata. |
| `seo_meta` | No meta title/description/OG in any form — required for public SEO. |
| `audit_logs` | No “who changed home section X”. |
| `pages` + `section_types` | Home is one Mixed blob; hard to query/order/publish per section. |
| Soft delete (`deleted_at`) | UI deletes permanently. |
| `created_by` / `updated_by` | Design rule; not in current Mongo CMS models. |
| Product → Category FK | UI category is free text — causes duplicates across products. |
| Contact `website_id` + `source` | Leads from catalogue vs contact page are mixed. |
| `is_published` on gallery/categories | Only blogs have a publish toggle in UI. |
| `sort_order` UI controls | Models have sortOrder; gallery/catalogue/faq forms do not expose it. |

---

## 2. Reusable architecture

1. **Single schema, many tenants** — always filter by `website_id`. Never create `products_phuket` tables.
2. **Media hub** — all Upload buttons write `media_assets`; entities store UUIDs only.
3. **Section pattern** — `page_sections` (1 per type) + `section_items` (N rows) covers hero scalars and list UIs (stats, FAQ, partners) without new tables per section.
4. **Lookup tables** — `roles`, `gallery_filters`, `section_types` are shared masters; tenant content references them.
5. **Soft delete + publish** — list APIs: `WHERE deleted_at IS NULL AND is_published = TRUE`.
6. **Unique per tenant** — `(website_id, slug)` on products/blogs; `(website_id, legal_type)` on legal.
7. **JSONB escape hatch** — `page_sections.settings` / `section_items.extra` for rare fields without migrations.
8. **API contract** — keep current admin routes; map DTOs to SQL behind the service layer so the UI need not be redesigned.

---

## 3. Future scalability

| Scale need | Approach |
|------------|----------|
| +4 Kitchen websites | `INSERT websites`; seed default `pages` + `page_sections` via template job |
| Varsovia.design different IA | Same tables; different `section_items` / optional `settings` JSON |
| Multi-language | Add `translations (entity_type, entity_id, locale, field, value)` later — no tenant redesign |
| CDN / Cloudinary | Already modeled on `media_assets.storage` + `public_id` |
| High read traffic | Read replicas; materialize public JSON cache per `website.code` |
| Editor permissions | Expand `roles` + optional `permissions` table; gate by `user_websites` |
| Analytics | Separate warehouse; keep `contact_leads` / `audit_logs` operational |

---

## 4. Migration path from current Mongo

1. Create PostgreSQL with `schema.sql`.
2. Seed `websites` for existing `thailand-kitchen` / `varsovia-kitchen` (+ Pattaya, Phuket stubs).
3. Migrate users → `users` + attach all sites via `user_websites` for admins.
4. For each site home Mixed doc → `pages(home)` + normalize sections/items.
5. Categories / products / blogs / gallery / legal → SQL with media URL → `media_assets` rows.
6. Contacts → `contact_leads` (`website_id` null until inferred).
7. Point API at SQL; keep admin UI forms unchanged.

---

## 5. Assumptions log

| Topic | Assumption |
|-------|------------|
| DB engine | PostgreSQL 14+ (production). Current app uses MongoDB — this file is the **target** schema. |
| Pattaya / Phuket codes | `pattaya-kitchen`, `phuket-kitchen` (align naming with existing `*-kitchen` codes). |
| Varsovia | `varsovia-kitchen` code kept for API compatibility; display name `Varsovia.design`. |
| Catalogue dual storage | Dedicated `catalogue_items` preferred; Home UI can still edit via API that writes that table. |
| FAQ dual storage | Same as catalogue with `faq_items`. |
| Hero video | Stored as URL string and/or `media_assets.kind = 'video'`. |
| WhatsApp vs LINE in footer | UI label “LINE”; column `line_url` — may store LINE or WhatsApp link depending on brand. |

---

## 6. File index

| File | Contents |
|------|----------|
| `entities.md` | Entity list + UI map |
| `schema.sql` | Full `CREATE TABLE` + seeds |
| `er-diagram.md` | Mermaid ER diagram |
| `relationships.md` | FKs + cardinality |
| `modules.md` | Module-wise mapping |
| `recommendations.md` | This document |
