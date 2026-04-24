import { useState } from 'react'
import { colors } from '../theme'

export default function ScoreViewer({ url, type, onClose }) {
  const [loading, setLoading] = useState(true)

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: '#1a1a1a', zIndex: 200,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', background: '#111',
        borderBottom: '0.5px solid #333',
      }}>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: colors.light,
          fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
        }}>← Tancar</button>
        <div style={{ fontSize: 12, color: '#888' }}>
          {type === 'pdf' ? 'PDF' : 'Imatge'} · Pinça per fer zoom
        </div>
        <div style={{ width: 70 }} />
      </div>

      <div style={{ flex: 1, overflow: 'auto', display: 'flex',
        alignItems: 'flex-start', justifyContent: 'center', padding: 8 }}>
        {loading && (
          <div style={{ position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)', color: colors.light, fontSize: 14 }}>
            Carregant...
          </div>
        )}
        {type === 'pdf' ? (
          <iframe
            src={url}
            onLoad={() => setLoading(false)}
            style={{
              width: '100%', height: 'calc(100vh - 60px)',
              border: 'none', background: 'white',
            }}
            title="Partitura"
          />
        ) : (
          <img
            src={url}
            onLoad={() => setLoading(false)}
            alt="Partitura"
            style={{
              width: '100%', maxWidth: '100%',
              objectFit: 'contain', borderRadius: 4,
              touchAction: 'pinch-zoom',
            }}
          />
        )}
      </div>
    </div>
  )
}