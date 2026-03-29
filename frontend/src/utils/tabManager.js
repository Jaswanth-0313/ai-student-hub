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
  window.addEventListener('beforeunload', () => {
    closeAllToolWindows()
  })
  window.addEventListener('unload', () => {
    closeAllToolWindows()
  })
}
