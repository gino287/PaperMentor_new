// SavedPanel.jsx — right-side saved papers panel


function SavedItem({ paper, onRemove }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '9px 18px',
        background: hov ? '#ece7dd' : 'transparent',
        transition: 'background 100ms ease',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}
    >
      <div style={{ width: 3, height: 30, background: '#d4552a', borderRadius: 2, flexShrink: 0, marginTop: 3 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.75rem', color: '#1c1917',
          lineHeight: '1.4', margin: '0 0 4px',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {paper.title}
        </p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.625rem', color: '#a8a29e' }}>
            {paper.authors[0]}{paper.authors.length > 1 ? ` +${paper.authors.length - 1}` : ''}
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.625rem', color: '#a8a29e' }}>· {paper.year}</span>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.5625rem', fontWeight: 500, color: '#9e3516', background: '#fff4f0', padding: '1px 4px', borderRadius: 2 }}>
            {paper.category}
          </span>
        </div>
      </div>
      <button
        onClick={onRemove}
        style={{
          background: 'none', border: 'none',
          color: hov ? '#a8a29e' : 'transparent',
          cursor: 'pointer', padding: 2, flexShrink: 0,
          transition: 'color 100ms ease', display: 'flex',
        }}
      >
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <line x1="2" y1="2" x2="9" y2="9"/><line x1="9" y1="2" x2="2" y2="9"/>
        </svg>
      </button>
    </div>
  );
}

function SavedPanel({ onClose }) {
  const [papers, setPapers] = React.useState([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    fetch('/api/saved')
      .then(r => r.json())
      .then(data => setPapers(data.papers || []));
  }, []);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(28,25,23,.42)', zIndex: 200,
          opacity: mounted ? 1 : 0, transition: 'opacity 200ms ease',
        }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
        background: '#f5f0e8', borderLeft: '1px solid #cfc9bc', zIndex: 201,
        display: 'flex', flexDirection: 'column',
        transform: mounted ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 260ms cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '-8px 0 32px rgba(28,25,23,.12)',
      }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '1.125rem', fontWeight: 600, color: 'rgba(255,255,255,.95)', margin: '0 0 3px' }}>
              Saved Papers
            </h2>
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', color: 'rgba(255,255,255,.38)', margin: 0, letterSpacing: '.04em' }}>
              {papers.length} papers in your library
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
              borderRadius: 3, color: 'rgba(255,255,255,.6)', cursor: 'pointer', padding: '6px 7px', display: 'flex',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/>
            </svg>
          </button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
          {papers.map(p => (
            <SavedItem
              key={p.id}
              paper={p}
              onRemove={() => {
                fetch(`/api/saved/${p.id}`, { method: 'DELETE' });
                setPapers(prev => prev.filter(x => x.id !== p.id));
              }}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid #e0dbd0', display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              fetch('/api/saved/add-all-to-board', { method: 'POST' })
                .then(r => r.json())
                .then(() => onClose());
            }}
            style={{
              flex: 1, background: '#d4552a', color: '#fff', border: 'none', borderRadius: 3,
              padding: 9, fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem',
              fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Add All to Board
          </button>
          <button
            onClick={() => {
              Promise.all(papers.map(p => fetch(`/api/saved/${p.id}`, { method: 'DELETE' })))
                .then(() => setPapers([]));
            }}
            style={{
              background: 'transparent', color: '#a8a29e', border: '1px solid #ddd8d2',
              borderRadius: 3, padding: '9px 14px', fontFamily: "'IBM Plex Mono',monospace",
              fontSize: '0.6875rem', letterSpacing: '.05em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </>
  );
}

window.SavedPanel = SavedPanel;
