import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'
import { MapControls } from 'three/addons/controls/MapControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import { acceleratedRaycast, computeBatchedBoundsTree, MeshBVH } from 'three-mesh-bvh'

import {
  createRadixSort,
  extendBatchedMeshPrototype,
  getBatchedMeshLODCount
} from '@three.ez/batched-mesh-extensions'
import {
  performanceRangeLOD,
  simplifyGeometriesByErrorLOD
} from '@three.ez/simplify-geometry'

extendBatchedMeshPrototype()


THREE.Mesh.prototype.raycast = acceleratedRaycast
THREE.BatchedMesh.prototype.computeBoundsTree = computeBatchedBoundsTree

let stats: Stats

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera

const instancesCount = 500
let batchedMesh: THREE.BatchedMesh
let lastHoveredInstance: THREE.BatchedMesh

const lastHoveredColor = new THREE.Color()
const highlight = new THREE.Color('green')

const raycaster = new THREE.Raycaster
const mouse = new THREE.Vector2(1., 1.)
const position = new THREE.Vector3
const quaternion = new THREE.Quaternion
const scale = new THREE.Vector3(1., 1., 1.)
const matrix = new THREE.Matrix4
const color = new THREE.Color

init()

async function init() {
  renderer = new THREE.WebGLRenderer({})
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = .8
  document.body.appendChild(renderer.domElement)

  scene = new THREE.Scene

  const pmremGenerator = new THREE.PMREMGenerator(renderer)
  scene.environment = pmremGenerator.fromScene(new RoomEnvironment, .04).texture

  camera = new THREE.PerspectiveCamera(50., window.innerWidth / window.innerHeight, .1, 1000.)
  camera.position.set(0., 20., 55.)

  raycaster.firstHitOnly = false

  stats = new Stats
  document.body.appendChild(stats.dom)

  const controls = new MapControls(camera, renderer.domElement)
  controls.maxPolarAngle = Math.PI / 2.

  const geometries = [
    new THREE.CircleGeometry(1., 12.),
    new THREE.CircleGeometry(10., 12.),
    new THREE.CircleGeometry(100., 12.)
  ]

  const geometriesLODArray = await simplifyGeometriesByErrorLOD(geometries, 4., performanceRangeLOD)

  const { vertexCount, indexCount, LODIndexCount } = getBatchedMeshLODCount(geometriesLODArray)
  batchedMesh = new THREE.BatchedMesh(
    instancesCount, vertexCount, indexCount,
    new THREE.MeshStandardMaterial({ metalness: 1., roughness: .8, })
  )

  batchedMesh.customSort = createRadixSort(batchedMesh)

  geometriesLODArray.forEach((geometryLOD, i) => {
    const geometryId = batchedMesh.addGeometry(geometryLOD[0], -1, LODIndexCount[i])
    batchedMesh.addGeometryLOD(geometryId, geometryLOD[1], 50.)
    batchedMesh.addGeometryLOD(geometryId, geometryLOD[2], 100.)
    batchedMesh.addGeometryLOD(geometryId, geometryLOD[3], 125.)
    batchedMesh.addGeometryLOD(geometryId, geometryLOD[4], 200.)
  })

  const sqrtCount = Math.ceil(Math.sqrt(instancesCount))
  const size = 5.5
  const start = (sqrtCount / 2 * size) + (size / 2)

  for (let i = 0; i < instancesCount; i++) {
    const r = Math.floor(i / sqrtCount)
    const c = i % sqrtCount
    const id = batchedMesh.addInstance(Math.floor(Math.random() * geometriesLODArray.length))
    position.set(c * size + start, 0., r * size + start)
    quaternion.random()
    batchedMesh.setMatrixAt(id, matrix.compose(position, quaternion, scale))
    batchedMesh.setColorAt(id, color.setHSL(Math.random(), .6, .5))
  }

  batchedMesh.computeBoundsTree()
  batchedMesh.computeBVH(THREE.WebGLCoordinateSystem)

  scene.add(batchedMesh)

  const config = { freeze: false, useBVH: true, useLOD: true }
  const bvh = batchedMesh.bvh
  const lods = (batchedMesh as unknown as MeshBVH)._geometryInfo.map(x => x.LOD)
  const onBeforeRender = batchedMesh.onBeforeRender

  const gui = new GUI

  gui.add(batchedMesh, 'instanceCount').disable()
  gui.add(config, 'freeze').onChange(v => {
    batchedMesh.onBeforeRender = v ? () => { } : onBeforeRender
  })

  const frustumCullingFolder = gui.addFolder('frustum culling & raycasting')
  frustumCullingFolder.add(config, 'useBVH').onChange(v => batchedMesh.bvh = v ? bvh : undefined)

  const geometriesFolder = gui.addFolder('geometries')
  geometriesFolder.add(config, 'useLOD').onChange(v => {
    const geometryInfo = batchedMesh._geometryInfo
    geometryInfo.forEach((geometry: { LOD: any }, i: number) => {
      geometry.LOD = v ? lods[i] : null
    })
  })



  renderer.setAnimationLoop(animate)

  function animate() {
    stats.begin()
    renderer.render(scene, camera)
    stats.end()
  }
}


