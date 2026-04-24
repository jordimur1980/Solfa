import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { colors } from '../theme'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.cream, display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontSize: 56, marginBottom: 8, color: colors.primary }}>𝄞</div>
      <div style={{ fontSize: 32, fontWeight: 500, color: colors.dark, marginBottom: 4 }}>Solfa</div>
      <div style={{ fontSize: 14, color: colors.mid, marginBottom: 40 }}>el teu quadern musical</div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340,
        display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input
          type="email" placeholder="Correu electrònic" value={email}
          onChange={e => setEmail(e.target.value)} required
          style={{ padding: '12px 14px', borderRadius: 10,
            border: `0.5px solid ${colors.border}`, background: colors.white,
            fontSize: 15, color: colors.choco, outline: 'none' }} />
        <input
          type="password" placeholder="Contrasenya" value={password}
          onChange={e => setPassword(e.target.value)} required
          style={{ padding: '12px 14px', borderRadius: 10,
            border: `0.5px solid ${colors.border}`, background: colors.white,
            fontSize: 15, color: colors.choco, outline: 'none' }} />
        {error && <div style={{ fontSize: 13, color: '#C0392B', textAlign: 'center' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{
          padding: 13, borderRadius: 10, border: 'none',
          background: colors.primary, color: colors.white,
          fontSize: 15, fontWeight: 500, cursor: 'pointer', marginTop: 4 }}>
          {loading ? '...' : isRegister ? 'Crear compte' : 'Entrar'}
        </button>
      </form>

      <button onClick={() => setIsRegister(!isRegister)} style={{
        marginTop: 20, background: 'none', border: 'none',
        color: colors.mid, fontSize: 14, cursor: 'pointer' }}>
        {isRegister ? 'Ja tinc compte · Entrar' : 'Compte nou · Registrar-me'}
      </button>
    </div>
  )
}