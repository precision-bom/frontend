# PrecisionBOM Architecture

## System Overview

PrecisionBOM is a distributed system for AI-powered electronic component sourcing with blockchain-backed audit trails.

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Users                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Next.js Web Application                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │  Auth Pages │  │  BOM Upload │  │  Part Search│                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│                           │                                          │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    API Routes (/api)                         │    │
│  │  auth | parse-bom | search-parts | suggest | gatekeeper     │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
         │              │                    │                │
         ▼              ▼                    ▼                ▼
┌──────────────┐ ┌─────────────┐ ┌─────────────────┐ ┌───────────────┐
│ Neon Postgres│ │Python Agent │ │ Part APIs       │ │ Ethereum      │
│              │ │   Service   │ │ - DigiKey       │ │ (ERC-7827)    │
│ - Users      │ │             │ │ - Mouser        │ │               │
│ - Sessions   │ │ - CrewAI    │ │ - Octopart      │ │ - Audit Trail │
│ - Tokens     │ │ - FastAPI   │ │                 │ │ - Invoices    │
└──────────────┘ └─────────────┘ └─────────────────┘ └───────────────┘
```

## Components

### 1. Next.js Web Application (`nextjs-app/`)

**Purpose**: User-facing web interface for BOM sourcing workflows.

**Technology**:
- Next.js 14 with App Router
- React Server Components
- Tailwind CSS
- Drizzle ORM

**Key Responsibilities**:
- User authentication (JWT-based)
- BOM file upload and parsing
- Part search across multiple suppliers
- AI-powered suggestions via OpenAI
- Blockchain transaction signing

**Data Flow**:
```
User Upload → Parse BOM → Enrich Parts → AI Suggestions → User Review → Order
```

### 2. Python Agent Service (`python-agent/`)

**Purpose**: Multi-agent AI system for automated BOM review and optimization.

**Technology**:
- FastAPI for HTTP API
- CrewAI for agent orchestration
- Anthropic Claude for LLM
- SQLite for local state

**Agents**:
| Agent | Role |
|-------|------|
| Engineering | Technical spec validation, compliance checks |
| Sourcing | Supply chain risk, lead times, availability |
| Finance | Pricing analysis, budget optimization |

**Flow Architecture**:
```
                    ┌────────────┐
                    │  Ingest    │
                    │    BOM     │
                    └─────┬──────┘
                          │
                    ┌─────▼──────┐
                    │Engineering │
                    │   Review   │
                    └─────┬──────┘
                          │
                    ┌─────▼──────┐
                    │  Sourcing  │
                    │   Review   │
                    └─────┬──────┘
                          │
                    ┌─────▼──────┐
                    │  Finance   │
                    │   Review   │
                    └─────┬──────┘
                          │
                    ┌─────▼──────┐
                    │  Generate  │
                    │   Report   │
                    └────────────┘
```

### 3. Blockchain Contracts (`blockchain/`)

**Purpose**: Immutable audit trail for sourcing decisions and invoices.

**Technology**:
- Solidity 0.8.12
- Hardhat for development
- ERC-7827 standard

**Contract Features**:
- JSON state storage on-chain
- Value Version Control (VVC) - full history of all changes
- Access control via authorized signer
- Gas-optimized for frequent writes

## Data Architecture

### Database Schema (Neon Postgres)

```sql
users
├── id (TEXT, PK)
├── email (TEXT, UNIQUE)
├── password_hash (TEXT)
├── name (TEXT)
├── created_at (TIMESTAMP)
└── email_verified (BOOLEAN)

sessions
├── id (TEXT, PK)
├── user_id (TEXT, FK → users)
├── expires_at (TIMESTAMP)
└── created_at (TIMESTAMP)

password_reset_tokens
├── id (TEXT, PK)
├── user_id (TEXT, FK → users)
├── token_hash (TEXT)
├── expires_at (TIMESTAMP)
└── created_at (TIMESTAMP)

email_verification_tokens
├── id (TEXT, PK)
├── user_id (TEXT, FK → users)
├── token_hash (TEXT)
├── expires_at (TIMESTAMP)
└── created_at (TIMESTAMP)
```

### External Data Sources

| Source | Data Type | Auth Method |
|--------|-----------|-------------|
| DigiKey | Part data, pricing, inventory | OAuth 2.0 |
| Octopart/Nexar | Aggregated supplier data | OAuth 2.0 |
| Mouser | Part data, pricing | API Key |
| OpenAI | AI suggestions | API Key |

## Security Architecture

### Authentication Flow

```
1. User submits email/password
2. Server validates credentials against bcrypt hash
3. Server generates JWT token (jose library)
4. Token stored in HTTP-only cookie
5. Middleware validates token on protected routes
6. Sessions tracked in database for revocation
```

### API Security

- JWT tokens with configurable expiry
- Password hashing with bcrypt
- Email verification for new accounts
- Password reset via secure tokens
- HTTPS enforced in production

### Blockchain Security

- Only authorized signer can write to contract
- All writes permanently recorded
- Version history is append-only
- No deletion capability by design

## Deployment Architecture

### Production Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                      precisionbom.com                                │
│                         (Vercel)                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                              ▼
┌─────────────────────────┐    ┌─────────────────────────────────────┐
│   api.precisionbom.com  │    │          Neon Postgres              │
│      (Render.com)       │    │           (Database)                │
└─────────────────────────┘    └─────────────────────────────────────┘
              │
              ▼
┌─────────────────────────┐
│        Ethereum         │
│       (ERC-7827)        │
└─────────────────────────┘
```

### URLs

| Service | URL |
|---------|-----|
| Web Application | https://precisionbom.com |
| Python Agent API | https://api.precisionbom.com |
| Contact | hello@precisionbom.com |
| Transactional Email | noreply@precisionbom.com |

### Environment Configuration

| Service | Platform | Config |
|---------|----------|--------|
| Web App | Vercel | `nextjs-app/.env` |
| Agent | Render | `python-agent/.env` |
| Database | Neon | Connection string |
| Blockchain | Any EVM | Contract address |

## Performance Considerations

### Caching Strategy

- Part data cached with TTL (supplier APIs are rate-limited)
- Static assets served via Vercel CDN
- Database connection pooling via Neon

### Scalability

- Next.js serverless functions auto-scale
- Python agent can be horizontally scaled
- Database handles connection pooling
- Blockchain writes are batched when possible
