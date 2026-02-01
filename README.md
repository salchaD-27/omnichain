# Omnichain - Cross-Chain Asset Management Platform

A full-stack omnichain application for creating, managing, and tracking digital assets across multiple blockchain networks using SIWE (Sign-In with Ethereum) authentication.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ConnectWallet │ Dashboard │ Tabs (Marketplace/Assets) │   │
│  └─────────────────────────────────────────────────────────┘   │
│              │                    │                            │
│              ▼                    ▼                            │
│  ┌────────────────────┐  ┌────────────────────┐               │
│  │ WalletContext      │  │ AuthContext        │               │
│  │ - wagmi hooks      │  │ - SIWE login       │               │
│  │ - chain detection  │  │ - session mgmt     │               │
│  └────────────────────┘  └────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │   Backend API      │
                    │   (Express)        │
                    │  - REST endpoints  │
                    │  - PostgreSQL      │
                    │  - Session auth    │
                    └────────────────────┘
                              │
                              ▼
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Hardhat Node  │    │   PostgreSQL  │    │     IPFS      │
│ (Chain 31337) │    │   Database    │    │  (Storage)    │
└───────────────┘    └───────────────┘    └───────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, TypeScript, TailwindCSS |
| **Web3** | wagmi, viem, WalletConnect, MetaMask |
| **Backend** | Node.js, Express, PostgreSQL |
| **Smart Contracts** | Solidity, Hardhat |
| **Authentication** | SIWE (Sign-In with Ethereum) |
| **Storage** | IPFS for asset thumbnails |
| **Containerization** | Docker, Docker Compose |

## Project Structure

```
omnichain/
├── frontend/                 # Next.js frontend application
│   ├── app/
│   │   ├── components/      # UI components (ConnectWallet)
│   │   ├── context/         # React contexts (Wallet, Auth, Asset)
│   │   ├── dashboard/       # Protected dashboard pages
│   │   └── page.tsx         # Landing page with wallet connect
│   └── wagmi/               # wagmi configuration
├── backend/                  # Express.js API server
│   └── routes/
│       ├── api-auth.js      # Authentication endpoints
│       └── api-asset.js     # Asset management endpoints
├── hardhat/                  # Hardhat blockchain environment
│   ├── contracts/           # Solidity smart contracts
│   └── ignition/            # Contract deployment scripts
├── docker-compose.yml        # Docker orchestration
└── .github/workflows/       # CI/CD pipelines
```

## Features

### 1. Wallet Connection
- **Supported Wallets**: MetaMask, WalletConnect, Injected, Safe, Base Account
- **Chain Support**: Hardhat Localhost (31337) as anchor chain
- **Automatic Detection**: Identifies connected chain and network status

### 2. SIWE Authentication (Sign-In with Ethereum)
- **Nonce Generation**: Secure nonce creation with 7-minute expiration
- **Signature Verification**: On-chain signature verification
- **Session Management**: HTTP-only cookies with 1-hour sessions
- **Auto Hydration**: Session persists on page refresh

### 3. Asset Management
- **Create Assets**: Upload icon, name, description, color
- **View Assets**: Display all assets owned by user
- **Asset States**: Drafted, Active, Inactive, Deleted
- **IPFS Storage**: Asset thumbnails stored on IPFS

### 4. Dashboard
- **Marketplace Tab (Tab 0)**: Browse available assets
- **Assets Tab (Tab 1)**: Create and manage your assets
- **User Tab (Tab 2)**: User profile and wallet info

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MetaMask or other Web3 wallet

### Quick Start with Docker

```bash
# Start all services
cd /Users/salchad27/Desktop/PH/web3/omnichain
./run.sh

# Or manually:
docker compose up -d --build
```

### Manual Development Setup

1. **Start Hardhat Node**
```bash
cd hardhat
npx hardhat node
```

2. **Start Backend**
```bash
cd backend
npm install
npm run dev
```

3. **Start Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Smart Contract

### AssetRegistry.sol
Main contract for on-chain asset tracking.

**Functions:**
- `createAsset()` - Register new asset
- `getAssetFromId()` - Retrieve asset data
- `getAssetsForAddress()` - Get all assets for owner
- `deleteAsset()` - Soft delete asset
- `changeAssetOwner()` - Transfer ownership

**States:**
- `Drafted` - Initial state
- `Active` - Publicly visible
- `Inactive` - Hidden from marketplace
- `Deleted` - Removed

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/omnichain
NODE_ENV=development
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
WALLET_CONNECT_PROJECT_ID=your_project_id
```

## Docker Services

| Service | Port | Description |
|---------|------|-------------|
| hardhat | 8545 | Ethereum node (Hardhat) |
| postgres | 5432 | PostgreSQL database |
| backend | 3001 | Express API server |
| frontend | 3000 | Next.js web application |

## Security Features

- **HTTP-only Cookies**: Session tokens not accessible via JavaScript
- **Signature Verification**: On-chain message verification
- **Nonce Expiration**: Short-lived nonces (7 minutes)
- **Session Expiration**: 1-hour session lifetime
- **Input Validation**: Server-side validation on all endpoints

## Development Notes

### Adding New Chains
To support additional chains, update:
1. `frontend/wagmi/wagmi.config.ts` - Add chain to chains array
2. `frontend/app/context/WalletContext.tsx` - Update `isAnchorChain` check
3. `frontend/app/components/ConnectWallet.tsx` - Update network switch message

### Network Switching
The app supports automatic network switching via MetaMask's `wallet_switchEthereumChain` API. Add new networks in the ConnectWallet component.

## License

MIT

