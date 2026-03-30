// STATUS: done | Task OA.10
/**
 * Maps openastrology-library Yoga.type to compact app categories for prompts/reports.
 */
import type { Yoga } from 'openastrology-library'

export type AppYogaCategory = 'raj' | 'dhana' | 'other'

export function mapYogaType(libType: Yoga['type']): AppYogaCategory {
  const map: Record<Yoga['type'], AppYogaCategory> = {
    Raja: 'raj',
    Dhana: 'dhana',
    Neechabhanga: 'raj',
    Arishtabhanga: 'other',
    Other: 'other',
  }
  return map[libType] ?? 'other'
}
