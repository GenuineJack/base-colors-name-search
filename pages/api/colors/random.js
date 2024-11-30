import { BaseColorsReader } from '../../../lib/contractInteraction';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const reader = new BaseColorsReader();
    const color = await reader.getRandomColor();
    console.log('Random color:', color); // Debug log
    res.json(color);
  } catch (error) {
    console.error('API Error:', error); // Debug log
    res.status(500).json({ error: error.message });
  }
}
