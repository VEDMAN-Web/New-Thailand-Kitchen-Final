-- =============================================================================
-- ThailandKitchens / Multi-Kitchen CMS — Production PostgreSQL Schema
-- =============================================================================
-- Designed from admin UI (routes, forms, MediaUpload, site switcher).
-- Multi-tenant: one schema for Pattaya, Thailand, Varsovia.design, Phuket, +N.
-- Adding a website = INSERT into websites — no structural change.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helper: updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 1. MASTER: Websites (tenants)
-- =============================================================================
CREATE TABLE websites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            VARCHAR(64)  NOT NULL,           -- e.g. thailand-kitchen
  name            VARCHAR(150) NOT NULL,           -- e.g. Thailand Kitchen
  display_name    VARCHAR(150),
  domain          VARCHAR(255),
  logo_url        TEXT,
  primary_locale  VARCHAR(10)  NOT NULL DEFAULT 'en',
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order      INT          NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT uq_websites_code UNIQUE (code)
);

CREATE TRIGGER trg_websites_updated_at
  BEFORE UPDATE ON websites
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed brands (extend with future kitchens by INSERT only)
INSERT INTO websites (code, name, display_name, sort_order) VALUES
  ('pattaya-kitchen',   'Pattaya Kitchen',   'Pattaya Kitchen',   1),
  ('thailand-kitchen',  'Thailand Kitchen',  'Thailand Kitchen',  2),
  ('varsovia-kitchen',  'Varsovia.design',   'Varsovia.design',   3),
  ('phuket-kitchen',    'Phuket Kitchen',    'Phuket Kitchen',    4);

-- =============================================================================
-- 2. AUTH: Roles & Users
-- =============================================================================
CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(32)  NOT NULL,              -- admin | editor
  name        VARCHAR(64)  NOT NULL,
  CONSTRAINT uq_roles_code UNIQUE (code)
);

INSERT INTO roles (code, name) VALUES
  ('admin',  'Administrator'),
  ('editor', 'Editor');

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id         UUID         NOT NULL REFERENCES roles(id),
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(255) NOT NULL,
  password_hash   TEXT         NOT NULL,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  updated_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Which websites a user can manage (multi-tenant ACL)
CREATE TABLE user_websites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  website_id  UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_websites UNIQUE (user_id, website_id)
);

CREATE INDEX ix_user_websites_website ON user_websites(website_id);

-- =============================================================================
-- 3. MEDIA (images, icons, PDFs, optional video)
-- =============================================================================
-- Maps to MediaUpload kinds: image | icon | pdf | any (+ video for hero)
CREATE TABLE media_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id      UUID         NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  kind            VARCHAR(20)  NOT NULL
                    CHECK (kind IN ('image', 'icon', 'pdf', 'video', 'other')),
  url             TEXT         NOT NULL,
  mime_type       VARCHAR(120),
  original_name   VARCHAR(255),
  size_bytes      BIGINT,
  storage         VARCHAR(32)  NOT NULL DEFAULT 'local'
                    CHECK (storage IN ('local', 'cloudinary', 's3', 'other')),
  public_id       VARCHAR(255),                   -- Cloudinary / S3 key
  alt_text        VARCHAR(255),
  uploaded_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX ix_media_website_kind ON media_assets(website_id, kind)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_media_updated_at
  BEFORE UPDATE ON media_assets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 4. CATEGORIES  (/categories)
-- =============================================================================
CREATE TABLE categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id      UUID         NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  title           VARCHAR(200) NOT NULL,
  description     TEXT         NOT NULL DEFAULT '',
  image_media_id  UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  icon_media_id   UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  sort_order      INT          NOT NULL DEFAULT 0,
  is_published    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  updated_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT uq_categories_website_title UNIQUE (website_id, title)
);

CREATE INDEX ix_categories_website ON categories(website_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 5. PRODUCTS  (/products)
-- =============================================================================
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id      UUID         NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  category_id     UUID         REFERENCES categories(id) ON DELETE SET NULL,
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL,
  description     TEXT         NOT NULL DEFAULT '',
  cover_media_id  UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  icon_media_id   UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  pdf_media_id    UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  is_featured     BOOLEAN      NOT NULL DEFAULT FALSE,  -- "Featured product"
  is_published    BOOLEAN      NOT NULL DEFAULT TRUE,
  sort_order      INT          NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  updated_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT uq_products_website_slug UNIQUE (website_id, slug)
);

CREATE INDEX ix_products_website ON products(website_id)
  WHERE deleted_at IS NULL;
CREATE INDEX ix_products_featured ON products(website_id, is_featured)
  WHERE deleted_at IS NULL AND is_published = TRUE;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Product gallery (comma-separated gallery URLs in UI)
CREATE TABLE product_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_id     UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  sort_order   INT  NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_product_media UNIQUE (product_id, media_id)
);

CREATE INDEX ix_product_media_product ON product_media(product_id, sort_order);

-- =============================================================================
-- 6. BLOGS  (/blogs)
-- =============================================================================
CREATE TABLE blog_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id      UUID         NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  category_id     UUID         REFERENCES categories(id) ON DELETE SET NULL,
  title           VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL,
  excerpt         TEXT         NOT NULL DEFAULT '',
  content         TEXT         NOT NULL DEFAULT '',
  cover_media_id  UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  is_published    BOOLEAN      NOT NULL DEFAULT TRUE,   -- Published checkbox
  published_at    TIMESTAMPTZ,
  sort_order      INT          NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  updated_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT uq_blog_posts_website_slug UNIQUE (website_id, slug)
);

CREATE INDEX ix_blog_posts_website ON blog_posts(website_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE blog_media (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_post_id  UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  media_id      UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  sort_order    INT  NOT NULL DEFAULT 0,
  CONSTRAINT uq_blog_media UNIQUE (blog_post_id, media_id)
);

-- =============================================================================
-- 7. GALLERY  (/gallery)
-- =============================================================================
CREATE TABLE gallery_filters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(64)  NOT NULL,              -- style-color
  label       VARCHAR(100) NOT NULL,              -- Style & Color
  sort_order  INT          NOT NULL DEFAULT 0,
  CONSTRAINT uq_gallery_filters_code UNIQUE (code)
);

INSERT INTO gallery_filters (code, label, sort_order) VALUES
  ('layout-space', 'Layout & Space', 1),
  ('storage',      'Storage',        2),
  ('style-color',  'Style & Color',  3),
  ('materials',    'Materials',      4);

CREATE TABLE gallery_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id      UUID         NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  filter_id       UUID         NOT NULL REFERENCES gallery_filters(id),
  media_id        UUID         NOT NULL REFERENCES media_assets(id),
  title           VARCHAR(255) NOT NULL,
  is_tall         BOOLEAN      NOT NULL DEFAULT FALSE,
  is_wide         BOOLEAN      NOT NULL DEFAULT FALSE,
  sort_order      INT          NOT NULL DEFAULT 0,
  is_published    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  updated_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX ix_gallery_website_filter ON gallery_items(website_id, filter_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 8. CATALOGUE  (Home → Free Catalogue)
-- =============================================================================
CREATE TABLE catalogue_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id        UUID         NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  title             VARCHAR(255) NOT NULL,
  category_label    VARCHAR(100) NOT NULL DEFAULT '',  -- Minimal / Classic / Modern
  cover_media_id    UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  pdf_media_id      UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  legacy_file_name  VARCHAR(255) NOT NULL DEFAULT '',
  download_name     VARCHAR(255) NOT NULL DEFAULT '',
  sort_order        INT          NOT NULL DEFAULT 0,
  is_published      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by        UUID         REFERENCES users(id) ON DELETE SET NULL,
  updated_by        UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX ix_catalogue_website ON catalogue_items(website_id, sort_order)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_catalogue_updated_at
  BEFORE UPDATE ON catalogue_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 9. FAQ  (Home → FAQ)
-- =============================================================================
CREATE TABLE faq_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id      UUID         NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  question        VARCHAR(500) NOT NULL,
  answer          TEXT         NOT NULL DEFAULT '',
  sort_order      INT          NOT NULL DEFAULT 0,
  is_published    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  updated_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX ix_faq_website ON faq_items(website_id, sort_order)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_faq_updated_at
  BEFORE UPDATE ON faq_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 10. LEGAL  (/privacy, /terms)
-- =============================================================================
CREATE TABLE legal_pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id      UUID         NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  legal_type      VARCHAR(20)  NOT NULL
                    CHECK (legal_type IN ('privacy', 'terms')),
  title           VARCHAR(255) NOT NULL,
  content         TEXT         NOT NULL DEFAULT '',
  is_published    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  updated_by      UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT uq_legal_website_type UNIQUE (website_id, legal_type)
);

CREATE TRIGGER trg_legal_updated_at
  BEFORE UPDATE ON legal_pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 11. HOME / PAGE SECTIONS  (/ Home Management)
-- =============================================================================
CREATE TABLE pages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id      UUID         NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  code            VARCHAR(64)  NOT NULL,           -- home | about | …
  title           VARCHAR(150) NOT NULL,
  is_published    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT uq_pages_website_code UNIQUE (website_id, code)
);

CREATE TABLE section_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        VARCHAR(64)  NOT NULL,              -- hero, statistics, …
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(255),
  sort_order  INT          NOT NULL DEFAULT 0,
  CONSTRAINT uq_section_types_code UNIQUE (code)
);

INSERT INTO section_types (code, name, description, sort_order) VALUES
  ('hero',          'Hero Banner',       'Main headline & hero CTA',           1),
  ('statistics',    'Statistics',        'Key numerical metrics',              2),
  ('advantages',    'Our Advantages',    'Feature cards',                      3),
  ('story',         'Our Story',         'Brand story narrative',              4),
  ('transition',    'Transition Banner', 'Pillar process highlights',          5),
  ('testimonials',  'Testimonials',      'Customer reviews & ratings',         6),
  ('catalogue',     'Free Catalogue',    'Downloadable PDF catalogs',          7),
  ('partners',      'Global Partners',   'Brand partner logos',                8),
  ('faq',           'FAQ Section',       'Frequently asked questions',         9),
  ('footer',        'Footer & Contact',  'Address, email & social links',     10);

CREATE TABLE page_sections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id           UUID         NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_type_id   UUID         NOT NULL REFERENCES section_types(id),
  -- Scalar fields used by hero / story / footer-style sections
  heading           VARCHAR(255) NOT NULL DEFAULT '',   -- title
  subheading        VARCHAR(255) NOT NULL DEFAULT '',   -- subtitle
  body              TEXT         NOT NULL DEFAULT '',   -- description
  button_text       VARCHAR(120) NOT NULL DEFAULT '',
  video_url         TEXT         NOT NULL DEFAULT '',
  -- Footer / contact scalars (also usable as JSON in settings)
  email             VARCHAR(255) NOT NULL DEFAULT '',
  phone             VARCHAR(64)  NOT NULL DEFAULT '',
  address           TEXT         NOT NULL DEFAULT '',
  facebook_url      TEXT         NOT NULL DEFAULT '',
  instagram_url     TEXT         NOT NULL DEFAULT '',
  line_url          TEXT         NOT NULL DEFAULT '',
  media_id          UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  settings          JSONB        NOT NULL DEFAULT '{}'::jsonb,  -- escape hatch
  sort_order        INT          NOT NULL DEFAULT 0,
  is_published      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by        UUID         REFERENCES users(id) ON DELETE SET NULL,
  updated_by        UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_at        TIMESTAMPTZ,
  CONSTRAINT uq_page_section_type UNIQUE (page_id, section_type_id)
);

CREATE TRIGGER trg_page_sections_updated_at
  BEFORE UPDATE ON page_sections
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Repeatable rows: stats, advantages, pillars, testimonials, partners,
-- (optional catalogue/faq when not using dedicated tables)
CREATE TABLE section_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_section_id   UUID         NOT NULL REFERENCES page_sections(id) ON DELETE CASCADE,
  item_key          VARCHAR(64)  NOT NULL DEFAULT '',  -- optional stable key
  title             VARCHAR(255) NOT NULL DEFAULT '',  -- label / name / question
  subtitle          VARCHAR(255) NOT NULL DEFAULT '',  -- role / category
  body              TEXT         NOT NULL DEFAULT '',  -- description / quote / answer
  value_text        VARCHAR(64)  NOT NULL DEFAULT '',  -- statistic value
  suffix            VARCHAR(16)  NOT NULL DEFAULT '',
  rating            SMALLINT     CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  media_id          UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  icon_media_id     UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  pdf_media_id      UUID         REFERENCES media_assets(id) ON DELETE SET NULL,
  download_name     VARCHAR(255) NOT NULL DEFAULT '',
  extra             JSONB        NOT NULL DEFAULT '{}'::jsonb,
  sort_order        INT          NOT NULL DEFAULT 0,
  is_published      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by        UUID         REFERENCES users(id) ON DELETE SET NULL,
  updated_by        UUID         REFERENCES users(id) ON DELETE SET NULL,
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX ix_section_items_section ON section_items(page_section_id, sort_order)
  WHERE deleted_at IS NULL;

CREATE TRIGGER trg_section_items_updated_at
  BEFORE UPDATE ON section_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 12. CONTACTS  (/contacts)
-- =============================================================================
CREATE TABLE contact_leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id        UUID         REFERENCES websites(id) ON DELETE SET NULL,
  full_name         VARCHAR(200) NOT NULL,
  email             VARCHAR(255) NOT NULL,
  phone_number      VARCHAR(40)  NOT NULL DEFAULT '',
  whatsapp_number   VARCHAR(40)  NOT NULL DEFAULT '',
  city_name         VARCHAR(120) NOT NULL DEFAULT '',
  country_name      VARCHAR(120) NOT NULL DEFAULT '',
  message           TEXT         NOT NULL DEFAULT '',
  source            VARCHAR(64)  NOT NULL DEFAULT 'contact_form'
                      CHECK (source IN (
                        'contact_form',
                        'consultation',
                        'catalogue',
                        'product',
                        'other'
                      )),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX ix_contact_leads_website ON contact_leads(website_id, created_at DESC)
  WHERE deleted_at IS NULL;
CREATE INDEX ix_contact_leads_email ON contact_leads(email);

CREATE TRIGGER trg_contact_leads_updated_at
  BEFORE UPDATE ON contact_leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 13. SEO  (not in UI today — production-ready stub)
-- =============================================================================
CREATE TABLE seo_meta (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id         UUID         NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  entity_type        VARCHAR(40)  NOT NULL
                       CHECK (entity_type IN (
                         'page', 'product', 'blog', 'category', 'gallery', 'legal'
                       )),
  entity_id          UUID         NOT NULL,
  meta_title         VARCHAR(255) NOT NULL DEFAULT '',
  meta_description   TEXT         NOT NULL DEFAULT '',
  og_image_url       TEXT         NOT NULL DEFAULT '',
  canonical_url      TEXT         NOT NULL DEFAULT '',
  robots             VARCHAR(64)  NOT NULL DEFAULT 'index,follow',
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_seo_entity UNIQUE (website_id, entity_type, entity_id)
);

CREATE TRIGGER trg_seo_updated_at
  BEFORE UPDATE ON seo_meta
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 14. AUDIT (recommended)
-- =============================================================================
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_id   UUID         REFERENCES websites(id) ON DELETE SET NULL,
  user_id      UUID         REFERENCES users(id) ON DELETE SET NULL,
  action       VARCHAR(32)  NOT NULL,              -- create|update|delete|login
  entity_type  VARCHAR(64)  NOT NULL,
  entity_id    UUID,
  payload      JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX ix_audit_website_time ON audit_logs(website_id, created_at DESC);

-- =============================================================================
-- Soft-delete helper views (optional convenience)
-- =============================================================================
CREATE VIEW v_active_products AS
  SELECT * FROM products WHERE deleted_at IS NULL AND is_published = TRUE;

CREATE VIEW v_active_blog_posts AS
  SELECT * FROM blog_posts WHERE deleted_at IS NULL AND is_published = TRUE;

CREATE VIEW v_active_gallery_items AS
  SELECT * FROM gallery_items WHERE deleted_at IS NULL AND is_published = TRUE;
