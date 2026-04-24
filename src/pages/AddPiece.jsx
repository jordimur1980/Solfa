import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { colors } from '../theme'

const inp = {
  padding: '10px 12px', borderRadius: 10,
  border: `0.5px solid ${colors.border}`,
  background: colors.white, fontSize: 14,
  color: colors.choco, outline: 'none', width: '100%',
}
const lbl = {
  fontSize: 12, fontWeight: 500, color: colors.mid,
  textTransform: 'uppercase', letterSpacing: '0.05em',
  marginBottom: 4, display: 'block',
}

const CLAUS = [
  'Do M','Re M','Mi M','Fa M','Sol M','La M','Si M',
  'Fa# M','Si♭ M','Mi♭ M','La♭ M',
  'La m','Si m','Do m','Re m','Mi m','Fa m','Sol m','Sol# m','Fa# m'
]
const COMPASSOS = ['2/4','2/2','3/4','3/8','4/4','6/8','9/8','12/8','5/4','7/8']

export default function AddPiece() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', composer: '', clau: '', compas: '', tempo: '',
    difficulty: 0, status: 'pending', notes: ''
  })
  const [chords, setChords] = useState([])
  const [chordInput, setChordInput] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  function addChord() {
    const v = chordInput.trim()
    if (v && !chords.includes(v)) setChords(c => [...c, v])
    setChordInput('')
  }

  function handleFileChange(e) {
    const f = e.target.files[0]
    if (f) {
      setFile(f)
      set('source_type', f.type === 'application/pdf' ? 'pdf' : 'photo')
    }
  }

  async function handleSave() {
    if (!form.title || !file) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('scores').upload(path, file)

    if (uploadError) { setSaving(false); return }

    const { data: { publicUrl } } = supabase.storage
      .from('scores').getPublicUrl(path)

    const { data: piece, error } = await supabase.from('pieces')
      .insert({ ...form, user_id: user.id, source_url: publicUrl })
      .select().single()

    if (!error && piece && chords.length > 0) {
      await supabase.from('chords')
        .insert(chords.map(name => ({ piece_id: piece.id, name })))
    }

    setSaving(false)
    if (!error) navigate('/')
  }

  const canSave = form.title && file

  return (
    <div style={{ background: colors.cream, minHeight: '100vh', paddingBottom: 40 }}>
      <div style={{ background: colors.cream, borderBottom: `0.5px solid ${colors.border}`,
        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none',
          color: colors.primary, fontSize: 14, cursor: 'pointer' }}>← Cancel·lar</button>
        <span style={{ fontSize: 17, fontWeight: 500, color: colors.dark }}>Nova partitura</span>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        <div><label style={lbl}>Títol *</label>
          <input style={inp} placeholder="p. ex. Sonata al clar de lluna"
            value={form.title} onChange={e => set('title', e.target.value)} /></div>

        <div><label style={lbl}>Compositor</label>
          <input style={inp} placeholder="p. ex. L. van Beethoven"
            value={form.composer} onChange={e => set('composer', e.target.value)} /></div>

        <div style={{ height: 1, background: colors.border }} />

        <div>
          <label style={lbl}>Partitura *</label>
          {!file ? (
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 10, padding: '28px 16px',
              border: `1.5px dashed ${colors.border}`, borderRadius: 12,
              background: colors.white, cursor: 'pointer',
            }}>
              <div style={{ fontSize: 36, color: colors.mid }}>+</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: colors.dark }}>Afegir partitura</div>
              <div style={{ fontSize: 12, color: colors.mid, textAlign: 'center' }}>
                Foto des de la càmera o PDF des del dispositiu</div>
              <input type="file" accept="image/*,application/pdf"
                onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          ) : (
            <div style={{ background: colors.white, border: `0.5px solid ${colors.border}`,
              borderRadius: 12, padding: '12px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>
                  {form.source_type === 'pdf' ? '📄' : '📷'}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: colors.dark }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: colors.mid }}>
                    {(file.size / 1024).toFixed(0)} KB</div>
                </div>
              </div>
              <button onClick={() => { setFile(null); set('source_type', '') }}
                style={{ background: 'none', border: 'none',
                  color: colors.mid, fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
          )}
        </div>

        <div style={{ height: 1, background: colors.border }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div><label style={lbl}>Clau</label>
            <select style={inp} value={form.clau} onChange={e => set('clau', e.target.value)}>
              <option value="">— Selecciona —</option>
              {CLAUS.map(c => <option key={c}>{c}</option>)}
            </select></div>
          <div><label style={lbl}>Compàs</label>
            <select style={inp} value={form.compas} onChange={e => set('compas', e.target.value)}>
              <option value="">— Selecciona —</option>
              {COMPASSOS.map(c => <option key={c}>{c}</option>)}
            </select></div>
        </div>

        <div><label style={lbl}>Tempo</label>
          <input style={inp} placeholder="p. ex. Andante, ♩=72"
            value={form.tempo} onChange={e => set('tempo', e.target.value)} /></div>

        <div>
          <label style={lbl}>Acords principals</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
            {chords.map(c => (
              <span key={c} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20,
                background: colors.light, color: colors.dark,
                display: 'flex', alignItems: 'center', gap: 5 }}>
                {c}
                <span onClick={() => setChords(ch => ch.filter(x => x !== c))}
                  style={{ cursor: 'pointer', color: colors.primary }}>×</span>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={{ ...inp, flex: 1 }} placeholder="p. ex. Am, G7..."
              value={chordInput} onChange={e => setChordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addChord()} />
            <button onClick={addChord} style={{ padding: '10px 14px', borderRadius: 10,
              border: `0.5px solid ${colors.border}`, background: colors.white,
              color: colors.dark, cursor: 'pointer', fontSize: 13 }}>+ Afegir</button>
          </div>
        </div>

        <div style={{ height: 1, background: colors.border }} />

        <div>
          <label style={lbl}>Dificultat</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[1,2,3,4,5].map(n => (
              <span key={n} onClick={() => set('difficulty', n)}
                style={{ fontSize: 26, cursor: 'pointer',
                  color: n <= form.difficulty ? '#E8915A' : colors.border }}>★</span>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>Estat inicial</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['pending','No iniciada'],['learning','En procés'],['mastered','Dominada']].map(([val, label]) => (
              <button key={val} onClick={() => set('status', val)} style={{
                flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                border: `${form.status === val ? '1.5px' : '0.5px'} solid
                  ${form.status === val ? colors.primary : colors.border}`,
                background: form.status === val ? colors.light : colors.white,
                color: form.status === val ? colors.dark : colors.mid,
                fontWeight: form.status === val ? 500 : 400 }}>{label}</button>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>Notes inicials</label>
          <textarea style={{ ...inp, minHeight: 80, resize: 'vertical', lineHeight: 1.5 }}
            placeholder="Primeres impressions, objectius..."
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <button onClick={handleSave} disabled={saving || !canSave} style={{
          padding: 13, borderRadius: 10, border: 'none',
          background: canSave ? colors.primary : colors.light,
          color: colors.white, fontSize: 15, fontWeight: 500,
          cursor: canSave ? 'pointer' : 'not-allowed', marginTop: 4 }}>
          {saving ? 'Guardant...' : 'Guardar partitura'}
        </button>
      </div>
    </div>
  )
}