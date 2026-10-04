import { useEffect, useMemo, useState } from 'react'
import { events, type Milestone, type RewardId } from './data'
import './App.css'

type SavedState = { eventId: string; points: number; claimedPoints: number }
type Totals = Record<RewardId, { label: string; amount: number; displayAmount: string }>
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
    if (typeof parsed.claimedPoints === 'number') return { eventId: parsed.eventId ?? fallback.eventId, points: parsed.points ?? fallback.points, claimedPoints: parsed.claimedPoints }
    const legacyEvent = events.find((item) => item.id === parsed.eventId) ?? events[4]
    const legacyClaimed = Array.isArray(parsed.claimed) ? parsed.claimed : []
    const migratedClaimedPoints = legacyEvent.milestones.filter((milestone) => legacyClaimed.includes(milestone.id)).at(-1)?.points ?? 0
    return { eventId: parsed.eventId ?? fallback.eventId, points: parsed.points ?? fallback.points, claimedPoints: migratedClaimedPoints }
  } catch { return fallback }
}

function App() {
  const [saved, setSaved] = useState<SavedState>(readSavedState)
  const [showFullRewards, setShowFullRewards] = useState(false)
  const event = events.find((item) => item.id === saved.eventId) ?? events[4]
  const update = (patch: Partial<SavedState>) => setSaved((current) => ({ ...current, ...patch }))
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)) }, [saved])
  const reached = useMemo(() => event.milestones.filter((milestone) => saved.points >= milestone.points), [event, saved.points])
  const available = reached.filter((milestone) => milestone.points > saved.claimedPoints).slice(0, 1)
  const next = event.milestones.find((milestone) => saved.points < milestone.points)
  const totals = available.reduce<Totals>((result, milestone) => {
    milestone.rewards.forEach((item) => { const current = result[item.id]; result[item.id] = { label: item.label, amount: (current?.amount ?? 0) + item.amount, displayAmount: current ? compactPoints(current.amount + item.amount) : item.displayAmount } })
    return result
  }, emptyTotals())
  const setPoints = (value: string) => update({ points: Math.max(0, Number(value.replace(/[^0-9]/g, '')) || 0) })
  const setClaimedPoints = (value: string) => update({ claimedPoints: Math.min(saved.points, Math.max(0, Number(value.replace(/[^0-9]/g, '')) || 0)) })
  const reset = () => { if (window.confirm('Reset points and claimed milestones for this tracker?')) update({ points: 0, claimedPoints: 0 }) }

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><span className="brand-mark">✦</span><div><strong>Clash of Critters</strong><span>Reward Calculator</span></div></div><div className="event-picker"><label htmlFor="event">EVENT</label><select id="event" value={event.id} onChange={(e) => { update({ eventId: e.target.value, points: 0, claimedPoints: 0 }); setShowFullRewards(false) }}>{events.map((item) => <option key={item.id} value={item.id}>{item.name}{item.active ? '  • ACTIVE' : ''}</option>)}</select>{event.milestones.length > 0 && <button type="button" className="full-rewards-button" onClick={() => setShowFullRewards(true)}>Full milestone rewards <span>↗</span></button>}</div></header>
    <section className="utility-heading"><p className="eyebrow">EVENT PROGRESS / {event.name.toUpperCase()}</p><h1>{event.name}</h1></section>
    {event.milestones.length === 0 ? <section className="empty-state"><span className="empty-icon">◌</span><h2>Milestone data coming soon</h2><p>This event’s milestone data has not been added yet.</p></section> : showFullRewards ? <FullRewardsPage eventName={event.name} milestones={event.milestones} claimedPoints={saved.claimedPoints} points={saved.points} onBack={() => setShowFullRewards(false)} /> : <>
      <div className="workspace-grid"><div className="main-column">
        <section className="panel points-panel"><div className="section-heading"><div><p className="eyebrow">01 / YOUR PROGRESS</p><h2>Current points</h2></div><span className="save-note">● Saved automatically</span></div><label className="points-input"><span className="sr-only">Your current points</span><input value={formatPoints(saved.points)} onChange={(e) => setPoints(e.target.value)} inputMode="numeric" aria-label="Your current points" /><span>PTS</span></label><div className="quick-actions"><button type="button" onClick={() => setPoints(String(saved.points - 5000))}>−5,000</button><button type="button" onClick={() => setPoints(String(saved.points - 1000))}>−1,000</button><button type="button" onClick={() => setPoints(String(saved.points - 100))}>−100</button><button type="button" onClick={() => setPoints(String(saved.points + 100))}>+100</button><button type="button" onClick={() => setPoints(String(saved.points + 1000))}>+1,000</button><button type="button" onClick={() => setPoints(String(saved.points + 5000))}>+5,000</button></div><label className="claimed-points-input"><span>Claimed through</span><input value={formatPoints(saved.claimedPoints)} onChange={(e) => setClaimedPoints(e.target.value)} inputMode="numeric" aria-label="Claimed points" /><small>milestones up to this point are automatically claimed</small></label><button type="button" className="reset-button" onClick={reset}>Reset progress</button></section>
        <section className="panel total-panel"><div className="section-heading"><div><p className="eyebrow">02 / REWARD TOTAL</p><h2>Total accumulated rewards</h2></div></div><div className="total-block"><div><p className="eyebrow">UNCLAIMED REWARDS</p><h3>Collected in this run</h3></div><div className="total-items">{Object.values(totals).map((item) => <div className="total-item" key={item.label}><span className={`reward-icon ${item.label.toLowerCase().replace(' ', '-')}`}>✦</span><div><strong>{item.displayAmount}</strong><small>{item.label}</small></div></div>)}{available.length === 0 && <span className="muted-message">Nothing new to total</span>}</div></div></section>
      </div><aside className="side-column"><section className="panel next-panel"><p className="eyebrow">03 / KEEP GOING</p><h2>Next milestone</h2>{next ? <><div className="next-number"><span>#{next.id}</span><strong>{compactPoints(next.points)}</strong></div><p className="next-detail"><strong>{formatPoints(next.points - saved.points)}</strong> points remaining</p><div className="progress-track"><span style={{ width: `${Math.min(100, (saved.points / next.points) * 100)}%` }} /></div><div className="progress-labels"><span>{compactPoints(saved.points)} current</span><span>{compactPoints(next.points)} target</span></div></> : <div className="unlocked"><span>✦</span><strong>All rewards unlocked</strong><p>You reached every milestone in this event.</p></div>}</section></aside></div>
    </>}
    <footer>CLASH OF CRITTERS <span>•</span> COMPANION TOOL <span>•</span> PROGRESS SAVED LOCALLY</footer>
  </main>
}

function FullRewardsPage({ eventName, milestones, claimedPoints, points, onBack }: { eventName: string; milestones: Milestone[]; claimedPoints: number; points: number; onBack: () => void }) {
  return <section className="full-rewards-page"><button type="button" className="back-button" onClick={onBack}>‹ <span>Calculator</span></button><div className="full-rewards-heading"><p className="eyebrow">{eventName.toUpperCase()} / COMPLETE REWARD TRACK</p><h2>Full milestone rewards</h2><p>From the first reward to the final milestone.</p></div><div className="game-reward-track">{milestones.map((milestone) => { const isClaimed = milestone.points <= claimedPoints; const isReached = points >= milestone.points; return <div className={`full-reward-row ${isClaimed ? 'claimed' : isReached ? 'reached' : ''}`} key={milestone.id}><span className="track-node">{isClaimed ? '✓' : milestone.id}</span><span className="full-reward-copy"><strong>Reach {formatPoints(milestone.points)}</strong><small>Milestone #{milestone.id}</small></span><span className="full-reward-items">{milestone.rewards.map((item) => <span key={item.id}><b className={`reward-icon ${item.label.toLowerCase().replace(' ', '-')}`}>✦</b>{item.displayAmount} {item.label}</span>)}</span></div> })}</div></section>
}
export default App
