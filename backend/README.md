# Web3 Grants Aggregator - Backend

A NestJS-powered backend that automatically aggregates, organizes, and tracks grant opportunities across multiple Web3 blockchains using GPT-4 for intelligent data extraction.

## 🚀 Features

- **Multi-chain Grant Aggregation**: Automatically scrapes grant data from BNB Chain, Solana, Ethereum, Polygon, Base, and more
- **AI-Powered Data Extraction**: Uses GPT-4 to intelligently parse and structure grant information
- **RESTful API**: Clean, well-documented API endpoints for the React frontend
- **Advanced Filtering**: Filter grants by chain, category, status, and search text
- **Automated Scraping**: Cron job runs daily at 2 AM UTC to fetch latest grants
- **Email Subscriptions**: Users can subscribe to grant updates
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Swagger Documentation**: Interactive API docs at `/api/docs`
- **Docker Support**: Complete Docker and Docker Compose setup

## 📋 Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **AI**: OpenAI GPT-4 API
- **Scraping**: Puppeteer
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Rate Limiting**: @nestjs/throttler
- **Scheduling**: @nestjs/schedule (Cron jobs)

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL 16+ (or use Docker)
- OpenAI API key

### Option 1: Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/grantpilot
   OPENAI_API_KEY=sk-your-actual-key-here
   PORT=3001
   ADMIN_API_KEY=your-secret-admin-key
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

3. **Start PostgreSQL** (if not using Docker):
   ```bash
   # Install PostgreSQL or use Docker:
   docker run --name grantpilot-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=grantpilot -p 5432:5432 -d postgres:16-alpine
   ```

4. **Run database migrations** (automatic with synchronize in dev):
   ```bash
   npm run start:dev
   ```

   TypeORM will automatically create tables on first run in development mode.

5. **Seed the database**:
   ```bash
   npm run seed
   ```

6. **Start the development server**:
   ```bash
   npm run start:dev
   ```

   The API will be available at:
   - **API**: http://localhost:3001/api
   - **Swagger Docs**: http://localhost:3001/api/docs
   - **Health Check**: http://localhost:3001/api/health

### Option 2: Docker Compose (Recommended)

1. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your OPENAI_API_KEY
   ```

2. **Start all services**:
   ```bash
   npm run docker:build
   ```

   This will start:
   - PostgreSQL on port 5432
   - Backend API on port 3001

3. **Seed the database**:
   ```bash
   # Wait for services to be healthy, then:
   docker exec -it grantpilot-backend npm run seed
   ```

4. **View logs**:
   ```bash
   docker-compose logs -f backend
   ```

5. **Stop services**:
   ```bash
   npm run docker:down
   ```

## 📚 API Endpoints

### Grants

- **GET** `/api/grants` - List all grants with optional filters
  - Query params: `?chain=Solana&category=DeFi&status=Open&search=builder`
  - Returns: `Grant[]`

- **GET** `/api/grants/:id` - Get single grant details
  - Returns: `Grant`

### Chains

- **GET** `/api/chains` - List all supported blockchains
  - Returns: `Chain[]`

### Categories

- **GET** `/api/categories` - List all grant categories
  - Returns: `Category[]`

### Subscriptions

- **POST** `/api/grants/subscribe` - Subscribe to grant updates
  - Body: `{ email: string, grant_id: number }`
  - Returns: `{ success: boolean, message: string }`

### Scraper (Admin Only)

- **POST** `/api/scraper/run` - Manually trigger grant scraping
  - Requires header: `x-admin-api-key: your-admin-key`
  - Returns: `{ grants_added: number, grants_updated: number }`

### Health

- **GET** `/api/health` - Health check endpoint
  - Returns: `{ status: "ok", timestamp: string }`

## 🗄️ Database Schema

### Grant
- `id`: Primary key
- `chain`: Blockchain name (e.g., "BNB Chain", "Solana")
- `category`: Grant category (e.g., "Infra", "DeFi", "Gaming")
- `title`: Grant program name
- `tag`: Short descriptive tags (e.g., "Infra · DeFi · Tooling")
- `amount`: Funding range (e.g., "Up to $150k")
- `status`: 'Open' | 'Upcoming' | 'Closed'
- `deadline`: Deadline or "Rolling"
- `summary`: 2-3 sentence description
- `focus`: Ideal applicant profile
- `link`: Application URL
- `source_url`: Where we scraped it from
- `created_at`, `updated_at`: Timestamps

### Chain
- `id`, `name`, `logo_url`, `website`, `description`

### Category
- `id`, `name`, `slug`, `description`

### UserSubscription
- `id`, `user_email`, `grant_id`, `created_at`

## 🤖 AI Integration

The system uses GPT-4 to extract structured data from grant announcements:

```typescript
// Example prompt structure
System: "You are a grant data extractor..."
User: "Extract the following from this grant announcement:
  - title: Official grant program name
  - chain: Blockchain name(s)
  - category: Choose ONE: 'Infra', 'DeFi', 'Gaming'...
  - status: 'Open', 'Upcoming', or 'Closed'
  ..."
```

The AI returns clean JSON that's validated and stored in the database.

## ⏰ Scheduled Tasks

The scraper runs automatically daily at **2 AM UTC** via cron job:

```typescript
@Cron('0 2 * * *', { timeZone: 'UTC' })
async handleDailyScraping() {
  await this.scrapeAll();
}
```

## 🔐 Security

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for React frontend origins
- **Admin Auth**: Admin endpoints require `x-admin-api-key` header
- **Input Validation**: All DTOs validated with class-validator
- **SQL Injection**: Protected by TypeORM parameterized queries

## 📊 Development Scripts

```bash
# Development
npm run start:dev       # Start with hot reload
npm run start:debug     # Start with debugger

# Build & Production
npm run build           # Build the project
npm run start:prod      # Run production build

# Database
npm run seed           # Seed database with initial data

# Docker
npm run docker:up      # Start containers
npm run docker:down    # Stop containers
npm run docker:build   # Build and start containers

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
```

## 🌐 Grant Sources

Currently scraping from:

1. **BNB Chain**: https://www.bnbchain.org/en/blog/bnb-chain-grants-program
2. **Solana**: https://solana.org/grants
3. **Polygon Village**: https://polygon.technology/village/grants
4. **Base**: https://paragraph.xyz/@base/calling-based-builders
5. **Ethereum Foundation**: https://esp.ethereum.foundation/

## 🚧 Future Enhancements

- [ ] Add more grant sources (Arbitrum, Optimism, etc.)
- [ ] Email notifications for subscriptions
- [ ] Grant application status tracking
- [ ] Advanced analytics and reporting
- [ ] User authentication and profiles
- [ ] Webhook support for real-time updates

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 | `sk-...` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` or `production` |
| `ADMIN_API_KEY` | Admin endpoint protection | `your-secret-key` |
| `CORS_ORIGINS` | Allowed origins (comma-separated) | `http://localhost:3000,http://localhost:5173` |
| `RATE_LIMIT_TTL` | Rate limit window (ms) | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |

## 🐛 Troubleshooting

### Puppeteer issues in Docker
The Dockerfile includes Chromium installation for Alpine Linux. If you encounter issues:
```bash
# The container uses:
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### Database connection errors
Ensure PostgreSQL is running and the `DATABASE_URL` is correct:
```bash
# Test connection:
psql postgresql://postgres:postgres@localhost:5432/grantpilot
```

### TypeORM sync issues
In development, `synchronize: true` auto-creates tables. In production, use migrations:
```bash
npm run typeorm migration:generate -- -n InitialMigration
npm run typeorm migration:run
```

## 📄 License

UNLICENSED - Private project

## 🤝 Contributing

This is a private project. For issues or questions, contact the development team.

---

Built with ❤️ using NestJS and TypeScript
