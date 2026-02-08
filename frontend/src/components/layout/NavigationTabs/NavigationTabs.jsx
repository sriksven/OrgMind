import { motion } from 'framer-motion'

export default function NavigationTabs({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'command-center', label: 'Command Center', icon: '🏠' },
        { id: 'organization-brain', label: 'Organization Brain', icon: '🧠' }
    ]

    return (
        <div className="nav-tabs-container">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                    <button
                        key={tab.id}
                        className={`nav-tab ${isActive ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span className="tab-icon">{tab.icon}</span>
                        <span className="tab-label">{tab.label}</span>
                        {isActive && (
                            <motion.div
                                layoutId="activeTabIndicator"
                                className="active-indicator"
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
