'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF, ContactShadows } from '@react-three/drei'
import { Suspense } from 'react'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={1} />
}

function Loader() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial wireframe color="#888" />
    </mesh>
  )
}

export default function ModelViewer({ url }: { url: string }) {
  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-gradient-to-b from-[#0f0f1a] via-[#15152a] to-[#1a1a35] shadow-2xl">
      <Canvas camera={{ position: [0, 1.5, 3.5], fov: 40 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <directionalLight position={[-3, 2, -2]} intensity={0.3} />
        <Suspense fallback={<Loader />}>
          <Stage environment="studio" intensity={0.5} shadows>
            <Model url={url} />
          </Stage>
        </Suspense>
        <ContactShadows position={[0, -0.8, 0]} opacity={0.4} scale={5} blur={2} />
        <OrbitControls autoRotate autoRotateSpeed={2.5} enableZoom={true} />
      </Canvas>
    </div>
  )
}
