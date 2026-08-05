# Relationships

## Primary multi-tenant rule

Every content table includes `website_id → websites.id`.  
Adding Pattaya Kitchen, Phuket Kitchen, or Varsovia.design = **insert a `websites` row**, not new tables.

---

## Foreign keys

| Child table | Column | Parent table | Parent column | On delete |
|-------------|--------|--------------|---------------|-----------|
| user_websites | user_id | users | id | CASCADE |
| user_websites | website_id | websites | id | CASCADE |
| media_assets | website_id | websites | id | CASCADE |
| media_assets | uploaded_by | users | id | SET NULL |
| categories | website_id | websites | id | CASCADE |
| categories | image_media_id | media_assets | id | SET NULL |
| categories | icon_media_id | media_assets | id | SET NULL |
| products | website_id | websites | id | CASCADE |
| products | category_id | categories | id | SET NULL |
| products | cover_media_id | media_assets | id | SET NULL |
| products | icon_media_id | media_assets | id | SET NULL |
| products | pdf_media_id | media_assets | id | SET NULL |
| product_media | product_id | products | id | CASCADE |
| product_media | media_id | media_assets | id | CASCADE |
| blog_posts | website_id | websites | id | CASCADE |
| blog_posts | cover_media_id | media_assets | id | SET NULL |
| blog_posts | category_id | categories | id | SET NULL |
| blog_media | blog_post_id | blog_posts | id | CASCADE |
| blog_media | media_id | media_assets | id | CASCADE |
| gallery_items | website_id | websites | id | CASCADE |
| gallery_items | filter_id | gallery_filters | id | RESTRICT |
| gallery_items | media_id | media_assets | id | RESTRICT |
| catalogue_items | website_id | websites | id | CASCADE |
| catalogue_items | cover_media_id | media_assets | id | SET NULL |
| catalogue_items | pdf_media_id | media_assets | id | SET NULL |
| faq_items | website_id | websites | id | CASCADE |
| legal_pages | website_id | websites | id | CASCADE |
| pages | website_id | websites | id | CASCADE |
| page_sections | page_id | pages | id | CASCADE |
| page_sections | section_type_id | section_types | id | RESTRICT |
| page_sections | media_id | media_assets | id | SET NULL |
| section_items | page_section_id | page_sections | id | CASCADE |
| section_items | media_id | media_assets | id | SET NULL |
| section_items | icon_media_id | media_assets | id | SET NULL |
| section_items | pdf_media_id | media_assets | id | SET NULL |
| contact_leads | website_id | websites | id | SET NULL |
| seo_meta | website_id | websites | id | CASCADE |
| users | role_id | roles | id | RESTRICT |
| *(audit columns)* | created_by / updated_by | users | id | SET NULL |

---

## Cardinality

| From | To | Cardinality | Notes |
|------|-----|-------------|-------|
| Website | Category | 1:N | Per-tenant categories |
| Website | Product | 1:N | |
| Category | Product | 1:N | UI today is free-text; schema uses FK |
| Product | ProductMedia | 1:N | Gallery images |
| Website | BlogPost | 1:N | |
| Website | GalleryItem | 1:N | |
| GalleryFilter | GalleryItem | 1:N | Shared lookup across tenants |
| Website | CatalogueItem | 1:N | Home Free Catalogue |
| Website | FaqItem | 1:N | Home FAQ |
| Website | LegalPage | 1:2 | One privacy + one terms (unique) |
| Website | Page | 1:N | home, privacy, terms, … |
| Page | PageSection | 1:N | Ordered sections |
| PageSection | SectionItem | 1:N | Stats / cards / FAQs / catalogues in section |
| Website | MediaAsset | 1:N | |
| User | Website | M:N | via `user_websites` |
| Website | ContactLead | 1:N | |

---

## UI relationship gaps (documented)

| UI behavior | Production relationship |
|-------------|-------------------------|
| Product Category = text input | Normalize to `categories.id` |
| Site switcher = 2 hardcoded sites | `websites` table + seed rows for all brands |
| Contacts not filtered by site | Add `contact_leads.website_id` |
| Users global | Keep global users + `user_websites` for access |
| Home Mixed JSON | Split into `page_sections` + `section_items` |
