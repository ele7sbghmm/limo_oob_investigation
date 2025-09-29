import * as THREE from 'three'

const fences = await fetch('/data/fences.json')

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)

document.body.appendChild(renderer.domElement)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75., window.innerWidth / window.innerHeight, .1, 1000.)

camera.position.z = 5.

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const geometry = new THREE.BoxGeometry(1., 1., 1.)
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

const animate = () => {
  requestAnimationFrame(animate)

  cube.rotation.x += .01

  renderer.render(scene, camera)
}

animate()

