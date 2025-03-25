
import React, { useEffect, useState } from 'react';
import { BoardCell as BoardCellType, Tile as TileType } from '@/types/scrabble';
import BoardCell from './BoardCell';

interface BoardProps {
  board: BoardCellType[][];
  onPlaceTile: (row: number, col: number, tileId: string) => void;
  currentDraggedTile: TileType | null;
}

const Board: React.FC<BoardProps> = ({ board, onPlaceTile, currentDraggedTile }) => {
  const [draggedOverCell, setDraggedOverCell] = useState<{ row: number; col: number } | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (row: number, col: number) => {
    if (currentDraggedTile) {
      onPlaceTile(row, col, currentDraggedTile.id);
    }
    setDraggedOverCell(null);
  };

  const handleCellDragOver = (e: React.DragEvent) => {
    const cellElement = e.currentTarget as HTMLDivElement;
    const rect = cellElement.getBoundingClientRect();
    const row = parseInt(cellElement.getAttribute('data-row') || '0');
    const col = parseInt(cellElement.getAttribute('data-col') || '0');
    
    setDraggedOverCell({ row, col });
  };

  const highlightedCells = draggedOverCell ? [draggedOverCell] : [];

  return (
    <div className="overflow-auto md:overflow-visible p-4">
      <div className="animate-fade-in grid grid-cols-15 gap-0 p-2 bg-scrabble-board rounded-lg shadow-md">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              data-row={rowIndex}
              data-col={colIndex}
            >
              <BoardCell
                cell={cell}
                onDrop={() => handleDrop(rowIndex, colIndex)}
                onDragOver={handleCellDragOver}
                highlightedCells={highlightedCells}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
