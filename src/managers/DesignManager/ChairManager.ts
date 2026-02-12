import { makeAutoObservable, reaction, runInAction } from "mobx"
import type { Chair } from "../../Type/types"
import type { TopManager } from "./TopManager"
import { SEATING_CHART } from "../../utils/SeatingConfig"

interface ChairResponse {
  chairs: Chair[]
}
export class ChairManager {
  private _topManager: TopManager
  chairs: Chair[] = []
  selectedChairId: string | null = null
  selectedChairColorId: string | null = null
  chairQuantity: number = 0
  loading = false
  error: string | null = null

  constructor(topManager: TopManager) {
    this._topManager = topManager
    makeAutoObservable(this)
    this.syncQuantityToConfig()

    const tm = this._topManager
    reaction(
      () => [
        tm.selectedTopId,
        tm.topLength,
        tm.topWidth,
        tm.topDiameter,
        tm.topSize,
      ],
      () => this.syncQuantityToConfig()
    )
  }

  private getSeatingEntry() {
    const tm = this._topManager;
    const shape = tm.selectedTop?.name?.toLowerCase() ?? "";

    let chart = SEATING_CHART.standard;
    let currentDimension = tm.topLength;

    if (shape.includes("round")) {
      chart = SEATING_CHART.round;
      currentDimension = tm.topDiameter;
    } else if (shape.includes("square")) {
      chart = SEATING_CHART.square;
      currentDimension = tm.topSize;
    }

    // Find closest entry for the current size
    const entry = chart.reduce((best, item) => {
      const bestDiff = Math.abs(best.len - currentDimension);
      const nextDiff = Math.abs(item.len - currentDimension);
      return nextDiff < bestDiff ? item : best;
    }, chart[0]);

    return { entry, currentDimension };
  }

  private getChairLimits() {
    const { entry } = this.getSeatingEntry();
    const min = 0;
    const max = Math.min(12, Math.max(entry.comfortable, entry.compact));
    return { min, max };
  }
 
  get chairLimits() {
    return this.getChairLimits()
  }

  private syncQuantityToConfig() {
    const { min, max } = this.getChairLimits()
    let next = this.chairQuantity || min
    if (next < min) next = min
    if (next > max) next = max
    if (next !== this.chairQuantity) {
      this.chairQuantity = next
    }
  }

  incrementChairQuantity() { 
    const { min, max } = this.getChairLimits()
    const current = this.chairQuantity < min ? min : this.chairQuantity
    const next = Math.min(max, current + 2)
    this.chairQuantity = next
  }

  decrementChairQuantity() { 
    const { min } = this.getChairLimits()
    const current = this.chairQuantity < min ? min : this.chairQuantity
    const next = Math.max(min, current - 2)
    this.chairQuantity = next
  }

  async loadChairs() {
    this.loading = true
    this.error = null

    try {
      const res = await fetch("/assets/config/chair.json")
      if (!res.ok) throw new Error("Failed to load chairs")

      const data: ChairResponse = await res.json()

      runInAction(() => {
  this.chairs = data.chairs;
  const firstAvailable = data.chairs.find(c => !c.disabled);
  this.selectedChairId = firstAvailable?.id ?? null;
  
  // NEW: Set default color if a chair is found
  if (firstAvailable) {
    this.selectedChairColorId = "color1";
  }
  this.loading = false;
})
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error).message
        this.loading = false
      })
    }
  }

  selectChair(id: string) {
    if (this.selectedChairId === id) return
    this.selectedChairId = id
  }

  selectChairColor(colorId: string) {
    if (this.selectedChairColorId === colorId) return
    this.selectedChairColorId = colorId
  }

  // incrementChairQuantity() {
  //   this.chairQuantity += 2
  // }

  // decrementChairQuantity() {
  //   if (this.chairQuantity > 2) {
  //     this.chairQuantity -= 2
  //   }
  // }


  get selectedChairColor() {
    const chair = this.selectedChair
    if (!chair || !this.selectedChairColorId) return null

    if (this.selectedChairColorId === "color1") return chair.color1 ?? null
    if (this.selectedChairColorId === "color2") return chair.color2 ?? null
    if (this.selectedChairColorId === "color3") return chair.color3 ?? null
    return null
  }

  get selectedChair() {
    return this.chairs.find(c => c.id === this.selectedChairId) ?? null
  }

  get seatingTypeLabel() {
    const { entry } = this.getSeatingEntry()
    const { comfortable, compact } = entry

    if (compact === comfortable) return "Comfortable Seating"
    if (this.chairQuantity >= compact) return "Compact Seating"
    if (this.chairQuantity <= comfortable) return "Comfortable Seating"
    return "Balanced Seating"
  }
}
