import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
  batch: {
    multicall: true
  }
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
      console.log('Starting search:', searchTerm);
      
      // Only search first 50 tokens initially for faster response
      const batchSize = 10;
      const maxTokens = 50;
      const results = [];

      for (let i = 0; i < maxTokens; i += batchSize) {
        const end = Math.min(i + batchSize, maxTokens);
        
        try {
          console.log(`Fetching batch ${i} to ${end}`);
          const colors = await this.client.readContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'getMintedColorsRange',
            args: [BigInt(i), BigInt(end)]
          });

          // Process colors in parallel for this batch
          const batchResults = await Promise.all(
            colors.map(async (color, index) => {
              const tokenId = i + index;
              
              if (this.cache.has(tokenId)) {
                return this.cache.get(tokenId);
              }

              try {
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
                    color,
                    name: nameAttr.value
                  };
                  this.cache.set(tokenId, result);
                  return result;
                }
              } catch (error) {
                console.error(`Error processing token ${tokenId}:`, error);
              }
              return null;
            })
          );

          results.push(...batchResults.filter(r => 
            r && r.name.toLowerCase().includes(searchTerm.toLowerCase())
          ));
        } catch (error) {
          console.error(`Error in batch ${i}-${end}:`, error);
        }
      }

      console.log(`Search complete. Found ${results.length} results`);
      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
}
