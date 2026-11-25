import { useMemo, useState } from 'react';
import { CATEGORIES, SAYINGS, TYPES, TYPE_TAGS } from './data.js';

function SayingItem({ item, open, onToggle }) {
  return (
    <li id={`s-${item.id}`} className={`saying ${open ? 'open' : ''}`}>
      <button className="saying-head" onClick={onToggle} aria-expanded={open}>
        <span className="saying-text">{item.saying}</span>
        <span className="saying-tags">
          {item.type !== 'polite' && <span className={`tag tag-${item.type}`}>{TYPE_TAGS[item.type]}</span>}
          {!item.original && <span className="tag tag-extra">Extra</span>}
        </span>
        <span className="chevron" aria-hidden>▾</span>
      </button>
      {open && (
        <div className="saying-body">
          {item.plain && (
            <p className={`plain ${item.type === 'polite' ? 'rude' : ''}`}>
              <strong>{item.type === 'polite' ? '❌ Instead of saying:' : 'Instead of:'}</strong> "{item.plain}"
            </p>
          )}
          <p className="meaning">
            <strong>{{ business: 'When to use:', polite: '✅ Why it works:' }[item.type] || 'Meaning:'}</strong> {item.meaning}
          </p>
          <p className="examples-title">Examples</p>
          <ol className="examples">
            {item.examples.map((ex, i) => (
              <li key={i}>{ex}</li>
            ))}
          </ol>
        </div>
      )}
    </li>
  );
}

const PRO_ITEMS = SAYINGS.filter((s) => s.type === 'polite');
const OTHER_ITEMS = SAYINGS.filter((s) => s.type !== 'polite');
const OTHER_TYPES = Object.entries(TYPES).filter(([key]) => key !== 'polite');

const SECTIONS = {
  pro: {
    tab: '💼 How to Say It Professionally',
    title: 'How to Say It Professionally',
    subtitle: `${PRO_ITEMS.length} rude or blunt phrases turned into respectful, professional English. Tap a phrase to see what to avoid, why the new version works, and two examples.`,
    search: 'Search phrases, e.g. "busy", "wrong", "hurry"…',
  },
  sayings: {
    tab: '📚 English Sayings & Expressions',
    title: 'English Sayings & Expressions',
    subtitle: `${OTHER_ITEMS.length} proverbs, idioms, phrasal verbs, natural phrases and business expressions, grouped by theme. Tap one to see its meaning and two examples.`,
    search: 'Search sayings, meanings or examples…',
  },
};

export default function App() {
  const [section, setSection] = useState('pro');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('all');
  const [openIds, setOpenIds] = useState(() => new Set());

  const byType = useMemo(
    () =>
      section === 'pro'
        ? PRO_ITEMS
        : OTHER_ITEMS.filter((s) => type === 'all' || s.type === type),
    [section, type]
  );

  const counts = useMemo(() => {
    const c = {};
    byType.forEach((s) => (c[s.category] = (c[s.category] || 0) + 1));
    return c;
  }, [byType]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return byType.filter(
      (s) =>
        (category === 'all' || s.category === category) &&
        (!q ||
          s.saying.toLowerCase().includes(q) ||
          s.meaning.toLowerCase().includes(q) ||
          (s.plain && s.plain.toLowerCase().includes(q)) ||
          s.examples.some((e) => e.toLowerCase().includes(q)))
    );
  }, [byType, category, query]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach((s) => (g[s.category] ||= []).push(s));
    return Object.keys(CATEGORIES)
      .filter((k) => g[k])
      .map((k) => [k, g[k].sort((a, b) => a.saying.localeCompare(b.saying))]);
  }, [filtered]);

  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const expandAll = () => setOpenIds(new Set(filtered.map((s) => s.id)));
  const collapseAll = () => setOpenIds(new Set());

  const randomSaying = () => {
    const pick = byType[Math.floor(Math.random() * byType.length)];
    setQuery('');
    setCategory(pick.category);
    setOpenIds(new Set([pick.id]));
    setTimeout(() => {
      document.getElementById(`s-${pick.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const changeType = (t) => {
    setType(t);
    setCategory('all');
  };

  const changeSection = (key) => {
    setSection(key);
    setType('all');
    setCategory('all');
    setQuery('');
    setOpenIds(new Set());
  };

  const current = SECTIONS[section];

  return (
    <div className="app">
      <nav className="main-tabs" role="tablist">
        {Object.entries(SECTIONS).map(([key, sec]) => (
          <button
            key={key}
            role="tab"
            aria-selected={section === key}
            className={`main-tab ${section === key ? 'active' : ''}`}
            onClick={() => changeSection(key)}
          >
            {sec.tab}
          </button>
        ))}
      </nav>

      <header className="header">
        <h1>{current.title}</h1>
        <p className="subtitle">{current.subtitle}</p>
      </header>

      {section === 'sayings' && (
      <div className="type-tabs" role="tablist">
        {[['all', 'All'], ...OTHER_TYPES].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={type === key}
            className={`type-tab ${type === key ? 'active' : ''}`}
            onClick={() => changeType(key)}
          >
            {label}
            <span className="count">
              {key === 'all' ? OTHER_ITEMS.length : OTHER_ITEMS.filter((s) => s.type === key).length}
            </span>
          </button>
        ))}
      </div>
      )}

      <div className="toolbar">
        <input
          className="search"
          type="search"
          placeholder={current.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="toolbar-buttons">
          <button onClick={expandAll}>Expand all</button>
          <button onClick={collapseAll}>Collapse all</button>
          <button className="primary" onClick={randomSaying}>🎲 Random</button>
        </div>
      </div>

      <nav className="chips">
        <button className={`chip ${category === 'all' ? 'active' : ''}`} onClick={() => setCategory('all')}>
          All categories <span className="count">{byType.length}</span>
        </button>
        {Object.entries(CATEGORIES)
          .filter(([key]) => counts[key])
          .map(([key, cat]) => (
            <button
              key={key}
              className={`chip ${category === key ? 'active' : ''}`}
              onClick={() => setCategory(key)}
            >
              {cat.emoji} {cat.name} <span className="count">{counts[key]}</span>
            </button>
          ))}
      </nav>

      <main>
        {grouped.length === 0 && <p className="empty">Nothing matches your search.</p>}
        {grouped.map(([key, items]) => (
          <section key={key} className="category">
            <h2>
              {CATEGORIES[key].emoji} {CATEGORIES[key].name}
              <span className="count">{items.length}</span>
            </h2>
            <ul className="saying-list">
              {items.map((item) => (
                <SayingItem key={item.id} item={item} open={openIds.has(item.id)} onToggle={() => toggle(item.id)} />
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="footer">
        "Extra" marks entries added beyond your original lists.
      </footer>
    </div>
  );
}
