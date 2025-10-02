import { Application, Container, Graphics } from 'pixi.js'

type Fence = { start: Vec3, end: Vec3, normal: Vec3 }
type Vec3 = { x: number, y: number, z: number }
class Vec2 {
  x: number
  z: number
  constructor(x: number, z: number) {
    this.x = x
    this.z = z
  }
  length() { return Math.sqrt(this.x * this.x + this.z * this.z) }
  add(other: Vec2) { return new Vec2(this.x + other.x, this.z + other.z) }
  sub(other: Vec2) { return new Vec2(this.x - other.x, this.z - other.z) }
  scale(factor: number) { return new Vec2(this.x * factor, this.z * factor) }
}


const drawFences = (gfx: Graphics, fences: Fence[], [xmin, ymin]: [number, number]) => {
  fences.forEach(fence => {
    gfx
      .moveTo(fence.start.x - xmin, -fence.start.z - ymin)
      .lineTo(fence.end.x - xmin, -fence.end.z - ymin)
  })
  gfx.stroke({ width: 1, color: 0xff0000 })
}
const drawFenceCircles = (gfx: Graphics, fences: Fence[], wheelBase: number) => {
  class C {
    x: number
    y: number
    r: number
    constructor(x: number, y: number, r: number) { [this.x, this.y, this.r] = [x, -y, r] }
  }
  let [cx, cm] = [[0., 0.], [0., 0.]]
  let [xmax, ymax, xmin, ymin] = [0., 0., 0., 0.]
  const cs = fences.map(fence => {
    const s = new Vec2(fence.start.x, fence.start.z)
    const e = new Vec2(fence.end.x, fence.end.z)

    const center = s.add(e).scale(.5)
    if (center.x > cx[0]) cx[0] = center.x
    if (center.z > cx[1]) cx[1] = center.z
    if (center.x < cm[0]) cm[0] = center.x
    if (center.z < cm[1]) cm[1] = center.z
    const halfLength = center.sub(s).length()
    const radius = new Vec2(halfLength, wheelBase).length()
    if (!xmax || center.x + radius > xmax) xmax = center.x + radius
    if (!ymax || center.z + radius > ymax) ymax = center.z + radius
    if (!xmin || center.x - radius < xmin) xmin = center.x - radius
    if (!ymin || center.z - radius < ymin) ymin = center.z - radius

    return new C(center.x, center.z, radius)

  })
  cs.forEach((c: C) => {
    gfx.circle(c.x - xmin, c.y - ymin, c.r)
  })
  gfx.fill({ color: 0xffffff, alpha: .05 })

  console.log(xmax, ymax, xmin, ymin)
  console.log(cx, cm)
  return [xmax, ymax, xmin, ymin]
}

(async () => {
  const fences = await fetch('data/fences.json').then(data => data.json())

  const gfx = new Graphics()
  const [xmax, ymax, xmin, ymin] = drawFenceCircles(gfx, fences[0].terra, 11.66)
  drawFences(gfx, fences[0].terra, [xmin, ymin])

  gfx
    .moveTo(0, 0)
    .lineTo(10_000, 10_000)
    .stroke({})

  const zoom = new Container
  zoom.addChild(gfx)

  const app = new Application()
  await app.init({
    // width: xmax - xmin,
    // height: ymax - ymin,
    resizeTo: window,
    backgroundColor: 0x202020,
    antialias: true,
  })
  document.body.appendChild(app.canvas)
  app.stage.addChild(zoom)

  app.canvas.addEventListener('wheel', doZoom)
  function doZoom(e: WheelEvent) {
    console.log(e)
  }
})()

