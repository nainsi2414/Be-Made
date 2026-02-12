import { makeAutoObservable, runInAction } from "mobx"
import type { BaseShape } from "../../Type/types"
import type { StateManager } from '../StateManager';

interface BaseShapeResponse {
  bases: BaseShape[]
}

export class BaseManager {
  bases: BaseShape[] = []
  selectedBaseId: string | null = null
  selectedBaseColorId: string | null = null
  loading = false
  error: string | null = null

  constructor(_libState: StateManager) {
    makeAutoObservable(this)
  }

  async loadBases() {
    this.loading = true
    this.error = null

    try {
      const res = await fetch("/assets/config/base-shape.json")
      if (!res.ok) throw new Error("Failed to load base shapes")

      const data: BaseShapeResponse = await res.json()

      runInAction(() => {
        this.bases = data.bases
        this.selectedBaseId =
          data.bases.find(b => !b.disabled)?.id ?? null
        this.loading = false
      })
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error).message
        this.loading = false
      })
    }
  }

  selectBase(id: string) {
    if (this.selectedBaseId === id) return
    this.selectedBaseId = id
    this.selectedBaseColorId = null
  }

  selectBaseColor(colorId: string) {
    if (this.selectedBaseColorId === colorId) return
    this.selectedBaseColorId = colorId
  }

  get selectedBase() {
    return this.bases.find(b => b.id === this.selectedBaseId) ?? null
  }

  get selectedBaseColor() {
    const base = this.selectedBase
    if (!base || !this.selectedBaseColorId) return null
    
    if (this.selectedBaseColorId === "color1") return base.color1 ?? null
    if (this.selectedBaseColorId === "color2") return base.color2 ?? null
    return null
  }
}
