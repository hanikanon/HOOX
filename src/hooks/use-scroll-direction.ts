import { useEffect, useState } from "react";

/**
 * Returns true when the user is scrolling down and past a small threshold.
 * Used to hide the mobile bottom nav on scroll-down and reveal on scroll-up.
 */
export function useHideOnScroll(threshold = 8) {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        if (Math.abs(delta) > threshold) {
          if (delta > 0 && y > 64) setHidden(true);
          else if (delta < 0) setHidden(false);
          lastY = y;
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return hidden;
}
