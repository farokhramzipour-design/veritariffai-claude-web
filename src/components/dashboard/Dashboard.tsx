import React, { useState } from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import { CalculatorPanel } from './CalculatorPanel';
import { ResultsPanel } from './ResultsPanel';
import AIChatWidget from './AIChatWidget';

const Dashboard = () => {
  const [showCalculator, setShowCalculator] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8">
          {!showCalculator && (
            <button
              onClick={() => setShowCalculator(true)}
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded"
            >
              New Calculation
            </button>
          )}
          {showCalculator && (
            <>
              <CalculatorPanel />
              <ResultsPanel />
            </>
          )}
        </main>
      </div>
      <AIChatWidget />
    </div>
  );
};

export default Dashboard;
