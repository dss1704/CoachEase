export function tourPosition(target: { left: number; top: number; right: number; bottom: number }, width: number, height: number, viewportWidth: number, viewportHeight: number) {
  const gap = 18, edge = 12;
  const clampX = (x: number) => Math.max(edge, Math.min(x, viewportWidth-width-edge));
  const clampY = (y: number) => Math.max(edge, Math.min(y, viewportHeight-height-edge));
  if (viewportWidth >= 760 && target.right+gap+width <= viewportWidth-edge) return { left: target.right+gap, top: clampY(target.top), side: "right" };
  if (target.bottom+gap+height <= viewportHeight-edge) return { left: clampX(target.left), top: target.bottom+gap, side: "bottom" };
  if (target.top-gap-height >= edge) return { left: clampX(target.left), top: target.top-gap-height, side: "top" };
  if (viewportWidth >= 760 && target.left-gap-width >= edge) return { left: target.left-gap-width, top: clampY(target.top), side: "left" };
  return { left: clampX(target.left), top: clampY(viewportHeight-height-edge), side: "dock" };
}
