import { useEffect, useRef } from 'react';

/**
 * Custom hook for smooth, single-trigger scroll reveal animations.
 * Observes elements with `.reveal-init` within a container ref (or the ref element itself)
 * and marks them `.reveal-visible` when scrolled into view.
 */
export function useScrollReveal(options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback for environments without IntersectionObserver
      const elements = container.querySelectorAll('.reveal-init');
      elements.forEach((el) => el.classList.add('reveal-visible'));
      if (container.classList.contains('reveal-init')) {
        container.classList.add('reveal-visible');
      }
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: options.threshold ?? 0.12,
        rootMargin: options.rootMargin ?? '0px 0px -30px 0px',
      }
    );

    const targetElements = container.querySelectorAll('.reveal-init');
    targetElements.forEach((el) => observer.observe(el));

    if (container.classList.contains('reveal-init')) {
      observer.observe(container);
    }

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return containerRef;
}

export default useScrollReveal;
