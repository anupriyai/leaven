import { useState } from 'react'
import { EXAMPLE_DISHES, generateElevation, type ElevationPlan, type HistoryEntry } from './data'

type View = 'home' | 'new' | 'result' | 'history'

const DISH_ICONS: Record<string, string> = {
  salmon: '🐟',
  piccata: '🍗',
  pasta: '🍝',
}
function dishIcon(id: string) {
  return DISH_ICONS[id] ?? '🍽️'
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [activePlan, setActivePlan] = useState<ElevationPlan | null>(null)
  const [activeInput, setActiveInput] = useState<{ input: string; goal: string } | null>(null)

  function handleGenerated(input: string, goal: string, plan: ElevationPlan) {
    setActivePlan(plan)
    setActiveInput({ input, goal })
    setHistory((h) => [{ input, goal, plan }, ...h])
    setView('result')
  }

  function reopen(entry: HistoryEntry) {
    setActivePlan(entry.plan)
    setActiveInput({ input: entry.input, goal: entry.goal })
    setView('result')
  }

  return (
    <div className="app">
      <Nav view={view} setView={setView} />
      <main className="main">
        <div className="view-transition" key={view + (activePlan?.id ?? '')}>
          {view === 'home' && <Home onStart={() => setView('new')} />}
          {view === 'new' && <NewElevation onGenerated={handleGenerated} />}
          {view === 'result' && activePlan && activeInput && (
            <Result plan={activePlan} input={activeInput.input} goal={activeInput.goal} />
          )}
          {view === 'history' && (
            <History history={history} onReopen={reopen} onStart={() => setView('new')} />
          )}
        </div>
      </main>
      <footer className="footer">
        Leaven — demo build. Elevation plans shown here are canned examples, not live AI output.
      </footer>
    </div>
  )
}

function Nav({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <header className="nav">
      <div className="brand" onClick={() => setView('home')}>
        <span className="brand-mark">🌿</span> Leaven
      </div>
      <nav className="nav-links">
        <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>Home</button>
        <button className={view === 'new' ? 'active' : ''} onClick={() => setView('new')}>New Elevation</button>
        <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')}>History</button>
      </nav>
      <div className="user-badge" title="Demo mode — auth is not implemented">
        <span className="user-dot" /> demo@leaven.app
      </div>
    </header>
  )
}

function Home({ onStart }: { onStart: () => void }) {
  return (
    <section className="home">
      <div className="hero">
        <span className="eyebrow">Cooking, elevated</span>
        <h1>Elevate the dish you already cook.</h1>
        <p className="lede">
          Leaven takes a dish you already make with confidence and shows you how to upgrade it with
          professional technique, equipment, and presentation — instead of pointing you to another
          recipe from scratch.
        </p>
        <button className="cta" onClick={onStart}>
          Try a New Elevation <span className="cta-arrow">→</span>
        </button>
      </div>

      <h2 className="section-heading">Seeded examples</h2>
      <div className="example-grid">
        {EXAMPLE_DISHES.map((d) => (
          <div className="example-card" key={d.id}>
            <div className="example-icon">{dishIcon(d.id)}</div>
            <h3>{d.label}</h3>
            <p>{d.sampleInput}</p>
            <span className={`badge badge-${d.plan.outputType}`}>
              {d.plan.outputType === 'delta' ? 'Delta upgrade' : 'Full rewrite'}
            </span>
          </div>
        ))}
      </div>

      <p className="fineprint">
        This is a lightweight demo build: no auth, no database, no live model calls. It reuses the
        product flow from the full design (describe a dish → structured elevation plan → history)
        with canned example data so the whole loop is runnable end to end.
      </p>
    </section>
  )
}

function NewElevation({
  onGenerated,
}: {
  onGenerated: (input: string, goal: string, plan: ElevationPlan) => void
}) {
  const [input, setInput] = useState('')
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function useExample(id: string) {
    const ex = EXAMPLE_DISHES.find((d) => d.id === id)
    if (!ex) return
    setInput(ex.sampleInput)
    setGoal(ex.sampleGoal)
    setError('')
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) {
      setError('Describe the dish you currently make before submitting.')
      return
    }
    setError('')
    setLoading(true)
    // Simulate the retrieval + generation pipeline latency.
    setTimeout(() => {
      const plan = generateElevation(input, goal, new Date().toISOString())
      setLoading(false)
      onGenerated(input, goal, plan)
    }, 700)
  }

  return (
    <section className="new-elevation">
      <h2>New Elevation</h2>
      <p className="hint">Try one of the seeded examples, or describe your own dish.</p>
      <div className="example-chips">
        {EXAMPLE_DISHES.map((d) => (
          <button type="button" key={d.id} className="chip" onClick={() => useExample(d.id)}>
            <span>{dishIcon(d.id)}</span> {d.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="elevation-form">
        <label>
          Current dish <span className="required">*</span>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I pan-sear salmon with salt, pepper, and lemon."
            rows={3}
          />
        </label>
        <label>
          Goal (optional)
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Make it feel like a dinner-party centerpiece."
            rows={2}
          />
        </label>
        {error && <div className="error">{error}</div>}
        <button className="cta" type="submit" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" /> Generating elevation…
            </>
          ) : (
            <>Elevate this dish <span className="cta-arrow">→</span></>
          )}
        </button>
      </form>
    </section>
  )
}

function Result({ plan, input, goal }: { plan: ElevationPlan; input: string; goal: string }) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
  const [note, setNote] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <section className="result">
      <div className="result-header">
        <div className="result-icon">🍽️</div>
        <div>
          <h2>{plan.dishName}</h2>
          <span className={`badge badge-${plan.outputType}`}>
            {plan.outputType === 'delta' ? 'Delta upgrade' : 'Full rewrite'}
          </span>
        </div>
      </div>

      <div className="original-input">
        <p><span className="label">You described</span>{input}</p>
        {goal && <p><span className="label">Goal</span>{goal}</p>}
      </div>

      <p className="summary">{plan.summary}</p>

      {plan.libraryMatches.length > 0 && (
        <div className="library-matches">
          {plan.libraryMatches.map((m) => (
            <span key={m} className="chip chip-static">✓ {m}</span>
          ))}
        </div>
      )}

      {plan.changes.length > 0 && (
        <div className="section">
          <h3><span className="section-icon">✏️</span>Recommended changes</h3>
          <ul>
            {plan.changes.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      {plan.steps.length > 0 && (
        <div className="section">
          <h3><span className="section-icon">📋</span>Steps</h3>
          <ol>
            {plan.steps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </div>
      )}

      <div className="section">
        <h3><span className="section-icon">🔧</span>Equipment</h3>
        <ul>
          {plan.equipment.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      </div>

      <div className="section">
        <h3><span className="section-icon">🎨</span>Plating</h3>
        <p>{plan.plating}</p>
      </div>

      <div className="feedback">
        <h3>Was this helpful?</h3>
        <div className="feedback-buttons">
          <button
            className={feedback === 'up' ? 'active' : ''}
            onClick={() => setFeedback('up')}
          >👍</button>
          <button
            className={feedback === 'down' ? 'active' : ''}
            onClick={() => setFeedback('down')}
          >👎</button>
        </div>
        <textarea
          placeholder="Optional note…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
        <button
          className="cta secondary"
          disabled={!feedback || sent}
          onClick={() => setSent(true)}
        >
          {sent ? 'Feedback recorded ✓' : 'Submit feedback'}
        </button>
      </div>
    </section>
  )
}

function History({
  history,
  onReopen,
  onStart,
}: {
  history: HistoryEntry[]
  onReopen: (e: HistoryEntry) => void
  onStart: () => void
}) {
  if (history.length === 0) {
    return (
      <section className="history">
        <h2>History</h2>
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <p>No elevations yet this session.</p>
          <button className="cta" onClick={onStart}>Create your first elevation <span className="cta-arrow">→</span></button>
        </div>
      </section>
    )
  }

  return (
    <section className="history">
      <h2>History</h2>
      <ul className="history-list">
        {history.map((entry) => (
          <li key={entry.plan.id} onClick={() => onReopen(entry)}>
            <div className="history-left">
              <div className="history-icon">🍽️</div>
              <div>
                <strong>{entry.plan.dishName}</strong>
                <span className="history-date">{new Date(entry.plan.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <span className={`badge badge-${entry.plan.outputType}`}>
              {entry.plan.outputType === 'delta' ? 'Delta' : 'Rewrite'}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
