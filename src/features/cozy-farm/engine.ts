import { CONFIG, type Multiplier } from './config'

export type Harvest = { time: string; fertilizerUsed: number; support: number; normalWeight: number; criticalMultiplier: number; weight: number; eventPoints: number }
export type AutoEstimate = { fertilizerUsed: number; applications: number; support: number; multiplier: number; normalWeight: number; finalWeight: number; eventPoints: number; criticalCounts: Record<number, number> }

export function formatNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2).replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1')}M`
  if (value >= 10_000) return `${(value / 1000).toFixed(2).replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1')}K`
  if (value >= 1000) return `${(value / 1000).toFixed(2).replace(/0$/, '').replace(/\.$/, '')}K`
  return Math.floor(value).toLocaleString('en-US')
}

export function formatWeight(value: number): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
}

export function affordableMultiplier(fertilizer: number, preferred: number): Multiplier {
  const eligible = CONFIG.MULTIPLIERS.filter((value) => value <= fertilizer)
  return (eligible.includes(preferred as Multiplier) ? preferred : eligible.at(-1) ?? 1) as Multiplier
}

export function calculateHarvest(fertilizerUsed: number, supportInput: number, random = Math.random, time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })): Harvest {
  const support = Math.max(0, Math.min(CONFIG.MAX_SUPPORT_PERCENT, supportInput))
  const normalWeight = CONFIG.BASE_WEIGHT_PER_FERTILIZER * (1 + support / 100) * fertilizerUsed
  // One critical roll is made for the entire fertilizer application.
  const roll = random()
  let cumulativeChance = 0
  const criticalMultiplier = CONFIG.CRITICAL_CHANCES.find((entry) => {
    cumulativeChance += entry.chance
    return roll < cumulativeChance
  })?.multiplier ?? 5
  const weight = normalWeight * criticalMultiplier
  return {
    time,
    fertilizerUsed,
    support,
    normalWeight,
    criticalMultiplier,
    weight,
    eventPoints: Math.round(weight * CONFIG.EVENT_POINTS_PER_KG),
  }
}

export function simulateAutoFertilize(fertilizer: number, support: number, preferredMultiplier: number, random = Math.random): AutoEstimate {
  let remaining = Math.max(0, Math.floor(fertilizer))
  const fertilizerUsed = remaining
  let applications = 0
  let normalWeight = 0
  let finalWeight = 0
  let eventPoints = 0
  const criticalCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const runTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  while (remaining > 0) {
    const amount = affordableMultiplier(remaining, preferredMultiplier)
    const application = calculateHarvest(amount, support, random, runTime)
    remaining -= amount
    applications += 1
    normalWeight += application.normalWeight
    finalWeight += application.weight
    eventPoints += application.eventPoints
    criticalCounts[application.criticalMultiplier] += 1
  }
  return { fertilizerUsed, applications, support: Math.max(0, Math.min(CONFIG.MAX_SUPPORT_PERCENT, support)), multiplier: preferredMultiplier, normalWeight, finalWeight, eventPoints, criticalCounts }
}
