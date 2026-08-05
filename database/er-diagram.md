# ER Diagram

```mermaid
erDiagram
    WEBSITES ||--o{ USER_WEBSITES : grants
    USERS ||--o{ USER_WEBSITES : has
    ROLES ||--o{ USERS : assigns

    WEBSITES ||--o{ MEDIA_ASSETS : owns
    WEBSITES ||--o{ CATEGORIES : owns
    WEBSITES ||--o{ PRODUCTS : owns
    WEBSITES ||--o{ BLOG_POSTS : owns
    WEBSITES ||--o{ GALLERY_ITEMS : owns
    WEBSITES ||--o{ CATALOGUE_ITEMS : owns
    WEBSITES ||--o{ FAQ_ITEMS : owns
    WEBSITES ||--o{ LEGAL_PAGES : owns
    WEBSITES ||--o{ PAGES : owns
    WEBSITES ||--o{ CONTACT_LEADS : receives
    WEBSITES ||--o{ SEO_META : has

    CATEGORIES ||--o{ PRODUCTS : classifies
    CATEGORIES ||--o{ BLOG_POSTS : optional

    PRODUCTS ||--o{ PRODUCT_MEDIA : has
    MEDIA_ASSETS ||--o{ PRODUCT_MEDIA : used_in
    BLOG_POSTS ||--o{ BLOG_MEDIA : has
    MEDIA_ASSETS ||--o{ BLOG_MEDIA : used_in

    GALLERY_FILTERS ||--o{ GALLERY_ITEMS : filters
    MEDIA_ASSETS ||--o{ GALLERY_ITEMS : image

    PAGES ||--o{ PAGE_SECTIONS : contains
    SECTION_TYPES ||--o{ PAGE_SECTIONS : typed_as
    PAGE_SECTIONS ||--o{ SECTION_ITEMS : contains

    WEBSITES {
        uuid id PK
        string code UK
        string name
        string domain
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    ROLES {
        uuid id PK
        string code UK
        string name
    }

    USERS {
        uuid id PK
        uuid role_id FK
        string name
        string email UK
        string password_hash
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    USER_WEBSITES {
        uuid id PK
        uuid user_id FK
        uuid website_id FK
    }

    MEDIA_ASSETS {
        uuid id PK
        uuid website_id FK
        string kind
        string url
        string mime_type
        string original_name
        bigint size_bytes
        string storage
        string public_id
        uuid uploaded_by FK
        timestamptz created_at
        timestamptz deleted_at
    }

    CATEGORIES {
        uuid id PK
        uuid website_id FK
        string title
        text description
        uuid image_media_id FK
        uuid icon_media_id FK
        int sort_order
        boolean is_published
        timestamptz deleted_at
    }

    PRODUCTS {
        uuid id PK
        uuid website_id FK
        uuid category_id FK
        string title
        string slug
        text description
        uuid cover_media_id FK
        uuid icon_media_id FK
        uuid pdf_media_id FK
        boolean is_featured
        boolean is_published
        int sort_order
        timestamptz deleted_at
    }

    PRODUCT_MEDIA {
        uuid id PK
        uuid product_id FK
        uuid media_id FK
        int sort_order
    }

    BLOG_POSTS {
        uuid id PK
        uuid website_id FK
        uuid category_id FK
        string title
        string slug
        text excerpt
        text content
        uuid cover_media_id FK
        boolean is_published
        int sort_order
        timestamptz deleted_at
    }

    GALLERY_FILTERS {
        uuid id PK
        string code UK
        string label
        int sort_order
    }

    GALLERY_ITEMS {
        uuid id PK
        uuid website_id FK
        uuid filter_id FK
        uuid media_id FK
        string title
        boolean is_tall
        boolean is_wide
        int sort_order
        boolean is_published
        timestamptz deleted_at
    }

    CATALOGUE_ITEMS {
        uuid id PK
        uuid website_id FK
        string title
        string category_label
        uuid cover_media_id FK
        uuid pdf_media_id FK
        string download_name
        int sort_order
        boolean is_published
        timestamptz deleted_at
    }

    FAQ_ITEMS {
        uuid id PK
        uuid website_id FK
        string question
        text answer
        int sort_order
        boolean is_published
        timestamptz deleted_at
    }

    LEGAL_PAGES {
        uuid id PK
        uuid website_id FK
        string legal_type
        string title
        text content
        boolean is_published
        timestamptz deleted_at
    }

    PAGES {
        uuid id PK
        uuid website_id FK
        string code
        string title
        boolean is_published
    }

    SECTION_TYPES {
        uuid id PK
        string code UK
        string name
    }

    PAGE_SECTIONS {
        uuid id PK
        uuid page_id FK
        uuid section_type_id FK
        string heading
        string subheading
        text body
        string button_text
        string video_url
        uuid media_id FK
        int sort_order
        boolean is_published
        timestamptz deleted_at
    }

    SECTION_ITEMS {
        uuid id PK
        uuid page_section_id FK
        string item_key
        string title
        string subtitle
        text body
        string value_text
        string suffix
        string rating
        uuid media_id FK
        uuid icon_media_id FK
        uuid pdf_media_id FK
        string download_name
        jsonb extra
        int sort_order
        boolean is_published
        timestamptz deleted_at
    }

    CONTACT_LEADS {
        uuid id PK
        uuid website_id FK
        string full_name
        string email
        string phone_number
        string whatsapp_number
        string city_name
        string country_name
        text message
        string source
        timestamptz created_at
        timestamptz deleted_at
    }

    SEO_META {
        uuid id PK
        uuid website_id FK
        string entity_type
        uuid entity_id
        string meta_title
        text meta_description
        string og_image_url
        string canonical_url
    }
```

## How to read this

- **WEBSITES** is the tenant hub — all content hangs off it.
- **PAGE_SECTIONS / SECTION_ITEMS** replace the current Mongo Mixed `sections` blob for Home Management.
- **MEDIA_ASSETS** centralizes every Upload button in the admin UI.
