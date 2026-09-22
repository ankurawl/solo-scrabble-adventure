import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Tile as TileType } from '@/types/scrabble';
import Tile from './Tile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check, RotateCcw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TileRackProps {
  tiles: TileType[];
  tilesRemaining: number;
  onTileDragStart: (e: React.DragEvent, tile: TileType) => void;
  onShuffleTiles: () => void;
  onPlayWord: () => void;
  onRecallTiles: () => void;
  canPlay: boolean;
  wordScore?: number;
  isMobile?: boolean;
  onReturnTileToRack?: (tileId: string) => void;
}

const TileRack: React.FC<TileRackProps> = ({
  tiles,
  tilesRemaining,
  onTileDragStart,
  onShuffleTiles,
  onPlayWord,
  onRecallTiles,
  canPlay,
  wordScore,
  isMobile: isMobileProp,
  onReturnTileToRack,
}) => {
  const detectedIsMobile = useIsMobile();
  const isMobile = isMobileProp ?? detectedIsMobile;
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const rackRef = useRef<HTMLDivElement>(null);
  const tilesContainerRef = useRef<HTMLDivElement>(null);

  const handleTileDragStart = (e: React.DragEvent, tile: TileType) => {
    setDraggedTileId(tile.id);
    onTileDragStart(e, tile);
  };

  const handleTileDragEnd = () => {
    setDraggedTileId(null);
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only set to false if we're actually leaving the component and not entering a child
    const relatedTarget = e.relatedTarget as Node;
    if (rackRef.current && !rackRef.current.contains(relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const tileId = e.dataTransfer.getData('text/plain');
    if (tileId && onReturnTileToRack) {
      onReturnTileToRack(tileId);
    }
  };

  // Handler for custom touch-based drop from board to rack
  const handleRackDrop = useCallback((e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail && customEvent.detail.tileId && onReturnTileToRack) {
      onReturnTileToRack(customEvent.detail.tileId);
    }
  }, [onReturnTileToRack]);

  // Set up listeners for custom rack-drop events from touch
  useEffect(() => {
    const rackElement = rackRef.current;
    const tilesContainer = tilesContainerRef.current;
    
    if (rackElement) {
      rackElement.addEventListener('rack-drop', handleRackDrop);
    }
    
    if (tilesContainer) {
      tilesContainer.addEventListener('rack-drop', handleRackDrop);
    }
    
    return () => {
      if (rackElement) {
        rackElement.removeEventListener('rack-drop', handleRackDrop);
      }
      
      if (tilesContainer) {
        tilesContainer.removeEventListener('rack-drop', handleRackDrop);
      }
    };
  }, [handleRackDrop]);

  return (
    <div 
      ref={rackRef}
      className={cn(
        "glass-panel w-full animate-slide-up",
        "p-1 sm:p-2 rounded-md",
        "tile-rack-container", // Add this class for touch event detection
        isDragOver && "drag-over" // Apply drag-over styling
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={cn(
        "flex justify-between items-center",
        "mb-2"
      )}>
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-medium text-gray-500">
            Tiles <span className="font-semibold">({tilesRemaining})</span>
          </h2>
          {wordScore !== undefined && wordScore > 0 && (
            <span className="text-xs text-green-600">+{wordScore}</span>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={onPlayWord}
            disabled={!canPlay}
            className={cn(
              'flex items-center gap-1',
              canPlay ? 'bg-green-600 hover:bg-green-700' : '',
              'p-1 text-xs h-7'
            )}
            title="Play Word"
          >
            <Check className="h-3 w-3" />
            <span>Play</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRecallTiles}
            className={cn(
              "flex items-center gap-1",
              "p-1 text-xs h-7"
            )}
            title="Recall Tiles"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Recall</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShuffleTiles}
            className={cn(
              "flex items-center gap-1",
              "p-1 text-xs h-7"
            )}
            title="Shuffle Tiles"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Shuffle</span>
          </Button>
        </div>
      </div>

      <div 
        ref={tilesContainerRef}
        className="flex flex-wrap gap-1 sm:gap-2 justify-center mt-2 mb-1 tile-rack-drop-zone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {tiles.map((tile) => (
          <div
            key={tile.id}
            className={cn(
              "transition-transform duration-200",
              "w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11"
            )}
            onDragEnd={handleTileDragEnd}
          >
            <Tile
              tile={tile}
              isDragging={draggedTileId === tile.id}
              onDragStart={handleTileDragStart}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TileRack;
