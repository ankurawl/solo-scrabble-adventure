
import React, { useState } from 'react';
import { Tile as TileType } from '@/types/scrabble';
import Tile from './Tile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface TileRackProps {
  tiles: TileType[];
  onTileDragStart: (e: React.DragEvent, tile: TileType) => void;
  onShuffleTiles: () => void;
}

const TileRack: React.FC<TileRackProps> = ({ 
  tiles, 
  onTileDragStart,
  onShuffleTiles
}) => {
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);

  const handleTileDragStart = (e: React.DragEvent, tile: TileType) => {
    setDraggedTileId(tile.id);
    onTileDragStart(e, tile);
  };

  const handleTileDragEnd = () => {
    setDraggedTileId(null);
  };

  return (
    <div className="glass-panel p-4 sm:p-6 w-full max-w-md animate-slide-up">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-medium text-gray-500">Your Tiles</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onShuffleTiles}
          className="text-xs flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Shuffle
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {tiles.map((tile) => (
          <div 
            key={tile.id} 
            className="transition-transform duration-200"
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
