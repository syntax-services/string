import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const customerTabs = ["/customer", "/customer/discover", "/customer/messages", "/customer/profile"];
const businessTabs = ["/business", "/business/discover", "/business/messages", "/business/profile"];

/**
 * An elite, hardware-accelerated gestural navigation hook that enables:
 * 1. Real-time tactile tab switching (swiping L/R translates current tab and switches).
 * 2. Anywhere-on-screen swipe-to-peek back navigation (translates page to reveal background).
 * 3. Elastic snap-back animations on gesture cancellation.
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
    let isGestureChecked = false;
    let activeTimeouts: any[] = [];

    const addTimeout = (fn: () => void, delay: number) => {
      const id = setTimeout(() => {
        activeTimeouts = activeTimeouts.filter(t => t !== id);
        fn();
      }, delay);
      activeTimeouts.push(id);
      return id;
    };

    const clearAllTimeouts = () => {
      activeTimeouts.forEach(clearTimeout);
      activeTimeouts = [];
    };

    const resetStyles = () => {
      const tabSlider = document.querySelector('.tab-slider') as HTMLElement;
      const currentPage = document.querySelector('.current-page-container') as HTMLElement;
      const prevPage = document.querySelector('.previous-page-container') as HTMLElement;
      const peekOverlay = document.querySelector('.peek-overlay') as HTMLElement;

      if (tabSlider) {
        tabSlider.style.transition = '';
        tabSlider.style.transform = '';
        tabSlider.style.willChange = '';
      }
      if (currentPage) {
        currentPage.style.transition = '';
        currentPage.style.animation = '';
        currentPage.style.transform = '';
        currentPage.style.willChange = '';
      }
      if (prevPage) {
        prevPage.style.transition = '';
        prevPage.style.transform = '';
        prevPage.style.opacity = '';
        prevPage.style.willChange = '';
      }
      if (peekOverlay) {
        peekOverlay.style.transition = '';
        peekOverlay.style.opacity = '';
        peekOverlay.style.willChange = '';
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = touch.clientX;
      currentY = touch.clientY;
      startTime = Date.now();

      // Clear any pending transitions/snaps immediately on a new touch to avoid style collisions
      clearAllTimeouts();
      resetStyles();

      // Ignore left edge touch start completely to let browser native back gesture execute
      if (startX < 50) {
        isValidGesture = false;
        isGestureChecked = true;
        return;
      }

      const target = e.target as HTMLElement;

      // Check if a dialog/slider is open
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;

      // Exclusions
      const isSlider = target.closest('input[type="range"]') || target.closest('[role="slider"]') || target.closest('.no-swipe');
      
      if (isSlider) {
        isValidGesture = false;
        isGestureChecked = true;
        return;
      }

      if (!isDialogOpen) {
        // Standard page exclusions
        const isInput = target.closest('input') || target.closest('textarea') || target.closest('select');
        const isScrollableX = target.closest('.overflow-x-auto') || target.closest('.no-scrollbar');
        const isTapAction = target.closest('button') || target.closest('a') || target.closest('[role="button"]');

        if (isInput || isScrollableX || isTapAction) {
          isValidGesture = false;
          isGestureChecked = true;
          return;
        }
      }

      isValidGesture = false; // Starts false, will set to true only if horizontal swipe detected in touchmove
      isGestureChecked = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const touch = e.touches[0];
      currentX = touch.clientX;
      currentY = touch.clientY;

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      // If we haven't determined the gesture type yet, wait until the drag distance is sufficient
      if (!isGestureChecked) {
        const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        if (dragDistance < 8) return; // Wait for clear movement

        // Determine if relatively horizontal
        const isRelativelyHorizontal = Math.abs(deltaY) < Math.abs(deltaX) * 0.55;
        isGestureChecked = true;

        if (isRelativelyHorizontal) {
          isValidGesture = true;

          // Now, lock transitions and set up styling will-change properties for smooth peeking!
          (window as any).isSwipeGestureActive = true;
          window.dispatchEvent(new CustomEvent("swipe-gesture-change", { detail: { active: true } }));

          const tabSlider = document.querySelector('.tab-slider') as HTMLElement;
          if (tabSlider) {
            tabSlider.style.transition = 'none';
            tabSlider.style.willChange = 'transform';
          }

          const currentPage = document.querySelector('.current-page-container') as HTMLElement;
          if (currentPage) {
            currentPage.style.transition = 'none';
            currentPage.style.animation = 'none';
            currentPage.style.willChange = 'transform';
          }

          const prevPage = document.querySelector('.previous-page-container') as HTMLElement;
          if (prevPage) {
            prevPage.style.transition = 'none';
            prevPage.style.willChange = 'transform, opacity';
          }

          const peekOverlay = document.querySelector('.peek-overlay') as HTMLElement;
          if (peekOverlay) {
            peekOverlay.style.transition = 'none';
            peekOverlay.style.willChange = 'opacity';
          }
        } else {
          isValidGesture = false;
          return;
        }
      }

      if (!isValidGesture) return;

      // Ensure gesture is horizontal
      const isRelativelyHorizontal = Math.abs(deltaY) < Math.abs(deltaX) * 0.55;
      if (!isRelativelyHorizontal) return;

      const isCustomerTab = customerTabs.includes(pathname);
      const isBusinessTab = businessTabs.includes(pathname);
      const isDashboardTab = isCustomerTab || isBusinessTab;
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;

      if (isDialogOpen) {
        const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
        if (dialog && deltaX > 0) {
          dialog.style.transition = 'none';
          dialog.style.transform = `translateX(${deltaX}px)`;
        }
        return;
      }

      const viewportWidth = window.innerWidth;

      if (isDashboardTab) {
        const tabSlider = document.querySelector('.tab-slider') as HTMLElement;
        if (!tabSlider) return;

        const tabs = isCustomerTab ? customerTabs : businessTabs;
        const currentIndex = tabs.indexOf(pathname);
        const baseOffset = -currentIndex * viewportWidth;

        // Apply drag translation to the tab row
        if (deltaX < 0 && currentIndex < tabs.length - 1) {
          // Swipe Left -> Next Tab (allowed)
          tabSlider.style.transform = `translateX(${baseOffset + deltaX}px)`;
        } else if (deltaX > 0 && currentIndex > 0) {
          // Swipe Right -> Prev Tab (allowed)
          tabSlider.style.transform = `translateX(${baseOffset + deltaX}px)`;
        }
      } else {
        // Secondary screen swipe-to-peek back navigation
        const currentPage = document.querySelector('.current-page-container') as HTMLElement;
        const prevPage = document.querySelector('.previous-page-container') as HTMLElement;
        const peekOverlay = document.querySelector('.peek-overlay') as HTMLElement;

        if (!currentPage) return;

        if (deltaX > 0) {
          // Translate active card
          currentPage.style.transform = `translateX(${deltaX}px)`;
          
          // Apply iOS style parallax depth to background card
          const progress = Math.min(deltaX / viewportWidth, 1);
          if (prevPage) {
            const bgTranslate = -20 + (progress * 20); // -20% to 0%
            const bgScale = 0.95 + (progress * 0.05); // 0.95 to 1.0
            const bgOpacity = 0.6 + (progress * 0.4); // 0.6 to 1.0
            prevPage.style.transform = `translateX(${bgTranslate}%) scale(${bgScale})`;
            prevPage.style.opacity = `${bgOpacity}`;
          }
          if (peekOverlay) {
            peekOverlay.style.opacity = `${1.0 - progress}`;
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isValidGesture) return;

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      const duration = Date.now() - startTime;

      const velocity = duration > 0 ? Math.abs(deltaX) / duration : 0; // px/ms
      const isRelativelyHorizontal = Math.abs(deltaY) < Math.abs(deltaX) * 0.45;
      
      const tabSlider = document.querySelector('.tab-slider') as HTMLElement;
      const currentPage = document.querySelector('.current-page-container') as HTMLElement;
      const prevPage = document.querySelector('.previous-page-container') as HTMLElement;
      const peekOverlay = document.querySelector('.peek-overlay') as HTMLElement;
      const isDialogOpen = document.querySelector('[role="dialog"]') !== null;

      const viewportWidth = window.innerWidth;

      // Signal swipe end
      (window as any).isSwipeGestureActive = false;
      window.dispatchEvent(new CustomEvent("swipe-gesture-change", { detail: { active: false } }));

      if (!isRelativelyHorizontal) {
        // Snap back if trajectory lost
        snapBack();
        isValidGesture = false;
        return;
      }

      if (isDialogOpen) {
        const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
        if (dialog && deltaX > 0) {
          const isSwipeTriggered = deltaX > 80 || (velocity > 0.3 && deltaX > 40);
          if (isSwipeTriggered) {
            // Animate sliding off-screen to the right
            dialog.style.transition = 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
            dialog.style.transform = 'translateX(100%)';
            addTimeout(() => {
              const escapeEvent = new KeyboardEvent("keydown", {
                key: "Escape",
                code: "Escape",
                keyCode: 27,
                which: 27,
                bubbles: true,
                cancelable: true
              });
              document.dispatchEvent(escapeEvent);
              
              // Reset transform after closed so it starts clean next time
              addTimeout(() => {
                dialog.style.transform = '';
                dialog.style.transition = '';
              }, 50);
            }, 220);
          } else {
            // Animate snap-back
            dialog.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
            dialog.style.transform = 'translateX(0)';
            addTimeout(() => {
              dialog.style.transform = '';
              dialog.style.transition = '';
            }, 250);
          }
        }
      } else {
        const isCustomerTab = customerTabs.includes(pathname);
        const isBusinessTab = businessTabs.includes(pathname);
        const isDashboardTab = isCustomerTab || isBusinessTab;

        if (isDashboardTab) {
          if (!tabSlider) {
            isValidGesture = false;
            return;
          }

          const tabs = isCustomerTab ? customerTabs : businessTabs;
          const currentIndex = tabs.indexOf(pathname);
          const isSwipeTriggered = Math.abs(deltaX) > 100 || (velocity > 0.3 && Math.abs(deltaX) > 50);

          if (isSwipeTriggered && currentIndex !== -1) {
            if (deltaX < 0 && currentIndex < tabs.length - 1) {
              // Complete Swipe Left -> Next Tab
              const targetIdx = currentIndex + 1;
              tabSlider.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
              tabSlider.style.transform = `translateX(-${targetIdx * 100}%)`;
              addTimeout(() => {
                navigate(tabs[targetIdx]);
                addTimeout(resetStyles, 100);
              }, 300);
            } else if (deltaX > 0 && currentIndex > 0) {
              // Complete Swipe Right -> Prev Tab
              const targetIdx = currentIndex - 1;
              tabSlider.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
              tabSlider.style.transform = `translateX(-${targetIdx * 100}%)`;
              addTimeout(() => {
                navigate(tabs[targetIdx]);
                addTimeout(resetStyles, 100);
              }, 300);
            } else {
              snapBack();
            }
          } else {
            snapBack();
          }
        } else {
          // Secondary screens back-swipe
          if (deltaX > 0 && currentPage) {
            const isBackTriggered = deltaX > 100 || (velocity > 0.3 && deltaX > 50);
            if (isBackTriggered) {
              // Complete Back Swipe (slide current off screen to right)
              currentPage.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
              currentPage.style.transform = 'translateX(100%)';
              
              if (prevPage) {
                prevPage.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
                prevPage.style.transform = 'translateX(0) scale(1)';
                prevPage.style.opacity = '1';
              }
              if (peekOverlay) {
                peekOverlay.style.transition = 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
                peekOverlay.style.opacity = '0';
              }

              addTimeout(() => {
                navigate(-1);
                addTimeout(resetStyles, 50);
              }, 200);
            } else {
              snapBack();
            }
          } else {
            snapBack();
          }
        }
      }

      isValidGesture = false;

      // Helper functions
      function snapBack() {
        const isCustomerTab = customerTabs.includes(pathname);
        const tabs = isCustomerTab ? customerTabs : businessTabs;
        const currentIndex = tabs.indexOf(pathname);

        if (tabSlider) {
          tabSlider.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
          tabSlider.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        if (currentPage) {
          currentPage.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
          currentPage.style.transform = 'translateX(0)';
        }

        if (prevPage) {
          prevPage.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
          prevPage.style.transform = 'translateX(-20%) scale(0.95)';
          prevPage.style.opacity = '0';
        }

        if (peekOverlay) {
          peekOverlay.style.transition = 'opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
          peekOverlay.style.opacity = '1';
        }

        addTimeout(resetStyles, 250);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      clearAllTimeouts();
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate, pathname]);
}
