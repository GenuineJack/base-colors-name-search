// Previous imports stay the same

export class BaseColorsReader {
  // Previous methods stay the same

  async searchColors(query, page = 0, limit = 100) { // Increased limit
    try {
      const totalSupply = await this.client.readContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'totalSupply'
      });

      // Search through more tokens
      const results = [];
      const batchSize = 20;
      const searchLimit = Math.min(Number(totalSupply), 1000); // Search first 1000 tokens

      for (let i = 0; i < searchLimit; i += batchSize) {
        const end = Math.min(i + batchSize, searchLimit);
        const promises = [];

        for (let j = i; j < end; j++) {
          promises.push(this.getColorInfo(j));
        }

        const batchResults = await Promise.all(promises);
        results.push(...batchResults.filter(result => 
          result?.name?.toLowerCase().includes(query.toLowerCase()) ||
          result?.hexColor?.toLowerCase().includes(query.toLowerCase())
        ));

        if (results.length >= limit) break;
      }

      return {
        colors: results.slice(0, limit),
        hasMore: results.length >= limit,
        total: Number(totalSupply)
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
}
