import React, { useState } from 'react';
import { BoardCell as BoardCellType, Tile as TileType } from '@/types/scrabble';
import BoardCell from './BoardCell';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

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

  return (
    <div className="flex flex-col items-center">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        centerOnInit={true}
        panning={{ disabled: false, velocityDisabled: true }}
        pinch={{ disabled: false }}
        doubleClick={{ disabled: true }}
        wheel={{ disabled: !isMobile, step: 0.1 }}
        zoomAnimation={{ disabled: true }}
        alignmentAnimation={{ disabled: true }}
        onPanningStart={(_, event) => {
          // Check if we're touching a tile - if so, don't start panning
          const target = event.target as HTMLElement;
          if (target.closest('.tile-draggable')) {
            return false; // Prevent panning
          }
          return true; // Allow panning
        }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <div className="board-container relative overflow-hidden touch-none">
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ width: '100%', height: '100%' }}
              >
                <div
                  className="board-grid bg-scrabble-board rounded-lg shadow-md border border-gray-300/40"
                  style={{
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
              </TransformComponent>
            </div>
            
            {/* Zoom controls below the board */}
            <div className="flex gap-2 mt-2 justify-center">
              <Button variant="outline" size="sm" className="h-8" onClick={() => zoomOut()}>
                <ZoomOut className="h-4 w-4 mr-1" />
                <span className="text-xs">Zoom Out</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8" onClick={() => resetTransform()}>
                <Maximize className="h-4 w-4 mr-1" />
                <span className="text-xs">Fit</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8" onClick={() => zoomIn()}>
                <ZoomIn className="h-4 w-4 mr-1" />
                <span className="text-xs">Zoom In</span>
              </Button>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default Board;
