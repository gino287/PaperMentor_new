// Homepage.jsx — PaperMentor reading board (main app entry)

const SearchModal = window.SearchModal;
const SavedPanel  = window.SavedPanel;

/* ── PaperCard ── */
function PaperCard({ title, authors = [], year = null, category = null, draggable = true, onDragStart, onDragEnd, onClick, selected = false, onDelete }) {
  const [hovered, setHovered] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const borderColor = selected ? '#c2421e' : '#d4552a';
  const boxShadow = dragging
    ? '0 14px 28px rgba(28,25,23,0.18), 0 4px 8px rgba(28,25,23,0.12)'
    : hovered
      ? '0 5px 14px rgba(28,25,23,0.12), 0 2px 4px rgba(28,25,23,0.08)'
      : '0 1px 3px rgba(28,25,23,0.06), 0 0 0 1px rgba(28,25,23,0.06)';
  const transform = dragging ? 'rotate(1.5deg) scale(1.03)' : hovered ? 'translateY(-1px)' : 'none';
  const cursor = !draggable ? (onClick ? 'pointer' : 'default') : dragging ? 'grabbing' : 'grab';

  return (
    <div
      draggable={draggable}
      onDragStart={e => { setDragging(true); onDragStart?.(e); }}
      onDragEnd={e => { setDragging(false); onDragEnd?.(e); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        position: 'relative',
        background: '#fdfbf7',
        borderLeft: `3px solid ${borderColor}`,
        borderTop: 'none', borderRight: 'none', borderBottom: 'none',
        padding: '10px 12px',
        borderRadius: '0 3px 3px 0',
        boxShadow, transform, cursor,
        transition: 'transform 120ms ease, box-shadow 120ms ease',
        userSelect: 'none',
        opacity: dragging ? 0.88 : 1,
      }}
    >
      {onDelete && hovered && (
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{
            position: 'absolute', top: 6, right: 6,
            background: 'none', border: 'none', padding: 2,
            cursor: 'pointer', color: '#c9c4be', display: 'flex',
            borderRadius: 2, transition: 'color 100ms ease',
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#78716c'}
          onMouseLeave={e => e.currentTarget.style.color = '#c9c4be'}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="2" y1="2" x2="8" y2="8"/><line x1="8" y1="2" x2="2" y2="8"/>
          </svg>
        </button>
      )}
      <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.8125rem', fontWeight: 400, color: '#1c1917', lineHeight: 1.4, margin: '0 0 8px', paddingRight: onDelete ? 16 : 0 }}>
        {title}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {authors.length > 0 && (
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', color: '#a8a29e' }}>
            {authors[0]}{authors.length > 1 ? ` +${authors.length - 1}` : ''}
          </span>
        )}
        {year && (
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', color: '#a8a29e' }}>· {year}</span>
        )}
        {category && (
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.625rem', fontWeight: 500, color: '#9e3516', background: '#fff4f0', padding: '1px 5px', borderRadius: 2, letterSpacing: '0.02em' }}>
            {category}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── KanbanColumn ── */
function KanbanColumn({ title, status = 'to-read', count = 0, children, onDrop }) {
  const [dragOver, setDragOver] = React.useState(false);
  const headerColor = { 'to-read': '#a8a29e', 'reading': '#d4552a', 'done': '#544f4a' }[status] || '#a8a29e';

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false); }}
      onDrop={e => { e.preventDefault(); setDragOver(false); onDrop?.(e); }}
      style={{
        flex: 1, minWidth: 220,
        background: dragOver ? '#e0dbd0' : '#ece7dd',
        border: dragOver ? '1.5px dashed #d4552a' : '1px solid #cfc9bc',
        borderRadius: 6, padding: 14, minHeight: 360,
        display: 'flex', flexDirection: 'column',
        transition: 'background 120ms ease, border-color 120ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #cfc9bc', flexShrink: 0 }}>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: headerColor }}>
          {title}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', color: '#a8a29e', background: '#e0dbd0', padding: '1px 8px', borderRadius: 9999, lineHeight: 1.8 }}>
          {count}
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
        {count === 0 && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cfc9bc', borderRadius: 4, minHeight: 72 }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', color: '#cfc9bc', letterSpacing: '0.04em' }}>drop here</span>
          </div>
        )}
      </div>
    </div>
  );
}

const EMPTY_BOARD = { 'to-read': [], 'reading': [], 'done': [] };

const COLS = [
  { id: 'to-read', title: 'To Read',  status: 'to-read' },
  { id: 'reading',  title: 'Reading',  status: 'reading'  },
  { id: 'done',     title: 'Done',     status: 'done'     },
];

/* ── Nav ── */
function Nav({ onSaved, savedCount }) {
  const [hov, setHov] = React.useState(false);
  return (
    <nav style={{
      background: '#1c1917', height: 56, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 32px',
      position: 'sticky', top: 0, zIndex: 100,
      borderBottom: '1px solid rgba(255,255,255,.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="17" height="21" viewBox="0 0 20 24" fill="none">
          <path d="M0 3C0 1.343 1.343 0 3 0H13L20 7V21C20 22.657 18.657 24 17 24H3C1.343 24 0 22.657 0 21V3Z" fill="rgba(255,255,255,.13)"/>
          <path d="M13 0L20 7H16C14.343 7 13 5.657 13 4V0Z" fill="#d4552a"/>
          <path d="M4 11H16M4 14.5H13M4 18H15" stroke="rgba(255,255,255,.36)" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '1.125rem', color: 'rgba(255,255,255,.95)' }}>
          Paper<em style={{ fontStyle: 'italic', color: '#ea9678' }}>Mentor</em>
        </span>
      </div>
      <button
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={onSaved}
        style={{
          background: hov ? 'rgba(255,255,255,.14)' : 'rgba(255,255,255,.07)',
          color: 'rgba(255,255,255,.65)', border: '1px solid rgba(255,255,255,.12)',
          borderRadius: 3, padding: '5px 14px',
          fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem',
          letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8, transition: 'background 120ms ease',
        }}
      >
        Saved
        <span style={{ background: '#d4552a', color: '#fff', borderRadius: 99, padding: '0 5px', fontSize: '0.6rem', fontWeight: 600, lineHeight: '16px', minWidth: 16, textAlign: 'center' }}>
          {savedCount}
        </span>
      </button>
    </nav>
  );
}

/* ── Search CTA ── */
function SearchCTA({ onClick }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div style={{
      background: '#1c1917', borderRadius: 8, padding: '32px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      marginTop: 48, marginBottom: 64,
    }}>
      <div>
        <h3 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '1.5rem', fontWeight: 600, color: 'rgba(255,255,255,.95)', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          Discover new research
        </h3>
        <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.75rem', color: 'rgba(255,255,255,.38)', margin: 0, letterSpacing: '.03em' }}>
          Search arXiv by title, author, keyword, or paper ID
        </p>
      </div>
      <button
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        onClick={onClick}
        style={{
          background: hov ? '#c2421e' : '#d4552a', color: '#fff', border: 'none', borderRadius: 3,
          padding: '13px 28px', fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.8125rem',
          fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          transition: 'background 120ms ease, transform 80ms ease',
          transform: hov ? 'translateY(-1px)' : 'none',
          whiteSpace: 'nowrap', flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="6" cy="6" r="4.5"/><line x1="9.5" y1="9.5" x2="13" y2="13"/>
        </svg>
        Search Papers
      </button>
    </div>
  );
}

/* ── App ── */
function App() {
  const [papers, setPapers] = React.useState(EMPTY_BOARD);
  const [savedCount, setSavedCount] = React.useState(0);
  const [showSearch, setShowSearch] = React.useState(false);
  const [showSaved,  setShowSaved]  = React.useState(false);

  React.useEffect(() => {
    fetch('/api/board')
      .then(r => r.json())
      .then(data => setPapers({
        'to-read': data['to-read'] || [],
        'reading':  data['reading']  || [],
        'done':     data['done']     || [],
      }));
    fetch('/api/saved')
      .then(r => r.json())
      .then(data => setSavedCount(data.total || 0));
  }, []);

  const deletePaper = (paperId) => {
    setPapers(prev => {
      const next = {};
      for (const [col, list] of Object.entries(prev))
        next[col] = list.filter(p => p.id !== paperId);
      return next;
    });
    fetch(`/api/board/papers/${paperId}`, { method: 'DELETE' });
  };

  const movePaper = (paperId, toCol) => {
    setPapers(prev => {
      let paper = null, fromCol = null;
      for (const [col, list] of Object.entries(prev)) {
        const found = list.find(p => p.id === paperId);
        if (found) { paper = found; fromCol = col; break; }
      }
      if (!paper || fromCol === toCol) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter(p => p.id !== paperId),
        [toCol]:   [...prev[toCol], paper],
      };
    });
    fetch(`/api/board/papers/${paperId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column: toCol }),
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f0e8' }}>
      <Nav onSaved={() => setShowSaved(true)} savedCount={savedCount} />

      <main style={{ maxWidth: 1240, margin: '0 auto', padding: '0 32px' }}>
        {/* Board header */}
        <div style={{ padding: '36px 0 24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '2rem', fontWeight: 600, color: '#1c1917', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
              Reading Board
            </h1>
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.75rem', color: '#a8a29e', margin: 0, letterSpacing: '.03em' }}>
              {papers['to-read'].length} to read · {papers['reading'].length} reading · {papers['done'].length} done
            </p>
          </div>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', color: '#cfc9bc', letterSpacing: '.05em' }}>
            drag to move between stages →
          </span>
        </div>

        {/* Kanban board */}
        <div style={{ display: 'flex', gap: 14 }}>
          {COLS.map(col => (
            <div key={col.id} style={{ flex: 1 }}>
              <KanbanColumn
                title={col.title}
                status={col.status}
                count={papers[col.id].length}
                onDrop={e => {
                  const id = e.dataTransfer.getData('text/plain');
                  if (id) movePaper(id, col.id);
                }}
              >
                {papers[col.id].map(p => (
                  <PaperCard
                    key={p.id}
                    title={p.title}
                    authors={p.authors}
                    year={p.year}
                    category={p.category}
                    onDragStart={e => e.dataTransfer.setData('text/plain', p.id)}
                    onDelete={() => deletePaper(p.id)}
                  />
                ))}
              </KanbanColumn>
            </div>
          ))}
        </div>

        <SearchCTA onClick={() => setShowSearch(true)} />
      </main>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
      {showSaved  && <SavedPanel  onClose={() => setShowSaved(false)}  />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
