# Complete Entity List

> Inferred from admin UI routes, forms, labels, menus, and interactions in `admin/src`.  
> Target: multi-tenant CMS for Pattaya Kitchen, Thailand Kitchen, Varsovia.design, Phuket Kitchen, and future Kitchen brands — **without schema redesign**.

---

## 1. Master / reference entities

| Entity | Source in UI | Purpose |
|--------|--------------|---------|
| **Website** | Site switcher (`thailand-kitchen`, `varsovia-kitchen`) | Tenant root. One row per brand site. |
| **Role** | Users modal Role select (`admin`, `editor`) | Access level master. |
| **User** | `/users` | Admin panel operators. |
| **UserWebsite** | *(not in UI — required for multi-tenant)* | Which users can manage which websites. |
| **MediaAsset** | `MediaUpload` (image / icon / PDF) | Central media library. |
| **Category** | `/categories` | Product/content grouping master. |
| **GalleryFilter** | Gallery Filter select | Layout & Space, Storage, Style & Color, Materials. |
| **LegalType** | `/privacy`, `/terms` | `privacy` \| `terms`. |
| **SectionType** | Home `SECTION_META` keys | hero, statistics, advantages, … footer. |
| **Page** | Implied by Home + Legal | Logical pages per website (home, privacy, terms, …). |

---

## 2. Content / CMS entities

| Entity | Source in UI | Purpose |
|--------|--------------|---------|
| **PageSection** | Home section list | One section instance on a page (e.g. Home → Hero). |
| **SectionItem** | Add/Remove rows inside sections | Stats, advantages, pillars, testimonials, catalogue, partners, FAQ items. |
| **Product** | `/products` | Kitchen products. |
| **ProductMedia** | Product gallery URLs + icon + PDF | Ordered media attached to a product. |
| **BlogPost** | `/blogs` | Journal / blog posts. |
| **BlogMedia** | *(API has gallery; UI has cover only)* | Extra blog images. |
| **GalleryItem** | `/gallery` | Inspiration mosaic images. |
| **CatalogueItem** | Home → Free Catalogue | Downloadable PDF catalogues. |
| **FaqItem** | Home → FAQ Section | Q&A entries. |
| **LegalPage** | `/privacy`, `/terms` | Legal document body. |
| **PartnerLogo** | Home → Global Partners | Partner brand logos. |
| **Testimonial** | Home → Testimonials | Customer quotes. |

---

## 3. Transactional entities

| Entity | Source in UI | Purpose |
|--------|--------------|---------|
| **ContactLead** | `/contacts` + public forms | Enquiries / catalogue unlock leads. |
| **AuditLog** | *(recommended; not in UI)* | Who changed what. |

---

## 4. SEO entity *(missing from UI — recommended)*

| Entity | Assumption |
|--------|------------|
| **SeoMeta** | UI has no meta title/description fields today. Recommended for public pages/products/blogs without redesigning tenant structure. |

---

## 5. Entity ↔ UI page map

| Admin route | Primary entities |
|-------------|------------------|
| `/login` | User |
| `/` Home Management | Website, Page, PageSection, SectionItem, MediaAsset |
| `/contacts` | ContactLead, Website |
| `/categories` | Category, MediaAsset, Website |
| `/products` | Product, Category, ProductMedia, MediaAsset, Website |
| `/gallery` | GalleryItem, GalleryFilter, MediaAsset, Website |
| `/blogs` | BlogPost, MediaAsset, Website |
| `/privacy` | LegalPage, Website |
| `/terms` | LegalPage, Website |
| `/users` | User, Role, UserWebsite |

---

## 6. Assumptions (explicit)

1. **Tenant key** = `website_id` (UUID). Current string codes (`thailand-kitchen`) become `websites.code`.
2. Product **Category** UI is free text today → production schema uses **FK** `products.category_id` → `categories.id` (with optional denormalized title for display).
3. Home catalogue/FAQ live inside Mixed JSON today → production uses **normalized** `catalogue_items` / `faq_items` (and/or `section_items`) keyed by `website_id`.
4. Contacts are global in current API → production adds `website_id` (nullable for legacy leads).
5. Soft delete, `created_by` / `updated_by`, and SEO tables are **not** in the UI but required by the design rules — marked as such in `recommendations.md`.
