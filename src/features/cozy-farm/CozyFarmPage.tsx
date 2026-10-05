import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { CONFIG } from './config'
import { formatNumber, formatWeight, type AutoEstimate } from './engine'
import { useCozyFarm } from './useCozyFarm'
import { useCountUp } from './useCountUp'
import styles from './CozyFarmPage.module.css'

type Modal = 'fertilizer' | 'auto' | 'rules' | null
type Props = { initialFertilizer?: number; onClose?: () => void }

export default function CozyFarmPage({ initialFertilizer, onClose }: Props) {
  const rawQueryAmount = new URLSearchParams(window.location.search).get('fertilizer')
  const queryAmount = rawQueryAmount === null ? Number.NaN : Number(rawQueryAmount)
  const initial = initialFertilizer ?? (Number.isFinite(queryAmount) && queryAmount >= 0 ? queryAmount : CONFIG.STARTING_FERTILIZER)
  const game = useCozyFarm(initial)
  const animatedFertilizer = useCountUp(game.fertilizer, 180)
  const animatedEventPoints = useCountUp(game.eventPoints)
  const [modal, setModal] = useState<Modal>(null)
  const [support, setSupport] = useState('')
  const [fertInput, setFertInput] = useState(String(game.fertilizer))
  const [autoEstimate, setAutoEstimate] = useState<AutoEstimate | null>(null)
  const [costFlash, setCostFlash] = useState<number | null>(null)
  const [damage, setDamage] = useState<{ id: number; points: number } | null>(null)
  const badgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const costTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const damageTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const fertilizeButton = useRef<HTMLButtonElement | null>(null)
  const fertilizeRef = useRef<() => void>(() => {})
  const held = useRef(false)

  useEffect(() => () => {
    if (badgeTimer.current) clearTimeout(badgeTimer.current)
    if (costTimer.current) clearTimeout(costTimer.current)
    if (damageTimer.current) clearTimeout(damageTimer.current)
    if (holdTimer.current) clearTimeout(holdTimer.current)
    if (holdInterval.current) clearInterval(holdInterval.current)
  }, [])

  const cycleMultiplier = (direction: 1 | -1) => {
    const options = CONFIG.MULTIPLIERS.filter((item) => item <= game.fertilizer)
    if (!options.length) return
    const index = options.indexOf(game.selectedMultiplier)
    const next = direction > 0 ? options[(index + 1) % options.length] : options[(index - 1 + options.length) % options.length]
    game.setMultiplier(next)
    setCostFlash(next)
    if (costTimer.current) clearTimeout(costTimer.current)
    costTimer.current = setTimeout(() => setCostFlash(null), 240)
  }
  const changeSupport = (input: string) => {
    const digits = input.replace(/\D/g, '').replace(/^0+(?=\d)/, '')
    if (!digits) { setSupport(''); return }
    setSupport(String(Math.min(CONFIG.MAX_SUPPORT_PERCENT, Number(digits))))
  }
  const startHold = () => {
    held.current = false
    badgeTimer.current = setTimeout(() => { held.current = true; cycleMultiplier(-1) }, 400)
  }
  const stopHold = () => {
    if (badgeTimer.current) clearTimeout(badgeTimer.current)
    if (!held.current) cycleMultiplier(1)
  }
  const fertilizeOnce = () => {
    if (game.fertilizer <= 0) {
      game.fertilize(Number(support) || 0)
      if (holdInterval.current) clearInterval(holdInterval.current)
      return
    }
    const harvest = game.fertilize(Number(support) || 0)
    if (!harvest) return
    fertilizeButton.current?.animate([
      { transform: 'translateY(0) scale(1)' },
      { transform: 'translateY(-14px) scale(1.06)', offset: 0.36 },
      { transform: 'translateY(2px) scale(.98)', offset: 0.72 },
      { transform: 'translateY(0) scale(1)' },
    ], { duration: 300, easing: 'ease-out' })
    setCostFlash(harvest.fertilizerUsed)
    if (costTimer.current) clearTimeout(costTimer.current)
    costTimer.current = setTimeout(() => setCostFlash(null), 220)
    setDamage((current) => ({ id: (current?.id ?? 0) + 1, points: harvest.eventPoints }))
    if (damageTimer.current) clearTimeout(damageTimer.current)
    damageTimer.current = setTimeout(() => setDamage(null), 520)
  }
  fertilizeRef.current = fertilizeOnce
  const startFertilizeHold = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    held.current = false
    fertilizeOnce()
    holdTimer.current = setTimeout(() => {
      held.current = true
      holdInterval.current = setInterval(() => fertilizeRef.current(), 320)
    }, 150)
  }
  const finishFertilizeHold = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current)
    if (holdInterval.current) clearInterval(holdInterval.current)
  }
  const leave = () => { if (onClose) onClose(); else window.history.back() }
  const runAutoFertilize = () => {
    const estimate = game.autoFertilize(Number(support) || 0)
    if (estimate) { setAutoEstimate(estimate); setModal('auto') }
  }

  return <main className={styles.page} onPointerDown={(event) => { if (event.target === event.currentTarget) leave() }}>
    <div className={styles.phone}>
      <header className={styles.header}><button className={styles.back} onClick={leave}>← Back</button><h1>Cozy Farm</h1><button className={styles.help} onClick={() => setModal('rules')} aria-label="Rules">?</button></header>
      <section className={styles.scenery} aria-label="Your farm"><div className={styles.sun}>☀️</div><span className={`${styles.tree} ${styles.treeOne}`}>🌲</span><span className={`${styles.tree} ${styles.treeTwo}`}>🌲</span><span className={`${styles.tree} ${styles.treeThree}`}>🌲</span>{damage && <div key={damage.id} className={styles.damageText}>+{formatNumber(damage.points)}</div>}</section>
      {game.notice && <div className={styles.toast} role="status">{game.notice}</div>}
      <section className={styles.controls}>
        <div className={styles.scoreCounter}>EVENT POINTS <strong>{formatNumber(animatedEventPoints)}</strong><small>Auto · provisional {CONFIG.EVENT_POINTS_PER_KG} point/kg</small></div>
        <div className={styles.gameInputs}><label className={styles.supportInput}>SUPPORT %<span><input type="text" inputMode="numeric" placeholder="0" value={support} onChange={(event) => changeSupport(event.target.value)} /></span></label></div>
        <div className={styles.actionRow}><button className={styles.utility} onClick={runAutoFertilize} disabled={!game.fertilizer}><span>⚡</span>Auto Fertilize</button><div className={styles.plantWrap}><button ref={fertilizeButton} className={`${styles.plant} ${!game.fertilizer ? styles.disabled : ''}`} aria-label="Fertilize (tap or hold to repeat)" disabled={!game.fertilizer} onPointerDown={startFertilizeHold} onPointerUp={finishFertilizeHold} onPointerCancel={finishFertilizeHold} onClick={(event) => { if (event.detail === 0) fertilizeOnce() }}><span className={styles.playIcon}>🧺<small>Fertilize</small></span></button><button key={game.selectedMultiplier} className={styles.multiplier} aria-label={`Fertilizer amount x${game.selectedMultiplier}. Tap to change, hold to go back`} onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={() => badgeTimer.current && clearTimeout(badgeTimer.current)} onContextMenu={(event) => event.preventDefault()}>x{game.selectedMultiplier}</button></div><span aria-hidden="true" /></div>
        <button className={styles.fertilizerPill} onClick={() => { setFertInput(String(game.fertilizer)); setModal('fertilizer') }}>🧪 {formatNumber(animatedFertilizer)} <small>FERTILIZER</small>{costFlash && <em>-{costFlash}</em>}<span>✎</span></button>
        {!game.fertilizer && <div className={styles.emptyFertilizer}>No fertilizer left</div>}
      </section>
    </div>
    {modal && <div className={styles.modalBackdrop} role="presentation" onPointerDown={(event) => { if (event.target === event.currentTarget) leave() }}><section className={styles.modal} role="dialog" aria-modal="true">
      <button className={styles.modalClose} onClick={() => setModal(null)} aria-label="Close">×</button>
      {modal === 'fertilizer' && <><h2>Fertilizer</h2><p>Set your fertilizer balance.</p><input className={styles.numberInput} type="number" min="0" max={CONFIG.MAX_FERTILIZER} value={fertInput} onChange={(event) => setFertInput(event.target.value)} /><div className={styles.quickAdd}>{[100, 1000, 10000].map((amount) => <button key={amount} onClick={() => setFertInput(String(Math.min(CONFIG.MAX_FERTILIZER, Number(fertInput || 0) + amount)))}>+{formatNumber(amount)}</button>)}</div><div className={styles.modalActions}><button onClick={() => setFertInput(String(CONFIG.STARTING_FERTILIZER))}>Reset to 0</button><button className={styles.primary} onClick={() => { game.setFertilizer(Number(fertInput) || 0); setModal(null) }}>Save</button></div></>}
      {modal === 'auto' && autoEstimate && <><h2>Auto Fertilize Estimate</h2><p>Used the full fertilizer balance at x{autoEstimate.multiplier}. Event points use the provisional 1 point/kg rate.</p><div className={styles.summaryGrid}>{[['Fertilizer used', formatNumber(autoEstimate.fertilizerUsed)], ['Applications', formatNumber(autoEstimate.applications)], ['Support', `${autoEstimate.support}%`], ['Normal weight', `${formatWeight(autoEstimate.normalWeight)} kg`], ['Final weight', `${formatWeight(autoEstimate.finalWeight)} kg`], ['Estimated event points', formatNumber(autoEstimate.eventPoints)]].map(([label, value]) => <div key={label}><small>{label}</small><b>{value}</b></div>)}</div><p className={styles.pointsNote}>Critical rolls: Normal {autoEstimate.criticalCounts[1]}, ×2 {autoEstimate.criticalCounts[2]}, ×3 {autoEstimate.criticalCounts[3]}, ×4 {autoEstimate.criticalCounts[4]}, ×5 {autoEstimate.criticalCounts[5]}.</p><button className={styles.primary} onClick={() => setModal(null)}>Done</button></>}
      {modal === 'rules' && <><h2>How to play</h2><ul className={styles.rules}><li>Set Support from 0% to 263%.</li><li>Choose how much fertilizer to use with the multiplier badge.</li><li>Tap Fertilize once for one application, or hold to repeat automatically.</li><li>Each application gets one Critical Roll.</li><li>Event points currently use the provisional 1 point per kg estimate.</li></ul><button className={styles.primary} onClick={() => setModal(null)}>Got it!</button></>}
    </section></div>}
  </main>
}
