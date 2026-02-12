import * as THREE from "three"
import { observer } from "mobx-react-lite"
import { useEffect, useMemo } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import { stateManager } from "../../managers/StateManager"

export const Base = observer(({ visible = true }: { visible?: boolean }) => {
  const { baseManager, topManager } = stateManager.designManager
  const base = baseManager.selectedBase
  const baseId = base?.id ?? ""
  const baseLabel = base?.label?.toLowerCase() ?? ""
  const topLength = topManager.topLength

  const isCradle = baseId === "cradle" || baseLabel === "cradle"
  const isLegAdjustable =
    baseId === "curva" ||
    baseId === "twiste" ||
    baseId === "linea" ||
    baseId === "moon" ||
    baseLabel === "curva" ||
    baseLabel === "twiste" ||
    baseLabel === "linea" ||
    baseLabel === "moon"

  // 1. ALWAYS call Hooks at the top level with fallbacks
  const shouldUseSmallModel =
    isCradle && !!base?.small_model && topLength >= 1600 && topLength <= 2400
  const modelPath =
    (shouldUseSmallModel ? base?.small_model : base?.models?.default) ||
    base?.model ||
    ""
  const gltf = useGLTF(modelPath)

  const colorKey = baseManager.selectedBaseColorId ?? "color1"
  const color = colorKey === "color2" ? base?.color2 : base?.color1

  // Load the full PBR texture set 
  const textures = useTexture({
    map: color?.["base-color"] || "",
    metalnessMap: color?.metalness || "",
    normalMap: color?.normal || "",
    roughnessMap: color?.roughness || "",
  })

  const shouldRender = !!(base?.models?.default && gltf)

  // 2. Configure texture settings (colorSpace is critical for realism)
  useEffect(() => {
    if (!shouldRender) return

    Object.values(textures).forEach((tex) => {
      if (tex) {
        tex.flipY = false
        tex.needsUpdate = true
      }
    })

    if (textures.map) textures.map.colorSpace = THREE.SRGBColorSpace
  }, [textures, shouldRender])

  // 3. Normalize the model position
  const normalizedScene = useMemo(() => {
    if (!gltf) return new THREE.Group()
    
    const scene = gltf.scene.clone(true)
    const box = new THREE.Box3().setFromObject(scene)
    const center = box.getCenter(new THREE.Vector3())

    scene.position.x -= center.x
    scene.position.z -= center.z
    scene.position.y -= box.min.y

    return scene
  }, [gltf])

  const legNodes = useMemo(() => {
    if (!normalizedScene) return []
    const candidates: THREE.Object3D[] = []

    normalizedScene.traverse((obj) => {
      const name = obj.name?.toLowerCase?.() ?? ""
      if (name.includes("leg")) candidates.push(obj)
    })

    if (candidates.length >= 2) {
      if (candidates.length <= 2) return candidates
      return candidates
        .map((obj) => ({ obj, x: Math.abs(obj.position.x) }))
        .sort((a, b) => b.x - a.x)
        .slice(0, 2)
        .map((entry) => entry.obj)
    }

    const rootMap = new Map<THREE.Object3D, number>()
    normalizedScene.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return
      const box = new THREE.Box3().setFromObject(obj)
      const center = box.getCenter(new THREE.Vector3())

      let root: THREE.Object3D = obj
      while (root.parent && root.parent !== normalizedScene) {
        root = root.parent
      }

      const score = Math.abs(center.x)
      const existing = rootMap.get(root)
      if (existing === undefined || score > existing) rootMap.set(root, score)
    })

    return Array.from(rootMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([root]) => root)
  }, [normalizedScene])

  // 4. Apply the high-quality PBR material
  useEffect(() => {
    if (!normalizedScene || !shouldRender) return

    normalizedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true

        // Clone material to avoid affecting other instances
        const oldMat = child.material as THREE.MeshStandardMaterial
        const newMat = oldMat.clone()

        // Apply all PBR maps from your JSON
        newMat.map = textures.map
        newMat.metalnessMap = textures.metalnessMap
        newMat.normalMap = textures.normalMap
        newMat.roughnessMap = textures.roughnessMap
        
        // Ensure values are set to 1 so the maps control the look
        newMat.metalness = 1 
        newMat.roughness = 1
        newMat.color = new THREE.Color(0xffffff)
        
        child.material = newMat
      }
    })
  }, [normalizedScene, textures, shouldRender])

  useEffect(() => {
    if (!normalizedScene || !shouldRender) return
    if (!isLegAdjustable || legNodes.length === 0) return

    const minLength = 1600
    const maxLength = baseId === "moon" ? 2900 : 3180
    const clampedLength = Math.max(minLength, Math.min(maxLength, topLength))
    const moonSnapRatio = 0.8
    const ratio =
      baseId === "moon"
        ? topLength >= minLength && topLength <= maxLength
          ? moonSnapRatio
          : 1
        : clampedLength / maxLength

    legNodes.forEach((node) => {
      if (node.userData._baseLegOriginalX === undefined) {
        node.userData._baseLegOriginalX = node.position.x
      }
      const originalX = node.userData._baseLegOriginalX as number
      node.position.x = originalX * ratio
    })
  }, [baseId, isLegAdjustable, legNodes, normalizedScene, shouldRender, topLength])

  const finalVisibility = shouldRender && visible;

  return (
    <primitive 
      object={normalizedScene} 
      visible={finalVisibility} 
    />
  )
})
