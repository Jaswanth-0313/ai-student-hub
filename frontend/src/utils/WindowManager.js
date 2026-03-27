class WindowManagerClass {
    constructor() {
        this.windows = [];

        // Broadcast channel to talk to external tabs if they happen to share the origin
        this.channel = new BroadcastChannel('external_tabs_sync');

        // When the main hub tab is closed, notify backend (optional) and close all external tabs.
        // The strict requirement: "If AI Student Hub tab is closed -> All externally opened tabs must automatically close."
        window.addEventListener('beforeunload', () => {
            this.closeAll();
        });
    }

    /**
     * Opens an external tool and tracks its window reference securely.
     */
    openExternalTool(url) {
        // Open in a new tab securely without opener reference access (to prevent external sites from navigating the hub)
        // However, we still hold the `newWin` pointer locally to close it later.
        const newWin = window.open(url, '_blank');
        if (newWin) {
            this.windows.push(newWin);
        }
        return newWin;
    }

    /**
     * Closes all tracked external tabs.
     */
    closeAll() {
        // 1. Programmatically close tracked window references.
        // This is the most reliable method for cross-origin tabs.
        this.windows.forEach(win => {
            if (win && !win.closed) {
                try {
                    win.close();
                } catch (e) {
                    console.error("Could not close external window", e);
                }
            }
        });

        // 2. Broadcast a termination message via BroadcastChannel
        // Useful if the opened tab is also part of our application origin.
        this.channel.postMessage('TERMINATE_SESSION');

        // 3. Clean up the local registry array, removing closed windows
        this.windows = this.windows.filter(win => win && !win.closed);
    }
}

// Export singleton instance
export const WindowManager = new WindowManagerClass();
