import { ExternalLink } from 'lucide-react';

export default function ColorCard({ color }) {
  const shortAddress = addr => 
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="flex items-center p-4 border rounded-lg hover:shadow-md transition-all">
      <div 
        className="w-12 h-12 rounded-md mr-4" 
        style={{ backgroundColor: color.hexColor }}
      />
      <div className="flex-grow">
        <h3 className="text-lg font-medium">
          {color.name || color.hexColor}
        </h3>
        <div className="flex space-x-4 text-sm text-gray-500">
          <a 
            href={color.openseaUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center hover:text-blue-500"
          >
            OpenSea <ExternalLink className="w-4 h-4 ml-1" />
          </a>
          <a 
            href={color.baseColorsUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center hover:text-blue-500"
          >
            BaseColors <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>
        <p className="mt-1">
          {color.owner ? 
            `Owned by: ${shortAddress(color.owner)}` : 
            'Color is available'}
        </p>
      </div>
    </div>
  );
}
