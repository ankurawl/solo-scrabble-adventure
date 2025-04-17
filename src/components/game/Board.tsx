import React, { useState } from 'react';
import { BoardCell as BoardCellType, Tile as TileType } from '@/types/scrabble';
import BoardCell from './BoardCell';
import { useIsMobile } from '@/hooks/use-mobile';

interface BoardProps {
  board: BoardCellType[][];
  onPlaceTile: (row: number, col: number, tileId: string) => void;
  currentDraggedTile: TileType | null;
  placedTiles: { row: number; col: number; tile: TileType }[];
  onTileDragStart: (e: React.DragEvent, tile: TileType) => void;
}

const Board: React.FC<BoardProps> = ({ board, onPlaceTile, currentDraggedTile, placedTiles, onTileDragStart }) => {
  const [draggedOverCell, setDraggedOverCell] = useState<{ row: number; col: number } | null>(null);
  const isMobile = useIsMobile();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (row: number, col: number) => {
    // Directly call onPlaceTile with the row, col, and tile ID from currentDraggedTile
    if (currentDraggedTile) {
      onPlaceTile(row, col, currentDraggedTile.id);
    }
    
    // Reset the dragged over cell
    setDraggedOverCell(null);
  };

  const handleCellDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const cellElement = e.currentTarget as HTMLDivElement;
    const row = parseInt(cellElement.getAttribute('data-row') || '0');
    const col = parseInt(cellElement.getAttribute('data-col') || '0');
    
    setDraggedOverCell({ row, col });
  };

  // Get placed tile for a specific cell
  const getPlacedTileForCell = (row: number, col: number) => {
    // First check if there's a tile from the current turn
    const placedTile = placedTiles.find(
      (placedTile) => placedTile.row === row && placedTile.col === col
    );
    
    if (placedTile) {
      return placedTile.tile;
    }
    
    // If no current turn tile, this will be null and BoardCell will check for board.tile
    return null;
  };

  // Check if the cell at (row, col) contains a tile placed in the current turn
  const isCurrentTurnPlacement = (row: number, col: number) => {
    const cellHasCurrentTurnTile = placedTiles.some(
      (placedTile) => placedTile.row === row && placedTile.col === col
    );
    
    return cellHasCurrentTurnTile;
  };

  const highlightedCells = draggedOverCell ? [draggedOverCell] : [];

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="board-container relative touch-none w-full h-full">
        <div
          className="board-grid bg-scrabble-board rounded-lg shadow-md border border-gray-300/40"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(15, 1fr)',
            gridTemplateRows: 'repeat(15, 1fr)',
            gap: '0px',
            width: '100%',
            height: '100%',
            aspectRatio: '1 / 1',
            maxWidth: '100%'
          }}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                data-row={rowIndex}
                data-col={colIndex}
                style={{ width: '100%', height: '100%' }}
              >
                <BoardCell
                  cell={cell}
                  onDrop={() => handleDrop(rowIndex, colIndex)}
                  onDragOver={handleCellDragOver}
                  highlightedCells={highlightedCells}
                  placedTile={getPlacedTileForCell(rowIndex, colIndex)}
                  isCurrentTurnPlacement={isCurrentTurnPlacement(rowIndex, colIndex)}
                  onTileDragStart={onTileDragStart}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Board;
