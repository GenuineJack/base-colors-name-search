import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const baseClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
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

      const batchSize = 50;
      const results = [];

      for (let i = 0; i < Math.min(1000, Number(currentId)); i += batchSize) {
        const end = Math.min(i + batchSize, 1000);
        
        console.log(`Fetching range ${i} to ${end}`);
        
        try {
          const colors = await this.client.readContract({
            address: CONTRACT_ADDRESS,
            abi: ABI,
            functionName: 'getMintedColorsRange',
            args: [BigInt(i), BigInt(end)]
          });

          console.log(`Found ${colors.length} colors in this range`);

          for (let j = 0; j < colors.length; j++) {
            const tokenId = i + j;
            
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
                console.log(`Token ${tokenId} name:`, nameAttr.value);
                results.push({
                  tokenId,
                  color: colors[j],
                  name: nameAttr.value
                });
              }
            } catch (e) {
              console.error(`Error processing token ${tokenId}:`, e);
            }
          }
        } catch (e) {
          console.error(`Error getting range ${i}-${end}:`, e);
        }
      }
      
      const filteredResults = results.filter(result => 
        result.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log('Found results:', filteredResults);
      return filteredResults;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  async getRandomColor() {
    try {
      const currentId = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'currentTokenId'
      });

      const randomId = Math.floor(Math.random() * Number(currentId));
      
      const [color, attributesJson] = await Promise.all([
        this.client.readContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'tokenIdToColor',
          args: [BigInt(randomId)]
        }),
        this.client.readContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
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
