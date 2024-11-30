import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const ABI = [
  {
    "inputs": [],
    "name": "currentTokenId",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}, {"type": "uint256"}],
    "name": "getMintedColorsRange",
    "outputs": [{"type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "getAttributesAsJson",
    "outputs": [{"type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "tokenIdToColor",
    "outputs": [{"type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

export class BaseColorsReader {
  constructor() {
    // Configure client for Base network
    this.client = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org') // Base RPC URL
    });
  }

  // ... rest of the code remains the same ...
}
