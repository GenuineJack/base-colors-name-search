# Base Colors Search

A Next.js application that lets users search and discover named colors from the Base Colors NFT collection. The app provides a Google-inspired interface for searching through all minted Base Colors tokens without requiring a wallet connection.

## Features

- Search colors by name
- Random color discovery
- Real-time color preview
- Clean, minimalist interface
- No wallet connection required
- Fully responsive design

## Tech Stack

- Next.js 13+
- Tailwind CSS
- Ethers.js
- Lucide React Icons

## Prerequisites

- Node.js 16+
- NPM or Yarn
- RPC URL (Infura/Alchemy)
- Base Colors Contract Address

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/base-colors-search.git
cd base-colors-search
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_RPC_URL=your_rpc_url
NEXT_PUBLIC_CONTRACT_ADDRESS=contract_address
```

4. Run development server:
```bash
npm run dev
```

## Project Structure

```
base-colors-search/
├── components/
│   └── BaseColorsSearch.js
├── lib/
│   └── contractInteraction.js
├── pages/
│   ├── api/
│   │   └── colors/
│   │       ├── index.js
│   │       └── random.js
│   └── index.js
└── .env.local
```

## API Routes

- `GET /api/colors` - Search colors by name
- `GET /api/colors/random` - Get random color

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

## Contract Integration

The app interacts with the Base Colors NFT contract deployed at `YOUR_CONTRACT_ADDRESS`. Key functions used:

- `currentTokenId()`
- `getMintedColorsRange()`
- `getAttributesAsJson()`
- `tokenIdToColor()`

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

MIT License
