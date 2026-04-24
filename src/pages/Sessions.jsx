import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { colors } from '../theme'
import BottomNav from '../components/BottomNav'

const MONTHS = ['Gener','Febrer','Març','Abril','Maig','Juny',
                'Juliol','Agost','Setembre','Octubre','Novembre','Desembre']

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate() }
function getFirstDay(y, m) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1 }

export default function Sessions() {
  const [sessions, setSessions] = useState([])
  const [practicedDays, setPracticedDays] = useState([])
  const [stats, setStats] = useState({ total: 0, hours: 0, streak: 0 })
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  useEffect(() => { loadSessions() }, [])
  useEffect(() => { loadMonth() }, [year, month])

  async function loadSessions() {
    const { data } = await supabase.from('practice_sessions')
      .select('*, pieces(title)').order('date', { ascending: false }).limit(20)
    if (data) {
      setSessions(data)
      const totalMins = data.reduce((acc, s) => acc + (s.duration_minutes || 0), 0)
      setStats(st => ({ ...st, total: data.length, hours: Math.round(totalMins / 60) }))
      calcStreak(data)
    }
  }

  async function loadMonth() {
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`
    const to   = `${year}-${String(month + 1).padStart(2, '0')}-${getDaysInMonth(year, month)}`
    const { data } = await supabase.from('practice_sessions')
      .select('date').gte('date', from).lte('date', to)
    if (data) {
      setPracticedDays([...new Set(data.map(s => parseInt(s.date.split('-')[2])))])
    }
  }

  function calcStreak(data) {
    const days = [...new Set(data.map(s => s.date))].sort().reverse()
    let streak = 0
    let check = new Date().toISOString().split('T')[0]
    for (const d of days) {
      if (d === check) {
        streak++
        const prev = new Date(check)
        prev.setDate(prev.getDate() - 1)
        check = prev.toISOString().split('T')[0]
      } else break
    }
    setStats(st => ({ ...st, streak }))
  }

  function changeMonth(dir) {
    let m = month + dir, y = year
    if (m < 0) { m = 11; y-- }
    if (m > 11) { m = 0; y++ }
    setMonth(m); setYear(y)
  }

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDay(year, month)
  const today = now.getDate()
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()

  return (
    <div style={{ background: colors.cream, minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: colors.cream, borderBottom: `0.5px solid ${colors.border}`,
        padding: '14px 16px' }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: colors.dark }}>Sessions</div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{ background: colors.light, borderRadius: 12, padding: '14px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 500, color: colors.dark }}>{stats.streak}</div>
            <div style={{ fontSize: 13, color: colors.primary }}>dies seguits practicant</div>
          </div>
          <div style={{ fontSize: 40 }}>🔥</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['Sessions', stats.total], [`${stats.hours}h`, 'Practicades']].map(([val, label]) => (
            <div key={label} style={{ background: colors.white, borderRadius: 8, padding: 12,
              border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: 24, fontWeight: 500, color: colors.dark }}>{val}</div>
              <div style={{ fontSize: 12, color: colors.mid, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: colors.white, border: `0.5px solid ${colors.border}`,
          borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 12 }}>
            <span onClick={() => changeMonth(-1)} style={{ fontSize: 20, cursor: 'pointer',
              color: colors.mid, padding: '0 8px' }}>‹</span>
            <span style={{ fontSize: 14, fontWeight: 500, color: colors.dark }}>
              {MONTHS[month]} {year}</span>
            <span onClick={() => changeMonth(1)} style={{ fontSize: 20, cursor: 'pointer',
              color: colors.mid, padding: '0 8px' }}>›</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
            {['Dl','Dt','Dc','Dj','Dv','Ds','Dg'].map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 10, color: colors.mid }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const practiced = practicedDays.includes(day)
              const isToday = isCurrentMonth && day === today
              return (
                <div key={day} style={{
                  aspectRatio: '1', borderRadius: 6, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 11,
                  background: practiced ? colors.primary : isToday ? colors.light : colors.cream,
                  color: practiced ? colors.white : isToday ? colors.dark : colors.mid,
                  fontWeight: practiced || isToday ? 500 : 400,
                  border: isToday && !practiced ? `1.5px solid ${colors.primary}` : 'none',
                }}>{day}</div>
              )
            })}
          </div>
        </div>

        <div style={{ background: colors.white, border: `0.5px solid ${colors.border}`,
          borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: colors.mid,
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Historial recent</div>
          {sessions.length === 0 && (
            <div style={{ fontSize: 13, color: colors.mid }}>Cap sessió encara.</div>
          )}
          {sessions.map(s => (
            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', padding: '8px 0',
              borderBottom: `0.5px solid ${colors.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: colors.choco }}>
                  {s.pieces?.title || '—'}</div>
                <div style={{ fontSize: 11, color: colors.mid, marginTop: 2 }}>
                  {s.date}{s.notes ? ` · ${s.notes}` : ''}</div>
              </div>
              <span style={{ fontSize: 12, color: colors.primary, fontWeight: 500,
                background: colors.light, padding: '2px 8px', borderRadius: 20,
                whiteSpace: 'nowrap', marginLeft: 8 }}>{s.duration_minutes} min</span>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}