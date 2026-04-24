import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { colors } from '../theme'
import BottomNav from '../components/BottomNav'

const statusLabel = { pending: 'No iniciada', learning: 'En procés', mastered: 'Dominada' }
const barColor = { pending: colors.light, learning: colors.primary, mastered: colors.green }
const barPct   = { pending: 5, learning: 50, mastered: 100 }
const MONTHS_SHORT = ['Gen','Feb','Mar','Abr','Mai','Jun','Jul','Ago','Set','Oct','Nov','Des']

export default function Progress() {
  const [pieces, setPieces] = useState([])
  const [stats, setStats] = useState({ total: 0, mastered: 0, hours: 0, sessions: 0 })
  const [monthHours, setMonthHours] = useState([])
  const [period, setPeriod] = useState(6)

  useEffect(() => { loadData() }, [])
  useEffect(() => { loadMonthHours() }, [period])

  async function loadData() {
    const { data: p } = await supabase.from('pieces').select('*').order('status')
    const { data: s } = await supabase.from('practice_sessions').select('duration_minutes')
    if (p) setPieces(p)
    const totalMins = s?.reduce((acc, x) => acc + (x.duration_minutes || 0), 0) || 0
    setStats({
      total: p?.length || 0,
      mastered: p?.filter(x => x.status === 'mastered').length || 0,
      hours: Math.round(totalMins / 60),
      sessions: s?.length || 0,
    })
  }

  async function loadMonthHours() {
    const from = new Date()
    from.setMonth(from.getMonth() - period + 1); from.setDate(1)
    const { data } = await supabase.from('practice_sessions')
      .select('date, duration_minutes').gte('date', from.toISOString().split('T')[0])
    const map = {}
    for (let i = 0; i < period; i++) {
      const d = new Date(); d.setMonth(d.getMonth() - (period - 1 - i))
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      map[key] = { label: MONTHS_SHORT[d.getMonth()], mins: 0 }
    }
    data?.forEach(s => { const k = s.date.slice(0, 7); if (map[k]) map[k].mins += s.duration_minutes || 0 })
    setMonthHours(Object.values(map).map(m => ({ ...m, hours: Math.round(m.mins / 60 * 10) / 10 })))
  }

  const mastered = pieces.filter(p => p.status === 'mastered').length
  const learning = pieces.filter(p => p.status === 'learning').length
  const pending  = pieces.filter(p => p.status === 'pending').length
  const total = pieces.length || 1
  const maxHours = Math.max(...monthHours.map(m => m.hours), 1)

  return (
    <div style={{ background: colors.cream, minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: colors.cream, borderBottom: `0.5px solid ${colors.border}`,
        padding: '14px 16px' }}>
        <div style={{ fontSize: 18, fontWeight: 500, color: colors.dark }}>Progrés</div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[['Peces', stats.total], ['Dominades', stats.mastered],
            [`${stats.hours}h`, 'Pràctica'], ['Sessions', stats.sessions]
          ].map(([val, label]) => (
            <div key={label} style={{ background: colors.white, borderRadius: 8, padding: 12,
              border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: 24, fontWeight: 500, color: colors.dark }}>{val}</div>
              <div style={{ fontSize: 12, color: colors.mid, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: colors.white, border: `0.5px solid ${colors.border}`,
          borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: colors.mid,
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            Distribució de peces</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {[['Dominades', mastered, colors.green],
              ['En procés', learning, colors.primary],
              ['No iniciades', pending, colors.light]
            ].map(([label, count, color]) => (
              <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ height: 6, background: color, borderRadius: 20, marginBottom: 6 }} />
                <div style={{ fontSize: 18, fontWeight: 500, color: colors.dark }}>{count}</div>
                <div style={{ fontSize: 11, color: colors.mid }}>{label}</div>
                <div style={{ fontSize: 11, color: colors.mid }}>
                  {Math.round(count / total * 100)}%</div>
              </div>
            ))}
          </div>
          <div style={{ height: 8, background: colors.cream, borderRadius: 20,
            overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${mastered / total * 100}%`, background: colors.green }} />
            <div style={{ width: `${learning / total * 100}%`, background: colors.primary }} />
            <div style={{ width: `${pending / total * 100}%`, background: colors.light }} />
          </div>
        </div>

        <div style={{ background: colors.white, border: `0.5px solid ${colors.border}`,
          borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: colors.mid,
              textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hores per mes</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[3, 6, 12].map(p => (
                <button key={p} onClick={() => setPeriod(p)} style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 20, cursor: 'pointer',
                  border: `0.5px solid ${colors.border}`,
                  background: period === p ? colors.primary : colors.cream,
                  color: period === p ? colors.white : colors.mid,
                  fontWeight: period === p ? 500 : 400,
                }}>{p === 12 ? '1 any' : `${p}m`}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120 }}>
            {monthHours.map(m => (
              <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 9, color: colors.mid }}>{m.hours > 0 ? `${m.hours}h` : ''}</div>
                <div style={{ width: '100%', background: colors.primary,
                  borderRadius: '3px 3px 0 0',
                  height: `${Math.round(m.hours / maxHours * 90)}%`,
                  minHeight: m.hours > 0 ? 4 : 0 }} />
                <div style={{ fontSize: 9, color: colors.mid }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: colors.white, border: `0.5px solid ${colors.border}`,
          borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: colors.mid,
            textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Totes les peces</div>
          {pieces.map(p => (
            <div key={p.id} style={{ padding: '8px 0', borderBottom: `0.5px solid ${colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 5 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: colors.choco }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: colors.mid }}>{p.composer}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 11, color: colors.primary, fontWeight: 500 }}>
                    {barPct[p.status]}%</span>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 20,
                    background: p.status === 'mastered' ? colors.greenLight :
                      p.status === 'learning' ? colors.light : '#F5F0EB',
                    color: p.status === 'mastered' ? '#2D5A1A' : colors.dark }}>
                    {statusLabel[p.status]}</span>
                </div>
              </div>
              <div style={{ height: 4, background: colors.cream, borderRadius: 20 }}>
                <div style={{ height: 4, borderRadius: 20,
                  width: `${barPct[p.status]}%`, background: barColor[p.status] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}