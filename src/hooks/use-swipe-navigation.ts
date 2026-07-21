import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

/**
 * Drives an interactive, finger-synchronized horizontal swipe gesture between
 * an ordered list of routes (e.g. the primary bottom-nav tabs).
 *
 * - Tracks raw touch movement 1:1 and exposes `dragX` every frame so the
 *   caller can transform its content in lockstep with the finger — no delay,
 *   no smoothing, no interpolation while a finger is actually down.
 * - Locks the gesture to one axis using an angle-based intent check (not just
 *   "which delta is bigger"), so it never fights native vertical scrolling
 *   and never mistakes a diagonal scroll for a page swipe.
 * - Applies rubber-band resistance at the first/last tab.
 * - On release, hands off to a real numerically-integrated spring simulation
 *   (stiffness/damping/mass) seeded with the finger's actual release
 *   velocity, so the settle — whether it's snapping back or completing the
 *   swipe — carries genuine momentum instead of a canned CSS easing curve.
 *
 * Elements that manage their own horizontal scrolling (story rails,
 * carousels, chart scrubbers, ...) can opt out by adding a
 * `data-no-swipe` attribute anywhere between the touch target and this
 * container.
 */

export interface SwipeNavigationOptions {
  /** Number of tabs in the swipeable set. */
  count: number;
  /** Index of the tab currently on screen. */
  activeIndex: number;
  /** Called once a swipe commits to a new tab index. */
  onCommit: (nextIndex: number) => void;
  /** Whether the gesture should be active at all (e.g. disable on desktop). */
  enabled?: boolean;
  /** Fraction of container width that counts as a committed swipe. Default 0.22 */
  distanceThreshold?: number;
  /** Minimum px/ms flick speed that also counts as a committed swipe. Default 0.5 */
  velocityThreshold?: number;
}

export interface SwipeNavigationState {
  /** Current horizontal offset to apply as `translateX(dragX)`. */
  dragX: number;
  /** True while a finger is actively down and the gesture is horizontal-locked. */
  isDragging: boolean;
  /** True during the physical spring settle animation after release. */
  isSettling: boolean;
  /** 0 → 1 progress toward the commit threshold, signed by direction. Useful
   *  for driving subtle "page identity" flair while dragging. */
  progress: number;
  /** Attach to the swipeable container. */
  containerRef: RefObject<HTMLDivElement | null>;
}

const RUBBER_BAND = 3.2;
// Real spring physics (critically-ish damped) — numerically integrated every
// frame rather than a fixed-duration CSS curve, so release velocity actually
// carries through into the settle.
const SPRING_STIFFNESS = 420;
const SPRING_DAMPING = 34;
const SPRING_MASS = 1;
const SPRING_REST_DIST = 0.4; // px
const SPRING_REST_VEL = 40; // px/s
// Angle (from horizontal) within which a gesture is allowed to lock to the
// x-axis. Keeps a mostly-vertical scroll from ever being mistaken for a swipe.
const AXIS_LOCK_ANGLE_DEG = 35;

export function useSwipeNavigation({
  count,
  activeIndex,
  onCommit,
  enabled = true,
  distanceThreshold = 0.22,
  velocityThreshold = 0.5,
}: SwipeNavigationOptions): SwipeNavigationState {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragXRef = useRef(0);
  const [dragX, setDragXState] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [progress, setProgress] = useState(0);

  const setDragX = useCallback((v: number) => {
    dragXRef.current = v;
    setDragXState(v);
  }, []);

  const touch = useRef({
    active: false,
    axisLocked: null as "x" | "y" | null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0, // px/ms
    width: 1,
  });

  const springRaf = useRef<number | null>(null);

  const stopSpring = useCallback(() => {
    if (springRaf.current != null) {
      cancelAnimationFrame(springRaf.current);
      springRaf.current = null;
    }
  }, []);

  /** Numerically-integrated spring from the current dragX to `target`,
   *  seeded with `velocityPxPerSec`. Runs every animation frame and updates
   *  `dragX` directly — no CSS transition involved, so it tracks exactly
   *  what a physical spring would do, including any overshoot. */
  const springTo = useCallback(
    (target: number, velocityPxPerSec: number, onDone?: () => void) => {
      stopSpring();
      setIsSettling(true);
      let pos = dragXRef.current;
      let vel = velocityPxPerSec;
      let last = performance.now();

      const step = (now: number) => {
        const dt = Math.min(0.032, (now - last) / 1000);
        last = now;
        const springForce = -SPRING_STIFFNESS * (pos - target);
        const dampingForce = -SPRING_DAMPING * vel;
        const accel = (springForce + dampingForce) / SPRING_MASS;
        vel += accel * dt;
        pos += vel * dt;

        const settled = Math.abs(pos - target) < SPRING_REST_DIST && Math.abs(vel) < SPRING_REST_VEL;
        if (settled) {
          setDragX(target);
          setIsSettling(false);
          springRaf.current = null;
          onDone?.();
          return;
        }
        setDragX(pos);
        springRaf.current = requestAnimationFrame(step);
      };
      springRaf.current = requestAnimationFrame(step);
    },
    [setDragX, stopSpring],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !enabled) return;

    const onTouchStart = (e: TouchEvent) => {
      if (isSettling) stopSpring();
      const target = e.target as HTMLElement;
      if (target.closest("[data-no-swipe]")) return;
      const t = e.touches[0];
      touch.current = {
        active: true,
        axisLocked: null,
        startX: t.clientX,
        startY: t.clientY,
        lastX: t.clientX,
        lastT: e.timeStamp,
        velocity: 0,
        width: el.clientWidth || 1,
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      const s = touch.current;
      if (!s.active) return;
      const t = e.touches[0];
      const dx = t.clientX - s.startX;
      const dy = t.clientY - s.startY;

      if (!s.axisLocked) {
        const dist = Math.hypot(dx, dy);
        if (dist < 10) return;
        // Angle-based intent: only lock horizontal if the gesture is clearly
        // more sideways than vertical. Anything steeper defers to scrolling.
        const angleFromHorizontal = (Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI;
        s.axisLocked = angleFromHorizontal <= AXIS_LOCK_ANGLE_DEG ? "x" : "y";
        if (s.axisLocked === "x") setIsDragging(true);
      }
      if (s.axisLocked !== "x") return;

      e.preventDefault();

      const dt = Math.max(1, e.timeStamp - s.lastT);
      s.velocity = (t.clientX - s.lastX) / dt;
      s.lastX = t.clientX;
      s.lastT = e.timeStamp;

      const atStart = activeIndex === 0 && dx > 0;
      const atEnd = activeIndex === count - 1 && dx < 0;
      const resisted = atStart || atEnd ? dx / RUBBER_BAND : dx;
      setDragX(resisted);
      setProgress(Math.max(-1, Math.min(1, resisted / s.width)));
    };

    const onTouchEnd = () => {
      const s = touch.current;
      if (!s.active) return;
      s.active = false;
      setIsDragging(false);
      if (s.axisLocked !== "x") {
        setDragX(0);
        return;
      }

      const width = s.width;
      const releaseVelocityPxPerSec = s.velocity * 1000;
      const pastDistance = Math.abs(dragXRef.current) / width > distanceThreshold;
      const pastVelocity = Math.abs(s.velocity) > velocityThreshold;
      const committed = pastDistance || pastVelocity;

      if (committed) {
        const goingNext = dragXRef.current < 0 || s.velocity < -velocityThreshold;
        const nextIndex = goingNext
          ? Math.min(count - 1, activeIndex + 1)
          : Math.max(0, activeIndex - 1);
        if (nextIndex !== activeIndex) {
          const exitTo = goingNext ? -width : width;
          springTo(exitTo, releaseVelocityPxPerSec, () => {
            onCommit(nextIndex);
            setDragX(0);
            setProgress(0);
          });
          return;
        }
      }
      springTo(0, releaseVelocityPxPerSec, () => setProgress(0));
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [
    enabled,
    activeIndex,
    count,
    isSettling,
    distanceThreshold,
    velocityThreshold,
    onCommit,
    springTo,
    setDragX,
    stopSpring,
  ]);

  return { dragX, isDragging, isSettling, progress, containerRef };
}
