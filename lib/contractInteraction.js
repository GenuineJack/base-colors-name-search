import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const CONTRACT_ADDRESS = '0x7Bc1C072742D8391817EB4Eb2317F98dc72C61dB';
const ABI = [
  // Core token functions
  {
    "inputs": [],
    "name": "currentTokenId",
    "outputs": [{"type": "uint256"}],
    "stateMutability": "view"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "tokenIdToColor",
    "outputs": [{"type": "string"}],
    "stateMutability": "view"
  },
  {
    "inputs": [{"type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"type": "address"}],
    "stateMutability": "view"
  },
  // Color name and attributes
  {
    "inputs": [{"type": "uint256"}],
    "name": "getAttributesAsJson",
    "outputs": [{"type": "string"}],
    "stateMutability": "view"
  },
  {
    "inputs": [{"type": "uint256"}, {"type": "uint256"}],
    "name": "getMintedColorsRange",
    "outputs": [{"type": "string[]"}],
    "stateMutability": "view"
  }
];

export class BaseColorsReader {
  constructor(rpcUrl = process.env.NEXT_PUBLIC_BASE_RPC_URL) {
    this.client = createPublicClient({
      chain: base,
      transport: http(rpcUrl)
    });
    this.cache = new Map();
  }

  async searchColors(query, page = 0, limit = 10) {
    try {
      const currentId = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'currentTokenId'
      });

      const start = page * limit;
      const end = Math.min(Number(currentId), start + limit);
      const results = [];

      for (let i = start; i < end; i++) {
        try {
          const colorInfo = await this.getColorInfo(i);
          if (this.matchesSearch(colorInfo, query)) {
            results.push(colorInfo);
          }
        } catch (error) {
          console.error(`Error processing token ${i}:`, error);
        }
      }

      return {
        colors: results,
        hasMore: end < Number(currentId),
        total: Number(currentId)
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
      })
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
  }

  async getRandomNamedColor() {
    const currentId = await this.client.readContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'currentTokenId'
    });

    for (let attempts = 0; attempts < 10; attempts++) {
      const randomId = Math.floor(Math.random() * Number(currentId));
      const colorInfo = await this.getColorInfo(randomId);
      if (colorInfo.name) {
        return colorInfo;
      }
    }

    throw new Error('No named color found');
  }

  private matchesSearch(colorInfo, query) {
    const searchTerm = query.toLowerCase();
    return (
      colorInfo.name.toLowerCase().includes(searchTerm) ||
      colorInfo.hexColor.toLowerCase().includes(searchTerm)
    );
  }
}
