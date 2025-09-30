import * as THREE from 'three'
import { MapControls } from 'three/addons/controls/MapControls.js';

type Vec3 = { x: number, y: number, z: number }
type Fence = { start: Vec3, end: Vec3, normal: Vec3 }

const fencesToCircle = (scene: THREE.Scene, fences: Fence[], wheelBase: number) => {
  const circleGeometry = new THREE.CircleGeometry(1., 24., 0., Math.PI * 2.)
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .1, depthWrite: false, wireframe: false, side: THREE.DoubleSide })
  const instancedCircles = new THREE.InstancedMesh(circleGeometry, material, fences.length)
  scene.add(instancedCircles)

  const matrix = new THREE.Matrix4()
  const dummy = new THREE.Object3D()

  fences.forEach((fence, i) => {
    const [sx, sz, ex, ez] = [fence.start.x, -fence.start.z, fence.end.x, -fence.end.z]
    const center = [(sx + ex) / 2., (sz + ez) / 2.]

    const [xdif, zdif] = [Math.abs(center[0] - sx), Math.abs(center[1] - sz)]
    const halfLengthSqr = xdif * xdif + zdif * zdif
    const radius = Math.sqrt(wheelBase * wheelBase + halfLengthSqr)

    dummy.position.set(center[0], 0., center[1])
    dummy.rotation.x = Math.PI / 2.
    // dummy.rotation.y = 1.
    // dummy.rotation.z = 1.
    dummy.scale.set(radius, radius, radius)
    dummy.updateMatrix()

    instancedCircles.setMatrixAt(i, dummy.matrix)
  })

  instancedCircles.instanceMatrix.needsUpdate = true
}

const fencesToMesh = (fences: Fence[]) => {
  const points = fences.flatMap(fence => [fence.start.x, 0., -fence.start.z, fence.end.x, 0., -fence.end.z])
  const arrayBuf = new Float32Array(points)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(arrayBuf, 3))

  const material = new THREE.LineBasicMaterial({ color: 0xff0000 })
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

const lineMesh = fencesToMesh(fences[0].terra)
scene.add(lineMesh)
fencesToCircle(scene, fences[0].terra, 10.22)

const controls = new MapControls(camera, renderer.domElement)
controls.enableRotate = false

camera.position.set(
  controls.target.x,
  100.,
  controls.target.z

)

const animate = () => {
  requestAnimationFrame(animate)
  controls.update(.1)

  mesh.rotation.z += .01

  renderer.render(scene, camera)
}

animate()

