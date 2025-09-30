import * as THREE from 'three'
import { MapControls } from 'three/addons/controls/MapControls.js';
import { GUI } from 'lil-gui'

type Vec3 = { x: number, y: number, z: number }
type Fence = { start: Vec3, end: Vec3, normal: Vec3 }

let dummy = new THREE.Object3D()
let instancedCircles: THREE.InstancedMesh

const fences = await fetch('./data/fences.json').then(data => data.json())
const halfLengthSqrs: number[] = Array.from({ length: fences.length }, () => 0.)

const fencesToCircle = (fences: Fence[]) => {
	const circleGeometry = new THREE.CircleGeometry(1., 96., 0., Math.PI * 2.)
	const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .1, depthWrite: false, side: THREE.DoubleSide })
	instancedCircles = new THREE.InstancedMesh(circleGeometry, material, fences.length)
	scene.add(instancedCircles)

	fences.forEach((fence, i) => {
		const [sx, sz, ex, ez] = [fence.start.x, -fence.start.z, fence.end.x, -fence.end.z]
		const center = [(sx + ex) / 2., (sz + ez) / 2.]

		const [xdif, zdif] = [Math.abs(center[0] - sx), Math.abs(center[1] - sz)]
		halfLengthSqrs[i] = xdif * xdif + zdif * zdif

		dummy.position.set(center[0], 0., center[1])
		dummy.rotation.x = Math.PI / 2.
		dummy.updateMatrix()

		instancedCircles.setMatrixAt(i, dummy.matrix)
	})

	instancedCircles.instanceMatrix.needsUpdate = true

	return instancedCircles
}

const updateInstanceScales = (scale: number) => {
	for (let i = 0; i < instancedCircles.count; i++) {
		instancedCircles.getMatrixAt(i, dummy.matrix)

		dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)

		const radius = Math.sqrt(halfLengthSqrs[i] + scale * scale)
		dummy.scale.set(radius, radius, radius)

		dummy.updateMatrix()
		instancedCircles.setMatrixAt(i, dummy.matrix)
	}

	instancedCircles.instanceMatrix.needsUpdate = true
}

const fencesToMesh = (scene: THREE.Scene, fences: Fence[]) => {
	const points = fences.flatMap(fence => [fence.start.x, 0., -fence.start.z, fence.end.x, 0., -fence.end.z])
	const arrayBuf = new Float32Array(points)

	const geometry = new THREE.BufferGeometry()
	geometry.setAttribute('position', new THREE.BufferAttribute(arrayBuf, 3))

	const material = new THREE.LineBasicMaterial({ color: 0xff0000 })

	const lines = new THREE.LineSegments(geometry, material)
	scene.add(lines)
}


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
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

fencesToMesh(scene, fences[0].terra)
instancedCircles = fencesToCircle(fences[0].terra)
scene.add(instancedCircles)

const controls = new MapControls(camera, renderer.domElement)
camera.position.set(controls.target.x, 100., controls.target.z)
controls.enableRotate = false

const guiControls = {
	wheelBase: 11.66
}

const gui = new GUI()
gui
	.add(guiControls, 'wheelBase', 5., 11.66)
	.name('wheel base')
	.step(.01)
	.onChange(updateInstanceScales)

const animate = () => {
	requestAnimationFrame(animate)

	mesh.rotation.x += .01
	mesh.rotation.z += .01

	controls.update(.1)

	renderer.render(scene, camera)
}

animate()

