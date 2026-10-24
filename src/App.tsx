import { lazy, Suspense, useMemo, useState } from 'react'
import { events, type Milestone, type RewardId } from './data'
import { Modal } from './Modal'
import { SimulatorBoundary } from './SimulatorBoundary'
import { normalizeProgress, parsePointInput } from './progress'
import './App.css'
import './responsive.css'

type SavedState = { eventId: string; points: number; claimedPoints: number }
type Totals = Record<RewardId, { label: string; amount: number; displayAmount: string }>
const CozyFarmPage = lazy(() => import('./features/cozy-farm/CozyFarmPage'))
const STORAGE_KEY = 'clash-of-critters-reward-state'
const emptyTotals = (): Totals => ({} as Totals)
const numberFormat = new Intl.NumberFormat('en-US')
const formatPoints = (value: number) => numberFormat.format(value)
const compactPoints = (value: number) => value >= 1000000 ? `${(value / 1000000).toFixed(value % 1000000 ? 2 : 0).replace(/\.0+$/, '')}M` : value >= 1000 ? `${(value / 1000).toFixed(value % 1000 ? 1 : 0).replace(/\.0+$/, '')}K` : formatPoints(value)
const readSavedState = (): SavedState => {
  const fallback = { eventId: 'cozy-farm', points: 0, claimedPoints: 0 }
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return fallback
    const parsed = JSON.parse(stored)
    const eventId = events.some((item) => item.id === parsed.eventId) ? parsed.eventId : fallback.eventId
    if (typeof parsed.claimedPoints === 'number') return { eventId, ...normalizeProgress(parsed.points, parsed.claimedPoints) }
    const legacyEvent = events.find((item) => item.id === parsed.eventId) ?? events[4]
    const legacyClaimed = Array.isArray(parsed.claimed) ? parsed.claimed : []
    const migratedClaimedPoints = legacyEvent.milestones.filter((milestone) => legacyClaimed.includes(milestone.id)).at(-1)?.points ?? 0
    return { eventId, ...normalizeProgress(parsed.points, migratedClaimedPoints) }
  } catch { return fallback }
}

function App() {
  const [saved, setSaved] = useState<SavedState>(readSavedState)
  const [pointsDraft, setPointsDraft] = useState(() => formatPoints(saved.points))
  const [claimedPointsDraft, setClaimedPointsDraft] = useState(() => formatPoints(saved.claimedPoints))
  const [showFullRewards, setShowFullRewards] = useState(false)
  const [showFarm, setShowFarm] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [inputError, setInputError] = useState('')
  const event = events.find((item) => item.id === saved.eventId) ?? events[4]
  const saveProgress = (progress: SavedState) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); setSaveError(false) }
    catch { setSaveError(true) }
  }
  const update = (patch: Partial<SavedState>) => {
    const progress = { ...saved, ...patch }
    setSaved(progress)
    saveProgress(progress)
  }
  const reached = useMemo(() => event.milestones.filter((milestone) => saved.points >= milestone.points), [event, saved.points])
  const available = reached.filter((milestone) => milestone.points > saved.claimedPoints)
  const next = event.milestones.find((milestone) => saved.points < milestone.points)
  const totals = available.reduce<Totals>((result, milestone) => {
    milestone.rewards.forEach((item) => { const current = result[item.id]; result[item.id] = { label: item.label, amount: (current?.amount ?? 0) + item.amount, displayAmount: current ? compactPoints(current.amount + item.amount) : item.displayAmount } })
    return result
  }, emptyTotals())
  const glitterFruit = event.id === 'fishing' && saved.points > 20000000
    ? 1 + Math.floor((saved.points - 20000000) / 500000)
    : 0
  if (glitterFruit > 0) totals.glitter_fruit = { label: 'Glitter Fruit', amount: glitterFruit, displayAmount: formatPoints(glitterFruit) }
  const setPoints = (value: string | number) => {
    const parsed = typeof value === 'number' ? value : parsePointInput(value)
    if (parsed === null) { setInputError('Enter points as a number, such as 1,000 or 1.5k.'); return }
    const progress = normalizeProgress(parsed, saved.claimedPoints)
    update(progress)
    setPointsDraft(formatPoints(progress.points))
    setClaimedPointsDraft(formatPoints(progress.claimedPoints))
    setInputError('')
  }
  const setClaimedPoints = (value: string) => {
    const parsed = parsePointInput(value)
    if (parsed === null) { setInputError('Enter claimed points as a number, such as 1,000 or 1.5k.'); return }
    const progress = normalizeProgress(saved.points, parsed)
    update(progress)
    setClaimedPointsDraft(formatPoints(progress.claimedPoints))
    setInputError('')
  }
  const handlePointsInput = (value: string) => { setPointsDraft(value); if (/^\d[\d,]*$/.test(value)) setPoints(value) }
  const emptyMessage = saved.points === 0
    ? `Enter your event points to see your rewards. The first milestone is ${formatPoints(event.milestones[0]?.points ?? 0)} points.`
    : reached.length === 0
      ? `No milestone reached yet. Add ${formatPoints((next?.points ?? 0) - saved.points)} more points for your first reward.`
      : next ? 'All reached milestones are marked claimed. Keep going to the next milestone.'
        : 'All milestone rewards are marked claimed. Reset progress to track another run.'
  const emptyTitle = reached.length === 0 ? 'Your next rewards start here' : 'You’re up to date'
  const reset = () => { if (window.confirm('Reset points and claimed milestones for this tracker?')) { update({ points: 0, claimedPoints: 0 }); setPointsDraft('0'); setClaimedPointsDraft('0'); setInputError('') } }

  return <>
  <main className="app-shell">
    <header className="topbar"><div className="brand"><img className="brand-mark" src="/brand-mark.svg" alt="" width="40" height="40" /><strong>Clash of Critters</strong><span className="brand-divider" aria-hidden="true" /><span>Event companion</span></div><span className="topbar-note">Progress, at your pace.</span></header>
    <section className="page-heading"><div><h1>Event rewards</h1><p>A clear view of what you’ve earned and what’s next.</p></div></section>
    <section className="utility-heading" aria-label="Event controls"><div className="event-heading-picker"><label htmlFor="event">Choose event</label><select id="event" value={event.id} onChange={(e) => { update({ eventId: e.target.value, points: 0, claimedPoints: 0 }); setPointsDraft('0'); setClaimedPointsDraft('0'); setInputError(''); setShowFullRewards(false) }}>{events.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>{event.id === 'cozy-farm' && <button className="play-farm-button" type="button" onClick={() => { setShowFarm(true); setShowFullRewards(false) }}><span className="play-cta-icon" aria-hidden="true">▶</span><span>Cozy Farm simulator</span></button>}</section>
    {saveError && <div className="save-error" role="alert"><p>Progress is kept in this tab, but couldn’t be saved. Allow browser storage before leaving this page.</p><button onClick={() => saveProgress(saved)}>Retry saving</button></div>}
    {event.milestones.length === 0 ? <section className="empty-state"><span className="empty-icon">◌</span><h2>Milestone data coming soon</h2><p>This event’s milestone data has not been added yet.</p></section> : showFullRewards ? <FullRewardsPage eventName={event.name} milestones={event.milestones} claimedPoints={saved.claimedPoints} points={saved.points} onBack={() => setShowFullRewards(false)} /> : <>
      <div className="workspace-grid">
        <section className="panel points-panel">
          <div className="section-heading"><h2>Your progress</h2><button type="button" className="reset-button" onClick={reset}>Reset progress</button></div>
          <label className="points-input"><span className="points-label">Current points</span><span className="points-value"><input value={pointsDraft} onChange={(e) => handlePointsInput(e.target.value)} onBlur={() => setPoints(pointsDraft)} inputMode="decimal" aria-label="Your current points" aria-describedby="points-hint points-error" aria-invalid={Boolean(inputError && !inputError.includes('claimed'))} /><span>pts</span></span></label>
          <div className="quick-actions"><button type="button" onClick={() => setPoints(saved.points - 5000)}>−5,000</button><button type="button" onClick={() => setPoints(saved.points - 1000)}>−1,000</button><button type="button" onClick={() => setPoints(saved.points - 100)}>−100</button><button type="button" onClick={() => setPoints(saved.points + 100)}>+100</button><button type="button" onClick={() => setPoints(saved.points + 1000)}>+1,000</button><button type="button" onClick={() => setPoints(saved.points + 5000)}>+5,000</button></div>
          <p id="points-hint" className="input-hint">Enter an exact number, or use 1.5k and 2m.</p>
          <p id="points-error" className="field-error" role="alert">{inputError && !inputError.includes('claimed') ? inputError : ''}</p>
          <label className="claimed-points-input"><span>Already claimed through</span><input value={claimedPointsDraft} onChange={(e) => setClaimedPointsDraft(e.target.value)} onBlur={() => setClaimedPoints(claimedPointsDraft)} inputMode="decimal" aria-label="Claimed points" aria-describedby="claimed-hint claimed-error" aria-invalid={Boolean(inputError.includes('claimed'))} /><small id="claimed-hint">We’ll count rewards after this point. Claimed points can’t exceed your current points.</small></label>
          <p id="claimed-error" className="field-error" role="alert">{inputError.includes('claimed') ? inputError : ''}</p>
          <p className="form-note">Your progress is kept in this browser.{saveError ? ' Saving is currently unavailable.' : ''}</p>
        </section>
        <div className="results-column">
          <section className="total-panel">
            <div className="section-heading"><h2>Unclaimed rewards</h2><span className="ready-count">{available.length} {available.length === 1 ? 'milestone' : 'milestones'} ready</span></div>
            <p className="reward-description">{glitterFruit > 0 ? 'Milestones after your claimed point, plus total Glitter Fruit earned.' : 'Everything unlocked since your last claim.'}</p>
            <div className="total-items" aria-live="polite">
              {Object.values(totals).map((item) => <div className="total-item" key={item.label}><RewardIcon label={item.label} /><div><strong>{item.displayAmount}</strong><small>{item.label}</small></div></div>)}
              {Object.keys(totals).length === 0 && <div className="rewards-empty">
                <div className="reward-preview" aria-hidden="true">{Array.from(new Set(event.milestones.flatMap((milestone) => milestone.rewards.map((item) => item.label)))).slice(0, 4).map((label) => <RewardIcon key={label} label={label} />)}</div>
                <h3>{emptyTitle}</h3><p className="muted-message">{emptyMessage}</p>
              </div>}
            </div>
          </section>
          <section className="next-panel">
            <div className="next-heading"><h2>Next milestone</h2>{next && <span className="milestone-index">#{next.id}</span>}</div>
            {next ? <><div className="next-number"><strong>{compactPoints(next.points - saved.points)}</strong><span>points to go</span></div><div className="progress-track" role="progressbar" aria-label="Progress to next milestone" aria-valuemin={0} aria-valuemax={next.points} aria-valuenow={saved.points}><span style={{ transform: `scaleX(${Math.min(1, saved.points / next.points)})` }} /></div><div className="progress-labels"><span>{formatPoints(saved.points)} current</span><span>{formatPoints(next.points)} target</span></div><div className="next-rewards"><span>Up next</span>{next.rewards.map((item) => <span key={item.id}><RewardIcon label={item.label} /><strong>{item.displayAmount}</strong> {item.label}</span>)}</div></> : <div className="unlocked"><strong>All rewards unlocked</strong><p>You reached every milestone in this event.</p></div>}
            <button type="button" className="full-rewards-button" onClick={() => setShowFullRewards(true)}>View full reward track <span aria-hidden="true">↗</span></button>
          </section>
        </div>
      </div>
    </>}
    <footer className="app-footer"><span>Clash of Critters reward calculator</span><span>Plan the next milestone. Keep playing.</span></footer>
  </main>
  {showFarm && <SimulatorBoundary onClose={() => setShowFarm(false)}><Suspense fallback={<Modal label="Loading Cozy Farm" className="farm-loading" onClose={() => setShowFarm(false)}><section className="recovery-panel"><p role="status">Loading Cozy Farm…</p><button onClick={() => setShowFarm(false)}>Back to calculator</button></section></Modal>}><CozyFarmPage onClose={() => setShowFarm(false)} /></Suspense></SimulatorBoundary>}
  </>
}

function RewardIcon({ label }: { label: string }) {
  const src = ({ Pinball: '/pinball.webp', Candy: '/Candy.ico', Wishbox: '/wishbox.webp', Egg: '/egg.webp', 'Glitter Fruit': '/glitter-fruit.webp' } as Record<string, string>)[label]
  return src ? <img className="reward-icon" src={src} width="32" height="32" alt="" /> : null
}

function FullRewardsPage({ eventName, milestones, claimedPoints, points, onBack }: { eventName: string; milestones: Milestone[]; claimedPoints: number; points: number; onBack: () => void }) {
  return <section className="full-rewards-page"><button type="button" className="back-button" onClick={onBack}>‹ <span>Back to calculator</span></button><div className="full-rewards-heading"><p>{eventName}</p><h2>The complete reward track</h2><p>Every milestone, with your claimed and available rewards.</p></div><div className="game-reward-track">{milestones.map((milestone) => { const isClaimed = milestone.points <= claimedPoints; const isReached = points >= milestone.points; return <div className={`full-reward-row ${isClaimed ? 'claimed' : isReached ? 'reached' : ''}`} key={milestone.id}><span className="track-node">{isClaimed ? '✓' : milestone.id}</span><span className="full-reward-copy"><strong>{formatPoints(milestone.points)} points</strong><small>{isClaimed ? 'Claimed' : isReached ? 'Ready to claim' : `Milestone ${milestone.id}`}</small></span><span className="full-reward-items">{milestone.rewards.map((item) => <span key={item.id}><RewardIcon label={item.label} /><strong>{item.displayAmount}</strong> {item.label}</span>)}</span></div> })}</div></section>
}
export default App
