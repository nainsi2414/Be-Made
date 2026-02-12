import * as THREE from "three"
import { useMemo, useEffect, Suspense } from "react"
import { useGLTF, useTexture } from "@react-three/drei"

type Props = {
  modelPath: string;
  textures: {
    leg: { color: string; metal: string; rough: string; normal: string };
    seat: { color: string; metal: string; rough: string; normal: string };
  } | null;
}

// Sub-component to handle the heavy lifting
function ChairContent({ modelPath, textures }: Props) {
  const { scene: originalScene } = useGLTF(modelPath)
  
  // Guard: If textures are missing, useTexture will fail. 
  // We provide a fallback or skip rendering until data is ready.
  const hasTextures = !!textures?.leg?.color;

  const maps = useTexture(hasTextures ? {
    legColor: textures.leg.color,
    legMetal: textures.leg.metal,
    legRough: textures.leg.rough,
    legNormal: textures.leg.normal,
    seatColor: textures.seat.color,
    seatMetal: textures.seat.metal,
    seatRough: textures.seat.rough,
    seatNormal: textures.seat.normal,
  } : {
    // Fallback transparent pixel to prevent 'undefined' crash
    legColor: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    legMetal: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    legRough: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    legNormal: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    seatColor: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    seatMetal: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    seatRough: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    seatNormal: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  });

  useEffect(() => {
    if (maps) {
      Object.values(maps).forEach(tex => {
        if (tex instanceof THREE.Texture) {
          tex.flipY = false;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
        }
      });
    }
  }, [maps]);

  const scene = useMemo(() => {
    const clone = originalScene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const center = box.getCenter(new THREE.Vector3())

    clone.position.set(-center.x, -box.min.y, -center.z)
    const size = box.getSize(new THREE.Vector3())
    const scale = 0.6 / Math.max(size.x, size.z)
    clone.scale.setScalar(scale)

    clone.traverse((c) => {
      if (c instanceof THREE.Mesh) {
        c.castShadow = true;
        c.receiveShadow = true;

        const isLeg = c.name.toLowerCase().includes("leg");

        // Dispose old materials to prevent memory leaks
        if (c.material) c.material.dispose();

        c.material = new THREE.MeshStandardMaterial({
          map: isLeg ? maps.legColor : maps.seatColor,
          metalnessMap: isLeg ? maps.legMetal : maps.seatMetal,
          roughnessMap: isLeg ? maps.legRough : maps.seatRough,
          normalMap: isLeg ? maps.legNormal : maps.seatNormal,
          roughness: 1,
          metalness: 1
        });
      }
    });

    return clone
  }, [originalScene, maps])

  return <primitive object={scene} />
}

// Main component with Suspense wrapper
export function ChairModel(props: Props) {
  // If modelPath is empty string or undefined, don't even try to load
  if (!props.modelPath) return null;

  return (
    <Suspense fallback={null}>
      <ChairContent {...props} />
    </Suspense>
  )
}