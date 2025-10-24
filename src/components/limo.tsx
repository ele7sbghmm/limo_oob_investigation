import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

export default function Limo() {
  return (
    <Canvas camera={{ position: [3, 3, 3] }}>
      <ambientLight />
      <mesh rotation={[.5, .5, 0.]}>
        <boxGeometry />
        <meshStandardMaterial color="green" />
      </mesh>
      <OrbitControls />
    </Canvas>
  )
}
