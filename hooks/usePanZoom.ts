import { MouseEvent, TouchEvent, useCallback, useRef, useState } from "react";

export function usePanZoom(
  containerRef: React.RefObject<HTMLDivElement | null>,
) {
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hasDraggedRef = useRef(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });
  const [scale, setScale] = useState(1);

  // Pinch-to-zoom tracking
  const lastPinchDistRef = useRef<number | null>(null);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.3));
  const handleResetZoom = () => setScale(1);

  // --- Mouse handlers ---
  const handleMouseDown = (e: MouseEvent<HTMLElement>) => {
    setIsPressed(true);
    hasDraggedRef.current = false;
    setDragStart({ x: e.pageX, y: e.pageY });
    if (containerRef.current) {
      setScrollStart({
        left: containerRef.current.scrollLeft,
        top: containerRef.current.scrollTop,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!isPressed || !containerRef.current) return;

    const dx = e.pageX - dragStart.x;
    const dy = e.pageY - dragStart.y;

    if (!hasDraggedRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      setIsDragging(true);
      hasDraggedRef.current = true;
    }

    if (hasDraggedRef.current) {
      e.preventDefault();
      containerRef.current.scrollLeft = scrollStart.left - dx;
      containerRef.current.scrollTop = scrollStart.top - dy;
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsPressed(false);
    setIsDragging(false);
  };

  const handleClickCapture = (e: MouseEvent<HTMLElement>) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDraggedRef.current = false;
    }
  };

  // --- Touch handlers (mobile) ---
  const handleTouchStart = useCallback(
    (e: TouchEvent<HTMLElement>) => {
      if (e.touches.length === 1) {
        // Single finger pan
        const touch = e.touches[0];
        setIsPressed(true);
        hasDraggedRef.current = false;
        setDragStart({ x: touch.pageX, y: touch.pageY });
        if (containerRef.current) {
          setScrollStart({
            left: containerRef.current.scrollLeft,
            top: containerRef.current.scrollTop,
          });
        }
      } else if (e.touches.length === 2) {
        // Pinch-to-zoom start
        const dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY,
        );
        lastPinchDistRef.current = dist;
      }
    },
    [containerRef],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent<HTMLElement>) => {
      if (e.touches.length === 1 && isPressed && containerRef.current) {
        const touch = e.touches[0];
        const dx = touch.pageX - dragStart.x;
        const dy = touch.pageY - dragStart.y;

        if (!hasDraggedRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
          setIsDragging(true);
          hasDraggedRef.current = true;
        }

        if (hasDraggedRef.current) {
          containerRef.current.scrollLeft = scrollStart.left - dx;
          containerRef.current.scrollTop = scrollStart.top - dy;
        }
      } else if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
        // Pinch-to-zoom
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY,
        );
        const delta = dist - lastPinchDistRef.current;
        if (Math.abs(delta) > 5) {
          setScale((s) => {
            const newScale = s + delta * 0.005;
            return Math.min(Math.max(newScale, 0.3), 2);
          });
          lastPinchDistRef.current = dist;
        }
      }
    },
    [isPressed, dragStart, scrollStart, containerRef],
  );

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    setIsDragging(false);
    lastPinchDistRef.current = null;
  }, []);

  return {
    scale,
    isPressed,
    isDragging,
    handlers: {
      handleMouseDown,
      handleMouseMove,
      handleMouseUpOrLeave,
      handleClickCapture,
      handleZoomIn,
      handleZoomOut,
      handleResetZoom,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    },
  };
}
