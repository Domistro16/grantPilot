export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  adminApiKey: process.env.ADMIN_API_KEY,
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:5173',
    ],
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
});
