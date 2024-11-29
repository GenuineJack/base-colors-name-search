import { BaseColorsReader } from '../../../lib/contractInteraction';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const reader = new BaseColorsReader(
    process.env.NEXT_PUBLIC_RPC_URL,
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  );

  try {
    const { search } = req.query;
    const results = await reader.searchColors(search || '');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
