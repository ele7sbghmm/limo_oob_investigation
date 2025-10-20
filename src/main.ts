import * as THREE from 'three'
import { MapControls } from 'three/addons/controls/MapControls.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import Stats from 'three/addons/libs/stats.module.js'

type V3 = { x: number, y: number, z: number }
type Fence = { start: V3, end: V3, normal: V3 }

let stats: Stats

let camera: THREE.PerspectiveCamera
let controls: MapControls
let scene: THREE.Scene
let renderer: THREE.WebGLRenderer
let inst: THREE.InstancedMesh
let circGeom: THREE.CircleGeometry
let outlineMesh: THREE.Mesh
let dummy = new THREE.Object3D
let linesGeom: THREE.BufferGeometry
let colorArrayBuf: Float32Array

let raycaster = new THREE.Raycaster
let mouse = new THREE.Vector2

const white = new THREE.Color('white')
const red = new THREE.Color('red')
const green = new THREE.Color('green')

await init()

async function init() {
  let fences = await fetch('/fences_sorted.json').then(data => data.json())
  fences = fences[1]

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
  controls.screenSpacePanning = true
  // controls.enableZoom = false

  scene = new THREE.Scene
  scene.background = new THREE.Color('black')
  // scene.fog = new THREE.Fog(0x110000, 2_000, 10_000)
  scene.add(new THREE.AmbientLight('white', 3))

  circGeom = new THREE.CircleGeometry(1., 64.)
  const circMat = new THREE.MeshBasicMaterial(
    { color: 'white', transparent: true, opacity: .1, depthWrite: false }
  )
  inst = new THREE.InstancedMesh(
    circGeom,
    circMat,
    //new THREE.MeshPhongMaterial({ color: 'white' }),
    fences.length
  )
  // const text = new THREE.Text

  const lineArrayBuf = new Float32Array(fences.flatMap((f: Fence) => {
    return [f.start.x, f.start.z, 0.1, f.end.x, f.end.z, 0.1]
  }))
  colorArrayBuf = new Float32Array(Array.from({ length: fences.length }, () => [1., 1., 1., 1., 1., 1.]).flat())
  linesGeom = new THREE.BufferGeometry
  linesGeom.setAttribute('position', new THREE.BufferAttribute(lineArrayBuf, 3))
  linesGeom.setAttribute('color', new THREE.BufferAttribute(colorArrayBuf, 3))
  const linesMat = new THREE.LineBasicMaterial({ vertexColors: true })
  const linesMesh = new THREE.LineSegments(linesGeom, linesMat)

  // const wheelbase = 11.66
  const wheelbase = 10.22
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

  const outlineMaterial = new THREE.MeshBasicMaterial(
    { color: 'blue', side: THREE.DoubleSide, depthWrite: false }//, opacity: .1, transparent: true }
  )
  outlineMesh = new THREE.Mesh(circGeom, outlineMaterial);
  outlineMesh.visible = false
  outlineMesh.renderOrder = 2
  inst.renderOrder = 1
  scene.add(outlineMesh)
  scene.add(mesh)
  scene.add(inst)
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

    newlyHovered.add(id!)
  }

  const sortedNewlyHovered = Array.from(newlyHovered).sort((a, b) => a - b)
  // for (let i = 0; i < sortedNewlyHovered.length; i++) {
  for (let i = sortedNewlyHovered.length - 1; i >= 0; i--) {
    const id = sortedNewlyHovered[i]
    inst.getMatrixAt(id, dummy.matrix)
    dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)

    dummy.scale.multiplyScalar(1.01)
    dummy.updateMatrix()
    // dummy.position.add(new THREE.Vector3(100., 0., 0.))
    // dummy.position.add(new THREE.Vector3(0., 100., 0.))
    dummy.position.add(new THREE.Vector3(0., 0., -1.))
    outlineMesh.position.copy(dummy.position)
    outlineMesh.quaternion.copy(dummy.quaternion)
    outlineMesh.scale.copy(dummy.scale)
    outlineMesh.visible = true
    inst.visible = false

    if (i < 8) {
      inst.setColorAt(sortedNewlyHovered[i], red)
      colorArrayBuf.set([1., 0., 0., 1., 0., 0.], id * 6)
    } else {
      inst.setColorAt(sortedNewlyHovered[i], green)
      colorArrayBuf.set([0., 1., 0., 0., 1., 0.], id * 6)
    }
  }

  // const sortedHovered = Array.from(newlyHovered).sort((a, b) => a - b)
  for (const id of hovered) {
    // for (let i = 0; i < sortedHovered.
    if (!newlyHovered.has(id)) {
      inst.setColorAt(id, white)
      colorArrayBuf.set([1., 1., 1., 1., 1., 1.], id * 6)
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

