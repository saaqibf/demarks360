import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/book', '/book/confirmation', '/privacy', '/terms'],
        disallow: ['/admin', '/api/', '/sign-in', '/sign-up', '/gallery/', '/preview/'],
      },
    ],
    sitemap: 'https://demarks360.ca/sitemap.xml',
  };
}
