import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_ROOT_DOMAIN
  ? `https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`
  : 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/app/',
          '/uploads/',
          '/order_files/',
          '/verify-email',
          '/403',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    // Yandex-only directive: pins the canonical host for the robot.
    host: BASE_URL,
  };
}
