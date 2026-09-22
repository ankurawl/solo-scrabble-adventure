import React, { useRef, useEffect, useCallback } from 'react';
import { BoardCell as BoardCellType, Tile as TileType } from '@/types/scrabble';
import Tile from './Tile';
import { cn } from '@/lib/utils';

interface BoardCellProps {
  cell: BoardCellType;
  onDrop: (row: number, col: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  highlightedCells?: { row: number; col: number }[];
  placedTile?: TileType | null;
  isCurrentTurnPlacement?: boolean;
  onTileDragStart?: (e: React.DragEvent, tile: TileType) => void;
}

const BoardCell: React.FC<BoardCellProps> = ({
  cell,
  onDrop,
  onDragOver,
  highlightedCells = [],
  placedTile = null,
  isCurrentTurnPlacement = false,
  onTileDragStart,
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  
  // Map cell type to background color classes (removed text-white from these classes)
  const getCellTypeClass = () => {
    switch (cell.type) {
      case 'triple-word':
        return 'bg-red-600/90';
      case 'double-word':
        return 'bg-pink-400/90';
      case 'triple-letter':
        return 'bg-blue-600/90';
      case 'double-letter':
        return 'bg-blue-400/90';
      case 'center':
        return 'bg-pink-400/90';
      default:
        return 'bg-amber-50';
    }
  };

  // Get abbreviation for cell type
  const getCellTypeAbbreviation = () => {
    switch (cell.type) {
      case 'triple-word':
        return 'TW';
      case 'double-word':
        return 'DW';
      case 'triple-letter':
        return 'TL';
      case 'double-letter':
        return 'DL';
      case 'center':
        return '★';
      default:
        return '';
    }
  };

  // Determine if this cell is highlighted
  const isHighlighted = highlightedCells.some(
    (highlightedCell) => highlightedCell.row === cell.row && highlightedCell.col === cell.col
  );

  // Current turn placement styles
  const currentTurnIndicatorClass = 'ring-2 ring-green-500';

  // Whether the cell can accept a dropped tile
  const canAcceptDrop = () => {
    // Can drop if there's no tile from current turn AND no permanently placed tile
    return !placedTile && !cell.tile;
  };

  // Handle drag over to allow dropping
  const handleDragOver = (e: React.DragEvent) => {
    if (canAcceptDrop()) {
      e.preventDefault();
      // Show we can drop here
      e.dataTransfer.dropEffect = 'move';
      onDragOver(e);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Stop event propagation to prevent multiple cell drops
    e.stopPropagation();
    
    if (canAcceptDrop()) {
      // Check for drag data
      const tileId = e.dataTransfer.getData('text/plain');
      if (tileId) {
        onDrop(cell.row, cell.col);
      }
    }
  };
  
  // Handle custom drop event from touch drag
  const handleCustomDrop = useCallback((e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail && customEvent.detail.tileId && canAcceptDrop()) {
      onDrop(cell.row, cell.col);
    }
  }, [onDrop, cell.row, cell.col, canAcceptDrop]);
  
  // Handle touch end events - used for the custom drop mechanism with touch
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (canAcceptDrop()) {
      // Prevent any default browser handling that might interfere with our custom drag/drop
      e.preventDefault();
    }
  };
  
  // Set up listener for custom drop events from touch
  useEffect(() => {
    const currentRef = cellRef.current;
    if (currentRef) {
      currentRef.addEventListener('custom-drop', handleCustomDrop);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('custom-drop', handleCustomDrop);
      }
    };
  }, [handleCustomDrop]);
  
  // Render the cell content
  const renderCellContent = () => {
    // First check for a tile placed in the current turn (from placedTiles)
    if (placedTile) {
      return (
        <div className="tile-container">
          <Tile
            tile={placedTile}
            isPlayable={false}
            isCurrentTurnPlacement={isCurrentTurnPlacement}
            onDragStart={onTileDragStart}
          />
        </div>
      );
    }
    
    // Then check for a permanently placed tile from previous turns (from board state)
    if (cell.tile) {
      return (
        <div className="tile-container">
          <Tile
            tile={cell.tile}
            isPlayable={false}
            isCurrentTurnPlacement={false} // This is from a previous turn
            onDragStart={null}
          />
        </div>
      );
    }
    
    // Otherwise show the cell type abbreviation
    return (
      <div className="cell-type-marker w-full h-full flex items-center justify-center">
        <span className="font-semibold opacity-80 select-none cell-text text-white">
          {getCellTypeAbbreviation()}
        </span>
      </div>
    );
  };

  return (
    <div
      ref={cellRef}
      className={cn(
        'relative border border-gray-300/80',
        'w-full h-full',
        'board-cell',
        getCellTypeClass(),
        isHighlighted && 'bg-primary/30 border-primary/60',
        isCurrentTurnPlacement && currentTurnIndicatorClass,
        'transition-all duration-150',
        'p-0 sm:p-[1px] md:p-[2px]',
        canAcceptDrop() && 'drop-target' // Add a class to highlight droppable cells
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onTouchEnd={handleTouchEnd}
      data-current-turn-placement={isCurrentTurnPlacement ? 'true' : 'false'}
      data-row={cell.row}
      data-col={cell.col}
      style={{touchAction: 'none'}}
    >
      {renderCellContent()}
    </div>
  );
};

export default BoardCell;
