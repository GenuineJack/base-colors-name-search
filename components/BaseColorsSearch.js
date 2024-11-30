import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';

// Import the Base Colors contract ABI and address
import baseColorsABI from './baseColorsABI.json';
const baseColorsAddress = '0x123456789abcdef';

const BaseColorSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load all named colors on component mount
    const fetchNamedColors = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const baseColorsContract = new ethers.Contract(baseColorsAddress, baseColorsABI, provider);
        const colorNames = await baseColorsContract.getColorNames();
        const colorDetails = await Promise.all(
          colorNames.map(async (name) => {
            const tokenId = await baseColorsContract.getTokenIdByName(name);
            const owner = await baseColorsContract.ownerOf(tokenId);
            const hex = await baseColorsContract.getColorHexByName(name);
            return {
              name,
              hex,
              owner,
              isAvailable: owner === ethers.constants.AddressZero,
            };
          })
        );
        setSearchResults(colorDetails);
      } catch (error) {
        console.error('Error fetching named colors:', error);
      }
    };
    fetchNamedColors();
  }, []);

  const handleSearch = () => {
    const filteredResults = searchResults.filter((result) =>
      result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.hex.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(filteredResults);
  };

  const handleRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * searchResults.length);
    const randomColor = searchResults[randomIndex];
    navigate(`/color/${randomColor.name}`, {
      state: randomColor,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Base Colors Name Search</h1>
      <div className="flex mb-4">
        {/* Search input and button */}
      </div>
      <div className="mb-4">
        {/* Random color button */}
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
                
                  href={async () => {
                    const tokenId = await baseColorsContract.getTokenIdByName(result.name);
                    return `https://opensea.io/assets/${baseColorsAddress}/${tokenId}`;
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
