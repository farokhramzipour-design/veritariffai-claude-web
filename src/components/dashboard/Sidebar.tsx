import React from 'react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 p-4">
      <h1 className="text-2xl font-bold mb-4">ExportCalc</h1>
      <nav>
        <ul>
          <li className="mb-2">
            <a href="#" className="text-gray-300 hover:text-white">
              Calculator
            </a>
          </li>
          <li className="mb-2">
            <a href="#" className="text-gray-300 hover:text-white">
              Results History
            </a>
          </li>
          <li className="mb-2">
            <a href="#" className="text-gray-300 hover:text-white">
              HS Code Browser
            </a>
          </li>
          <li className="mb-2">
            <a href="#" className="text-gray-300 hover:text-white">
              Rate Tables
            </a>
          </li>
          <li className="mb-2">
            <a href="#" className="text-gray-300 hover:text-white">
              AI Assistant
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
