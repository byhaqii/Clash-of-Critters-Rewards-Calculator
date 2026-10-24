import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { CONFIG } from './config'
import { formatNumber, formatWeight, type AutoEstimate } from './engine'
import { useCozyFarm } from './useCozyFarm'
import { useCountUp } from './useCountUp'
import styles from './CozyFarmPage.module.css'
import { Modal as ModalSurface } from '../../Modal'

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
  const multiplierHeld = useRef(false)

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
    multiplierHeld.current = false
    badgeTimer.current = setTimeout(() => { multiplierHeld.current = true; cycleMultiplier(-1) }, 400)
  }
  const stopHold = () => {
    if (badgeTimer.current) clearTimeout(badgeTimer.current)
  }
  const fertilizeOnce = () => {
    if (game.fertilizer <= 0) {
      game.fertilize(Number(support) || 0)
      if (holdInterval.current) clearInterval(holdInterval.current)
      return
    }
    const harvest = game.fertilize(Number(support) || 0)
    if (!harvest) return
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) fertilizeButton.current?.animate([
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
  useEffect(() => { fertilizeRef.current = fertilizeOnce })
  const startFertilizeHold = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    fertilizeOnce()
    holdTimer.current = setTimeout(() => {
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

  return <ModalSurface label="Cozy Farm simulator" className={styles.page} onClose={leave}>
    <div className={styles.phone}>
      <header className={styles.header}><button className={styles.back} onClick={leave}>← Back</button><h1>Cozy Farm</h1><button className={styles.help} onClick={() => setModal('rules')} aria-label="Rules">?</button></header>
      <section className={styles.scenery} aria-label="Your farm"><div className={styles.sun} aria-hidden="true" /><span className={`${styles.tree} ${styles.treeOne}`} aria-hidden="true" /><span className={`${styles.tree} ${styles.treeTwo}`} aria-hidden="true" /><span className={`${styles.tree} ${styles.treeThree}`} aria-hidden="true" />{damage && <div key={damage.id} className={styles.damageText}>+{formatNumber(damage.points)}</div>}</section>
      {game.notice && <div className={styles.toast} role="status">{game.notice}</div>}
      <section className={styles.controls}>
        <div className={styles.scoreCounter}>Event points <strong>{formatNumber(animatedEventPoints)}</strong><small>Provisional estimate: {CONFIG.EVENT_POINTS_PER_KG} point/kg</small></div>
        {game.saveError && <p className={styles.storageError} role="alert">Fertilizer couldn’t be saved. Allow browser storage, then <button onClick={() => game.setFertilizer(game.fertilizer)}>retry saving</button>.</p>}
        <div className={styles.gameInputs}><label className={styles.supportInput}>Support %<span><input type="text" inputMode="numeric" placeholder="0" value={support} onChange={(event) => changeSupport(event.target.value)} /></span></label></div>
        <div className={styles.actionRow}><button className={styles.utility} onClick={runAutoFertilize} disabled={!game.fertilizer}>Auto Fertilize</button><div className={styles.plantWrap}><button ref={fertilizeButton} className={`${styles.plant} ${!game.fertilizer ? styles.disabled : ''}`} aria-label="Fertilize (tap or hold to repeat)" disabled={!game.fertilizer} onPointerDown={startFertilizeHold} onPointerUp={finishFertilizeHold} onPointerCancel={finishFertilizeHold} onClick={(event) => { if (event.detail === 0) fertilizeOnce() }}><span className={styles.playIcon}>Fertilize</span></button><button className={styles.multiplier} disabled={!game.fertilizer} aria-label={`Fertilizer amount x${game.selectedMultiplier}. Activate to change, hold to go back`} onPointerDown={startHold} onPointerUp={stopHold} onPointerCancel={stopHold} onPointerLeave={stopHold} onClick={(event) => { if (event.detail === 0 || !multiplierHeld.current) cycleMultiplier(1) }} onContextMenu={(event) => event.preventDefault()}>x{game.selectedMultiplier}</button></div><button className={styles.utility} onClick={game.reset}>Reset farm</button></div>
        <button className={styles.fertilizerPill} onClick={() => { setFertInput(String(game.fertilizer)); setModal('fertilizer') }}><span>Edit fertilizer</span><strong>{formatNumber(animatedFertilizer)}</strong>{costFlash && <em>-{costFlash}</em>}</button>
        {!game.fertilizer && <div className={styles.emptyFertilizer}>No fertilizer left. Set your balance with Edit fertilizer.</div>}
      </section>
    </div>
    {modal && <ModalSurface label={modal === 'rules' ? 'How to play' : modal === 'fertilizer' ? 'Fertilizer balance' : 'Auto Fertilize Estimate'} className={styles.modalBackdrop} onClose={() => setModal(null)}><section className={styles.modal}>
      <button className={styles.modalClose} onClick={() => setModal(null)} aria-label="Close">×</button>
      {modal === 'fertilizer' && <form onSubmit={(event) => { event.preventDefault(); game.setFertilizer(Number(fertInput) || 0); setModal(null) }}><h2>Fertilizer</h2><label htmlFor="fertilizer-balance">Set your fertilizer balance.</label><input id="fertilizer-balance" className={styles.numberInput} type="number" min="0" max={CONFIG.MAX_FERTILIZER} step="1" required value={fertInput} onChange={(event) => setFertInput(event.target.value)} /><div className={styles.quickAdd}>{[100, 1000, 10000].map((amount) => <button type="button" key={amount} onClick={() => setFertInput(String(Math.min(CONFIG.MAX_FERTILIZER, Math.max(0, Number(fertInput) || 0) + amount)))}>+{formatNumber(amount)}</button>)}</div><div className={styles.modalActions}><button type="button" onClick={() => setFertInput(String(CONFIG.STARTING_FERTILIZER))}>Reset to 0</button><button className={styles.primary} type="submit">Save</button></div></form>}
      {modal === 'auto' && autoEstimate && <><h2>Auto Fertilize Estimate</h2><p>Used the full fertilizer balance at x{autoEstimate.multiplier}. Event points use the provisional 1 point/kg rate.</p><div className={styles.summaryGrid}>{[['Fertilizer used', formatNumber(autoEstimate.fertilizerUsed)], ['Applications', formatNumber(autoEstimate.applications)], ['Support', `${autoEstimate.support}%`], ['Lowest chance weight', `${formatWeight(autoEstimate.normalWeight)} kg`], ['Highest chance weight', `${formatWeight(autoEstimate.finalWeight)} kg`], ['Estimated event points', formatNumber(autoEstimate.eventPoints)]].map(([label, value]) => <div key={label}><small>{label}</small><b>{value}</b></div>)}</div><p className={styles.pointsNote}>Critical rolls: Normal {autoEstimate.criticalCounts[1]}, ×2 {autoEstimate.criticalCounts[2]}, ×3 {autoEstimate.criticalCounts[3]}, ×4 {autoEstimate.criticalCounts[4]}, ×5 {autoEstimate.criticalCounts[5]}.</p><button className={styles.primary} onClick={() => setModal(null)}>Done</button></>}
      {modal === 'rules' && <><h2>How to play</h2><ul className={styles.rules}><li>Set Support from 0% to 263%.</li><li>Choose how much fertilizer to use with the multiplier badge.</li><li>Tap Fertilize once for one application, or hold to repeat automatically.</li><li>Each application gets one Critical Roll.</li><li>Event points currently use the provisional 1 point per kg estimate.</li></ul><button className={styles.primary} onClick={() => setModal(null)}>Got it!</button></>}
    </section></ModalSurface>}
  </ModalSurface>
}
