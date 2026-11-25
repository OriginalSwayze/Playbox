// Kestrel's own settings, kept in SharedJSContext's localStorage so they survive restarts.
import { DEFAULT_SETTINGS, getState, setState, type Settings } from './store';

const KEY = 'kestrel.settings.v1';

export function loadSettings() {
	try {
		const raw = localStorage.getItem(KEY);
		if (raw) setState({ settings: { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } });
	} catch { /* storage unavailable: defaults */ }
}

export function updateSettings(patch: Partial<Settings>) {
	const settings = { ...getState().settings, ...patch };
	setState({ settings });
	try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignore */ }
}
