import { useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useRef, useMemo } from "react"
import * as THREE from "three"

export function CameraController({ activeView }: { activeView: string }) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)

  // Map view names to specific 3D coordinates
  const positions = useMemo(() => ({
    "Front": new THREE.Vector3(0, 1.3, 5.5),
    "Left": new THREE.Vector3(-3.5, 1.15, 1.2),
    "Top": new THREE.Vector3(0, 6, 0.1),
    "Right": new THREE.Vector3(5.2, 2.4, 3),
    "Two Chair": new THREE.Vector3(0, 1, 5),
    "Chair": new THREE.Vector3(5.3, 2.5, 3),
    "Chair Top": new THREE.Vector3(0, 6.5, 0.001)
  }), []);

  useFrame(() => {
    const target = positions[activeView as keyof typeof positions] || positions["Front"];
    
    // Smooth transition logic (0.1 = speed)
    camera.position.lerp(target, 0.04);
    
    // Ensure camera always focuses on the table center
    camera.lookAt(0, 1, 0);

    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      target={[0, 0.5, 0]}
    />
  )
}
