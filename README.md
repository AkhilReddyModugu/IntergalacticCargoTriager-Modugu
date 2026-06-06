# IntergalacticCargoTriager - Modugu

An internal tool to parse, serve, and display legacy intergalactic cargo manifests.

## Prerequisites

- Node.js v18 or higher
- npm

## Project Structure

```
├── manifest.txt          # Raw cargo manifest input
├── parser/               # Task 1: Manifest parser
├── output/               # Task 1: Generated JSON
├── server/               # Task 2: Express API
└── client/               # Task 3: React dashboard
```

## How to Run

### Task 1 — Parser

```bash
cd parser
node parser.js
```

Output is written to `output/Task 1 - Modugu - Parser.json`.

### Task 2 — Backend API

```bash
cd server
npm install
node server.js
```

Server runs on **http://localhost:3001**

**Endpoints:**
- `GET /api/cargo` — returns the 10-record cargo JSON array
- Any request with header `X-System-Override: true` returns HTTP 418 with body `System override denied`

**Test the 418 response:**
```bash
curl -v -H "X-System-Override: true" http://localhost:3001/api/cargo
```

### Task 3 — Frontend Dashboard

> Make sure the backend server is running first (port 3001).

```bash
cd client
npm install
npm run dev
```

Dashboard runs on **http://localhost:3000**

## Business Rules

- **Sector-7 Multiplier:** Cargo destined for any location containing "Sector-7" has its weight multiplied by 1.45
- **Prime Discard:** After rounding, records with a prime weight are discarded entirely
- **Earth Pinned:** Earth-bound cargo is always displayed last on the dashboard regardless of weight
