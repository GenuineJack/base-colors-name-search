import React, { useState } from 'react';
import { Search, Palette, ExternalLink } from 'lucide-react';

export default function BaseColorsSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  const searchColors = async (term, newSearch = true) => {
    if (newSearch) {
      setPage(0);
      setResults([]);
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/colors?query=${encodeURIComponent(term)}&page=${newSearch ? 0 : page}`);
      const data = await response.json();
      setResults(newSearch ? data.colors : [...results, ...data.colors]);
      setHasMore(data.hasMore);
      if (!newSearch) setPage(page + 1);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setIsLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchColors(searchTerm);
  };

  const handleRandomColor = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/colors/random');
      const color = await response.json();
      setResults([color]);
      setHasMore(false);
    } catch (error) {
      console.error('Random color failed:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-20">
      <div className="flex items-center mb-8">
        <Palette className="w-12 h-12 mr-3 text-blue-500" />
        <h1 className="text-4xl font-semibold">Base Colors Search</h1>
      </div>

      <div className="w-full max-w-2xl px-4">
        <form onSubmit={handleSearch} className="w-full">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-5 py-3 border border-gray-200 rounded-full focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 pr-12"
              placeholder="Search by name or hex code..."
            />
            <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <Search className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </form>

        <div className="flex justify-center mt-6 space-x-3">
          <button onClick={handleSearch} className="px-4 py-2 bg-gray-50 text-sm text-gray-700 hover:border-gray-300 rounded">
            Search
          </button>
          <button onClick={handleRandomColor} className="px-4 py-2 bg-gray-50 text-sm text-gray-700 hover:border-gray-300 rounded">
            I'm Feeling Colorful
          </button>
        </div>

        {isLoading && <div className="mt-8 text-center">Loading...</div>}

        <div className="mt-8 space-y-4">
          {results.map((color) => (
            <div key={color.tokenId} className="flex items-center p-4 border rounded-lg hover:shadow-md">
              <div className="w-12 h-12 rounded-md mr-4" style={{ backgroundColor: color.hexColor }} />
              <div className="flex-grow">
                <h3 className="text-lg font-medium">{color.name || color.hexColor}</h3>
                <div className="flex space-x-4 text-sm text-gray-500">
                  <a href={color.openseaUrl} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500">
                    View on OpenSea <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                  <a href={color.baseColorsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-blue-500">
                    View on BaseColors <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </div>
                <p className="mt-1">
                  {color.owner ? `Owned by: ${color.owner}` : 'Color is available'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {hasMore && !isLoading && (
          <button
            onClick={() => searchColors(searchTerm, false)}
            className="mt-4 w-full py-2 bg-gray-50 text-sm text-gray-700 hover:bg-gray-100 rounded"
          >
            Load More
          </button>
        )}
      </div>
    </div>
  );
}
