
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, RotateCcw, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScorePanelProps {
  score: number;
  tilesRemaining: number;
  onPlayWord: () => void;
  onRecallTiles: () => void;
  onNewGame: () => void;
  canPlay: boolean;
  wordScore?: number;
}

const ScorePanel: React.FC<ScorePanelProps> = ({
  score,
  tilesRemaining,
  onPlayWord,
  onRecallTiles,
  onNewGame,
  canPlay,
  wordScore,
}) => {
  return (
    <div className="glass-panel p-4 sm:p-6 w-full max-w-md animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm font-medium text-gray-500">Score</p>
          <h2 className="text-4xl font-semibold">
            {score}
            {wordScore !== undefined && wordScore > 0 && (
              <span className="text-xl text-green-600 ml-2">+{wordScore}</span>
            )}
          </h2>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500">Tiles Remaining</p>
          <p className="text-xl font-medium">{tilesRemaining}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <Button
          onClick={onPlayWord}
          disabled={!canPlay}
          className={cn(
            'flex items-center gap-2',
            canPlay && 'bg-green-600 hover:bg-green-700'
          )}
        >
          <Check className="h-4 w-4" />
          Play Word
        </Button>
        <Button
          variant="outline"
          onClick={onRecallTiles}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Recall Tiles
        </Button>
        <Button
          variant="ghost"
          onClick={onNewGame}
          className="flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          New Game
        </Button>
      </div>
    </div>
  );
};

export default ScorePanel;
