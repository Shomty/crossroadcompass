// STATUS: done | Task OA.3
/**
 * lib/astro/calculatorService.ts
 * Singleton factory for VedicAstrologyCalculator and WesternAstrologyCalculator.
 * THIS IS THE ONLY FILE THAT MAY INSTANTIATE THESE CALCULATORS.
 * No other file in the codebase may import or call them directly.
 */

import path from 'path'
import { createRequire } from 'module'
import { env } from '@/lib/env'

// Force CJS load — the ESM build (index.mjs) uses `import * as swisseph` which
// returns a namespace object where native Node bindings are inaccessible.
const _require = createRequire(import.meta.url)
const {
  VedicAstrologyCalculator,
  WesternAstrologyCalculator,
} = _require('openastrology-library') as typeof import('openastrology-library')

const EPHE_PATH = path.isAbsolute(env.EPHE_PATH)
  ? env.EPHE_PATH
  : path.resolve(process.cwd(), env.EPHE_PATH)

let _vedic: InstanceType<typeof VedicAstrologyCalculator> | null = null
let _western: InstanceType<typeof WesternAstrologyCalculator> | null = null

export function getVedicCalculator(): InstanceType<typeof VedicAstrologyCalculator> {
  if (!_vedic) {
    _vedic = new VedicAstrologyCalculator({
      ayanamsa: 'lahiri',
      houseSystem: 'wholehouse',
      ephePath: EPHE_PATH,
    })
  }
  return _vedic
}

export function getWesternCalculator(): InstanceType<typeof WesternAstrologyCalculator> {
  if (!_western) {
    _western = new WesternAstrologyCalculator({
      houseSystem: 'placidus',
      ephePath: EPHE_PATH,
    })
  }
  return _western
}

export function disposeCalculators(): void {
  _vedic?.dispose()
  _vedic = null
  _western?.dispose()
  _western = null
}

if (typeof process !== 'undefined') {
  process.on('exit', disposeCalculators)
  process.on('SIGTERM', () => { disposeCalculators(); process.exit(0) })
  process.on('SIGINT',  () => { disposeCalculators(); process.exit(0) })
}
