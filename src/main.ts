import { Application, Bounds, Container, Graphics, Rectangle, Text } from 'pixi.js'

(async () => {
  const app = new Application
  await app.init({
    background: '#111111',
    resizeTo: window,
    // antialias: true,
  })
  document.getElementById('pixi-container')!.appendChild(app.canvas)

  const fenceData = await fetch('/data/fences.json').then(data => data.json())
  const c = new Container({})
  c.hitArea = new Rectangle(0, 0, window.innerWidth, window.innerHeight)
  const t = new Text({
    text: `text`,
    style: { fill: { color: '#ffffff' } }
  })

  const scales = [.2, .5, 1., 2., 4., 6., 8., 10.]
  const fences = scales.map((scale, i) => {
    return {
      container: buildFences(fenceData, scale, 0xff << 16 + 0xff * i / 8),
      low: scale,
      high: [...scales, 20.][i + 1]
    }
  })
  fences.forEach(fence => { c.addChild(fence.container) })

  c.eventMode = 'static'
  let last = fences[0]
  last.container.visible = true

  c.on('wheel', (event: WheelEvent) => {
    const factor = event.deltaY > 0 ? 1.25 : .8
    c.scale.x *= factor
    c.scale.y *= factor

    if (c.scale.x < last.low || c.scale.x > last.high) {
      last.container.visible = false
      fences.forEach((fence, i) => {
        last.container.visible = false
        if (c.scale.x > fence.low && c.scale.x < fence.high) {
          last = fences[i]
          last.container.visible = true
        }
      })
    }

    console.log(event, event.deltaY, c.scale, factor)
  })
  app.ticker.add(() => {
    t.text = last
  })

  app.stage.addChild(t, c)
})()

function buildFences(fenceData: any, scale: number, color: string | number) {
  type Vec3 = { x: number, y: number, z: number }
  type Fence = { start: Vec3, end: Vec3, normal: Vec3 }

  const c = new Container({})
  c.visible = false
  const g = new Graphics({})

  c.addChild(g)

  let [max, min] = [[-Infinity, -Infinity], [Infinity, Infinity]]
  fenceData[1].terra.forEach((fence: Fence) => {
    const [s, e] = [[fence.start.x * scale, -fence.start.z * scale], [fence.end.x * scale, -fence.end.z * scale]]
    max = [Math.max(max[0], s[0], e[0]), Math.max(max[1], s[1], e[1])]
    min = [Math.min(min[0], s[0], e[0]), Math.min(min[1], s[1], e[1])]
    g
      .moveTo(s[0], s[1])
      .lineTo(e[0], e[1])
  })
  g.stroke({ color })

  c.position.set(window.innerWidth / 2, window.innerHeight / 2 + 200)

  // c.bounds = new Bounds(...min, ...max)
  c.scale.x *= 1 / scale
  c.scale.y *= 1 / scale
  c.hitArea = c.getLocalBounds().rectangle
  // console.log(c.bounds)
  console.log(c.hitArea)

  return c
}
