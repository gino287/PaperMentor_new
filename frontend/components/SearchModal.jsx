// SearchModal.jsx — arXiv search overlay


function SearchResult({ paper, saved, onSave }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ padding: '11px 18px', background: hov ? '#f5f0e8' : 'transparent', transition: 'background 100ms ease' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.8125rem', color: '#1c1917', lineHeight: '1.4', margin: '0 0 5px' }}>
            {paper.title}
          </p>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', color: '#a8a29e' }}>
              {paper.authors[0]}{paper.authors.length > 1 ? ` +${paper.authors.length - 1}` : ''}
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', color: '#a8a29e' }}>· {paper.year}</span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.625rem', fontWeight: 500, color: '#9e3516', background: '#fff4f0', padding: '1px 5px', borderRadius: 2 }}>
              {paper.category}
            </span>
          </div>
        </div>
        <button
          onClick={onSave}
          style={{
            background: saved ? '#fff4f0' : 'transparent',
            border: `1px solid ${saved ? '#fde8e0' : '#ddd8d2'}`,
            borderRadius: 3, padding: '5px 10px', cursor: 'pointer',
            fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem',
            color: saved ? '#c2421e' : '#a8a29e',
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 120ms ease', flexShrink: 0, whiteSpace: 'nowrap',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill={saved ? '#c2421e' : 'none'} stroke={saved ? '#c2421e' : '#a8a29e'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 2h8v9L6 9 2 11V2z"/>
          </svg>
          {saved ? 'saved' : 'save'}
        </button>
      </div>
    </div>
  );
}

function SearchModal({ onClose, onAddToBoard }) {
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);
  const [searching, setSearching] = React.useState(false);
  const [saved, setSaved] = React.useState(new Set());
  const inputRef = React.useRef(null);

  React.useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 60);
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const search = () => {
    if (!query.trim()) return;
    setSearching(true);
    fetch(`/api/papers/search?q=${encodeURIComponent(query.trim())}`)
      .then(r => r.json())
      .then(data => { setResults(data.results || []); setSearching(false); })
      .catch(() => setSearching(false));
  };

  const toggleSave = paper => {
    const alreadySaved = saved.has(paper.id);
    setSaved(prev => {
      const next = new Set(prev);
      alreadySaved ? next.delete(paper.id) : next.add(paper.id);
      return next;
    });
    if (!alreadySaved) {
      fetch('/api/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: paper.id, title: paper.title,
          authors: paper.authors, year: paper.year, category: paper.category,
        }),
      });
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(28,25,23,.72)', zIndex: 1000,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '56px 24px', backdropFilter: 'blur(4px)',
      }}
    >
      <div style={{
        background: '#fdfbf7', borderRadius: 8, width: '100%', maxWidth: 660,
        boxShadow: '0 24px 48px rgba(28,25,23,.2),0 8px 16px rgba(28,25,23,.12)', overflow: 'hidden',
      }}>
        {/* Search bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', borderBottom: '1px solid #ece7dd' }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="#a8a29e" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="6.5" cy="6.5" r="5"/><line x1="10.5" y1="10.5" x2="14" y2="14"/>
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') search(); if (e.key === 'Escape') onClose(); }}
            placeholder="Search by title, author, or arXiv ID…"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.9375rem', color: '#1c1917',
            }}
          />
          {query && (
            <button
              onClick={search}
              style={{
                background: '#d4552a', color: '#fff', border: 'none', borderRadius: 3,
                padding: '5px 12px', fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem',
                fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              Search
            </button>
          )}
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="11" y2="11"/><line x1="11" y1="2" x2="2" y2="11"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ maxHeight: '58vh', overflowY: 'auto' }}>
          {searching ? (
            <div style={{ padding: '44px', textAlign: 'center', fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.75rem', color: '#a8a29e', letterSpacing: '.05em' }}>
              searching arXiv…
            </div>
          ) : results.length > 0 ? (
            <div>
              {results.map(p => (
                <SearchResult key={p.id} paper={p} saved={saved.has(p.id)} onSave={() => toggleSave(p)} />
              ))}
            </div>
          ) : (
            <div style={{ padding: '44px 32px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: '1.125rem', color: '#a8a29e', margin: '0 0 8px', fontStyle: 'italic' }}>
                Search the arXiv catalog
              </p>
              <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', color: '#cfc9bc', margin: 0, letterSpacing: '.04em' }}>
                Try a topic, author name, or paper ID like 2401.00000
              </p>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div style={{ padding: '10px 18px', borderTop: '1px solid #ece7dd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', color: '#a8a29e' }}>
              {results.length} results from arXiv
            </span>
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: '0.6875rem', color: '#cfc9bc' }}>esc to close</span>
          </div>
        )}
      </div>
    </div>
  );
}

window.SearchModal = SearchModal;
