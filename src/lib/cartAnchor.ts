/**
 * Holds refs to whichever cart icon is currently visible (desktop navbar vs.
 * mobile bottom nav) so the fly-to-cart animation always lands on the right
 * target without the layout components needing to know about each other.
 */
export const cartAnchors: { desktop: HTMLElement | null; mobile: HTMLElement | null } = {
  desktop: null,
  mobile: null,
};

function isVisible(el: HTMLElement | null): el is HTMLElement {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0 && el.offsetParent !== null;
}

export function getCartAnchorRect(): DOMRect | null {
  if (isVisible(cartAnchors.mobile)) return cartAnchors.mobile.getBoundingClientRect();
  if (isVisible(cartAnchors.desktop)) return cartAnchors.desktop.getBoundingClientRect();
  return null;
}
