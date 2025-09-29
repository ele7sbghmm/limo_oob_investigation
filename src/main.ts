import * as THREE from 'three'
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';

type Vec3 = { x: number, y: number, z: number }
type Fence = { start: Vec3, end: Vec3, normal: Vec3 }

const fenceToCircles = (fences: Fence[], wheelBase: number) => {
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })

  return fences.map(fence => {
    const [sx, sz, ex, ez] = [fence.start.x, fence.start.z, fence.end.x, fence.end.z]
    const center = [(sx + ex) / 2., (sz + ez) / 2.]

    const [xdif, zdif] = [Math.abs(center.x - s.x), Math.abs(center.z - s.z)]
    const halfLengthSqr = xdif * xdif + zdif * zdif
    const radius = Math.sqrt(wheelBase * wheelBase + halflengthsqr)

    const geometry = new THREE.CircleGeometry(center, radius)
    return new THREE.Mesh(geometry, material)
  })
}

const fencesToMesh = (fences: Fence[]) => {
  // const points = fences.flatMap(fence => [fence.start.x, 0., fence.start.z, fence.end.x, 0., fence.end.z])
  const points: number[] = fences.flatMap(fence => [fence.start.x, fence.start.z, 0., fence.end.x, fence.end.z, 0.])
  const arrayBuf = new Float32Array(points)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(arrayBuf, 3))

  const material = new THREE.LineBasicMaterial({ color: 0x00ff00 })
  return new THREE.LineSegments(geometry, material)
}

const fences = await fetch('/data/fences.json').then(data => data.json())
console.log(fences)

const renderer = new THREE.WebGLRenderer({ antialias: false })
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
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const fencesMesh = fencesToMesh(fences[0]['terra'])
console.log(fencesMesh)
scene.add(fencesMesh)

const controls = new FirstPersonControls(camera, renderer.domElement)
controls.lookSpeed = 1.
controls.movementSpeed = 50.

const animate = () => {
  requestAnimationFrame(animate)
  controls.update(.01)

  mesh.rotation.z += .01

  renderer.render(scene, camera)
}

animate()

