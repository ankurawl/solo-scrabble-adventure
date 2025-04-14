import React, { useState } from 'react';
import { Tile as TileType } from '@/types/scrabble';
import Tile from './Tile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, RotateCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TileRackProps {
  tiles: TileType[];
  tilesRemaining: number;
  onTileDragStart: (e: React.DragEvent, tile: TileType) => void;
  onShuffleTiles: () => void;
  onPlayWord: () => void;
  onRecallTiles: () => void;
  canPlay: boolean;
  wordScore?: number;
  isMobile?: boolean;
  onReturnTileToRack?: (tileId: string) => void;
}

const TileRack: React.FC<TileRackProps> = ({
  tiles,
  tilesRemaining,
  onTileDragStart,
  onShuffleTiles,
  onPlayWord,
  onRecallTiles,
  canPlay,
  wordScore,
  isMobile = useIsMobile(),
  onReturnTileToRack,
}) => {
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);

  const handleTileDragStart = (e: React.DragEvent, tile: TileType) => {
    setDraggedTileId(tile.id);
    onTileDragStart(e, tile);
  };

  const handleTileDragEnd = () => {
    setDraggedTileId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData('text/plain');
    if (tileId && onReturnTileToRack) {
      onReturnTileToRack(tileId);
    }
  };

  return (
    <div 
      className={cn(
        "glass-panel w-full animate-slide-up",
        "p-2 sm:p-3 rounded-md"
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className={cn(
        "flex justify-between items-center",
        "mb-3"
      )}>
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-medium text-gray-500">
            Your Tiles <span className="font-semibold">({tilesRemaining} left)</span>
          </h2>
          {wordScore !== undefined && wordScore > 0 && (
            <span className="text-xs text-green-600">+{wordScore}</span>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={onPlayWord}
            disabled={!canPlay}
            className={cn(
              'flex items-center gap-1',
              canPlay ? 'bg-green-600 hover:bg-green-700' : '',
              'p-1 sm:p-2 text-xs'
            )}
            title="Play Word"
          >
            <Check className="h-3 w-3" />
            <span>Play</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRecallTiles}
            className={cn(
              "flex items-center gap-1",
              "p-1 sm:p-2 text-xs"
            )}
            title="Recall Tiles"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Recall</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShuffleTiles}
            className={cn(
              "flex items-center gap-1",
              "p-1 sm:p-2 text-xs"
            )}
            title="Shuffle Tiles"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Shuffle</span>
          </Button>
        </div>
      </div>

      <div 
        className="flex flex-wrap gap-2 justify-center mt-3 mb-1"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={cn(
              "transition-transform duration-200",
              "w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12"
            )}
            onDragEnd={handleTileDragEnd}
          >
            <Tile
              tile={tile}
              isDragging={draggedTileId === tile.id}
              onDragStart={handleTileDragStart}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TileRack;
