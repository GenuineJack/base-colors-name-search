import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export class BaseColorsReader {
  constructor() {
    this.client = createPublicClient({
      chain: base,
      transport: http('https://mainnet.base.org')
    });

    this.contract = {
      address: '0x0E820DF54D9e8D72E622B9BE23486674e5C9B026',
      abi: [
        {
          "inputs": [],
          "name": "totalSupply",  // Changed from currentTokenId to totalSupply
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
      ]
    };
  }

  async searchColors(searchTerm) {
    try {
      console.log('Starting search for:', searchTerm);
      
      const currentId = await this.client.readContract({
        ...this.contract,
        functionName: 'totalSupply'  // Changed function name here too
      });

      console.log('Total supply:', currentId);

      const batchSize = 10;
      const results = [];

      for (let i = 0; i < Math.min(100, Number(currentId)); i += batchSize) {
        const end = Math.min(i + batchSize, 100);
        
        console.log(`Fetching range ${i} to ${end}`);
        
        const colors = await this.client.readContract({
          ...this.contract,
          functionName: 'getMintedColorsRange',
          args: [BigInt(i), BigInt(end)]
        });

        for (let j = 0; j < colors.length; j++) {
          const tokenId = i + j;
          
          const attributesJson = await this.client.readContract({
            ...this.contract,
            functionName: 'getAttributesAsJson',
            args: [BigInt(tokenId)]
          });

          const attributes = JSON.parse(attributesJson);
          const nameAttr = attributes.find(attr => attr.trait_type === "Color Name");
          
          if (nameAttr && nameAttr.value.toLowerCase().includes(searchTerm.toLowerCase())) {
            results.push({
              tokenId,
              color: colors[j],
              name: nameAttr.value
            });
          }
        }
      }
      
      console.log('Search results:', results);
      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async getRandomColor() {
    try {
      const currentId = await this.client.readContract({
        ...this.contract,
        functionName: 'totalSupply'  // Changed here too
      });

      const randomId = Math.floor(Math.random() * Number(currentId));
      
      const [color, attributesJson] = await Promise.all([
        this.client.readContract({
          ...this.contract,
          functionName: 'tokenIdToColor',
          args: [BigInt(randomId)]
        }),
        this.client.readContract({
          ...this.contract,
          functionName: 'getAttributesAsJson',
          args: [BigInt(randomId)]
        })
      ]);

      const attributes = JSON.parse(attributesJson);
      const nameAttr = attributes.find(attr => attr.trait_type === "Color Name");

      return {
        tokenId: randomId,
        color,
        name: nameAttr ? nameAttr.value : ''
      };
    } catch (error) {
      console.error('Random color error:', error);
      throw error;
    }
  }
}
