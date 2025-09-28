import { Application, Graphics } from 'pixi.js';

type Fence = { start: Vec3, end: Vec3, normal: Vec3 }
type Vec3 = { x: number, y: number, z: number }
class Vec2 {
  constructor(public x: number, public z: number) { }
  length() { return Math.sqrt(this.x * this.x + this.z * this.z) }
  add(other: Vec2) { return new Vec2(this.x + other.x, this.z + other.z) }
  sub(other: Vec2) { return new Vec2(this.x - other.x, this.z - other.z) }
  scale(factor: number) { return new Vec2(this.x * factor, this.z * factor) }
}

const drawFences = (gfx: Graphics, fences: Fence[]) => {
  fences.forEach(fence => {
    gfx
      .moveTo(fence.start.x, fence.start.z)
      .lineTo(fence.end.x, fence.end.z)
  })
  gfx.stroke({ width: 1, color: 0xff0000 })
}
const drawFenceCircles = (gfx: Graphics, fences: Fence[], wheelBase: number) => {
  fences.forEach(fence => {
    const s = new Vec2(fence.start.x, fence.start.z)
    const e = new Vec2(fence.end.x, fence.end.z)

    const center = s.add(e).scale(.5)
    const halfLength = center.sub(s).length()
    const radius = new Vec2(halfLength, wheelBase).length()
    gfx.circle(center.x, center.z, radius)
  })
  gfx.fill({ color: 0xffffff, alpha: .05 })
}

async function loadFences(path: string) {
  const res = await fetch(path)
  const data = await res.json()
  return data
}

(async () => {
  const fences = await loadFences('data/fences.json')

  const app = new Application();
  await app.init({
    // resizeTo: window,
    width: 1_000,
    height: 1_000,
    backgroundColor: 0x202020,
    antialias: true,
  })
  document.body.appendChild(app.canvas)

  const gfx = new Graphics()
  gfx.x = 500
  gfx.y = 1000
  drawFences(gfx, fences[0].terra)
  drawFenceCircles(gfx, fences[0].terra, 11.66)

  app.stage.addChild(gfx)
})();

