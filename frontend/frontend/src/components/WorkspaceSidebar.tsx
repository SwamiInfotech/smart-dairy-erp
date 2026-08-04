import { useEffect, useMemo, useState } from 'react'

type SidebarGroup = {
  title: string
  items: readonly string[]
}

type WorkspaceSidebarProps = {
  isSidebarCollapsed: boolean
  activeSidebarMenu: string
  sidebarGroups: readonly SidebarGroup[]
  tabLabels: Record<string, string>
  iconMap: Record<string, string>
  toggleSidebarCollapse: () => void
  onSelectSidebarMenu: (key: string, isUiTab: boolean) => void
}

export function WorkspaceSidebar({
  isSidebarCollapsed,
  activeSidebarMenu,
  sidebarGroups,
  tabLabels,
  iconMap,
  toggleSidebarCollapse,
  onSelectSidebarMenu,
}: WorkspaceSidebarProps) {
  const defaultExpandedTitle = useMemo(() => {
    const activeGroupTitle = sidebarGroups.find((group) => group.items.includes(activeSidebarMenu))?.title
    return activeGroupTitle || sidebarGroups[0]?.title || null
  }, [activeSidebarMenu, sidebarGroups])

  const [expandedGroupTitle, setExpandedGroupTitle] = useState<string | null>(defaultExpandedTitle)

  useEffect(() => {
    const activeGroupTitle = sidebarGroups.find((group) => group.items.includes(activeSidebarMenu))?.title
    if (!activeGroupTitle) {
      return
    }

    setExpandedGroupTitle(activeGroupTitle)
  }, [activeSidebarMenu, sidebarGroups])

  const toggleGroup = (title: string) => {
    setExpandedGroupTitle((prev) => (prev === title ? null : title))
  }

  return (
    <aside className={isSidebarCollapsed ? 'left-sidebar collapsed' : 'left-sidebar'}>
      <div className="sidebar-head">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={toggleSidebarCollapse}
          aria-expanded={!isSidebarCollapsed}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span aria-hidden="true">{isSidebarCollapsed ? '>' : '<'}</span>
        </button>
      </div>

      <div className={isSidebarCollapsed ? 'sidebar-content collapsed' : 'sidebar-content'}>
        {!isSidebarCollapsed ? (
          sidebarGroups.map((group) => (
            <section className="sidebar-group" key={group.title}>
              <button
                type="button"
                className="sidebar-group-toggle"
                onClick={() => toggleGroup(group.title)}
                aria-expanded={expandedGroupTitle === group.title}
                aria-controls={`sidebar-group-items-${group.title}`}
              >
                <span className="sidebar-group-title">{group.title}</span>
                <span className="sidebar-group-chevron" aria-hidden="true">
                  {expandedGroupTitle === group.title ? '▾' : '▸'}
                </span>
              </button>

              {expandedGroupTitle === group.title ? (
                <div className="sidebar-group-items" id={`sidebar-group-items-${group.title}`}>
                  {group.items.map((key) => {
                    const isUiTab = key in tabLabels
                    const label = isUiTab ? tabLabels[key as keyof typeof tabLabels] : key
                    const iconClass = iconMap[key] || 'icon-generic'

                    return (
                      <button
                        type="button"
                        key={key}
                        className={activeSidebarMenu === key ? 'menu-btn active' : 'menu-btn'}
                        onClick={() => onSelectSidebarMenu(key, isUiTab)}
                      >
                        <span aria-hidden="true" className={`menu-icon ${iconClass}`} />
                        <span className="menu-label">{label}</span>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </section>
          ))
        ) : (
          <div className="collapsed-sidebar-groups" aria-label="Collapsed navigation groups">
            {sidebarGroups.map((group) => (
              <section className="collapsed-sidebar-group" key={group.title} aria-label={group.title}>
                <div className="collapsed-menu-grid">
                  {group.items.map((key) => {
                    const isUiTab = key in tabLabels
                    const label = isUiTab ? tabLabels[key as keyof typeof tabLabels] : key
                    const iconClass = iconMap[key] || 'icon-generic'

                    return (
                      <button
                        type="button"
                        key={key}
                        title={`${group.title}: ${label}`}
                        aria-label={`${group.title}: ${label}`}
                        data-label={label}
                        className={activeSidebarMenu === key ? 'menu-btn collapsed-menu-btn active' : 'menu-btn collapsed-menu-btn'}
                        onClick={() => onSelectSidebarMenu(key, isUiTab)}
                      >
                        <span aria-hidden="true" className={`collapsed-menu-icon ${iconClass}`} />
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
