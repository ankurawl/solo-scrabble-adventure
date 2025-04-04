import React, { useRef } from 'react';
import { Tile as TileType } from '@/types/scrabble';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface TileProps {
  tile: TileType;
  isDragging?: boolean;
  isPlayable?: boolean;
  onDragStart?: (e: React.DragEvent, tile: TileType) => void;
  onTileClick?: (tile: TileType) => void;
  isMobile?: boolean;
}

const Tile: React.FC<TileProps> = ({
  isMobile = useIsMobile(),
  tile,
  isDragging = false,
  isPlayable = true,
  onDragStart,
  onTileClick,
}) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number, y: number } | null>(null);

  const handleDragStart = (e: React.DragEvent) => {
    if (!isPlayable && tile.isPlaced) return; // Don't allow dragging permanently placed tiles
    
    e.dataTransfer.setData('text/plain', tile.id);
    if (onDragStart) {
      onDragStart(e, tile);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPlayable && tile.isPlaced) return; // Don't allow dragging permanently placed tiles
    
    // Store the initial touch position
    touchStartPosRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    
    // Set a timeout to distinguish between tap and drag
    touchTimeoutRef.current = setTimeout(() => {
      // This is a long press, trigger drag start
      if (onDragStart && tileRef.current) {
        const dragEvent = new Event('dragstart', { bubbles: true }) as unknown as React.DragEvent;
        onDragStart(dragEvent, tile);
      }
    }, 200);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current || !isPlayable) return;
    
    // Clear the timeout to prevent tap event
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    // Calculate distance moved
    const dx = e.touches[0].clientX - touchStartPosRef.current.x;
    const dy = e.touches[0].clientY - touchStartPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If moved more than a threshold, consider it a drag
    if (distance > 10 && tileRef.current) {
      // Create a custom drag event
      const dragEvent = new Event('dragstart', { bubbles: true }) as unknown as React.DragEvent;
      if (onDragStart) {
        onDragStart(dragEvent, tile);
      }
      
      // Move the tile with the touch
      if (tileRef.current) {
        tileRef.current.style.position = 'absolute';
        tileRef.current.style.left = `${e.touches[0].clientX - 25}px`;
        tileRef.current.style.top = `${e.touches[0].clientY - 25}px`;
        tileRef.current.style.zIndex = '1000';
      }
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Clear the timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    // Reset touch position
    touchStartPosRef.current = null;
    
    // If this was a tap, handle click
    if (onTileClick && isPlayable) {
      onTileClick(tile);
    }
    
    // Reset tile position
    if (tileRef.current) {
      tileRef.current.style.position = '';
      tileRef.current.style.left = '';
      tileRef.current.style.top = '';
      tileRef.current.style.zIndex = '';
    }
  };

  return (
    <div
      ref={tileRef}
      className={cn(
        'relative w-full h-full flex items-center justify-center',
        'bg-scrabble-tile border border-amber-700/30 rounded-sm shadow-tile select-none cursor-pointer',
        'transform transition-all duration-200 ease-out',
        isDragging ? 'dragging opacity-75' : 'hover:shadow-tile-hover hover:scale-102',
        !isPlayable && tile.isPlaced && 'opacity-90 cursor-default',
        !isPlayable && !tile.isPlaced && 'cursor-grab',
        'text-center', // Ensure text is centered
        'tile-draggable', // Add class for drag and drop detection
        'tile' // Add class for ensuring square shape
      )}
      draggable={isPlayable || !tile.isPlaced}
      onDragStart={handleDragStart}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative flex items-center justify-center h-full w-full">
        {/* Main letter */}
        <span className={cn(
          "text-[0.8em] sm:text-[1em] md:text-[1.2em]", // Responsive font sizing
          tile.letter === ' ' && "text-amber-700/50"
        )}>
          {tile.letter === ' ' ? '' : tile.letter} {/* Display blank as empty */}
        </span>
        
        {/* Points number - positioned absolutely */}
        <span className={cn(
          "absolute font-normal text-amber-900",
          "text-[0.5em] sm:text-[0.6em]", // Responsive font sizing
          "bottom-1 right-1" // Position at bottom right with padding
        )}>
          {tile.points}
        </span>
      </div>
    </div>
  );
};

export default Tile;
