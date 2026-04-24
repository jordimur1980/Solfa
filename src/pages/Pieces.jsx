import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { colors } from '../theme'
import BottomNav from '../components/BottomNav'
import PieceCard from '../components/PieceCard'

export default function Pieces() {
  const [pieces, setPieces] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState({ total: 0, mastered: 0, hours: 0 })
  const navigate = useNavigate()

  useEffect(() => { loadPieces() }, [])

  async function loadPieces() {
    const { data } = await supabase.from('pieces').select('*')
      .order('created_at', { ascending: false })
    if (data) {
      setPieces(data)
      const { data: sessions } = await supabase
        .from('practice_sessions').select('duration_minutes')
      const totalMins = sessions?.reduce((acc, s) => acc + (s.duration_minutes || 0), 0) || 0
      setStats({
        total: data.length,
        mastered: data.filter(p => p.status === 'mastered').length,
        hours: Math.round(totalMins / 60),
      })
    }
  }

  const filtered = pieces.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.composer || '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div style={{ background: colors.cream, minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: colors.cream, borderBottom: `0.5px solid ${colors.border}`,
        padding: '14px 16px' }}>
        <div style={{ fontSize: 22, fontWeight: 500, color: colors.dark }}>𝄞 Solfa</div>
        <div style={{ fontSize: 12, color: colors.mid }}>el teu quadern musical</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '12px 16px' }}>
        {[['Peces', stats.total], ['Dominades', stats.mastered], [`${stats.hours}h`, 'Pràctica']].map(([a, b]) => (
          <div key={a} style={{ background: colors.white, borderRadius: 8, padding: '10px 8px',
            textAlign: 'center', border: `0.5px solid ${colors.border}` }}>
            <div style={{ fontSize: 20, fontWeight: 500, color: colors.dark }}>{a}</div>
            <div style={{ fontSize: 11, color: colors.mid, marginTop: 2 }}>{b}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 16px 10px' }}>
        <input placeholder="Cerca per títol o compositor..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', borderRadius: 8,
            border: `0.5px solid ${colors.border}`, background: colors.white,
            fontSize: 14, color: colors.choco, outline: 'none' }} />
      </div>

      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[['all','Totes'],['learning','En procés'],['mastered','Dominades'],['pending','No iniciades']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{
            fontSize: 12, padding: '5px 10px', borderRadius: 20,
            border: `0.5px solid ${colors.border}`,
            background: filter === val ? colors.primary : colors.white,
            color: filter === val ? colors.white : colors.mid,
            cursor: 'pointer', fontWeight: filter === val ? 500 : 400 }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: colors.mid, padding: '40px 0', fontSize: 14 }}>
            Cap partitura trobada
          </div>
        )}
        {filtered.map(p => <PieceCard key={p.id} piece={p} />)}
      </div>

      <button onClick={() => navigate('/add')} style={{
        position: 'fixed', bottom: 80, right: 'calc(50% - 215px + 16px)',
        width: 52, height: 52, borderRadius: '50%', border: 'none',
        background: colors.primary, color: colors.white,
        fontSize: 28, cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'center' }}>+</button>

      <BottomNav />
    </div>
  )
}