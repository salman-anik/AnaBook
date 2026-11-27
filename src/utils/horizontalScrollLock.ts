import { useMemo } from 'react';

/**
 * Locks the outer horizontal tab pager on touch/drag so nested horizontal
 * carousels (authors, books, breadcrumbs, theme chips) scroll smoothly without tab-swipe theft.
 */
export function useHorizontalScrollLock(onHorizontalTouchLock?: (locked: boolean) => void) {
  return useMemo(
    () =>
      onHorizontalTouchLock
        ? {
            nestedScrollEnabled: true,
            onScrollBeginDrag: () => onHorizontalTouchLock(true),
            onScrollEndDrag: () => onHorizontalTouchLock(false),
            onMomentumScrollEnd: () => onHorizontalTouchLock(false),
          }
        : { nestedScrollEnabled: true },
    [onHorizontalTouchLock]
  );
}
