import { useRef, useCallback, useEffect } from 'react';

/**
 * Lightweight horizontal carousel: native scroll-snap + arrow control + autoplay.
 * Returns a ref for the track and helpers for arrows / hover-pause.
 */
export default function useCarousel({ gap = 18, interval = 4000 } = {}) {
  const trackRef = useRef(null);
  const pausedRef = useRef(false);

  const slide = useCallback(
    (dir) => {
      const track = trackRef.current;
      if (!track) return;
      const first = track.firstElementChild;
      const step = first ? first.offsetWidth + gap : track.clientWidth * 0.8;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
      const atStart = track.scrollLeft <= 5;
      if (dir > 0 && atEnd) track.scrollTo({ left: 0, behavior: 'smooth' });
      else if (dir < 0 && atStart) track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      else track.scrollBy({ left: dir * step, behavior: 'smooth' });
    },
    [gap]
  );

  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !interval) return;
    const id = setInterval(() => {
      if (!pausedRef.current) slide(1);
    }, interval);
    return () => clearInterval(id);
  }, [slide, interval]);

  const pause = useCallback(() => { pausedRef.current = true; }, []);
  const resume = useCallback(() => { pausedRef.current = false; }, []);

  return { trackRef, slide, pause, resume };
}
