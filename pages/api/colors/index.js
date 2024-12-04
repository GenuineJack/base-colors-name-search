import { BaseColorsReader } from '../../../lib/contractInteraction';

export default async function handler(req, res) {
  const { query = '', page = '0' } = req.query;
  const reader = new BaseColorsReader();

  try {
    const results = await reader.searchColors(query, parseInt(page));
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
