import { useEffect } from 'react';

/**
 * Locks the document body scroll when `locked` is true and restores it on cleanup.
 * Preserves any existing inline overflow style set on the body.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [locked]);
}
