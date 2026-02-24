import React from 'react';

const AIChatWidget = () => {
  return (
    <div className="fixed bottom-4 right-4 w-96 bg-gray-800 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold">AI Assistant</h3>
      </div>
      <div className="p-4 h-64 overflow-y-auto">
        {/* Chat messages will go here */}
      </div>
      <div className="p-4 border-t border-gray-700">
        <input
          type="text"
          placeholder="Ask a question..."
          className="w-full bg-gray-700 text-white rounded-lg p-2"
        />
      </div>
    </div>
  );
};

export default AIChatWidget;
