import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CONFIG, type Multiplier } from './config'
import { affordableMultiplier, calculateHarvest, simulateAutoFertilize, type AutoEstimate } from './engine'

const STORAGE_KEY = 'cozy-farm-fertilizer-v2'
function readFertilizer(fallback: number) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) return fallback
    const value = Number(stored)
    return Number.isFinite(value) && value >= 0 ? Math.min(CONFIG.MAX_FERTILIZER, value) : fallback
  } catch { return fallback }
}

export function useCozyFarm(initialFertilizer: number = CONFIG.STARTING_FERTILIZER) {
  const [fertilizer, setFertilizerState] = useState(() => readFertilizer(initialFertilizer))
  const [multiplier, setMultiplier] = useState<Multiplier>(1)
  const [eventPoints, setEventPoints] = useState(0)
  const [notice, setNotice] = useState('')
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selectedMultiplier = useMemo(() => affordableMultiplier(fertilizer, multiplier), [fertilizer, multiplier])

  const setFertilizer = useCallback((value: number) => {
    const next = Math.max(0, Math.min(CONFIG.MAX_FERTILIZER, Math.floor(value)))
    setFertilizerState(next)
    try { localStorage.setItem(STORAGE_KEY, String(next)) } catch { /* Storage can be disabled by the browser. */ }
    setMultiplier((current) => affordableMultiplier(next, current))
  }, [])

  useEffect(() => () => { if (noticeTimer.current) clearTimeout(noticeTimer.current) }, [])

  const flash = useCallback((message: string) => {
    setNotice(message)
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(''), 1800)
  }, [])

  const fertilize = useCallback((support: number) => {
    if (!fertilizer) { flash('No fertilizer left'); return null }
    const cost = affordableMultiplier(fertilizer, multiplier)
    setMultiplier(cost)
    setFertilizer(fertilizer - cost)
    const harvest = calculateHarvest(cost, support)
    setEventPoints((total) => total + harvest.eventPoints)
    return harvest
  }, [fertilizer, flash, multiplier, setFertilizer])

  const autoFertilize = useCallback((support: number): AutoEstimate | null => {
    if (!fertilizer) { flash('No fertilizer left'); return null }
    const estimate = simulateAutoFertilize(fertilizer, support, multiplier)
    setFertilizer(fertilizer - estimate.fertilizerUsed)
    setEventPoints((total) => total + estimate.eventPoints)
    return estimate
  }, [fertilizer, flash, multiplier, setFertilizer])

  const reset = useCallback(() => {
    setFertilizer(CONFIG.STARTING_FERTILIZER)
    setEventPoints(0)
    flash('Farm reset!')
  }, [flash, setFertilizer])

  return { fertilizer, setFertilizer, multiplier, setMultiplier, selectedMultiplier, eventPoints, notice, fertilize, autoFertilize, reset }
}
