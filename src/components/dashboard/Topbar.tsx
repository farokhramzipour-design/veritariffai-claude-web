import React from 'react';

const Topbar = () => {
  return (
    <div className="flex items-center justify-between bg-gray-800 p-4">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold">ExportCalc</h1>
      </div>
      <div className="flex items-center">
        {/* Add search, status indicators, and user menu here */}
      </div>
    </div>
  );
};

export default Topbar;
