# PrecisionBOM Web Application

Next.js 14 web application for AI-powered BOM sourcing.

**Production URL**: https://precisionbom.com

## Features

- **BOM Upload & Parsing** - Upload CSV/Excel BOMs for automatic parsing
- **Part Search** - Real-time search across DigiKey, Mouser, Octopart
- **AI Suggestions** - OpenAI-powered part recommendations and alternatives
- **User Authentication** - Email/password auth with JWT sessions
- **Blockchain Integration** - ERC-7827 audit trail via ethers.js

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Neon Postgres + Drizzle ORM
- **Styling**: Tailwind CSS
- **Auth**: Custom JWT implementation with bcrypt
- **APIs**: DigiKey, Octopart/Nexar, OpenAI

## Getting Started

### Prerequisites
- Node.js 18+
- Neon Postgres database

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database (Neon)
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=your-secret-key

# APIs
OPENAI_API_KEY=sk-...
OCTOPART_CLIENT_ID=...
OCTOPART_CLIENT_SECRET=...
DIGIKEY_CLIENT_ID=...
DIGIKEY_CLIENT_SECRET=...
```

### Database Setup

Push the schema to your Neon database:

```bash
npm run db:push
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
nextjs-app/
├── app/
│   ├── (app)/         # Protected app routes
│   ├── (auth)/        # Login/register pages
│   ├── (marketing)/   # Public landing pages
│   └── api/           # API routes
│       ├── auth/      # Authentication endpoints
│       ├── parse-bom/ # BOM parsing
│       ├── search-parts/
│       ├── suggest/   # AI suggestions
│       └── gatekeeper/ # Blockchain integration
├── components/        # React components
├── lib/
│   ├── db/           # Drizzle schema & connection
│   ├── auth/         # JWT utilities
│   ├── providers/    # DigiKey, Octopart clients
│   └── email/        # SendGrid integration
└── public/
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:generate` | Generate migrations |

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/parse-bom` | POST | Parse uploaded BOM file |
| `/api/search-parts` | GET | Search parts by query |
| `/api/suggest` | POST | Get AI part suggestions |
| `/api/suggest-boms` | POST | Generate BOM suggestions |
| `/api/gatekeeper` | POST | Blockchain operations |
