export function Environment() {
  return (
    <>
      {/* Main directional light */}
      <directionalLight
        intensity={0.65}
        position={[5, 10, 8]}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={2}
        shadow-camera-far={60}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={14}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0002}
        shadow-normalBias={0.01}
      />

      {/* Fill light */}
      <directionalLight
        intensity={0.45}
        position={[-6, 10, -10]}
      />

      {/* Ambient */}
      <ambientLight intensity={0.55} />
    </>
  )
}
