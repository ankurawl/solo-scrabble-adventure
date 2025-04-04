import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScorePanelProps {
  score: number;
  onNewGame: () => void;
  wordScore?: number;
  isMobile?: boolean;
}

const ScorePanel: React.FC<ScorePanelProps> = ({
  isMobile = useIsMobile(),
  score,
  onNewGame,
  wordScore,
}) => {
  return (
    <div className={cn(
      "glass-panel w-full animate-slide-up",
      "p-2 sm:p-3 md:p-4 rounded-md"
    )}>
      {/* Consistent layout for all screen sizes */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">Score</p>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold">
            {score}
            {wordScore !== undefined && wordScore > 0 && (
              <span className="text-xs sm:text-sm text-green-600 ml-1">+{wordScore}</span>
            )}
          </h2>
        </div>
          
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={onNewGame}
            className="flex items-center p-1 sm:p-2"
            title="New Game"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">New Game</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScorePanel;
