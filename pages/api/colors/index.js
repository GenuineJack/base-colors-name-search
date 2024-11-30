import { BaseColorsReader } from '../../../lib/contractInteraction';

export const config = {
  maxDuration: 10 // Set to 10 seconds for Hobby plan
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Search request received:', req.query.search);
    const reader = new BaseColorsReader();
    
    // Set 8-second timeout to ensure we don't hit Vercel's limit
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 8000)
    );

    const results = await Promise.race([
      reader.searchColors(req.query.search || ''),
      timeoutPromise
    ]);

    res.json(results || []);
  } catch (error) {
    console.error('API Error:', error);
    
    if (error.message === 'Request timeout') {
      res.status(504).json({
        error: 'Search timeout',
        message: 'Please try a more specific search term'
      });
    } else {
      res.status(500).json({
        error: 'Search failed',
        message: error.message
      });
    }
  }
}
