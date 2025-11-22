# Web3 Grants Aggregator - Quick Start Guide

This project consists of two parts:
- **Frontend**: React + Vite application (in `/frontend`)
- **Backend**: NestJS API (in `/backend`)

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (recommended)
- OpenAI API key (for grant scraping and AI Grants Agent)

### Option 1: Docker (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd grantPilot
   ```

2. **Configure backend environment**:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Start backend with Docker**:
   ```bash
   npm run docker:build
   ```

4. **Seed the database**:
   ```bash
   # Wait for containers to be healthy (~10 seconds), then:
   docker exec -it grantpilot-backend npm run seed
   ```

5. **Start frontend** (in a new terminal):
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

6. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api
   - API Docs: http://localhost:3001/api/docs

### Option 2: Local Development

#### Backend Setup

1. **Install PostgreSQL**:
   ```bash
   docker run --name grantpilot-db \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=grantpilot \
     -p 5432:5432 -d postgres:16-alpine
   ```

2. **Configure and start backend**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your OPENAI_API_KEY
   npm run start:dev
   ```

3. **Seed the database** (in another terminal):
   ```bash
   cd backend
   npm run seed
   ```

#### Frontend Setup

1. **Start frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📚 Project Structure

```
grantPilot/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── modules/      # Feature modules
│   │   │   ├── grants/
│   │   │   ├── chains/
│   │   │   ├── categories/
│   │   │   ├── subscriptions/
│   │   │   ├── ai/
│   │   │   └── scraper/
│   │   ├── config/       # Configuration
│   │   ├── common/       # Guards, filters
│   │   └── database/     # Seeds
│   ├── Dockerfile
│   └── docker-compose.yml
└── frontend/             # React + Vite
    └── src/
```

## 🔑 API Endpoints

### Public Endpoints

- `GET /api/health` - Health check
- `GET /api/grants` - List grants (with filters)
- `GET /api/grants/:id` - Get grant details
- `GET /api/chains` - List chains
- `GET /api/categories` - List categories
- `POST /api/grants/subscribe` - Subscribe to grant
- `POST /api/agent/chat` - Chat with AI Grants Agent

### Admin Endpoints

- `POST /api/scraper/run` - Trigger manual scraping
  - Requires: `x-admin-api-key` header

## 🛠️ Useful Commands

### Backend

```bash
cd backend

# Development
npm run start:dev          # Start with hot reload
npm run build              # Build production
npm run seed               # Seed database

# Docker
npm run docker:build       # Build and start
npm run docker:down        # Stop containers
docker-compose logs -f     # View logs
```

### Frontend

```bash
cd frontend

npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build
```

## 🧪 Testing the API

### Using cURL

```bash
# Get all grants
curl http://localhost:3001/api/grants

# Filter grants
curl "http://localhost:3001/api/grants?chain=Solana&status=Open"

# Subscribe to grant
curl -X POST http://localhost:3001/api/grants/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","grant_id":1}'

# Trigger scraper (admin)
curl -X POST http://localhost:3001/api/scraper/run \
  -H "x-admin-api-key: admin-secret-key-12345"
```

### Using Swagger

Visit http://localhost:3001/api/docs for interactive API documentation.

## 🔐 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/grantpilot
OPENAI_API_KEY=sk-your-actual-key-here
PORT=3001
ADMIN_API_KEY=your-secret-admin-key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

## 🐛 Troubleshooting

### Backend won't start

1. Check PostgreSQL is running:
   ```bash
   docker ps | grep postgres
   ```

2. Check database connection:
   ```bash
   psql postgresql://postgres:postgres@localhost:5432/grantpilot
   ```

### Frontend can't connect to API

1. Ensure backend is running on port 3001
2. Check CORS configuration in backend/.env
3. Verify API URL in frontend configuration

### Scraper errors

1. Ensure OPENAI_API_KEY is set correctly
2. Check Puppeteer/Chromium installation in Docker
3. View scraper logs:
   ```bash
   docker-compose logs -f backend
   ```

### AI Agent not working

1. Ensure OPENAI_API_KEY is set correctly in backend/.env
2. Check backend logs for authentication errors
3. Verify grant_id is valid when sending chat requests

## 📖 Documentation

- Backend README: [backend/README.md](backend/README.md)
- API Documentation: http://localhost:3001/api/docs (when running)

## 🚀 Deployment

### Backend

1. Set environment variables in production
2. Set `NODE_ENV=production`
3. Use `npm run start:prod` or Docker

### Frontend

1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)
3. Update API URL for production backend

## 📝 Next Steps

1. ✅ Start the backend and seed the database
2. ✅ Start the frontend
3. ✅ Explore the API docs at /api/docs
4. ✅ Test grant filtering and search
5. ✅ Try the AI Grants Agent in the dashboard
6. 🔧 Configure automated scraping schedule
7. 🔧 Add your OpenAI API key for AI extraction and Grants Agent
8. 🚀 Deploy to production

## 🤝 Support

For issues or questions:
- Check the backend README for detailed API documentation
- Review Swagger docs at /api/docs
- Check application logs for errors

---

Happy building! 🎉
