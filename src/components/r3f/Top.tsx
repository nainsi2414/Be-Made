import * as THREE from "three"
import { observer } from "mobx-react-lite"
import { useEffect, useMemo } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import { stateManager } from "../../managers/StateManager"
import gsap from "gsap"

export const Top = observer(({ visible = true }: { visible?: boolean }) => {
  const { topManager, topColorManager } = stateManager.designManager
  const top = topManager.selectedTop
  const tc = topColorManager.selectedTopColor

  // 1. DYNAMIC PATHS
  const topPath = top?.modelPath || ""
  const mdfPath = top?.mdfModelPath || ""
  
  // 2. MODEL LOADING
  const topGltf = useGLTF(topPath)
  const mdfGltf = useGLTF(mdfPath)

  // 3. TEXTURE LOADING
  const textures = useTexture({
    map: tc?.["base-color"] || "",
    normalMap: tc?.normal || "",
    roughnessMap: tc?.roughness || "",
    metalnessMap: tc?.metalness || "",
  })

  const isReady = !!(topGltf && mdfGltf)

  // 4. SCALE CALCULATION
  const scales = useMemo(() => {
    const shape = top?.name?.toLowerCase() ?? ""
    if (shape.includes("round")) {
      const s = topManager.topDiameter / 1580
      return { x: s, z: s }
    } else if (shape.includes("square")) {
      const s = topManager.topSize / 1580
      return { x: s, z: s }
    } else {
      return { 
        x: topManager.topLength / 3180, 
        z: topManager.topWidth / 1300 
      }
    }
  }, [top?.name, topManager.topLength, topManager.topWidth, topManager.topDiameter, topManager.topSize])

  // 5. TEXTURE CONFIGURATION & DISPOSAL
  useEffect(() => {
    if (!isReady) return
    
    Object.values(textures).forEach((tex) => {
      if (tex) {
        tex.flipY = false
        tex.anisotropy = 16 
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping
        tex.repeat.set(scales.x, scales.z)
        tex.center.set(0.5, 0.5) 
        tex.needsUpdate = true
      }
    })

    if (textures.map) textures.map.colorSpace = THREE.SRGBColorSpace

    // Cleanup textures on change to prevent memory bloat
    return () => {
      Object.values(textures).forEach(tex => tex?.dispose())
    }
  }, [textures, isReady, scales])

  // 6. SCENE HIERARCHY
  const combinedGroup = useMemo(() => {
    if (!isReady) return new THREE.Group()
    const root = new THREE.Group()

    const mdfScene = mdfGltf.scene.clone(true)
    mdfScene.traverse((child) => {
      if (child instanceof THREE.Mesh) child.receiveShadow = true
    })

    const topScene = topGltf.scene.clone(true)
    topScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false
        child.receiveShadow = true
      }
    })

    root.add(mdfScene) 
    root.add(topScene) 
    return root
  }, [topGltf, mdfGltf, isReady])

  // 7. MATERIAL APPLICATION & CONTEXT PROTECTION
  useEffect(() => {
    if (!combinedGroup || !isReady) return

    combinedGroup.scale.set(scales.x, 1, scales.z)

    const topLayer = combinedGroup.children[1] 
    const materialsToDispose: THREE.Material[] = []

    topLayer.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Track the old material before replacing it
        materialsToDispose.push(child.material)

        const newMat = (child.material as THREE.MeshStandardMaterial).clone()
        
        newMat.map = textures.map
        newMat.normalMap = textures.normalMap
        newMat.roughnessMap = textures.roughnessMap
        newMat.metalnessMap = textures.metalnessMap
        
        // Balanced for PointLight reflections
        newMat.roughness = 0.2
        newMat.metalness = 0.1
        
        newMat.transparent = true
        newMat.opacity = 0.2 // Prevent black "pop"
        
        child.material = newMat

        gsap.to(newMat, {
          opacity: 1,
          duration: 0.8, // Snappier than 2s for better UX
          ease: "power2.out",
          onComplete: () => {
            newMat.transparent = false 
          }
        })
      }
    })

    // CRITICAL: Dispose of old materials to stop "Context Lost"
    return () => {
      materialsToDispose.forEach(mat => mat.dispose())
    }
  }, [combinedGroup, textures, isReady, scales])

  return <primitive object={combinedGroup} visible={isReady && visible} />
})