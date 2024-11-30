import { BaseColorsReader } from '../../../lib/contractInteraction';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('API called with search term:', req.query.search);
    const reader = new BaseColorsReader();
    
    if (!reader.searchColors) {
      console.error('searchColors method missing from reader');
      throw new Error('Search method not available');
    }

    console.log('Starting search...');
    const results = await reader.searchColors(req.query.search || '');
    console.log('Search completed with results:', results);
    
    res.json(results);
  } catch (error) {
    console.error('Detailed API Error:', {
      message: error.message,
      stack: error.stack,
      cause: error.cause
    });
    res.status(500).json({ 
      error: 'Failed to search colors',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
