import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { colors } from '../theme'
import ScoreViewer from '../components/ScoreViewer'

const statusLabel = { pending: 'No iniciada', learning: 'En procés', mastered: 'Dominada' }
const statusStyle = {
  pending:  { background: '#F5F0EB', color: colors.dark },
  learning: { background: '#FDE8D8', color: colors.dark },
  mastered: { background: colors.greenLight, color: '#2D5A1A' },
}
const barPct   = { pending: 5, learning: 55, mastered: 100 }
const barColor = { pending: colors.light, learning: colors.primary, mastered: colors.green }

export default function PieceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [piece, setPiece] = useState(null)
  const [chords, setChords] = useState([])
  const [sessions, setSessions] = useState([])
  const [showScore, setShowScore] = useState(false)
  const [showSession, setShowSession] = useState(false)
  const [sessionForm, setSessionForm] = useState({
    duration_minutes: 30, notes: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
    const { data: p } = await supabase.from('pieces').select('*').eq('id', id).single()
    const { data: c } = await supabase.from('chords').select('*').eq('piece_id', id)
    const { data: s } = await supabase.from('practice_sessions').select('*')
      .eq('piece_id', id).order('date', { ascending: false }).limit(5)
    if (p) setPiece(p)
    if (c) setChords(c)
    if (s) setSessions(s)
  }

  async function saveSession() {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('practice_sessions')
      .insert({ ...sessionForm, piece_id: id, user_id: user.id })
    await supabase.from('pieces')
      .update({ last_practiced: new Date().toISOString() }).eq('id', id)
    setShowSession(false)
    loadAll()
  }

  if (!piece) return (
    <div style={{ padding: 40, textAlign: 'center', color: colors.mid }}>Carregant...</div>
  )

  return (
    <>
      {showScore && (
        <ScoreViewer
          url={piece.source_url}
          type={piece.source_type}
          onClose={() => setShowScore(false)}
        />
      )}

      <div style={{ background: colors.cream, minHeight: '100vh', paddingBottom: 40 }}>
        <div style={{ background: colors.cream, borderBottom: `0.5px solid ${colors.border}`,
          padding: '14px 16px' }}>
          <div onClick={() => navigate(-1)} style={{ fontSize: 13, color: colors.primary,
            cursor: 'pointer', marginBottom: 10 }}>← Totes les partitures</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 500, color: colors.dark }}>{piece.title}</div>
              <div style={{ fontSize: 14, color: colors.mid, marginTop: 2 }}>{piece.composer}</div>
            </div>
            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20,
              fontWeight: 500, ...statusStyle[piece.status] }}>
              {statusLabel[piece.status]}</span>
          </div>
        </div>

        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>

          {piece.source_url && (
            <button onClick={() => setShowScore(true)} style={{
              padding: '16px', borderRadius: 12, border: 'none',
              background: colors.dark, color: colors.white,
              fontSize: 16, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 20 }}>
                {piece.source_type === 'pdf' ? '📄' : '📷'}
              </span>
              Veure partitura
            </button>
          )}

          <div style={{ background: colors.white, border: `0.5px solid ${colors.border}`,
            borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.mid,
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Informació musical</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[['Clau', piece.clau], ['Compàs', piece.compas],
                ['Tempo', piece.tempo],
                ['Dificultat', piece.difficulty ? '★'.repeat(piece.difficulty) : null]
              ].map(([label, val]) => val ? (
                <div key={label}>
                  <div style={{ fontSize: 11, color: colors.mid }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: colors.dark, marginTop: 2 }}>
                    {val}</div>
                </div>
              ) : null)}
            </div>
            {chords.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 11, color: colors.mid, marginBottom: 6 }}>
                  Acords principals</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {chords.map(c => (
                    <span key={c.id} style={{ fontSize: 13, fontWeight: 500,
                      padding: '4px 12px', borderRadius: 20,
                      background: colors.light, color: colors.dark }}>{c.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: colors.white, border: `0.5px solid ${colors.border}`,
            borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.mid,
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Progrés</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: colors.dark }}>{statusLabel[piece.status]}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: colors.primary }}>
                {barPct[piece.status]}%</span>
            </div>
            <div style={{ height: 6, background: colors.light, borderRadius: 20 }}>
              <div style={{ height: 6, borderRadius: 20,
                width: `${barPct[piece.status]}%`, background: barColor[piece.status] }} />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {[['pending','No iniciada'],['learning','En procés'],['mastered','Dominada']].map(([val, label]) => (
                <button key={val} onClick={async () => {
                  await supabase.from('pieces').update({ status: val }).eq('id', id)
                  loadAll()
                }} style={{
                  flex: 1, padding: '6px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 11,
                  border: `${piece.status === val ? '1.5px' : '0.5px'} solid
                    ${piece.status === val ? colors.primary : colors.border}`,
                  background: piece.status === val ? colors.light : colors.white,
                  color: piece.status === val ? colors.dark : colors.mid,
                  fontWeight: piece.status === val ? 500 : 400 }}>{label}</button>
              ))}
            </div>
          </div>

          {piece.notes && (
            <div style={{ background: colors.white, border: `0.5px solid ${colors.border}`,
              borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 500, color: colors.mid,
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Notes</div>
              <div style={{ fontSize: 13, color: colors.choco, lineHeight: 1.6,
                borderLeft: `2px solid ${colors.light}`, paddingLeft: 10 }}>{piece.notes}</div>
            </div>
          )}

          <div style={{ background: colors.white, border: `0.5px solid ${colors.border}`,
            borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.mid,
              textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Sessions recents</div>
            {sessions.length === 0 && (
              <div style={{ fontSize: 13, color: colors.mid }}>Cap sessió registrada.</div>
            )}
            {sessions.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between',
                padding: '7px 0', borderBottom: `0.5px solid ${colors.border}` }}>
                <div>
                  <div style={{ fontSize: 13, color: colors.choco }}>{s.date}</div>
                  {s.notes && <div style={{ fontSize: 12, color: colors.mid, marginTop: 2 }}>
                    {s.notes}</div>}
                </div>
                <span style={{ fontSize: 12, color: colors.primary, fontWeight: 500,
                  background: colors.light, padding: '2px 8px', borderRadius: 20 }}>
                  {s.duration_minutes} min</span>
              </div>
            ))}
          </div>

          {showSession ? (
            <div style={{ background: colors.white, border: `0.5px solid ${colors.border}`,
              borderRadius: 12, padding: '12px 14px',
              display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: colors.dark }}>Nova sessió</div>
              <div>
                <label style={{ fontSize: 12, color: colors.mid, display: 'block', marginBottom: 4 }}>
                  Data</label>
                <input type="date" value={sessionForm.date}
                  onChange={e => setSessionForm(f => ({ ...f, date: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `0.5px solid ${colors.border}`, fontSize: 14,
                    color: colors.choco, background: colors.white }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: colors.mid, display: 'block', marginBottom: 4 }}>
                  Durada: {sessionForm.duration_minutes} min</label>
                <input type="range" min="5" max="120" step="5"
                  value={sessionForm.duration_minutes}
                  onChange={e => setSessionForm(f => ({
                    ...f, duration_minutes: parseInt(e.target.value) }))}
                  style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: colors.mid, display: 'block', marginBottom: 4 }}>
                  Notes</label>
                <textarea value={sessionForm.notes}
                  onChange={e => setSessionForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Què has treballat avui?"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `0.5px solid ${colors.border}`, fontSize: 14,
                    color: colors.choco, background: colors.white,
                    minHeight: 60, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <button onClick={() => setShowSession(false)} style={{ padding: 10, borderRadius: 8,
                  border: `0.5px solid ${colors.border}`, background: colors.white,
                  cursor: 'pointer', fontSize: 13, color: colors.mid }}>Cancel·lar</button>
                <button onClick={saveSession} style={{ padding: 10, borderRadius: 8,
                  border: 'none', background: colors.primary, color: colors.white,
                  cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Guardar</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowSession(true)} style={{
              padding: 13, borderRadius: 10, border: `0.5px solid ${colors.border}`,
              background: colors.white, color: colors.dark,
              fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              + Registrar sessió
            </button>
          )}
        </div>
      </div>
    </>
  )
}