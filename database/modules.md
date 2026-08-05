# Module-wise Schema Explanation

Mapped 1:1 from admin UI modules. Current Mongo collections are noted where they differ.

---

## 1. Website / Tenant switcher

| UI | DB |
|----|-----|
| Site dropdown: Thailand Kitchen, Varsovia Kitchen | `websites` |
| `localStorage.admin_site_id` | `websites.code` |

**Future brands** (Pattaya, Phuket, +4): `INSERT INTO websites (...)` only.

Every CMS query filters `WHERE website_id = :currentTenant`.

---

## 2. Login & Users (`/login`, `/users`)

| UI field | Column |
|----------|--------|
| Email | `users.email` |
| Password | `users.password_hash` |
| Name | `users.name` |
| Role (`admin` \| `editor`) | `users.role_id` → `roles` |
| Cannot delete self | App rule |
| Initials badge | Derived in app (not stored) |

**Addition vs UI:** `user_websites` so an editor can be limited to Phuket only while an admin sees all.

---

## 3. Home Management (`/`)

| UI section key | Storage |
|----------------|---------|
| `hero` | `page_sections` (heading, subheading, body, button_text, media_id, video_url) |
| `statistics` | `section_items` (title=label, value_text, suffix) |
| `advantages` | `section_items` (title, body, icon_media_id) |
| `story` | `page_sections` scalars + media |
| `transition` | `section_items` (pillars) |
| `testimonials` | `section_items` (title=name, subtitle=role, body=quote, media, rating) |
| `catalogue` | Prefer dedicated `catalogue_items`; or `section_items` with pdf_media_id |
| `partners` | `section_items` (title=name, media_id=logo) |
| `faq` | Prefer dedicated `faq_items`; or `section_items` |
| `footer` | `page_sections` email/phone/address/social URLs |

**Assumption:** One `pages` row with `code = 'home'` per website.  
“Update Home Page” = upsert sections + items in a transaction.  
“Reset Page” = reload from seed defaults for that website.

---

## 4. Contacts (`/contacts`)

| UI column | Column |
|-----------|--------|
| Name | `full_name` |
| Email | `email` |
| Phone | `phone_number` (fallback `whatsapp_number`) |
| Message | `message` |
| Date | `created_at` |
| Delete | soft: set `deleted_at` |

**UI gap:** city/country/WhatsApp exist in current Mongo contact model but are not shown — still columns in schema.  
**UI gap:** not site-scoped — schema adds `website_id` + `source` (contact_form / catalogue / consultation).

---

## 5. Categories (`/categories`)

| UI | Column |
|----|--------|
| Title | `title` |
| Description | `description` |
| Image upload | `image_media_id` → `media_assets` |
| *(API has icon, no UI)* | `icon_media_id` reserved |

Unique `(website_id, title)`.

---

## 6. Products (`/products`)

| UI | Column |
|----|--------|
| Title | `title` |
| Slug | `slug` (unique per website) |
| Category text | `category_id` FK *(normalize free-text)* |
| Main Image | `cover_media_id` |
| Icon | `icon_media_id` |
| Gallery URLs | `product_media` rows |
| Product PDF | `pdf_media_id` |
| Description | `description` |
| Featured | `is_featured` |

---

## 7. Gallery (`/gallery`)

| UI | Column |
|----|--------|
| Title | `title` |
| Filter select | `filter_id` → `gallery_filters` |
| Image | `media_id` |
| Tall / Wide | `is_tall`, `is_wide` |
| *(API sortOrder, no UI)* | `sort_order` |

---

## 8. Blogs (`/blogs`)

| UI | Column |
|----|--------|
| Title / Slug | `title`, `slug` |
| Excerpt / Content | `excerpt`, `content` |
| Cover Image | `cover_media_id` |
| Published | `is_published` (+ `published_at`) |

**Reserved (API exists, no UI):** `blog_media`, `category_id`.

---

## 9. Privacy & Terms (`/privacy`, `/terms`)

| UI | Column |
|----|--------|
| Page Title | `legal_pages.title` |
| Content | `legal_pages.content` |
| Route type | `legal_type` IN (`privacy`,`terms`) |

Unique `(website_id, legal_type)` ⇒ one of each per brand.

---

## 10. Media uploads

Every **Upload** button → insert `media_assets` then store FK on parent.

| kind | Used by UI |
|------|------------|
| `image` | Hero, story, products, blogs, gallery, catalogue cover, partners, testimonials |
| `icon` | Advantages, pillars, product icon |
| `pdf` | Catalogue PDF, product PDF |
| `video` | Hero video URL field (URL or uploaded asset) |

---

## Master vs transactional

| Master | Transactional |
|--------|----------------|
| websites, roles, gallery_filters, section_types | contact_leads, audit_logs |
| categories, media_assets | — |
| products, blogs, gallery, catalogue, faq, legal, pages/sections | — |

---

## Current Mongo vs this SQL

| Today (Mongo) | Production SQL |
|---------------|----------------|
| `siteId` string enum (2 values) | `websites` table (unlimited) |
| `CmsHomePage.sections` Mixed | `pages` + `page_sections` + `section_items` |
| Product `category` string | `category_id` FK |
| Image URL strings | `media_assets` + FKs |
| Hard delete | `deleted_at` soft delete |
| No audit users on CMS rows | `created_by` / `updated_by` |
| Contacts global | `website_id` on leads |
