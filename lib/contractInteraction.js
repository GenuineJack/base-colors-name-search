import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Helper function to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org'),
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
    this.client = baseClient;
    this.cache = new Map();
  }

  async searchColors(searchTerm) {
    try {
      console.log('Starting search for:', searchTerm);
      
      const currentId = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'currentTokenId'
      });

      console.log('Current token ID:', currentId);

      const batchSize = 10; // Reduced batch size
      const results = [];

      for (let i = 0; i < Math.min(100, Number(currentId)); i += batchSize) {
        const end = Math.min(i + batchSize, 100);
        
        // Add delay between batches
        if (i > 0) await delay(500);
        
        console.log(`Fetching range ${i} to ${end}`);
        
        try {
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

            // Add small delay between token requests
            await delay(100);
            
            try {
              const attributesJson = await this.client.readContract({
                address: CONTRACT_ADDRESS,
                abi: ABI,
                functionName: 'getAttributesAsJson',
                args: [BigInt(tokenId)]
              });

              const attributes = JSON.parse(attributesJson);
              const nameAttr = attributes.find(attr => attr.trait_type === "Color Name");
              
              if (nameAttr) {
                const result = {
                  tokenId,
                  color: colors[j],
                  name: nameAttr.value
                };
                
                // Cache the result
                this.cache.set(tokenId, result);
                
                if (nameAttr.value.toLowerCase().includes(searchTerm.toLowerCase())) {
                  results.push(result);
                }
              }
            } catch (e) {
              console.error(`Error processing token ${tokenId}:`, e);
            }
          }
        } catch (e) {
          console.error(`Error getting range ${i}-${end}:`, e);
        }
      }

      console.log('Found results:', results);
      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // ... rest of the code remains the same ...
}
