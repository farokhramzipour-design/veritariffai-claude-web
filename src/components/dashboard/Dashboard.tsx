import React from 'react';
import Topbar from './Topbar';
import Sidebar from './Sidebar';
import CalculatorPanel from './CalculatorPanel';
import ResultsPanel from './ResultsPanel';
import AIChatWidget from './AIChatWidget';

const Dashboard = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-8">
          <CalculatorPanel />
          <ResultsPanel />
        </main>
      </div>
      <AIChatWidget />
    </div>
  );
};

export default Dashboard;
