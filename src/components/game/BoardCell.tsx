import React, { useRef } from 'react';
import { BoardCell as BoardCellType, Tile as TileType } from '@/types/scrabble';
import Tile from './Tile';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface BoardCellProps {
  cell: BoardCellType;
  onDrop: (row: number, col: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  highlightedCells?: { row: number; col: number }[];
  placedTile?: TileType | null;
  isMobile?: boolean;
}

const CELL_TYPE_LABELS: Record<string, string> = {
  'triple-word': 'TW',
  'double-word': 'DW',
  'triple-letter': 'TL',
  'double-letter': 'DL',
  'center': '★',
  'regular': '',
};

const BoardCell: React.FC<BoardCellProps> = ({
  isMobile = useIsMobile(),
  cell,
  onDrop,
  onDragOver,
  highlightedCells = [],
  placedTile,
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  
  const isHighlighted = highlightedCells.some(
    (highlightedCell) => highlightedCell.row === cell.row && highlightedCell.col === cell.col
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    onDragOver(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDrop(cell.row, cell.col);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Check if there's a dragged tile over this cell
    const draggedTiles = document.querySelectorAll('.dragging');
    if (draggedTiles.length > 0) {
      // Simulate a drop event
      const dropEvent = new Event('drop', { bubbles: true }) as unknown as React.DragEvent;
      handleDrop(dropEvent);
    }
  };

  const renderCellContent = () => {
    // Check for placed tile from game state first
    const tileToShow = placedTile || cell.tile;
    
    if (tileToShow) {
      return (
        <div className="w-full h-full">
          <Tile tile={tileToShow} isPlayable={!cell.tile?.isPlaced} />
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-600/80">
        {CELL_TYPE_LABELS[cell.type]}
      </div>
    );
  };

  return (
    <div
      ref={cellRef}
      className={cn(
        'relative border border-gray-300/80',
        'w-full h-full', // Use full width/height of grid cell
        'board-cell', // Add class for ensuring square shape
        cell.type !== 'regular' && cell.type,
        isHighlighted && 'bg-primary/30 border-primary/60',
        'transition-all duration-150',
        'p-[1px] sm:p-[2px]' // Consistent padding based on screen size
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onTouchEnd={handleTouchEnd}
    >
      {renderCellContent()}
    </div>
  );
};

export default BoardCell;
