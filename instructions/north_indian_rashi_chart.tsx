import React, { useState } from 'react';

const NorthIndianRashiChart = () => {
  // Sample chart data - houses 1-12 with planets
  const [chartData, setChartData] = useState({
    1: ['La'],
    2: ['Su'],
    3: [],
    4: ['Me'],
    5: [],
    6: ['Ve'],
    7: [],
    8: ['Ma'],
    9: [],
    10: ['Ju', 'Sa'],
    11: ['Ra'],
    12: ['Ke', 'Mo']
  });

  const planetSymbols = {
    'Su': 'Sun', 'Mo': 'Moon', 'Ma': 'Mars', 'Me': 'Mercury',
    'Ju': 'Jupiter', 'Ve': 'Venus', 'Sa': 'Saturn',
    'Ra': 'Rahu', 'Ke': 'Ketu', 'La': 'Lagna'
  };

  const renderHouseContent = (houseNum: keyof typeof chartData) => {
    const planets = chartData[houseNum];
    return (
      <>
        <div className="text-sm font-bold text-gray-700">{houseNum}</div>
        {planets.length > 0 && (
          <div className="text-xs text-center mt-1">
            {planets.map((planet, idx) => (
              <div key={idx} className="font-semibold text-blue-700">
                {planet}
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">North Indian Rashi Chart</h1>
      
      <div className="relative bg-amber-50" style={{ width: '450px', height: '450px', border: '6px solid #D2691E', borderRadius: '4px' }}>
        <svg width="450" height="450" viewBox="0 0 450 450" className="absolute inset-0">
          {/* Main X diagonal lines */}
          <line x1="0" y1="0" x2="450" y2="450" stroke="#C19A6B" strokeWidth="2" />
          <line x1="450" y1="0" x2="0" y2="450" stroke="#C19A6B" strokeWidth="2" />
          
          {/* Diamond outline connecting midpoints */}
          <line x1="225" y1="0" x2="450" y2="225" stroke="#C19A6B" strokeWidth="2" />
          <line x1="450" y1="225" x2="225" y2="450" stroke="#C19A6B" strokeWidth="2" />
          <line x1="225" y1="450" x2="0" y2="225" stroke="#C19A6B" strokeWidth="2" />
          <line x1="0" y1="225" x2="225" y2="0" stroke="#C19A6B" strokeWidth="2" />
        </svg>

        {/* House 1 - Center (Lagna) */}
        <div className="absolute flex flex-col items-center justify-center" style={{ 
          top: '37.5%', left: '37.5%',
          width: '25%', height: '25%'
        }}>
          <div className="text-lg font-bold text-gray-700">Lagna</div>
          {chartData[1].length > 0 && (
            <div className="text-sm text-center mt-1">
              {chartData[1].map((planet, idx) => (
                <div key={idx} className="font-semibold text-blue-700">
                  {planet}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* House 12 - Top right */}
        <div className="absolute flex flex-col items-center justify-start pt-4" style={{ 
          top: '0', left: '50%',
          width: '25%', height: '25%'
        }}>
          {renderHouseContent(12)}
        </div>

        {/* House 11 - Right top */}
        <div className="absolute flex flex-col items-center justify-center" style={{ 
          top: '12.5%', right: '12.5%',
          width: '20%', height: '20%'
        }}>
          {renderHouseContent(11)}
        </div>

        {/* House 10 - Right middle */}
        <div className="absolute flex flex-col items-center justify-center" style={{ 
          top: '37.5%', right: '0',
          width: '25%', height: '25%'
        }}>
          {renderHouseContent(10)}
        </div>

        {/* House 9 - Right bottom */}
        <div className="absolute flex flex-col items-center justify-center" style={{ 
          bottom: '12.5%', right: '12.5%',
          width: '20%', height: '20%'
        }}>
          {renderHouseContent(9)}
        </div>

        {/* House 8 - Bottom right */}
        <div className="absolute flex flex-col items-center justify-end pb-4" style={{ 
          bottom: '0', right: '25%',
          width: '25%', height: '25%'
        }}>
          {renderHouseContent(8)}
        </div>

        {/* House 7 - Bottom center */}
        <div className="absolute flex flex-col items-center justify-end pb-4" style={{ 
          bottom: '0', left: '37.5%',
          width: '25%', height: '25%'
        }}>
          {renderHouseContent(7)}
        </div>

        {/* House 6 - Bottom left */}
        <div className="absolute flex flex-col items-center justify-end pb-4" style={{ 
          bottom: '0', left: '0',
          width: '25%', height: '25%'
        }}>
          {renderHouseContent(6)}
        </div>

        {/* House 5 - Left bottom */}
        <div className="absolute flex flex-col items-center justify-center" style={{ 
          bottom: '12.5%', left: '12.5%',
          width: '20%', height: '20%'
        }}>
          {renderHouseContent(5)}
        </div>

        {/* House 4 - Left middle */}
        <div className="absolute flex flex-col items-center justify-center" style={{ 
          top: '37.5%', left: '0',
          width: '25%', height: '25%'
        }}>
          {renderHouseContent(4)}
        </div>

        {/* House 3 - Left top */}
        <div className="absolute flex flex-col items-center justify-center" style={{ 
          top: '12.5%', left: '12.5%',
          width: '20%', height: '20%'
        }}>
          {renderHouseContent(3)}
        </div>

        {/* House 2 - Top left */}
        <div className="absolute flex flex-col items-center justify-start pt-4" style={{ 
          top: '0', left: '25%',
          width: '25%', height: '25%'
        }}>
          {renderHouseContent(2)}
        </div>
      </div>

      <div className="mt-8 bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-2">Planet Key</h2>
        <div className="grid grid-cols-3 gap-2 text-sm">
          {Object.entries(planetSymbols).map(([abbr, name]) => (
            <div key={abbr}>
              <span className="font-bold text-blue-700">{abbr}</span> - {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NorthIndianRashiChart;