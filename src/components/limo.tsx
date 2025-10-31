import { useRef } from 'react'

import { Canvas, useFrame } from '@react-three/fiber'
import { MapControls, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export default function Limo() {
  const instRef = useRef<THREE.InstancedMesh>(undefined!)
  const dummy = new THREE.Object3D
  for (let i = 0; i < 16; i++) {
    dummy.position.set(i, 1., i)
    dummy.updateMatrix()
    instRef.current?.setMatrixAt(i, dummy.matrix)
  }

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'block', flex: 1 }}>
      <Canvas
        style={{ width: '100vw', height: '100vh', display: 'block', flex: 1 }}
        camera={{ position: [3, 3, 3] }}
      >
        {/* <ambientLight /> */}
        <Box />
        <instancedMesh ref={instRef} args={[undefined, undefined, 16]}>
          <circleGeometry args={[2, 32]} />
          <meshBasicMaterial color='red' side={THREE.DoubleSide} />
        </instancedMesh>
        <OrbitControls /> {/* <MapControls enableRotate={false} screenSpacePanning={true} /> */}
      </Canvas>
    </div>
  )
}

function Box() {
  const boxRef = useRef<THREE.Mesh>(undefined!)

  useFrame((state, delta) => {
    boxRef.current.rotation.x += delta
  })

  return (
    <mesh ref={boxRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color='green' />
    </mesh>
  )
}
