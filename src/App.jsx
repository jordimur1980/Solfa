import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Login from './pages/Login'
import Pieces from './pages/Pieces'
import PieceDetail from './pages/PieceDetail'
import AddPiece from './pages/AddPiece'
import Sessions from './pages/Sessions'
import Progress from './pages/Progress'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: '100vh', color: '#C0622F', fontSize: 32 }}>
      𝄞
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={
          <ProtectedRoute session={session}><Pieces /></ProtectedRoute>} />
        <Route path="/piece/:id" element={
          <ProtectedRoute session={session}><PieceDetail /></ProtectedRoute>} />
        <Route path="/add" element={
          <ProtectedRoute session={session}><AddPiece /></ProtectedRoute>} />
        <Route path="/sessions" element={
          <ProtectedRoute session={session}><Sessions /></ProtectedRoute>} />
        <Route path="/progress" element={
          <ProtectedRoute session={session}><Progress /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}