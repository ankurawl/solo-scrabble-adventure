
import React from 'react';
import ScrabbleGame from '@/components/game/ScrabbleGame';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 font-sans">
      <div className="container mx-auto px-4 py-8">
        <ScrabbleGame />
      </div>
    </div>
  );
};

export default Index;
