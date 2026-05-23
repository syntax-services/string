import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const customerTabs = ["/customer", "/customer/discover", "/customer/messages", "/customer/profile"];
const businessTabs = ["/business", "/business/discover", "/business/messages", "/business/profile"];

/**
 * An elite, highly responsive gesture navigation hook that enables:
 * 1. Horizontal swipes to switch tabs seamlessly when on the dashboard's main tabs.
 * 2. Anywhere-on-screen right swipes to go back when on secondary screens.
 * 
 * Includes advanced velocity thresholds, straightness/trajectory checks, and
 * full exclusion rules for scrollable elements, inputs, buttons, and sliders.
 */
export function useSwipeNavigation() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let currentX = 0;
    let currentY = 0;
    let isValidGesture = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const target = e.target as HTMLElement;

      // Check if a slider (Sheet or Dialog) is currently open in the DOM
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;

      // Premium exclusions: Skip gesture starts on range inputs or sliders
      const isSlider = target.closest('input[type="range"]') || target.closest('[role="slider"]') || target.closest('.no-swipe');
      
      if (isSlider) {
        isValidGesture = false;
        return;
      }

      if (!isDialogOpen) {
        // Standard page exclusions: Skip gesture starts on interactive or scrollable elements
        const isInput = target.closest('input') || target.closest('textarea') || target.closest('select');
        const isScrollableX = target.closest('.overflow-x-auto') || target.closest('.no-scrollbar');
        
        // Let buttons, links, or specific chat items process tap events cleanly without gesture intercept
        const isTapAction = target.closest('button') || target.closest('a') || target.closest('[role="button"]');

        if (isInput || isScrollableX || isTapAction) {
          isValidGesture = false;
          return;
        }
      }

      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = touch.clientX;
      currentY = touch.clientY;
      startTime = Date.now();
      isValidGesture = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isValidGesture || e.touches.length !== 1) return;

      const touch = e.touches[0];
      currentX = touch.clientX;
      currentY = touch.clientY;
    };

    const handleTouchEnd = () => {
      if (!isValidGesture) return;

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      const duration = Date.now() - startTime;

      // Prevent crash / divide by zero
      if (duration <= 0) return;

      const velocity = Math.abs(deltaX) / duration; // px/ms

      // Smart Gestural Heuristics:
      // 1. Must be predominantly horizontal: Y deviation must be less than 45% of X displacement
      const isRelativelyHorizontal = Math.abs(deltaY) < Math.abs(deltaX) * 0.45;
      
      if (!isRelativelyHorizontal) {
        isValidGesture = false;
        return;
      }

      // Check if a slider (Sheet or Dialog) is currently open in the DOM
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;

      if (isDialogOpen) {
        // Dismiss the open slider/drawer if swiping right
        if (deltaX > 0) {
          // Moderate thresholds for dismissing drawers to make it extremely responsive and easy
          const isSwipeTriggered = deltaX > 80 || (velocity > 0.3 && deltaX > 40);
          if (isSwipeTriggered) {
            // Dispatch standard accessible Escape keypress to close Radix Sheets/Dialogs/Dropdowns
            const escapeEvent = new KeyboardEvent("keydown", {
              key: "Escape",
              code: "Escape",
              keyCode: 27,
              which: 27,
              bubbles: true,
              cancelable: true
            });
            document.dispatchEvent(escapeEvent);
          }
        }
      } else {
        const isCustomerTab = customerTabs.includes(pathname);
        const isBusinessTab = businessTabs.includes(pathname);
        const isDashboardTab = isCustomerTab || isBusinessTab;

        if (isDashboardTab) {
          // Tab switching logic: Swiping Left (deltaX < 0) switches to NEXT tab. Swiping Right (deltaX > 0) switches to PREV tab.
          const tabs = isCustomerTab ? customerTabs : businessTabs;
          const currentIndex = tabs.indexOf(pathname);

          // Distance threshold for tab swipe: 100px OR velocity > 0.3 px/ms with 50px displacement
          const isSwipeTriggered = Math.abs(deltaX) > 100 || (velocity > 0.3 && Math.abs(deltaX) > 50);

          if (isSwipeTriggered && currentIndex !== -1) {
            if (deltaX < 0 && currentIndex < tabs.length - 1) {
              // Swipe Left -> Next Tab
              navigate(tabs[currentIndex + 1]);
            } else if (deltaX > 0 && currentIndex > 0) {
              // Swipe Right -> Prev Tab
              navigate(tabs[currentIndex - 1]);
            }
          }
        } else {
          // Secondary screen "Anywhere-on-screen back-swipe" logic:
          // Must swipe L-to-R (deltaX > 0)
          if (deltaX > 0) {
            // Strict Premium thresholds for anywhere-on-screen back swipe:
            // Distance > 120px OR (velocity > 0.4 px/ms AND distance > 60px)
            const isBackTriggered = deltaX > 120 || (velocity > 0.4 && deltaX > 60);
            if (isBackTriggered) {
              navigate(-1);
            }
          }
        }
      }

      // Reset values
      startX = 0;
      startY = 0;
      currentX = 0;
      currentY = 0;
      startTime = 0;
      isValidGesture = false;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate, pathname]);
}

