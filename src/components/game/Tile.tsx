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
      <div className="relative flex items-center justify-center h-full">
        <span className={cn(
          "text-xl",
          tile.letter === ' ' && "text-amber-700/50"
        )}>
          {tile.letter === ' ' ? '?' : tile.letter}
        </span>
        <span className="absolute bottom-0.5 left-3.5 text-xs font-normal text-amber-900">
          {tile.points}
        </span>
      </div>
    </div>
  );
};

export default Tile;
