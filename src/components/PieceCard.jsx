import { useNavigate } from 'react-router-dom'
import { colors } from '../theme'

const statusLabel = { pending: 'No iniciada', learning: 'En proces', mastered: 'Dominada' }
const statusStyle = {
  pending:  { background: '#F5F0EB', color: colors.dark },
  learning: { background: '#FDE8D8', color: colors.dark },
  mastered: { background: colors.greenLight, color: '#2D5A1A' },
}
const barColor = { pending: colors.light, learning: colors.primary, mastered: colors.green }
const barPct   = { pending: 5, learning: 50, mastered: 100 }

export default function PieceCard({ piece }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(`/piece/${piece.id}`)} style={{
      background: colors.white, border: `0.5px solid ${colors.border}`,
      borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500, color: colors.choco,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {piece.title}</div>
          <div style={{ fontSize: 12, color: colors.mid, marginTop: 2 }}>{piece.composer}</div>
        </div>
        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 20,
          fontWeight: 500, flexShrink: 0, marginLeft: 8, ...statusStyle[piece.status] }}>
          {statusLabel[piece.status]}</span>
      </div>
      <div style={{ height: 4, background: colors.light, borderRadius: 20, marginTop: 10 }}>
        <div style={{ height: 4, borderRadius: 20,
          width: `${barPct[piece.status]}%`, background: barColor[piece.status] }} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 8,
        flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {piece.clau && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20,
            background: colors.cream, color: colors.dark,
            border: `0.5px solid ${colors.border}` }}>{piece.clau}</span>}
          {piece.compas && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20,
            background: colors.cream, color: colors.dark,
            border: `0.5px solid ${colors.border}` }}>{piece.compas}</span>}
          {piece.difficulty > 0 && (
            <span style={{ color: '#E8915A', fontSize: 13, letterSpacing: -1 }}>
              {'★'.repeat(piece.difficulty)}</span>
          )}
        </div>
      </div>
    </div>
  )
}