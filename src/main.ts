import { Application, Graphics } from 'pixi.js';

(async () => {
  console.log('eggs')

  const app = new Application();
  await app.init({
    resizeTo: window,
    backgroundColor: 0x202020,
    antialias: true,
  })
  document.body.appendChild(app.canvas)

  const graphics = new Graphics()
  graphics
    .circle(400, 200, 50)
    .stroke({ width: 2, color: 0xfffff })

  graphics
    .moveTo(50, 50)
    .arc(100, 100, 10, 100, Math.PI)
    .closePath()
    .fill({ color: 0x00ff00, alpha: 0.5 }); // Fill the shape


  app.stage.addChild(graphics)
})();

