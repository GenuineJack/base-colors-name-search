import { createPublicClient, http, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';

// Base Colors contract address
const CONTRACT_ADDRESS = '0x0E820DF54D9e8D72E622B9BE23486674e5C9B026';

// Simplified ABI for the functions we need
const CONTRACT_ABI = [
  'function currentTokenId() view returns (uint256)',
  'function getMintedColorsRange(uint256 start, uint256 end) view returns (string[])',
  'function getAttributesAsJson(uint256 tokenId) view returns (string)',
  'function tokenIdToColor(uint256) view returns (string)'
];

export class BaseColorsReader {
  constructor() {
    this.client = createPublicClient({
      chain: mainnet,
      transport: http(process.env.NEXT_PUBLIC_RPC_URL)
    });
    this.cache = new Map();
  }

  async searchColors(searchTerm, options = { batchSize: 100, maxResults: 20 }) {
    try {
      // Get total tokens
      const currentId = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'currentTokenId'
      });

      const results = [];
      
      // Search in batches
      for (let i = 0; i < Number(currentId); i += options.batchSize) {
        const end = Math.min(i + options.batchSize, Number(currentId));
        
        // Get colors in this range
        const colors = await this.client.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getMintedColorsRange',
          args: [BigInt(i), BigInt(end)]
        });

        // Get attributes for each color
        await Promise.all(colors.map(async (color, index) => {
          const tokenId = i + index;
          const attributes = await this.getTokenAttributes(tokenId);
          const name = this.findColorName(attributes);
          
          if (name && name.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({ tokenId, color, name });
          }
        }));

        if (results.length >= options.maxResults) break;
      }
      
      return results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  async getTokenAttributes(tokenId) {
    if (this.cache.has(tokenId)) {
      return this.cache.get(tokenId);
    }

    try {
      const attributesJson = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getAttributesAsJson',
        args: [BigInt(tokenId)]
      });

      const attributes = JSON.parse(attributesJson);
      this.cache.set(tokenId, attributes);
      return attributes;
    } catch (error) {
      console.error(`Error getting attributes for token ${tokenId}:`, error);
      return [];
    }
  }

  findColorName(attributes) {
    const nameAttr = attributes.find(attr => attr.trait_type === "Color Name");
    return nameAttr ? nameAttr.value : "";
  }

  async getRandomColor() {
    try {
      const currentId = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'currentTokenId'
      });

      const randomId = Math.floor(Math.random() * Number(currentId));
      const color = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'tokenIdToColor',
        args: [BigInt(randomId)]
      });

      const attributes = await this.getTokenAttributes(randomId);
      const name = this.findColorName(attributes);
      
      return { tokenId: randomId, color, name };
    } catch (error) {
      console.error('Random color error:', error);
      return null;
    }
  }
}
