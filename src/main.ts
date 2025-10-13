import paper from 'paper'

paper.setup('canvas')

const circle = new paper.Path.Circle({
  center: paper.view.center,
  radius: 200,
  fillColor: 'red'
})

paper.view.onFrame = event => {
  circle.rotate(1. + event.count * 0)
  circle.scaling = 1. + .05 * Math.sin(event.time * 2.)
}

