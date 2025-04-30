
import React from 'react';
import { ClipboardCheck } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <ClipboardCheck className="h-6 w-6 text-blue-600" />
        <h1 className="text-xl font-semibold">LLM Trace Evaluator</h1>
      </div>
    </header>
  );
};

export default Header;
