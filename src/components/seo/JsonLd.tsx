type ProductJsonLd = {
  name: string;
  description: string;
  image: string;
  brand?: string;
  sku?: string;
};

type ArticleJsonLd = {
  headline: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  image: string;
  articleBody: string;
  reviewer?: string;
};

type BreadcrumbItem = {
  name: string;
  url: string;
};

type BreadcrumbJsonLd = {
  items: BreadcrumbItem[];
};

type OrganizationJsonLd = {
  name: string;
  logo: string;
  url: string;
  contactPoint?: {
    telephone: string;
    contactType: string;
  };
  sameAs?: string[];
};

type WebSiteJsonLd = {
  name: string;
  url: string;
};

type ServiceJsonLd = {
  name: string;
  description: string;
  provider?: string;
  url?: string;
  areaServed?: string;
};

type LocalBusinessJsonLd = {
  name: string;
  description: string;
  url: string;
  image?: string;
  telephone?: string;
  areaServed?: string;
};

type FaqItemJsonLd = {
    question: string;
    answer: string;
};

type FaqPageJsonLd = {
    items: FaqItemJsonLd[];
};

type JsonLdProps =
  | { type: 'Product'; data: ProductJsonLd }
  | { type: 'Article'; data: ArticleJsonLd }
  | { type: 'Breadcrumb'; data: BreadcrumbJsonLd }
  | { type: 'Organization'; data: OrganizationJsonLd }
  | { type: 'WebSite'; data: WebSiteJsonLd }
  | { type: 'Service'; data: ServiceJsonLd }
  | { type: 'LocalBusiness'; data: LocalBusinessJsonLd }
| { type: 'FAQPage'; data: FaqPageJsonLd };

function generateProductSchema(data: ProductJsonLd) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description,
    image: data.image,
    brand: {
      '@type': 'Brand',
      name: data.brand || 'Thailand Kitchen',
    },
    ...(data.sku ? { sku: data.sku } : {}),
  };
}

function generateArticleSchema(data: ArticleJsonLd) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    image: data.image,
    articleBody: data.articleBody,
    author: {
      '@type': 'Person',
      name: data.author || 'Thailand Kitchen',
    },
  };

  if (data.datePublished) {
    schema.datePublished = data.datePublished;
  }

  if (data.dateModified) {
    schema.dateModified = data.dateModified;
  }

  if (data.reviewer) {
    schema.reviewedBy = {
      '@type': 'Person',
      name: data.reviewer,
    };
  }

  return schema;
}

function generateBreadcrumbSchema(data: BreadcrumbJsonLd) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function generateOrganizationSchema(data: OrganizationJsonLd) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    url: data.url,
    logo: data.logo,
  };

  if (data.contactPoint) {
    schema.contactPoint = {
      '@type': 'ContactPoint',
      telephone: data.contactPoint.telephone,
      contactType: data.contactPoint.contactType,
    };
  }

  if (data.sameAs && data.sameAs.length > 0) {
    schema.sameAs = data.sameAs;
  }

  return schema;
}

function generateWebSiteSchema(data: WebSiteJsonLd) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: data.name,
    url: data.url,
  };
}

function generateServiceSchema(data: ServiceJsonLd) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: data.name,
    description: data.description,
    provider: {
      '@type': 'Organization',
      name: data.provider || 'Thailand Kitchens',
    },
    ...(data.url ? { url: data.url } : {}),
    ...(data.areaServed
      ? { areaServed: { '@type': 'Place', name: data.areaServed } }
      : {}),
  };
}

function generateLocalBusinessSchema(data: LocalBusinessJsonLd) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: data.name,
    description: data.description,
    url: data.url,
    ...(data.image ? { image: data.image } : {}),
    ...(data.telephone ? { telephone: data.telephone } : {}),
    ...(data.areaServed
      ? { areaServed: { '@type': 'Place', name: data.areaServed } }
      : {}),
  };
}

function generateFaqPageSchema(data: FaqPageJsonLd) {
    return {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.items.map((item) => ({
                  '@type': 'Question',
                  name: item.question,
                  acceptedAnswer: {
                            '@type': 'Answer',
                            text: item.answer,
                  },
          })),
    };
}

function generateSchema(type: JsonLdProps['type'], data: any) {
  switch (type) {
    case 'Product':
      return generateProductSchema(data);
    case 'Article':
      return generateArticleSchema(data);
    case 'Breadcrumb':
      return generateBreadcrumbSchema(data);
    case 'Organization':
      return generateOrganizationSchema(data);
    case 'WebSite':
      return generateWebSiteSchema(data);
    case 'Service':
      return generateServiceSchema(data);
    case 'LocalBusiness':
      return generateLocalBusinessSchema(data);
    case 'FAQPage':
      return generateFaqPageSchema(data);
    default:
      return {};
  }
}

export default function JsonLd({ type, data }: JsonLdProps) {
  const schema = generateSchema(type, data);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export type {
  ProductJsonLd,
  ArticleJsonLd,
  BreadcrumbJsonLd,
  OrganizationJsonLd,
  WebSiteJsonLd,
  ServiceJsonLd,
  LocalBusinessJsonLd,
  FaqPageJsonLd,
  FaqItemJsonLd,
  BreadcrumbItem,
};
