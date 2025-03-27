
import React from 'react';
import { Tile as TileType } from '@/types/scrabble';
import { cn } from '@/lib/utils';

interface TileProps {
  tile: TileType;
  isDragging?: boolean;
  isPlayable?: boolean;
  onDragStart?: (e: React.DragEvent, tile: TileType) => void;
  onTileClick?: (tile: TileType) => void;
}

const Tile: React.FC<TileProps> = ({
  tile,
  isDragging = false,
  isPlayable = true,
  onDragStart,
  onTileClick,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (!isPlayable && tile.isPlaced) return; // Don't allow dragging permanently placed tiles
    
    e.dataTransfer.setData('text/plain', tile.id);
    if (onDragStart) {
      onDragStart(e, tile);
    }
  };

  const handleClick = () => {
    if (onTileClick && isPlayable) {
      onTileClick(tile);
    }
  };

  return (
    <div
      className={cn(
        'relative w-full h-full flex items-center justify-center',
        'bg-scrabble-tile border border-amber-700/30 rounded-sm shadow-tile select-none cursor-pointer',
        'transform transition-all duration-200 ease-out',
        isDragging ? 'dragging opacity-75' : 'hover:shadow-tile-hover hover:scale-102',
        !isPlayable && tile.isPlaced && 'opacity-90 cursor-default',
        !isPlayable && !tile.isPlaced && 'cursor-grab'
      )}
      draggable={isPlayable || !tile.isPlaced}
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <span className="tile-letter text-base sm:text-lg font-bold text-amber-950">
        {tile.letter}
      </span>
      <span className="tile-points text-xs absolute bottom-0.5 right-1 font-medium text-amber-900">
        {tile.points}
      </span>
    </div>
  );
};

export default Tile;
