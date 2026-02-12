import { makeAutoObservable, runInAction } from "mobx"
import type { TopShape } from "../../Type/types"
import type { StateManager } from '../StateManager';

interface TopShapeResponse {
  tops: TopShape[]
}

export class TopManager {
  tops: TopShape[] = []
  selectedTopId: string | null = null

  seatingType: 'comfortable' | 'compact' = 'comfortable';
  
  // Oblong shape dimensions
  topLength: number = 3180 // mm
  topWidth: number = 1300 // mm
  private _lengthHasDecreased: boolean = false
  
  // Circle/Square shape dimensions
  topDiameter: number = 1580 // mm (for round circle)
  topSize: number = 1580 // mm (for square)
  private _diameterHasDecreased: boolean = false
  private _sizeHasDecreased: boolean = false
  
  loading = false
  error: string | null = null

  constructor(_libState: StateManager, type: 'comfortable' | 'compact') {
    this.seatingType = type;
    makeAutoObservable(this)
  }

  setSeatingType(type: 'comfortable' | 'compact') {
    this.seatingType = type;
  }

  async loadTops() {
    this.loading = true
    this.error = null

    try {
      const res = await fetch("/assets/config/top-shape.json")
      if (!res.ok) throw new Error("Failed to load top shapes")

      const data: TopShapeResponse = await res.json()

      runInAction(() => {
        this.tops = data.tops
        this.selectedTopId = data.tops.find(b => !b.disabled)?.id ?? null
        this.loading = false
      })

      console.log("Loaded tops:", this.tops)
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error).message
        this.loading = false
      })
    }
  }

  selectTop(id: string) {
    if (this.selectedTopId === id) return
    this.selectedTopId = id
    // Reset all decrease flags when shape changes
    this._lengthHasDecreased = false
    this._diameterHasDecreased = false
    this._sizeHasDecreased = false

    this.seatingType = 'comfortable';
  }

  private applyIncrementLogic(value: number, min: number, max: number, state: { current: number, hasDecreased: boolean }): { value: number, hasDecreased: boolean } {
    // First decrease: 80mm drop from max
    if (!state.hasDecreased && value < max && value <= max - 80) {
      return { value: max - 80, hasDecreased: true }
    }

    // Mark as decreased if going down from starting value
    let newHasDecreased = state.hasDecreased
    if (value < state.current) {
      newHasDecreased = true
    }

    // All other changes: 100mm increments
    const rounded = Math.round(value / 100) * 100
    const clamped = Math.max(min, Math.min(max, rounded))
    
    return { value: clamped, hasDecreased: newHasDecreased }
  }

  setTopLength(length: number) {
    const result = this.applyIncrementLogic(length, 1600, 3180, { current: this.topLength, hasDecreased: this._lengthHasDecreased })
    this.topLength = result.value
    this._lengthHasDecreased = result.hasDecreased
  }

  setTopWidth(width: number) {
    // Width always changes by 50mm increments
    const rounded = Math.round(width / 50) * 50
    this.topWidth = Math.max(800, Math.min(1300, rounded))
  }

  setTopDiameter(diameter: number) {
    const result = this.applyIncrementLogic(diameter, 1200, 1580, { current: this.topDiameter, hasDecreased: this._diameterHasDecreased })
    this.topDiameter = result.value
    this._diameterHasDecreased = result.hasDecreased
  }

  setTopSize(size: number) {
    const result = this.applyIncrementLogic(size, 1200, 1580, { current: this.topSize, hasDecreased: this._sizeHasDecreased })
    this.topSize = result.value
    this._sizeHasDecreased = result.hasDecreased
  }

  get selectedTop() {
    return this.tops.find(b => b.id === this.selectedTopId) ?? null
  }
}
