export default function Sidebar({ activePage, onNavigate }) {
  const items = [
    { id: 'command-center', label: 'Command Center', icon: '🏠' },
    { id: 'organization-brain', label: 'Organization Brain', icon: '🧠' },
    { id: 'ask-organization', label: 'Ask the Organization', icon: '💬' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-title">OrgMind</div>
      <nav className="sidebar-nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${activePage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate?.(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
