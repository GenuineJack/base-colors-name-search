import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

// Import the Base Colors contract ABI and address
import baseColorsABI from './baseColorsABI.json';
const baseColorsAddress = '0x123456789abcdef';

const BaseColorSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const baseColorsContract = new ethers.Contract(baseColorsAddress, baseColorsABI, provider);

      // Search by named color
      let colorNames = await baseColorsContract.getColorNames();
      let matchingColors = colorNames.filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

      // Search by hex code
      if (matchingColors.length === 0 && searchTerm.startsWith('#')) {
        let hexColors = await baseColorsContract.getColorHexCodes();
        matchingColors = hexColors.filter(hex => hex.toLowerCase().includes(searchTerm.toLowerCase()));
      }

      // Fetch owner information for each matching color
      const results = await Promise.all(matchingColors.map(async (colorName) => {
        const tokenId = await baseColorsContract.getTokenIdByName(colorName);
        const owner = await baseColorsContract.ownerOf(tokenId);
        return {
          name: colorName,
          hex: await baseColorsContract.getColorHexByName(colorName),
          owner: owner,
          isAvailable: owner === ethers.constants.AddressZero
        };
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching for colors:', error);
    }
  };

  const handleRandomColor = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const baseColorsContract = new ethers.Contract(baseColorsAddress, baseColorsABI, provider);

      // Get all named colors
      let colorNames = await baseColorsContract.getColorNames();

      // Select a random named color
      const randomIndex = Math.floor(Math.random() * colorNames.length);
      const randomColorName = colorNames[randomIndex];

      // Fetch the hex code and owner information for the random color
      const tokenId = await baseColorsContract.getTokenIdByName(randomColorName);
      const owner = await baseColorsContract.ownerOf(tokenId);
      const hex = await baseColorsContract.getColorHexByName(randomColorName);

      // Navigate to the random color's details page
      navigate(`/color/${randomColorName}`, {
        state: {
          name: randomColorName,
          hex: hex,
          owner: owner,
          isAvailable: owner === ethers.constants.AddressZero
        }
      });
    } catch (error) {
      console.error('Error getting random color:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Base Colors Name Search</h1>
      <div className="flex mb-4">
        <input
          type="text"
          className="border border-gray-300 rounded-md px-3 py-2 flex-1 mr-2"
          placeholder="Search by name or hex code"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-md"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>
      <div className="mb-4">
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-md"
          onClick={handleRandomColor}
        >
          I'm Feeling Colorful
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {searchResults.map((result, index) => (
          <div key={index} className="border border-gray-300 rounded-md p-4">
            <h2 className="text-lg font-medium mb-2">{result.name}</h2>
            <p className="mb-2">Hex: {result.hex}</p>
            {result.isAvailable ? (
              <p className="mb-2">
                <a href={`https://basecolors.com/color/${result.name}`} target="_blank" rel="noopener noreferrer">
                  This Color is Available
                </a>
              </p>
            ) : (
              <p className="mb-2">
                Owned By:{' '}
                <a href={`https://opensea.io/assets/${baseColorsAddress}/${await baseColorsContract.getTokenIdByName(result.name)}`} target="_blank" rel="noopener noreferrer">
                  {result.owner}
                </a>
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BaseColorSearch;
