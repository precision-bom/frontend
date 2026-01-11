# PrecisionBOM Terminal

Next.js terminal for high-fidelity, AI-powered BOM sourcing gated by forensic blockchain substrate.

**Production URL**: https://precisionbom.com

## Forensic Sourcing Protocol (V1.0)

The PrecisionBOM terminal implements a unique **Thermodynamic Sourcing Protocol** leveraging `ERC-7827` and `x402` principles to ensure identity integrity and compute efficiency.

### 1. Identity Handshake (Clickwrap)
Access begins with a cryptographic **Clickwrap Handshake**. Users must anchor their 0x identity by signing a terminal access agreement. This anchors the session in the forensic substrate without requiring traditional passwords.

### 2. Tiered Gatekeeper (x402 + ERC-7827)
Sourcing strikes are protected by a three-tiered verification system:
- **Tier 1: Forensic Cache** - Instant lookup against the `ERC-7827` on-chain registry.
- **Tier 2: Ledger Audit** - Autonomous scanning of the **Sepolia Ledger** for valid 0.001 ETH payment strikes.
- **Tier 3: Auto-Write Sync** - Server-side synchronization that anchors ledger payments into the substrate, granting 30-day access and refilling agentic capital.

### 3. Thermodynamic AI Pricing
AI sourcing strikes are grounded in thermodynamic capital:
- **Strike Cost:** 50 Tokens per intelligent sourcing operation.
- **Capital Refill:** 1000 Tokens granted upon every successful 0.001 Sepolia ETH subscription strike.
- **Visibility:** Real-time monitoring of identity, expiry, and capital via the **Forensic Ledger**.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Blockchain**: Sepolia Test Network
- **Protocol Standards**: ERC-7827 (JSON VVC), x402 (Payment Required)
- **Identity**: EIP-191 Signatures (ethers.js)
- **AI**: OpenAI GPT-4o-mini (via internal agent logic)

## Getting Started

### Prerequisites
- Node.js 18+
- Web3 Wallet (MetaMask) set to **Sepolia Network**

### Installation

```bash
cd nextjs-app
npm install
```

### Environment Variables

Ensure `.env` contains:
```env
# Sepolia Infrastructure
SEPOLIA_RPC_URL=https://...
PRIVATE_KEY=0x... (Server-side signer for Auto-Write)
ETHERSCAN_API_KEY=... (For ledger audits)

# AI Strikes
OPENAI_API_KEY=sk-...
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to initiate the forensic boot sequence.

## Substrate Components

| Component | Path | Description |
|-----------|------|-------------|
| **Gatekeeper API** | `app/api/gatekeeper/route.ts` | Tiered verification engine |
| **Forensic Ledger** | `components/PaymentTab.tsx` | Substrate status & payment UI |
| **Identity Anchor** | `components/WalletConnect.tsx` | Clickwrap handshake handler |
| **Forensic Gate** | `lib/forensic-gate.ts` | Server-side identity utility |
| **BOM Agent** | `lib/bom-agent.ts` | Thermodynamic sourcing logic |

---
*Note: PrecisionBOM operates on a 'Strike-First' economy. Every sourcing decision is permanently recorded in the Heartwood substrate.*