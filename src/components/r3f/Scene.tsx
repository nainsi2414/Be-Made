import { Base } from "./Base"
import { Top } from "./Top"
import { CameraController } from "./CameraController"
import { Environment } from "./Environment"
import { ChairGroup } from "./ChairGroup"
import { useTexture } from "@react-three/drei"
import * as THREE from "three"

// Scene.tsx
interface SceneProps {
  activeView: string;
}

export function Scene({ activeView }: SceneProps) {

  const bgTexture = useTexture("/assets/images/background/background.svg")
  bgTexture.colorSpace = THREE.SRGBColorSpace

  const showChairs = ["Two Chair", "Chair", "Chair Top"].includes(activeView);
  // This view should only show chairs
  const isHeroView = activeView === "Two Chair";

  return (
    <>
      <primitive object={bgTexture} attach="background" />
      {/* <ambientLight intensity={1} /> */}
      <directionalLight position={[5, 7, 5]} intensity={1.5} castShadow />

      <Environment />
      <CameraController activeView={activeView} />

      {/* Pass visibility prop: hide if isHeroView is true */}
      <Base visible={!isHeroView} />
      <Top visible={!isHeroView} />

      <ChairGroup
        visible={showChairs}
        activeView={activeView}
      />
    </>
  )
}
