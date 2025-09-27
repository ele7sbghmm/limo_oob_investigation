import { Application, Graphics } from 'pixi.js';
import fences from './data/fences.json'

type Vec3 = { x: number, y: number, z: number }
type Fence = { start: Vec3, end: Vec3, normal: Vec3 }

const drawFence = (graphics: Graphics, fence: Fence) => {
  return graphics
    .moveTo(fence.start.x + 500, fence.start.z + 500)
    .lineTo(fence.end.x + 500, fence.end.z + 500)
}

const drawFenceArray = (graphics: Graphics, fences: Fence[]) => {
  fences.forEach(fence => drawFence(graphics, fence))

  return graphics.stroke({ width: 2, color: 0xff0000 })
}

(async () => {
  const app = new Application();
  await app.init({
    resizeTo: window,
    backgroundColor: 0x202020,
    antialias: true,
  })
  document.body.appendChild(app.canvas)

  const l1 = fences[0].terra

  const graphics = new Graphics()
  drawFenceArray(graphics, l1)

  app.stage.addChild(graphics)
})();

