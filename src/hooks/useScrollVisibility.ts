import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

/**
 * A senior-grade scroll tracking hook that monitors scroll direction to toggle header/nav state.
 * Includes a safety block that freezes the visibility state for 450ms on route transitions.
 * This completely eliminates layout flashing/glitching caused by document height shifts
 * and scroll-resets during page slide animations.
 */
export function useScrollVisibility(threshold = 10) {
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Freeze scroll tracking immediately on page transitions to prevent layout jumps
  useEffect(() => {
    setIsVisible(true);
    setIsBlocked(true);
    
    const timer = setTimeout(() => {
      setIsBlocked(false);
      setLastScrollY(window.scrollY);
    }, 450);

    return () => clearTimeout(timer);
  }, [pathname]);

  const handleScroll = useCallback(() => {
    if (isBlocked) return;

    const currentScrollY = window.scrollY;
    
    // At the top - always show expanded nav
    if (currentScrollY < threshold) {
      setIsVisible(true);
      setLastScrollY(currentScrollY);
      return;
    }

    // Scrolling up - show standard navigation
    if (currentScrollY < lastScrollY) {
      setIsVisible(true);
    } 
    // Scrolling down - collapse into compact nav
    else if (currentScrollY > lastScrollY + threshold) {
      setIsVisible(false);
    }

    setLastScrollY(currentScrollY);
  }, [lastScrollY, threshold, isBlocked]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return isVisible;
}

