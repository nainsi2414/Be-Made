import { makeAutoObservable, runInAction } from "mobx"
import type { TopColor } from "../../Type/types"
import type { StateManager } from '../StateManager'

interface TopColorResponse {
  "top-colors"?: TopColor[]
  topColors?: TopColor[]
}

export class TopColorManager {
  topColors: TopColor[] = []
  selectedTopColorId: string | null = null
  // NEW: Track the currently active category tab
  selectedCategory: string = "natural" 
  loading = false
  error: string | null = null

  constructor(_libState: StateManager) {
    makeAutoObservable(this)
  }

  async loadTopColors() {
    this.loading = true
    this.error = null

    try {
      const res = await fetch("/assets/config/top-color.json")
      if (!res.ok) throw new Error("Failed to load top colors")

      const data: TopColorResponse = await res.json()
      const list = data["top-colors"] ?? data.topColors ?? []

      runInAction(() => {
        this.topColors = list
        
        // Logic to select the first item that matches the default category
        const firstInCategory = list.find(c => c.type === this.selectedCategory && !(c as any).disabled)
        this.selectedTopColorId = firstInCategory?.id ?? list.find(c => !(c as any).disabled)?.id ?? null
        
        this.loading = false
      })
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error).message
        this.loading = false
      })
    }
  }

  // NEW: Action to switch categories
  setCategory(category: string) {
    this.selectedCategory = category.toLowerCase()
  }

  selectTopColor(id: string) {
    if (this.selectedTopColorId === id) return
    this.selectedTopColorId = id
  }

  get selectedTopColor() {
    return this.topColors.find(c => c.id === this.selectedTopColorId) ?? null
  }

  // OPTIONAL: Helper to get colors for the current category only
  get filteredTopColors() {
    return this.topColors.filter(c => c.type === this.selectedCategory)
  }

  get categories() {
  return [ "natural","polish", "silk"];
}

// Helper to get colors belonging to a specific group
getColorsByCategory(category: string) {
  return this.topColors.filter(tc => tc.type?.toLowerCase() === category.toLowerCase());
}
}
