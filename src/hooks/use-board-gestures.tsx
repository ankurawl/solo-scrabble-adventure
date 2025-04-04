import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from './use-mobile';

interface BoardGesturesOptions {
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
}

export function useBoardGestures(options: BoardGesturesOptions = {}) {
  const {
    minScale = 0.5,
    maxScale = 3,
    initialScale = 1,
  } = options;

  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPosition = useRef({ x: 0, y: 0 });
  const lastDistance = useRef<number | null>(null);

  // Handle pinch to zoom
  useEffect(() => {
    if (!containerRef.current || !isMobile) return;

    const container = containerRef.current;

    const handleTouchStart = (e: TouchEvent) => {
      // Skip if the target is a tile (to allow drag and drop)
      const target = e.target as HTMLElement;
      if (target.closest('.tile-draggable')) {
        return;
      }
      
      if (e.touches.length === 2) {
        // Store the initial distance between two fingers for pinch-to-zoom
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastDistance.current = Math.sqrt(dx * dx + dy * dy);
      } else if (e.touches.length === 1) {
        // Store the initial position for dragging
        lastPosition.current = {
          x: e.touches[0].clientX - position.x,
          y: e.touches[0].clientY - position.y,
        };
        setIsDragging(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Skip if the target is a tile (to allow drag and drop)
      const target = e.target as HTMLElement;
      if (target.closest('.tile-draggable')) {
        return;
      }
      
      if (e.touches.length === 2 && lastDistance.current !== null) {
        // Handle pinch-to-zoom
        e.preventDefault(); // Prevent default to avoid page zooming
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate new scale based on the change in distance
        const scaleFactor = distance / lastDistance.current;
        const newScale = Math.min(maxScale, Math.max(minScale, scale * scaleFactor));
        
        setScale(newScale);
        lastDistance.current = distance;
      } else if (e.touches.length === 1 && isDragging) {
        // Handle dragging
        e.preventDefault();
        const newX = e.touches[0].clientX - lastPosition.current.x;
        const newY = e.touches[0].clientY - lastPosition.current.y;
        
        setPosition({ x: newX, y: newY });
      }
    };

    const handleTouchEnd = () => {
      lastDistance.current = null;
      setIsDragging(false);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(maxScale, Math.max(minScale, scale * scaleFactor));
      setScale(newScale);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [isMobile, scale, position, isDragging, minScale, maxScale]);

  const resetZoom = () => {
    setScale(initialScale);
    setPosition({ x: 0, y: 0 });
  };

  return {
    containerRef,
    scale,
    position,
    resetZoom,
    setScale,
    isMobile,
    isDragging,
  };
}