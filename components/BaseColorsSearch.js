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
    const response = await fetch('/api/colors/random');
    const data = await response.json();
    setSearchResults([data]);
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
    <span className="mx-2">·</span>
    <span className="text-green-500">C</span>
    <span className="text-red-500">o</span>
    <span className="text-blue-500">l</span>
    <span className="text-yellow-500">o</span>
    <span className="text-green-500">r</span>
    <span className="text-red-500">s</span>
    <span className="mx-2">·</span>
    <span className="text-gray-700">Search</span>
  </h1>
</div>
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
                className="flex items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div 
                  className="w-12 h-12 rounded-md mr-4" 
                  style={{ backgroundColor: result.color }} 
                />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {result.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {result.color}
                  </p>
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
