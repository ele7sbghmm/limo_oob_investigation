import * as THREE from 'three'
import { useEffect, useRef } from 'react'

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mount = mountRef.current!
    const scene = new THREE.Scene
    const camera = new THREE.PerspectiveCamera(65, mount.clientWidth / mount.clientHeight, .1, 10_000.)
    const renderer = new THREE.WebGLRenderer
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const geo = new THREE.BoxGeometry
    const mat = new THREE.MeshNormalMaterial
    const cube = new THREE.Mesh(geo, mat)
    scene.add(cube)

    const animate = () => {
      cube.rotation.x += .01
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mount.clientWidth, mount.clientHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return <div ref={mountRef} className="w-full h-[400px]" />
}
