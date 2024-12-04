import { BaseColorsReader } from '../../../lib/contractInteraction';

export default async function handler(req, res) {
  const reader = new BaseColorsReader();

  try {
    const color = await reader.getRandomNamedColor();
    res.json(color);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
