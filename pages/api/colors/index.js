import { BaseColorsReader } from '../../../lib/contractInteraction';

export const config = {
  maxDuration: 300 // Extend function timeout to 5 minutes
};

export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), 8000)
  );

  try {
    console.log('Search request received:', req.query.search);
    const reader = new BaseColorsReader();
    
    // Race between the search and timeout
    const results = await Promise.race([
      reader.searchColors(req.query.search || ''),
      timeoutPromise
    ]);

    console.log('Search completed, found results:', results?.length || 0);
    res.json(results || []);
  } catch (error) {
    console.error('API Error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    if (error.message === 'Request timeout') {
      res.status(504).json({
        error: 'Search took too long to complete',
        message: 'Please try a more specific search term'
      });
    } else {
      res.status(500).json({
        error: 'Failed to search colors',
        message: error.message
      });
    }
  }
}
