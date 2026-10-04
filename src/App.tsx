import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { events, type Milestone, type RewardId } from './data'
import './App.css'
import './responsive.css'

type SavedState = { eventId: string; points: number; claimedPoints: number }
type Totals = Record<RewardId, { label: string; amount: number; displayAmount: string }>
const STORAGE_KEY = 'clash-of-critters-reward-state'
const emptyTotals = (): Totals => ({} as Totals)
const numberFormat = new Intl.NumberFormat('en-US')
const formatPoints = (value: number) => numberFormat.format(value)
const compactPoints = (value: number) => value >= 1000000 ? `${(value / 1000000).toFixed(value % 1000000 ? 2 : 0).replace(/\.0+$/, '')}M` : value >= 1000 ? `${(value / 1000).toFixed(value % 1000 ? 1 : 0).replace(/\.0+$/, '')}K` : formatPoints(value)
const parsePointInput = (value: string) => {
  const normalized = value.trim().replace(/,/g, '').toLowerCase()
  const match = normalized.match(/^(\d+(?:\.\d+)?)\s*([km])?$/)
  if (!match) return Number(value.replace(/[^0-9]/g, '')) || 0
  const multiplier = match[2] === 'm' ? 1000000 : match[2] === 'k' ? 1000 : 1
  return Math.round(Number(match[1]) * multiplier)
}
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
  const [pointsDraft, setPointsDraft] = useState(() => formatPoints(saved.points))
  const [claimedPointsDraft, setClaimedPointsDraft] = useState(() => formatPoints(saved.claimedPoints))
  const [showFullRewards, setShowFullRewards] = useState(false)
  const event = events.find((item) => item.id === saved.eventId) ?? events[4]
  const update = (patch: Partial<SavedState>) => setSaved((current) => ({ ...current, ...patch }))
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)) }, [saved])
  const reached = useMemo(() => event.milestones.filter((milestone) => saved.points >= milestone.points), [event, saved.points])
  const available = reached.filter((milestone) => milestone.points > saved.claimedPoints)
  const next = event.milestones.find((milestone) => saved.points < milestone.points)
  const totals = available.reduce<Totals>((result, milestone) => {
    milestone.rewards.forEach((item) => { const current = result[item.id]; result[item.id] = { label: item.label, amount: (current?.amount ?? 0) + item.amount, displayAmount: current ? compactPoints(current.amount + item.amount) : item.displayAmount } })
    return result
  }, emptyTotals())
  const glitterFruit = Math.floor(Math.max(0, saved.points - 1450000) / 30000)
  if (glitterFruit > 0) totals.glitter_fruit = { label: 'Glitter Fruit', amount: glitterFruit, displayAmount: formatPoints(glitterFruit) }
  const setPoints = (value: string | number) => { const points = Math.max(0, typeof value === 'number' ? value : parsePointInput(value)); update({ points }); setPointsDraft(formatPoints(points)) }
  const setClaimedPoints = (value: string | number) => { const claimedPoints = Math.min(saved.points, Math.max(0, typeof value === 'number' ? value : parsePointInput(value))); update({ claimedPoints }); setClaimedPointsDraft(formatPoints(claimedPoints)) }
  const handlePointsInput = (value: string) => { setPointsDraft(value); if (/^\d[\d,]*$/.test(value)) setPoints(value) }
  const reset = () => { if (window.confirm('Reset points and claimed milestones for this tracker?')) { update({ points: 0, claimedPoints: 0 }); setPointsDraft('0'); setClaimedPointsDraft('0') } }

  return <main className="app-shell">
    <header className="topbar"><div className="brand"><img className="brand-mark" src="/brand-mark.webp" alt="" /><div><strong>Clash of Critters</strong><span>Event Reward Calculator</span></div></div></header>
    <section className="utility-heading"><p className="eyebrow">SELECT EVENT</p><div className="event-heading-picker"><label className="sr-only" htmlFor="event">Choose event</label><select id="event" value={event.id} onChange={(e) => { update({ eventId: e.target.value, points: 0, claimedPoints: 0 }); setPointsDraft('0'); setClaimedPointsDraft('0'); setShowFullRewards(false) }}>{events.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></section>
    {event.milestones.length === 0 ? <section className="empty-state"><span className="empty-icon">◌</span><h2>Milestone data coming soon</h2><p>This event’s milestone data has not been added yet.</p></section> : showFullRewards ? <FullRewardsPage eventName={event.name} milestones={event.milestones} claimedPoints={saved.claimedPoints} points={saved.points} onBack={() => setShowFullRewards(false)} /> : <>
      <div className="workspace-grid"><div className="main-column">
        <section className="panel points-panel"><div className="section-heading"><div><p className="eyebrow">01 / YOUR PROGRESS</p><h2>Current points</h2></div></div><label className="points-input"><span className="sr-only">Your current points</span><input value={pointsDraft} onChange={(e) => handlePointsInput(e.target.value)} onBlur={() => setPoints(pointsDraft)} inputMode="decimal" aria-label="Your current points" /><span>PTS</span></label><div className="quick-actions"><button type="button" onClick={() => setPoints(saved.points - 5000)}>−5,000</button><button type="button" onClick={() => setPoints(saved.points - 1000)}>−1,000</button><button type="button" onClick={() => setPoints(saved.points - 100)}>−100</button><button type="button" onClick={() => setPoints(saved.points + 100)}>+100</button><button type="button" onClick={() => setPoints(saved.points + 1000)}>+1,000</button><button type="button" onClick={() => setPoints(saved.points + 5000)}>+5,000</button></div><label className="claimed-points-input"><span>Claimed through</span><input value={claimedPointsDraft} onChange={(e) => setClaimedPointsDraft(e.target.value)} onBlur={() => setClaimedPoints(claimedPointsDraft)} inputMode="decimal" aria-label="Claimed points" /><small>milestones up to this point are automatically claimed</small></label><button type="button" className="reset-button" onClick={reset}>Reset progress</button></section>
        <section className="panel total-panel"><div className="section-heading"><div><p className="eyebrow">02 / REWARD TOTAL</p><h2>Total accumulated rewards</h2></div></div><div className="total-block"><div><p className="eyebrow">UNCLAIMED REWARDS</p><h3>Collected in this run</h3></div><div className="total-items">{Object.values(totals).map((item) => <div className="total-item" key={item.label}>{item.label === 'Pinball' ? <img className="reward-icon pinball" src="/pinball.webp" alt="" /> : item.label === 'Candy' ? <img className="reward-icon candy" src="/Candy.ico" alt="" /> : item.label === 'Wishbox' ? <img className="reward-icon wishbox" src="/wishbox.webp" alt="" /> : item.label === 'Egg' ? <img className="reward-icon egg" src="/egg.webp" alt="" /> : item.label === 'Glitter Fruit' ? <img className="reward-icon glitter-fruit" src="/glitter-fruit.webp" alt="" /> : <span className={`reward-icon ${item.label.toLowerCase().replace(' ', '-')}`}>✦</span>}<div><strong>{item.displayAmount}</strong><small>{item.label}</small></div></div>)}{available.length === 0 && <span className="muted-message">Nothing new to total</span>}</div></div></section>
      </div><aside className="side-column"><section className="panel next-panel"><p className="eyebrow">03 / KEEP GOING</p><div className="next-heading"><h2>Next milestone</h2>{event.milestones.length > 0 && <button type="button" className="full-rewards-button" onClick={() => setShowFullRewards(true)}>Full milestone rewards <span>↗</span></button>}</div>{next ? <><div className="next-number"><span>#{next.id}</span><strong>{compactPoints(next.points)}</strong></div><p className="next-detail"><strong>{formatPoints(next.points - saved.points)}</strong> points remaining</p><div className="progress-track"><span style={{ width: `${Math.min(100, (saved.points / next.points) * 100)}%` }} /></div><div className="progress-labels"><span>{compactPoints(saved.points)} current</span><span>{compactPoints(next.points)} target</span></div></> : <div className="unlocked"><span>✦</span><strong>All rewards unlocked</strong><p>You reached every milestone in this event.</p></div>}</section></aside></div>
    </>}
  </main>
}

function FullRewardsPage({ eventName, milestones, claimedPoints, points, onBack }: { eventName: string; milestones: Milestone[]; claimedPoints: number; points: number; onBack: () => void }) {
  const reachedCount = milestones.filter((milestone) => points >= milestone.points).length
  const trackStyle = { '--track-progress': `${milestones.length ? (Math.max(0, reachedCount - 1) / milestones.length) * 100 : 0}%` } as CSSProperties
  return <section className="full-rewards-page"><button type="button" className="back-button" onClick={onBack}>‹ <span>Calculator</span></button><div className="full-rewards-heading"><p className="eyebrow">{eventName.toUpperCase()} / COMPLETE REWARD TRACK</p><h2>Full milestone rewards</h2><p>From the first reward to the final milestone.</p></div><div className="game-reward-track" style={trackStyle}>{milestones.map((milestone) => { const isClaimed = milestone.points <= claimedPoints; const isReached = points >= milestone.points; const isCurrent = isReached && !milestones.some((other) => other.points > milestone.points && other.points <= points); return <div className={`full-reward-row ${isClaimed ? 'claimed' : isCurrent ? 'current' : isReached ? 'reached' : ''}`} key={milestone.id}><span className="track-node">{isClaimed ? '✓' : isCurrent ? '✦' : milestone.id}</span><span className="full-reward-copy"><strong>Reach {formatPoints(milestone.points)}</strong><small>Milestone #{milestone.id}</small></span><span className="full-reward-items">{milestone.rewards.map((item) => <span key={item.id}>{item.id === 'bubble' ? <img className="reward-icon pinball" src="/pinball.webp" alt="" /> : item.id === 'candy' ? <img className="reward-icon candy" src="/Candy.ico" alt="" /> : item.id === 'box' ? <img className="reward-icon wishbox" src="/wishbox.webp" alt="" /> : item.id === 'capsule' ? <img className="reward-icon egg" src="/egg.webp" alt="" /> : <b className={`reward-icon ${item.label.toLowerCase().replace(' ', '-')}`}>✦</b>}{item.displayAmount} {item.label}</span>)}</span></div> })}</div></section>
}
export default App
