export function normalizeProgress(points: unknown, claimedPoints: unknown) {
  const safePoints = (value: unknown) => typeof value === 'number' && Number.isFinite(value)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.round(value))) : 0
  const current = safePoints(points)
  return { points: current, claimedPoints: Math.min(current, safePoints(claimedPoints)) }
}

export function parsePointInput(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '').toLowerCase()
  if (!normalized) return 0
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*([km])?$/)
  if (!match) return null
  const points = Number(match[1]) * (match[2] === 'm' ? 1000000 : match[2] === 'k' ? 1000 : 1)
  return Number.isFinite(points) && points <= Number.MAX_SAFE_INTEGER ? Math.round(points) : null
}
