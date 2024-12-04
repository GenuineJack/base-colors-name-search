import React, { useState } from 'react';
import { Search, Palette, ExternalLink } from 'lucide-react';

export default function BaseColorsSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchColors = async (term) => {
    if (!term) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/colors?search=${encodeURIComponent(term)}`);
      const data = await response.json();
      setSearchResults(data.colors || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchColors(searchTerm);
  };

  const handleRandomColor = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/colors/random');
      const data = await response.json();
      setSearchResults([data]);
    } catch (error) {
      console.error('Random color failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-20">
      <div className="flex items-center mb-8">
        <Palette className="w-12 h-12 mr-3 text-blue-500" />
        <h1 className="text-4xl font-semibold">
          <span className="text-blue-500">B</span>
          <span className="text-red-500">a</span>
          <span className="text-yellow-500">s</span>
          <span className="text-blue-500">e</span>
          <span className="text-green-500"> C</span>
          <span className="text-red-500">o</span>
          <span className="text-blue-500">l</span>
          <span className="text-yellow-500">o</span>
          <span className="text-green-500">r</span>
          <span className="text-red-500">s</span>
          <span className="text-blue-500"> S</span>
          <span className="text-red-500">e</span>
          <span className="text-yellow-500">a</span>
          <span className="text-green-500">r</span>
          <span className="text-blue-500">c</span>
          <span className="text-red-500">h</span>
        </h1>
      </div>

      <div className="w-full max-w-2xl px-4">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 pr-12"
              placeholder="Search for color names..."
            />
            <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </form>

        <div className="flex justify-center mt-6 space-x-3">
          <button 
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-50 text-sm text-gray-700 hover:border-gray-300 rounded"
          >
            Base Colors Search
          </button>
          <button 
            onClick={handleRandomColor}
            className="px-4 py-2 bg-gray-50 text-sm text-gray-700 hover:border-gray-300 rounded"
          >
            I'm Feeling Colorful
          </button>
        </div>

        {isLoading ? (
          <div className="mt-8 text-center text-gray-600">Searching...</div>
        ) : searchResults.length > 0 ? (
          <div className="mt-8 space-y-4">
            {searchResults.map((result) => (
              <div 
                key={result.tokenId} 
                className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-16 h-16 rounded-lg shadow-inner" 
                    style={{ backgroundColor: result.hexColor }} 
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {result.name || result.hexColor}
                    </h3>
                    <p className="text-gray-500 text-sm">{result.hexColor}</p>
                    {result.owner ? (
                      <div className="mt-2 text-sm">
                        Owned by: 
                        <a 
                          href={result.openseaUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1 text-blue-500 hover:text-blue-600"
                        >
                          {`${result.owner.slice(0, 6)}...${result.owner.slice(-4)}`}
                        </a>
                      </div>
                    ) : (
                      <a 
                        href={result.baseColorsUrl}
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
            ))}
          </div>
        ) : searchTerm && (
          <div className="mt-8 text-center text-gray-600">
            No colors found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
}
