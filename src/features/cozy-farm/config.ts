export const CONFIG = {
  STARTING_FERTILIZER: 0,
  MAX_FERTILIZER: 1_000_000,
  MULTIPLIERS: [1, 2, 3, 5, 10, 20, 50, 100, 200],
  BASE_WEIGHT_PER_FERTILIZER: 5,
  MAX_SUPPORT_PERCENT: 263,
  // Provisional until the in-game weight-to-points conversion is confirmed.
  EVENT_POINTS_PER_KG: 1,
  CRITICAL_CHANCES: [
    { multiplier: 1, chance: 0.84 },
    { multiplier: 2, chance: 0.10 },
    { multiplier: 3, chance: 0.04 },
    { multiplier: 4, chance: 0.01 },
    { multiplier: 5, chance: 0.01 },
  ],
  BACK_PATH: '',
} as const

export type Multiplier = typeof CONFIG.MULTIPLIERS[number]
