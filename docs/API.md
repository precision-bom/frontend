# PrecisionBOM API Reference

## Base URLs

| Environment | URL |
|-------------|-----|
| Development (Web) | `http://localhost:3000/api` |
| Development (Agent) | `http://localhost:8000` |
| Production (Web) | `https://precisionbom.com/api` |
| Production (Agent) | `https://api.precisionbom.com` |

## Authentication

All protected endpoints require a valid JWT token in cookies. Tokens are set automatically after login.

### Register

Create a new user account.

```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

### Login

Authenticate and receive a session token.

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "abc123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

Sets `auth_token` cookie with JWT.

### Logout

End the current session.

```
POST /auth/logout
```

**Response:**
```json
{
  "success": true
}
```

---

## BOM Operations

### Parse BOM

Upload and parse a BOM file.

```
POST /parse-bom
Content-Type: multipart/form-data
```

**Request:**
- `file`: CSV or Excel file

**Response:**
```json
{
  "success": true,
  "items": [
    {
      "lineNumber": 1,
      "partNumber": "RC0805FR-0710KL",
      "manufacturer": "Yageo",
      "description": "RES 10K OHM 1% 1/8W 0805",
      "quantity": 100,
      "referenceDesignator": "R1-R100"
    }
  ],
  "warnings": [
    "Row 5: Missing manufacturer"
  ]
}
```

### Search Parts

Search for parts across suppliers.

```
GET /search-parts
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `limit` | number | No | Max results (default: 20) |
| `supplier` | string | No | Filter by supplier |

**Response:**
```json
{
  "results": [
    {
      "partNumber": "STM32F103C8T6",
      "manufacturer": "STMicroelectronics",
      "description": "MCU 32-bit ARM Cortex M3",
      "category": "Microcontrollers",
      "suppliers": [
        {
          "name": "DigiKey",
          "sku": "497-6063-ND",
          "price": 2.50,
          "currency": "USD",
          "stock": 5000,
          "leadTimeDays": 0,
          "moq": 1
        }
      ],
      "datasheet": "https://...",
      "rohs": true
    }
  ],
  "totalCount": 150,
  "query": "STM32F103"
}
```

---

## AI Suggestions

### Get Part Suggestions

Get AI-powered suggestions for a specific part.

```
POST /suggest
```

**Request Body:**
```json
{
  "partNumber": "LM7805CT",
  "manufacturer": "Texas Instruments",
  "requirements": {
    "maxPrice": 1.00,
    "minStock": 100,
    "rohs": true
  }
}
```

**Response:**
```json
{
  "original": {
    "partNumber": "LM7805CT",
    "price": 0.89,
    "stock": 50,
    "issue": "Low stock"
  },
  "suggestions": [
    {
      "partNumber": "L7805CV",
      "manufacturer": "STMicroelectronics",
      "similarity": 0.95,
      "price": 0.45,
      "stock": 10000,
      "reason": "Drop-in replacement with better availability",
      "tradeoffs": "Slightly different thermal characteristics"
    }
  ]
}
```

### Get BOM Suggestions

Analyze entire BOM and suggest optimizations.

```
POST /suggest-boms
```

**Request Body:**
```json
{
  "items": [
    {
      "partNumber": "RC0805FR-0710KL",
      "quantity": 100
    }
  ],
  "optimization": "cost" | "availability" | "balanced"
}
```

**Response:**
```json
{
  "summary": {
    "originalCost": 150.00,
    "optimizedCost": 125.00,
    "savings": 25.00,
    "savingsPercent": 16.7
  },
  "suggestions": [
    {
      "original": "RC0805FR-0710KL",
      "suggested": "CRCW080510K0FKEA",
      "savings": 5.00,
      "reason": "Equivalent specs, better bulk pricing"
    }
  ],
  "risks": [
    {
      "partNumber": "STM32F103C8T6",
      "risk": "single_source",
      "recommendation": "Consider STM32F103CBT6 as backup"
    }
  ]
}
```

---

## Blockchain (Gatekeeper)

### Write Record

Write a record to the ERC-7827 contract.

```
POST /gatekeeper
```

**Request Body:**
```json
{
  "action": "write",
  "keys": ["decision_001", "timestamp"],
  "values": ["{\"part\":\"LM7805\"}", "2025-01-11T12:00:00Z"]
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x123...",
  "blockNumber": 12345678
}
```

### Read Record

Read current state or version history.

```
POST /gatekeeper
```

**Request Body (current state):**
```json
{
  "action": "read"
}
```

**Response:**
```json
{
  "json": "{\"decision_001\": \"{...}\", \"timestamp\": \"...\"}"
}
```

**Request Body (version history):**
```json
{
  "action": "version",
  "key": "decision_001"
}
```

**Response:**
```json
{
  "history": [
    "{\"part\":\"LM7805\",\"status\":\"pending\"}",
    "{\"part\":\"LM7805\",\"status\":\"approved\"}"
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTH_REQUIRED` | 401 | Authentication required |
| `AUTH_INVALID` | 401 | Invalid credentials |
| `AUTH_EXPIRED` | 401 | Token expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMITED` | 429 | Too many requests |
| `SUPPLIER_ERROR` | 502 | External API failure |
| `BLOCKCHAIN_ERROR` | 500 | Contract interaction failed |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/*` | 10 req/min |
| `/search-parts` | 60 req/min |
| `/suggest*` | 20 req/min |
| `/parse-bom` | 10 req/min |
| `/gatekeeper` | 30 req/min |

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1704978000
```
