import { useState, useEffect } from 'react';

/**
 * Custom hook that uses IntersectionObserver to track element visibility.
 * @param ref - React ref object pointing to the element to observe
 * @param options - IntersectionObserver options (root, rootMargin, threshold)
 * @returns A boolean indicating whether the element is intersecting with the viewport
 */
export function useIntersectionObserver(ref: React.RefObject<Element>, options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}