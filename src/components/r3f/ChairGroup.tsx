import { observer } from "mobx-react-lite"
import { useMemo } from "react"
import { stateManager } from "../../managers/StateManager"
import { ChairModel } from "../r3f/ChairGroup/ChairModel"
import {
  placeRadialChairs,
  placeOvalChairs,
  placeRectChairs,
  placeSquareChairs,
  placeOblongChairs, // 1. Add the new import
} from "../r3f/ChairGroup/ChairPlacement"

interface ChairGroupProps {
  visible: boolean;
  activeView: string;
}

export const ChairGroup = observer(({ visible, activeView }: ChairGroupProps) => {
  const { chairManager, topManager } = stateManager.designManager
  
  const chair = chairManager.selectedChair
  const quantity = chairManager.chairQuantity
  const selectedColor = chairManager.selectedChairColor;

  const poses = useMemo(() => {
    if (!chair || !chair.modelPath || quantity <= 0) return [];

    if (activeView === "Two Chair") {
      return [
        { x: -0.3, z: 1.0, rotY: Math.PI },
        { x: 0.3, z: 1.1, rotY: 0 },
      ];
    }

    const shape = topManager.selectedTop?.name?.toLowerCase() ?? ""
    const topId = (topManager.selectedTop?.id ?? "").toLowerCase() // Ensure lowercase for comparison
    
    const rectShapes = ["capsule", "rectangle"]
    const roundShapes = ["round"]
    const isSquare = topId === "square" || shape.includes("square")

    // 2. REFINED SHAPE LOGIC: Separate Oblong from Oval
    const isOblong = topId === "oblong" || shape.includes("oblong")
    const isOval = topId === "oval" || shape.includes("oval")

    if (rectShapes.includes(topId)) {
      return placeRectChairs(topManager.topLength ?? 3180, topManager.topWidth ?? 1300, quantity)
    }

    // 3. New specific check for Oblong using the curved-rectangular logic
    if (isOblong) {
      return placeOblongChairs(topManager.topLength ?? 3180, topManager.topWidth ?? 1300, quantity)
    }

    // 4. Standard Oval uses the radial/arc logic
    if (isOval) {
      return placeOvalChairs(topManager.topLength ?? 3180, topManager.topWidth ?? 1300, quantity)
    }

    if (isSquare) {
      return placeSquareChairs(topManager.topSize ?? 1580, quantity)
    }

    if (roundShapes.some((s) => shape.includes(s))) {
      const r = ((topManager.topDiameter ?? 1580) / 1580) * 1.2
      return placeRadialChairs(r, r, quantity)
    }

    return placeRadialChairs(1.2, 1.2, quantity)
  }, [
    chair,
    quantity,
    activeView,
    topManager.selectedTopId,
    topManager.topLength,
    topManager.topWidth,
    topManager.topDiameter,
    topManager.topSize,
  ])

  const isActuallyVisible = visible && quantity > 0 && chair && chair.modelPath;

  return (
    <group name="chair-group" visible={!!isActuallyVisible}>
      {poses.map((p, i) => (
        <group
          key={`${chair?.id}-${i}`}
          position={[p.x, 0, p.z]}
          rotation={[0, p.rotY, 0]}
        >
          <ChairModel
            modelPath={chair?.modelPath || ""}
            textures={selectedColor ? {
              leg: {
                color: selectedColor.legcolor,
                metal: selectedColor.legmetalness,
                rough: selectedColor.legroughness,
                normal: selectedColor.legnormal
              },
              seat: {
                color: selectedColor.seatcolor,
                metal: selectedColor.seatmetalness,
                rough: selectedColor.seatroughness,
                normal: selectedColor.seatnormal
              }
            } : null}
          />
        </group>
      ))}
    </group>
  )
})