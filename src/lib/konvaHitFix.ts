import Konva from 'konva'

let applied = false

export function patchKonvaHitDetection() {
  if (applied) return
  applied = true

  const proto = Konva.Layer.prototype as any
  proto.getIntersection = function (
    pos: { x: number; y: number }
  ): Konva.Shape | null {
    if (!this.isListening() || !this.isVisible()) return null
    return hitTestContainer(this, pos)
  }
}

function hitTestContainer(
  container: Konva.Container,
  pos: { x: number; y: number }
): Konva.Shape | null {
  const children = container.getChildren()
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i]
    if (!child.isListening() || !child.isVisible()) continue

    if (child instanceof Konva.Group) {
      const hit = hitTestContainer(
        child as unknown as Konva.Container,
        pos
      )
      if (hit) return hit
    } else if (child instanceof Konva.Shape) {
      if ((child as any).attrs.hitFunc) continue

      const local = child
        .getAbsoluteTransform()
        .copy()
        .invert()
        .point(pos)
      const w = child.width()
      const h = child.height()
      if (
        w > 0 &&
        h > 0 &&
        local.x >= 0 &&
        local.x <= w &&
        local.y >= 0 &&
        local.y <= h
      ) {
        return child
      }
    }
  }
  return null
}
