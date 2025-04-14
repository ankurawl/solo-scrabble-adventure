import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  // New prop to indicate if the tile was placed in the current turn
  isCurrentTurnPlacement?: boolean;
}

const Tile: React.FC<TileProps> = ({
  isMobile = useIsMobile(),
  tile,
  isDragging = false,
  isPlayable = true,
  onDragStart,
  onTileClick,
  // Default to false - older tiles are not current turn placements
  isCurrentTurnPlacement = false,
}) => {
  const tileRef = useRef<HTMLDivElement>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number, y: number } | null>(null);
  const [isDraggingTouch, setIsDraggingTouch] = useState(false);
  
  // If this tile is from a placement in the current turn, it should be draggable
  // even if it's technically "placed" on the board
  const isDraggable = isPlayable || isCurrentTurnPlacement;

  // Handle when touch moves outside the tile
  const handleGlobalTouchMove = useCallback((e: TouchEvent) => {
    if (isDraggingTouch && tileRef.current) {
      e.preventDefault();
      
      // Update the tile position to follow the finger
      tileRef.current.style.position = 'absolute';
      tileRef.current.style.left = `${e.touches[0].clientX - 25}px`;
      tileRef.current.style.top = `${e.touches[0].clientY - 25}px`;
      tileRef.current.style.zIndex = '1000';
    }
  }, [isDraggingTouch]);

  // Handle when touch ends outside the tile
  const handleGlobalTouchEnd = useCallback((e: TouchEvent) => {
    if (isDraggingTouch) {
      // Find elements below the touch position
      const elementBelow = document.elementFromPoint(
        e.changedTouches[0].clientX,
        e.changedTouches[0].clientY
      );
      
      // If we found an element that can accept drops
      if (elementBelow) {
        // Try to find a board cell
        const cellElement = elementBelow.closest('[data-row]');
        
        if (cellElement) {
          // Dispatch a custom drop event on the cell
          const dropEvent = new CustomEvent('custom-drop', {
            bubbles: true,
            detail: { tileId: tile.id }
          });
          cellElement.dispatchEvent(dropEvent);
        }
      }
      
      // Reset tile position and state
      if (tileRef.current) {
        tileRef.current.style.position = '';
        tileRef.current.style.left = '';
        tileRef.current.style.top = '';
        tileRef.current.style.zIndex = '';
        tileRef.current.classList.remove('dragging');
      }
      
      setIsDraggingTouch(false);
    }
    
    // Clear any long-press timeout
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    
    // Reset touch position
    touchStartPosRef.current = null;
  }, [isDraggingTouch, tile.id]);

  // Effect to add document-level touch event handlers when a tile is being dragged
  useEffect(() => {
    if (!isMobile) return;

    // Always add these handlers at the document level for more reliable touch handling
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('touchcancel', handleGlobalTouchEnd);
    
    return () => {
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('touchcancel', handleGlobalTouchEnd);
    };
  }, [isMobile, handleGlobalTouchMove, handleGlobalTouchEnd]);

  const handleDragStart = (e: React.DragEvent) => {
    // Only allow dragging if the tile is in the rack or was placed in the current turn
    if (!isDraggable) {
      e.preventDefault();
      return;
    }

    console.log('Drag started for tile:', tile.id, tile.letter);
    
    // Set the drag data with the tile ID
    e.dataTransfer.setData('text/plain', tile.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add a class to visually indicate dragging
    if (tileRef.current) {
      tileRef.current.classList.add('dragging');
    }
    
    if (onDragStart) {
      onDragStart(e, tile);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log('Drag ended for tile:', tile.id, tile.letter);
    
    if (tileRef.current) {
      tileRef.current.classList.remove('dragging');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Same condition as handleDragStart
    if (!isDraggable) return;
    
    // Store the initial touch position
    touchStartPosRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    
    // Set a timeout to distinguish between tap and drag (long press)
    touchTimeoutRef.current = setTimeout(() => {
      // This is a long press, trigger drag start
      if (onDragStart && tileRef.current) {
        // Mark as dragging
        setIsDraggingTouch(true);
        
        // Provide visual feedback that drag has started
        tileRef.current.classList.add('dragging');
        
        // Create a synthetic drag event for the onDragStart callback
        const dragEvent = new Event('dragstart', { bubbles: true }) as unknown as React.DragEvent;
        dragEvent.dataTransfer = {
          setData: () => {},
          effectAllowed: 'move',
        } as unknown as DataTransfer;
        
        onDragStart(dragEvent, tile);
      }
    }, 200);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    // Same condition as handleDragStart
    if (!touchStartPosRef.current || !isDraggable) return;
    
    // Always prevent default on touch move if we're tracking a potential drag
    e.preventDefault();
    
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
    if (distance > 10 && tileRef.current && !isDraggingTouch) {
      setIsDraggingTouch(true);
      
      // Create a synthetic drag event
      const dragEvent = new Event('dragstart', { bubbles: true }) as unknown as React.DragEvent;
      dragEvent.dataTransfer = {
        setData: () => {},
        effectAllowed: 'move',
      } as unknown as DataTransfer;
      
      if (onDragStart) {
        onDragStart(dragEvent, tile);
      }
      
      // Move the tile with the touch - initial placement
      tileRef.current.style.position = 'absolute';
      tileRef.current.style.left = `${e.touches[0].clientX - 25}px`;
      tileRef.current.style.top = `${e.touches[0].clientY - 25}px`;
      tileRef.current.style.zIndex = '1000';
      
      // Provide visual feedback that drag has started
      tileRef.current.classList.add('dragging');
    }
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    // If this was a tap (not a drag), handle click
    if (onTileClick && isDraggable && !isDraggingTouch && !isDragging) {
      onTileClick(tile);
    }
  };

  return (
    <div
      ref={tileRef}
      className={cn(
        'relative w-full h-full flex items-center justify-center',
        'bg-scrabble-tile border border-amber-700/30 rounded-sm shadow-tile select-none cursor-pointer',
        'transform transition-all duration-200 ease-out',
        (isDragging || isDraggingTouch) ? 'dragging opacity-75' : 'hover:shadow-tile-hover hover:scale-102',
        !isDraggable && 'opacity-90 cursor-default',
        isDraggable && 'cursor-grab',
        isCurrentTurnPlacement && 'ring-1 ring-green-500/50',
        'text-center', // Ensure text is centered
        'tile-draggable', // Add class for drag and drop detection
        'tile' // Add class for ensuring square shape
      )}
      draggable={isDraggable && !isMobile}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-tile-id={tile.id}
      data-is-current-turn={isCurrentTurnPlacement ? 'true' : 'false'}
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
