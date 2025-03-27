
import React, { useEffect, useState } from 'react';
import { BoardCell as BoardCellType, Tile as TileType } from '@/types/scrabble';
import BoardCell from './BoardCell';

interface BoardProps {
  board: BoardCellType[][];
  onPlaceTile: (row: number, col: number, tileId: string) => void;
  currentDraggedTile: TileType | null;
  placedTiles: { row: number; col: number; tile: TileType }[];
}

const Board: React.FC<BoardProps> = ({ board, onPlaceTile, currentDraggedTile, placedTiles }) => {
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
    const row = parseInt(cellElement.getAttribute('data-row') || '0');
    const col = parseInt(cellElement.getAttribute('data-col') || '0');
    
    setDraggedOverCell({ row, col });
  };

  // Get placed tile for a specific cell
  const getPlacedTileForCell = (row: number, col: number) => {
    const placedTile = placedTiles.find(
      (placedTile) => placedTile.row === row && placedTile.col === col
    );
    return placedTile ? placedTile.tile : null;
  };

  const highlightedCells = draggedOverCell ? [draggedOverCell] : [];

  return (
    <div className="overflow-auto md:overflow-visible p-4">
      <div className="animate-fade-in grid grid-cols-15 gap-0 p-2 bg-scrabble-board rounded-lg shadow-md border border-gray-300/40">
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
                placedTile={getPlacedTileForCell(rowIndex, colIndex)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
