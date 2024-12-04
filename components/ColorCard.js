import { ExternalLink } from 'lucide-react';

export default function ColorCard({ color }) {
  const shortAddr = addr => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-center space-x-4">
        <div 
          className="w-16 h-16 rounded-lg shadow-inner" 
          style={{ backgroundColor: color.hexColor }}
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold">
            {color.name || color.hexColor}
          </h3>
          <p className="text-gray-500 text-sm">{color.hexColor}</p>
          
          {color.owner ? (
            <div className="mt-2 text-sm">
              Owned by: 
              <a 
                href={color.openseaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-500 hover:text-blue-600"
              >
                {shortAddr(color.owner)}
              </a>
            </div>
          ) : (
            <a 
              href={color.baseColorsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-sm text-blue-500 hover:text-blue-600"
            >
              Available on BaseColors <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
