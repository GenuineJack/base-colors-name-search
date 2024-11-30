import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL)
});

const CONTRACT_ADDRESS = '0x7Bc1C072742D8391817EB4Eb2317F98dc72C61dB';
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
  }
];

export class BaseColorsReader {
  constructor() {
    this.client = baseClient;
    this.cache = new Map();
  }

  async searchColors(searchTerm) {
    try {
      // Only search first 20 tokens for quick response
      const batchSize = 5;
      const maxTokens = 20;
      const results = [];

      for (let i = 0; i < maxTokens; i += batchSize) {
        const end = Math.min(i + batchSize, maxTokens);
        
        const colors = await this.client.readContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'getMintedColorsRange',
          args: [BigInt(i), BigInt(end)]
        });

        for (let j = 0; j < colors.length; j++) {
          const tokenId = i + j;
          
          // Use cache if available
          if (this.cache.has(tokenId)) {
            const cached = this.cache.get(tokenId);
            if (cached.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              results.push(cached);
            }
            continue;
          }

          const attributesJson = await this.client.readContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'getAttributesAsJson',
            args: [BigInt(tokenId)]
          });

          const attributes = JSON.parse(attributesJson);
          const nameAttr = attributes.find(attr => 
            attr.trait_type === "Color Name"
          );

          if (nameAttr) {
            const result = {
              tokenId,
              color: colors[j],
              name: nameAttr.value
            };
            this.cache.set(tokenId, result);
            if (result.name.toLowerCase().includes(searchTerm.toLowerCase())) {
              results.push(result);
            }
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
}
