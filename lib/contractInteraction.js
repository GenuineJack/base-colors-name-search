import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export class BaseColorsReader {
  // ... constructor remains the same ...

  async searchColors(searchTerm) {
    try {
      console.log('Starting search for:', searchTerm);
      
      const currentId = await this.client.readContract({
        ...this.contract,
        functionName: 'currentTokenId'
      });

      console.log('Current token ID:', currentId);

      const batchSize = 50; // Increased batch size
      const results = [];

      // Search first 1000 tokens instead of just 100
      for (let i = 0; i < Math.min(1000, Number(currentId)); i += batchSize) {
        const end = Math.min(i + batchSize, 1000);
        
        console.log(`Fetching range ${i} to ${end}`);
        
        try {
          const colors = await this.client.readContract({
            ...this.contract,
            functionName: 'getMintedColorsRange',
            args: [BigInt(i), BigInt(end)]
          });

          console.log(`Found ${colors.length} colors in this range`);

          for (let j = 0; j < colors.length; j++) {
            const tokenId = i + j;
            
            try {
              const attributesJson = await this.client.readContract({
                ...this.contract,
                functionName: 'getAttributesAsJson',
                args: [BigInt(tokenId)]
              });

              console.log(`Token ${tokenId} attributes:`, attributesJson);

              const attributes = JSON.parse(attributesJson);
              const nameAttr = attributes.find(attr => attr.trait_type === "Color Name");
              
              if (nameAttr) {
                console.log(`Token ${tokenId} name:`, nameAttr.value);
                // Don't filter by search term yet, just collect all names
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
      
      console.log('All found colors before filtering:', results);
      
      // Filter results after collecting them
      const filteredResults = results.filter(result => 
        result.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log('Filtered results:', filteredResults);
      return filteredResults;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // ... getRandomColor remains the same ...
}
