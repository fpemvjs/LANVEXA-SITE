import { animate, inView, scroll, stagger } from "motion";

/**
 * Diagnostic motion tokens matching LANVEXA design system
 * Consistent with CSS custom properties in src/evidence-ledger.css
 */
export const MOTION_TOKENS = {
  duration: {
    fast: 0.18,      // 180ms
    state: 0.33,     // 330ms
    editorial: 0.70, // 700ms
    hero: 0.80,      // 800ms
    stagger: 0.11,   // 110ms
  },
  easing: {
    // Precise, calibrated instrument curve (no bouncy spring or playful oscillation)
    standard: [0.16, 1, 0.3, 1],
    state: [0.25, 1, 0.5, 1],
    linear: "linear",
  },
};

/**
 * Check whether the user environment requests reduced motion.
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Safe animate wrapper using Motion's vanilla JS/DOM API.
 * If prefers-reduced-motion is active, animation completes immediately with duration 0.
 *
 * @param {Element | Element[] | string} target
 * @param {Record<string, any>} keyframes
 * @param {Record<string, any>} [options]
 * @returns {any} AnimationControls
 */
export function safeAnimate(target, keyframes, options = {}) {
  const isReduced = prefersReducedMotion();
  const safeOptions = isReduced
    ? { ...options, duration: 0, delay: 0 }
    : options;

  return animate(target, keyframes, safeOptions);
}

/**
 * Safe inView observer wrapper.
 * When reduced motion is preferred, immediately triggers the callback and skips scroll observation.
 *
 * @param {Element | Element[] | string} element
 * @param {(entry: any) => void | (() => void)} onEnter
 * @param {Record<string, any>} [options]
 * @returns {() => void} cleanup function
 */
export function safeInView(element, onEnter, options = {}) {
  if (!element) return () => {};
  if (prefersReducedMotion()) {
    if (typeof onEnter === "function") {
      onEnter(element);
    }
    return () => {};
  }
  return inView(element, onEnter, options);
}

/**
 * Safe scroll progress binder.
 * Skips execution if reduced motion is preferred.
 *
 * @param {((progress: number) => void) | Record<string, any>} onScroll
 * @param {Record<string, any>} [options]
 * @returns {() => void} cleanup function
 */
export function safeScroll(onScroll, options = {}) {
  if (prefersReducedMotion()) return () => {};
  return scroll(onScroll, options);
}

export { animate, inView, scroll, stagger };
