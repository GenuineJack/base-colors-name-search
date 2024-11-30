import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';

const CONTRACT_ABI = [
  "function currentTokenId() view returns (uint256)",
  "function getMintedColorsRange(uint256 start, uint256 end) view returns (string[])",
  "function getAttributesAsJson(uint256 tokenId) view returns (string)",
  "function tokenIdToColor(uint256) view returns (string)"
];

export class BaseColorsReader {
  constructor(rpcUrl, contractAddress) {
    const provider = new JsonRpcProvider(rpcUrl);
    this.contract = new Contract(contractAddress, CONTRACT_ABI, provider);
    this.cache = new Map();
  }

  async searchColors(searchTerm, options = { batchSize: 1000, maxResults: 100 }) {
    const currentId = await this.contract.currentTokenId();
    const results = [];
    
    for (let i = 0; i < currentId.toNumber(); i += options.batchSize) {
      const end = Math.min(i + options.batchSize, currentId.toNumber());
      const colors = await this.contract.getMintedColorsRange(i, end);
      
      await Promise.all(colors.map(async (color, index) => {
        const tokenId = i + index;
        const attributes = await this.getTokenAttributes(tokenId);
        const name = this.findColorName(attributes);
        
        if (name.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({ tokenId, color, name });
        }
      }));

      if (results.length >= options.maxResults) break;
    }
    
    return results;
  }

  async getTokenAttributes(tokenId) {
    if (this.cache.has(tokenId)) {
      return this.cache.get(tokenId);
    }
    
    const attributesJson = await this.contract.getAttributesAsJson(tokenId);
    const attributes = JSON.parse(attributesJson);
    this.cache.set(tokenId, attributes);
    return attributes;
  }

  findColorName(attributes) {
    const nameAttr = attributes.find(attr => attr.trait_type === "Color Name");
    return nameAttr ? nameAttr.value : "";
  }

  async getRandomColor() {
    const currentId = await this.contract.currentTokenId();
    const randomId = Math.floor(Math.random() * currentId.toNumber());
    const color = await this.contract.tokenIdToColor(randomId);
    const attributes = await this.getTokenAttributes(randomId);
    const name = this.findColorName(attributes);
    
    return { tokenId: randomId, color, name };
  }
}
