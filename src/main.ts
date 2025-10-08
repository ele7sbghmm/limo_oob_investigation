import { Application, Container, Graphics, Rectangle, Text } from 'pixi.js'

(async () => {
  const app = new Application
  await app.init({
    background: '#111111',
    resizeTo: window,
    antialias: true,
  })
  document.getElementById('pixi-container')!.appendChild(app.canvas)

  const c = new Container({ })
  c.eventMode = 'static'
  await buildFences(c)

  c.on('wheel', (event: WheelEvent) => {
    const factor = event.deltaY > 0 ? 1.01 : .99
    c.scale.x *= factor
    c.scale.y *= factor

    console.log(event.deltaY, c.scale, factor)
  })

  app.stage.addChild(c)
})()

async function buildFences(c: Container) {
  const fenceData = await fetch('/data/fences.json').then(data => data.json())

  const g = new Graphics({ })

  let max = [-Infinity, -Infinity]
  let min = [Infinity, Infinity]
  fenceData[1].terra.forEach(fence => {
    const [s, e] = [[fence.start.x, -fence.start.z], [fence.end.x, -fence.end.z]]
    max = [Math.max(max[0], s[0], e[0]), Math.max(max[1], s[1], e[1])]
    min = [Math.min(min[0], s[0], e[0]), Math.min(min[1], s[1], e[1])]
    g
      .moveTo(...s)
      .lineTo(...e)
  })
  g.stroke({ color: '#ff0000' })


  c.hitArea = new Rectangle(...min, ...max)
  c.position.set(Math.abs(min[0]), Math.abs(min[1]))
  c.width = c.x + max[0]
  c.height = c.z + max[1]
  console.log(c.x, c.y)

  const centerText = new Text({
    text: 'center',
    style: { fill: '#ffffff', fontFamily: 'courier' }
  })
  centerText.x = c.width / 3
  centerText.z = c.height / 2
  const b = new Graphics({ })
  b
    .moveTo(0, 0)
    .lineTo(200, c.height)
    .stroke({ color: '#00ff00' })

  c.addChild(centerText, b, g)
  return c
}
