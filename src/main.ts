import * as THREE from 'three'
import { MapControls } from 'three/addons/controls/MapControls.js'
import Stats from 'three/addons/libs/stats.module.js'

type V3 = { x: number, y: number, z: number }
type Fence = { start: V3, end: V3, normal: V3 }

let stats: Stats

let camera: THREE.PerspectiveCamera
let controls: MapControls
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let inst: THREE.InstancedMesh
let linesGeom: THREE.BufferGeometry
let colorArrayBuf: Float32Array

let raycaster = new THREE.Raycaster
let mouse = new THREE.Vector2

const white = new THREE.Color('white')
const red = new THREE.Color('red')
const green = new THREE.Color('green')

await init()

async function init() {
  let fences = await fetch('/fences_l3_sorted.json').then(data => data.json())

  renderer = new THREE.WebGLRenderer//({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setAnimationLoop(animate)

  stats = new Stats
  document.body.appendChild(renderer.domElement)

  const aspectRatio = window.innerWidth / window.innerHeight
  camera = new THREE.PerspectiveCamera(27., aspectRatio, 1, 10_000)
  camera.position.set(0., 0., 500.);
  camera.lookAt(0., 0., 0.);

  controls = new MapControls(camera, renderer.domElement)
  controls.enableRotate = false
  // controls.enableZoom = false
  controls.screenSpacePanning = true

  scene = new THREE.Scene
  scene.background = new THREE.Color('black')
  // scene.fog = new THREE.Fog(0x110000, 2_000, 10_000)
  scene.add(new THREE.AmbientLight('white', 3))

  inst = new THREE.InstancedMesh(
    new THREE.CircleGeometry(1., 24.),
    //new THREE.MeshPhongMaterial({ color: 'white' }),
    new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: .1 }),
    fences.length
  )

  const lineArrayBuf = new Float32Array(fences.flatMap((f: Fence) => {
    return [f.start.x, f.start.z, 0.1, f.end.x, f.end.z, 0.1]
  }))
  colorArrayBuf = new Float32Array(Array.from({ length: fences.length }, () => [1., 1., 1., 1., 1., 1.]).flat())
  linesGeom = new THREE.BufferGeometry
  linesGeom.setAttribute('position', new THREE.BufferAttribute(lineArrayBuf, 3))
  linesGeom.setAttribute('color', new THREE.BufferAttribute(colorArrayBuf, 3))
  const linesMat = new THREE.LineBasicMaterial({ vertexColors: true })
  const linesMesh = new THREE.LineSegments(linesGeom, linesMat)

  const wheelbase = 11.66
  fences.forEach((f: Fence, i: number) => {
    const matrix = new THREE.Matrix4
    const s = new THREE.Vector3(f.start.x, f.start.z, 0.)
    const e = new THREE.Vector3(f.end.x, f.end.z, 0.)

    const center = e.clone().lerp(s, .5)
    const halflen = center.distanceTo(s)
    const radius = Math.sqrt(Math.pow(halflen, 2) + Math.pow(wheelbase, 2))

    matrix.setPosition(center.x, center.y, center.z)
    matrix.scale(new THREE.Vector3(radius, radius, radius))
    inst.setMatrixAt(i, matrix)
    inst.setColorAt(i, white)
  })

  const geom = new THREE.BoxGeometry(1., 1.)
  const mat = new THREE.MeshBasicMaterial({ color: '#00ff00' })
  const mesh = new THREE.Mesh(geom, mat)
  scene.add(mesh, inst)

  scene.add(linesMesh)

  document.addEventListener('mousemove', onMouseMove)
}

const hovered = new Set<number>
function animate() {
  controls.update()
  raycaster.setFromCamera(mouse, camera)

  const intersection = raycaster.intersectObject(inst)
  const newlyHovered = new Set<number>

  // for (const hit of intersection) {
  for (let i = 0; i < intersection.length; i++) {
    const hit = intersection[i]
    const id = hit.instanceId
    // if (!id)
    //   continue

    newlyHovered.add(id!)
  }

  const sortedHovered = Array.from(newlyHovered).sort((a, b) => a - b)
  for (let i = 0; i < sortedHovered.length; i++) {
    if (i < 8) {
      inst.setColorAt(sortedHovered[i], red)
      colorArrayBuf.set([1., 0., 0., 1., 0., 0.], sortedHovered[i] * 6)
    } else {
      inst.setColorAt(sortedHovered[i], green)
      colorArrayBuf.set([0., 1., 0., 0., 1., 0.], sortedHovered[i] * 6)
    }
  }

  for (const id of hovered) {
    if (!newlyHovered.has(id)) {
      inst.setColorAt(id, white)
    }
  }
  hovered.clear()
  for (const id of newlyHovered) hovered.add(id)

  inst.instanceColor!.needsUpdate = true
  linesGeom.attributes.color.needsUpdate = true

  renderer.render(scene, camera)
  stats.update()
}

function onMouseMove(event: MouseEvent) {
  event.preventDefault()

  const rect = renderer.domElement.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

