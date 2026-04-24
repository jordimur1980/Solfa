import { useNavigate, useLocation } from 'react-router-dom'
import { colors } from '../theme'

const items = [
  { path: '/',         label: 'Peces',    icon: '♪' },
  { path: '/sessions', label: 'Sessions', icon: '📅' },
  { path: '/progress', label: 'Progrés',  icon: '📈' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 430,
      background: colors.white, borderTop: `0.5px solid ${colors.border}`,
      display: 'flex', zIndex: 100,
    }}>
      {items.map(item => {
        const active = pathname === item.path
        return (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            flex: 1, padding: '10px 0 6px', border: 'none', background: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 2,
            color: active ? colors.dark : colors.mid,
            fontWeight: active ? 500 : 400,
          }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 10 }}>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}