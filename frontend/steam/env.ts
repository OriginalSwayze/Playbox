// Access to Steam's own runtime objects. Everything here is feature-detected: if Steam changes or
// removes something, callers get null/[] and Kestrel falls back to Steam's native UI instead of breaking.
/* eslint-disable @typescript-eslint/no-explicit-any */

const w = window as any;

export type MainWindow = {
	Navigate(path: string, replace?: boolean): void;
	NavigateBack(): void;
	NavigateToSteamWeb(url: string): void;
	LocationPathName: string;
	BrowserWindow: Window & { SteamClient?: any };
	m_history?: { listen?(fn: () => void): () => void; length?: number };
};

export function mainWindow(): MainWindow | null {
	try {
		const mw = w.SteamUIStore?.WindowStore?.MainWindowInstance;
		return mw && mw.BrowserWindow && mw.BrowserWindow.document ? mw : null;
	} catch {
		return null;
	}
}

export function mainDocument(): Document | null {
	return mainWindow()?.BrowserWindow.document ?? null;
}

export const stores = {
	get app(): any { return w.appStore; },
	get appDetails(): any { return w.appDetailsStore; },
	get collections(): any { return w.collectionStore; },
	get downloads(): any { return w.downloadsStore; },
	get friends(): any { return w.friendStore; },
	get ui(): any { return w.SteamUIStore; },
};

export const client = (): any => w.SteamClient;

/** Resolves once Steam's main window exists (it can also be destroyed and recreated later). */
export function whenMainWindow(): Promise<MainWindow> {
	return new Promise((resolve) => {
		const tick = () => {
			const mw = mainWindow();
			if (mw) resolve(mw);
			else setTimeout(tick, 300);
		};
		tick();
	});
}
