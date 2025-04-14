import React, { useEffect, useState } from 'react';
import { BoardCell as BoardCellType, Tile as TileType } from '@/types/scrabble';
import BoardCell from './BoardCell';
import { useBoardGestures } from '@/hooks/use-board-gestures';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
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
  const { containerRef, scale, position, resetZoom, setScale, isDragging } = useBoardGestures({
    minScale: 0.5,
    maxScale: 3,
    initialScale: 1,
  });

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
    const placedTile = placedTiles.find(
      (placedTile) => placedTile.row === row && placedTile.col === col
    );
    return placedTile ? placedTile.tile : null;
  };

  // Check if the cell at (row, col) contains a tile placed in the current turn
  const isCurrentTurnPlacement = (row: number, col: number) => {
    const cellHasCurrentTurnTile = placedTiles.some(
      (placedTile) => placedTile.row === row && placedTile.col === col
    );
    
    return cellHasCurrentTurnTile;
  };

  const highlightedCells = draggedOverCell ? [draggedOverCell] : [];
  
  const handleZoomIn = () => {
    setScale(Math.min(scale + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setScale(Math.max(scale - 0.25, 0.5));
  };

  return (
    <div className="flex flex-col items-center">
      <div className="board-container relative" ref={containerRef}>
        <div
          className="board-grid bg-scrabble-board rounded-lg shadow-md border border-gray-300/40 transform-gpu"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center',
            transition: 'transform 0.1s ease-out',
            display: 'grid',
            gridTemplateColumns: 'repeat(15, 1fr)',
            gridTemplateRows: 'repeat(15, 1fr)',
            aspectRatio: '1 / 1'
          }}
        >
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
                isCurrentTurnPlacement={isCurrentTurnPlacement(rowIndex, colIndex)}
                onTileDragStart={onTileDragStart}
              />
            </div>
          ))
        )}
        </div>
      </div>
      
      {/* Zoom controls below the board */}
      <div className="flex gap-2 mt-2 justify-center">
        <Button variant="outline" size="sm" className="h-8" onClick={handleZoomOut}>
          <ZoomOut className="h-4 w-4 mr-1" />
          <span className="text-xs">Zoom Out</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={resetZoom}>
          <Maximize className="h-4 w-4 mr-1" />
          <span className="text-xs">Fit</span>
        </Button>
        <Button variant="outline" size="sm" className="h-8" onClick={handleZoomIn}>
          <ZoomIn className="h-4 w-4 mr-1" />
          <span className="text-xs">Zoom In</span>
        </Button>
      </div>
    </div>
  );
};

export default Board;
