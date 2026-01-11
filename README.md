# PrecisionBOM

AI-powered Bill of Materials (BOM) sourcing platform with blockchain-backed audit trails.

## Overview

PrecisionBOM automates electronic component sourcing through multi-agent AI systems. It combines real-time supplier data from DigiKey, Mouser, and Octopart with intelligent part recommendations and immutable record-keeping on Ethereum.

## Project Structure

```
precisionBOM/
├── nextjs-app/      # Web application (Next.js 14)
├── python-agent/    # AI agent service (CrewAI + FastAPI)
├── blockchain/      # Smart contracts (Hardhat + Solidity)
└── docs/            # Architecture and design documentation
```

## Components

### [nextjs-app](./nextjs-app)
Next.js web application providing the user interface for BOM upload, part search, and sourcing workflows. Features authentication, real-time part lookups via DigiKey/Octopart APIs, and AI-powered suggestions.

### [python-agent](./python-agent)
Multi-agent BOM processing service built with CrewAI. Specialized agents (Engineering, Sourcing, Finance) evaluate components for compliance, supply chain risk, and budget constraints.

### [blockchain](./blockchain)
ERC-7827 smart contract implementation for immutable JSON state with version history. Provides forensic-grade audit trails for sourcing decisions and invoice records.

## Live URLs

| Service | URL |
|---------|-----|
| Web Application | https://precisionbom.com |
| API (Python Agent) | https://api.precisionbom.com |

**Contact**: hello@precisionbom.com

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- pnpm or npm
- make

### Start Everything
```bash
make dev
```

### Individual Services

**Web Application:**
```bash
make dev-web
# or: cd nextjs-app && npm run dev
```

**Python Agent:**
```bash
make dev-api
# or: cd python-agent && uv run uvicorn bom_agent_service.main:app --reload
```

**Smart Contracts:**
```bash
cd blockchain
npm install
npx hardhat compile
```

### Clean All
```bash
make clean
```

## Environment Variables

See `.env.example` files in each directory for required configuration:
- `nextjs-app/.env.example` - API keys, database, auth
- `python-agent/.env` - Anthropic API key

## Database

The application uses Neon Postgres. Configure `DATABASE_URL` in `nextjs-app/.env` with your Neon connection string.

## License

MIT
