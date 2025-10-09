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
  const c = buildFences(fenceData)

  c.eventMode = 'static'
  c.on('wheel', (event: WheelEvent) => {
    const factor = event.deltaY > 0 ? 1.25 : .8
    c.scale.x *= factor
    c.scale.y *= factor

    console.log(event, event.deltaY, c.scale, factor)
  })

  app.stage.addChild(c)
})()

function buildFences(fenceData: any) {
  const c = new Container({ })
  const g = new Graphics({ })
  c.addChild(g)

  let [max, min] = [[-Infinity, -Infinity], [Infinity, Infinity]]
  fenceData[1].terra.forEach(fence => {
    const [s, e] = [[fence.start.x * 10, -fence.start.z * 10], [fence.end.x * 10, -fence.end.z * 10]]
    max = [Math.max(max[0], s[0], e[0]), Math.max(max[1], s[1], e[1])]
    min = [Math.min(min[0], s[0], e[0]), Math.min(min[1], s[1], e[1])]
    g
      .moveTo(...s)
      .lineTo(...e)
  })
  g.stroke({ color: '#ff0000' })

  c.position.set(window.innerWidth / 2, window.innerHeight / 2)

  // c.bounds = new Bounds(...min, ...max)
  c.scale.x *= 1/10
  c.scale.y *= 1/10
  c.hitArea = c.getLocalBounds().rectangle
  console.log(c.bounds)
  console.log(c.hitArea)

  return c
}
