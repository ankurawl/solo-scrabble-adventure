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
  isCurrentTurnPlacement?: boolean;
  onTileDragStart?: (e: React.DragEvent, tile: TileType) => void;
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
  isCurrentTurnPlacement = false,
  onTileDragStart,
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  
  const isHighlighted = highlightedCells.some(
    (highlightedCell) => highlightedCell.row === cell.row && highlightedCell.col === cell.col
  );

  // This function just determines if the cell can accept a drop
  // Either the cell is empty OR it contains a tile placed in the current turn
  const canAcceptDrop = () => {
    return !cell.tile || isCurrentTurnPlacement;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Show we can drop here
    e.dataTransfer.dropEffect = 'move';
    
    if (canAcceptDrop()) {
      onDragOver(e);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Always handle the drop regardless of tileId
    // The parent component's onDrop will do the necessary validation
    onDrop(cell.row, cell.col);
    
    // Stop event propagation to prevent multiple drops
    e.stopPropagation();
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    const draggedTiles = document.querySelectorAll('.dragging');
    if (draggedTiles.length > 0) {
      const dropEvent = new Event('drop', { bubbles: true }) as unknown as React.DragEvent;
      
      if (canAcceptDrop()) {
        handleDrop(dropEvent);
      }
    }
  };

  const renderCellContent = () => {
    const tileToShow = placedTile || cell.tile;
    
    if (tileToShow) {
      return (
        <div className="w-full h-full">
          <Tile 
            tile={tileToShow} 
            isPlayable={!cell.tile?.isPlaced} 
            isCurrentTurnPlacement={isCurrentTurnPlacement}
            onDragStart={onTileDragStart}
          />
        </div>
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-600/80">
        {CELL_TYPE_LABELS[cell.type]}
      </div>
    );
  };

  const currentTurnIndicatorClass = isCurrentTurnPlacement ? 'ring-2 ring-green-500/50' : '';

  return (
    <div
      ref={cellRef}
      className={cn(
        'relative border border-gray-300/80',
        'w-full h-full',
        'board-cell',
        cell.type !== 'regular' && cell.type,
        isHighlighted && 'bg-primary/30 border-primary/60',
        isCurrentTurnPlacement && currentTurnIndicatorClass,
        'transition-all duration-150',
        'p-[1px] sm:p-[2px]'
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onTouchEnd={handleTouchEnd}
      data-current-turn-placement={isCurrentTurnPlacement ? 'true' : 'false'}
      data-row={cell.row}
      data-col={cell.col}
    >
      {renderCellContent()}
    </div>
  );
};

export default BoardCell;
