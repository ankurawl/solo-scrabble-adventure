
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
    if (!isPlayable) return;
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
        'relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center',
        'bg-scrabble-tile rounded-md shadow-tile select-none cursor-pointer',
        'transform transition-all duration-200 ease-out',
        isDragging ? 'dragging opacity-75' : 'hover:shadow-tile-hover hover:scale-102',
        !isPlayable && 'opacity-50 cursor-default'
      )}
      draggable={isPlayable}
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <span className="tile-letter text-lg sm:text-xl font-semibold">
        {tile.letter}
      </span>
      <span className="tile-points">
        {tile.points}
      </span>
    </div>
  );
};

export default Tile;
