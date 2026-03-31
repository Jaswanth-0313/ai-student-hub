const openedToolTabs = {}

export function openToolWindow(toolKey, url) {
  if (!url) return null
  if (openedToolTabs[toolKey] && !openedToolTabs[toolKey].closed) {
    try {
      openedToolTabs[toolKey].focus()
    } catch (e) {
      // ignore
    }
    return openedToolTabs[toolKey]
  }

  const newTab = window.open(url, '_blank')
  if (newTab) {
    openedToolTabs[toolKey] = newTab
  }
  return newTab
}

export function closeAllToolWindows() {
  Object.keys(openedToolTabs).forEach((key) => {
    const tab = openedToolTabs[key]
    if (tab && !tab.closed) {
      try {
        tab.close()
      } catch (e) {
        // ignore
      }
    }
  })
}

export function listOpenToolWindows() {
  return Object.entries(openedToolTabs)
    .filter(([_, tab]) => tab && !tab.closed)
    .map(([key, tab]) => ({ key, closed: tab.closed }))
}

if (typeof window !== 'undefined') {
  const closeToolTabs = () => {
    closeAllToolWindows()
    try {
      localStorage.setItem('aiStudentHub_appClosed', Date.now().toString())
    } catch (e) {
      // localStorage may be unavailable in private mode, ignore
    }
  }

  window.addEventListener('beforeunload', closeToolTabs)
  window.addEventListener('unload', closeToolTabs)

  window.addEventListener('storage', (event) => {
    if (event.key === 'aiStudentHub_appClosed' && event.newValue) {
      // If main app closed in another tab, close this tool tab as well
      if (window.opener) {
        try {
          window.close()
        } catch (e) {
          // Some browsers block window.close; ignore.
        }
      }
    }
  })
}
