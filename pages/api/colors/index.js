import { BaseColorsReader } from '../../../lib/contractInteraction';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Search term:', req.query.search); // Debug log
    const reader = new BaseColorsReader();
    const results = await reader.searchColors(req.query.search || '');
    console.log('Search results:', results); // Debug log
    res.json(results);
  } catch (error) {
    console.error('API Error:', error); // Debug log
    res.status(500).json({ error: error.message });
  }
}
