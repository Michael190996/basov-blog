export default {
  KOA: {
    PORT: process.env.BLOG_PORT || 3000
  },
  POSTGRES: {
    user: process.env.POSTGRES_USER || 'postgres',
    database: process.env.POSTGRES_DATABASE || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    password: process.env.POSTGRES_PASSWORD || '',
    port: process.env.POSTGRES_PORT || 5432
  },
  DEBUG: !!process.env.DEBUG,
  CACHE: !!process.env.CACHE,
  STATIC: !!process.env.STATIC
};