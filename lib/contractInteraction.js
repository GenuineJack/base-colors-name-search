import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const client = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org')
});

const CONTRACT_ADDRESS = '0x7Bc1C072742D8391817EB4Eb2317F98dc72C61dB';
const ABI = [
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "tokenIdToColor",
    "outputs": [{"type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"type": "address"}],
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
    this.client = client;
    this.cache = new Map();
  }

  async searchColors(query, page = 0, limit = 100) {
    try {
      const totalSupply = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'totalSupply'
      });

      const results = [];
      const batchSize = 20;
      const searchLimit = Math.min(Number(totalSupply), 1000);

      for (let i = 0; i < searchLimit; i += batchSize) {
        const end = Math.min(i + batchSize, searchLimit);
        
        for (let j = i; j < end; j++) {
          try {
            const colorInfo = await this.getColorInfo(j);
            if (this._matchesQuery(colorInfo, query)) {
              results.push(colorInfo);
            }
          } catch (error) {
            console.error(`Error processing token ${j}:`, error);
          }
        }

        if (results.length >= limit) break;
      }

      return {
        colors: results.slice(0, limit),
        hasMore: results.length >= limit
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async getColorInfo(tokenId) {
    if (this.cache.has(tokenId)) {
      return this.cache.get(tokenId);
    }

    try {
      const [hexColor, attributesJson, owner] = await Promise.all([
        this.client.readContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'tokenIdToColor',
          args: [BigInt(tokenId)]
        }),
        this.client.readContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'getAttributesAsJson',
          args: [BigInt(tokenId)]
        }),
        this.client.readContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)]
        }).catch(() => null)
      ]);

      const attributes = JSON.parse(attributesJson);
      const nameAttr = attributes.find(attr => attr.trait_type === "Color Name");

      const info = {
        tokenId,
        hexColor,
        name: nameAttr?.value || '',
        owner,
        openseaUrl: `https://opensea.io/assets/base/${CONTRACT_ADDRESS}/${tokenId}`,
        baseColorsUrl: `https://basecolors.com/colors/${tokenId}`
      };

      this.cache.set(tokenId, info);
      return info;
    } catch (error) {
      console.error(`Error fetching color info for token ${tokenId}:`, error);
      return null;
    }
  }

  _matchesQuery(colorInfo, query) {
    if (!colorInfo || !query) return false;
    const searchTerm = query.toLowerCase();
    return (
      colorInfo.name?.toLowerCase().includes(searchTerm) ||
      colorInfo.hexColor?.toLowerCase().includes(searchTerm)
    );
  }

  async getRandomNamedColor() {
    const totalSupply = await this.client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'totalSupply'
    });

    for (let attempts = 0; attempts < 10; attempts++) {
      const randomId = Math.floor(Math.random() * Number(totalSupply));
      const colorInfo = await this.getColorInfo(randomId);
      if (colorInfo?.name) {
        return colorInfo;
      }
    }

    throw new Error('No named color found');
  }
}
