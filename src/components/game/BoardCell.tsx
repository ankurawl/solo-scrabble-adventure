
import React from 'react';
import { BoardCell as BoardCellType, Tile as TileType } from '@/types/scrabble';
import Tile from './Tile';
import { cn } from '@/lib/utils';

interface BoardCellProps {
  cell: BoardCellType;
  onDrop: (row: number, col: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  highlightedCells?: { row: number; col: number }[];
  placedTile?: TileType | null;
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
  cell,
  onDrop,
  onDragOver,
  highlightedCells = [],
  placedTile,
}) => {
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

  const renderCellContent = () => {
    // Check for placed tile from game state first
    const tileToShow = placedTile || cell.tile;
    
    if (tileToShow) {
      return <Tile tile={tileToShow} isPlayable={!cell.tile?.isPlaced} />;
    }

    return (
      <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-600/70">
        {CELL_TYPE_LABELS[cell.type]}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'relative border border-gray-200/70 w-8 h-8 sm:w-10 sm:h-10',
        cell.type !== 'regular' && cell.type,
        isHighlighted && 'bg-primary/20 border-primary/40',
        'transition-all duration-150'
      )}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {renderCellContent()}
    </div>
  );
};

export default BoardCell;
