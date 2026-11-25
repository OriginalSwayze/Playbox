// Moving around Kestrel. Kestrel's own views (home, library, game) are drawn over Steam's library route;
// Steam-owned pages (Store, Community, profile, the classic game page, downloads) are shown natively.
import { mainWindow } from '../steam/env';
import { getState, setState, type Space, type View } from './store';
import { updateSettings } from './settings';

const SPACE_URL: Record<Exclude<Space, 'play'>, string> = {
	discover: 'https://store.steampowered.com/',
	social: 'https://steamcommunity.com/',
	you: 'https://steamcommunity.com/my/',
};

const same = (a: View, b: View) => a.kind === b.kind && (a.kind !== 'game' || (b.kind === 'game' && a.appid === b.appid));

/** Show one of Kestrel's own views. */
export function go(view: View) {
	const s = getState();
	if (view.kind !== 'native') {
		// Keep Steam on a light DOM route so no native browser view sits above Kestrel's layer
		const mw = mainWindow();
		if (mw && !/^\/library\/home/.test(mw.LocationPathName || '')) mw.Navigate('/library/home');
	}
	if (same(s.view, view)) return;
	setState({ view, history: [...s.history, s.view].slice(-30), space: view.kind === 'native' ? s.space : 'play', commandOpen: false, dir: 'forward' });
}

/** Hand over to a Steam-owned page inside the window. */
export function goNative(path: string, space: Space = getState().space) {
	const mw = mainWindow();
	if (!mw) return;
	const s = getState();
	if (/^https?:/.test(path)) mw.NavigateToSteamWeb(path);
	else mw.Navigate(path);
	setState({ view: { kind: 'native' }, history: [...s.history, s.view].slice(-30), space, commandOpen: false });
}

export function goSpace(space: Space) {
	if (space === 'play') {
		const v = getState().view;
		go(v.kind === 'native' ? { kind: 'home' } : v.kind === 'home' ? v : { kind: 'home' });
		setState({ space: 'play' });
		return;
	}
	goNative(SPACE_URL[space], space);
}

export function back() {
	const s = getState();
	const prev = s.history[s.history.length - 1];
	// Inside a run of Steam-owned pages, step back through Steam's own history
	if (s.view.kind === 'native' && (!prev || prev.kind === 'native')) { mainWindow()?.NavigateBack(); return; }
	if (!prev) return;
	if (prev.kind === 'native') { mainWindow()?.NavigateBack(); setState({ view: prev, history: s.history.slice(0, -1) }); return; }
	const mw = mainWindow();
	if (mw && !/^\/library\/home/.test(mw.LocationPathName || '')) mw.Navigate('/library/home');
	setState({ view: prev, history: s.history.slice(0, -1), space: 'play', dir: 'back' });
}

export const canGoBack = (s = getState()) => s.history.length > 0 || s.view.kind === 'native';

/** Open Kestrel's game page. Pass the element that was clicked to carry its artwork into the page. */
export function openGame(appid: number, from?: Element | null) {
	const img = from?.querySelector?.('img') as HTMLImageElement | null;
	if (img && img.complete && img.naturalWidth && !getState().calm) {
		const r = img.getBoundingClientRect();
		const radius = parseFloat(getComputedStyle(img.parentElement as Element).borderTopLeftRadius) || 12;
		setState({ morph: { appid, src: img.currentSrc || img.src, x: r.left, y: r.top, w: r.width, h: r.height, radius } });
	} else setState({ morph: null });
	go({ kind: 'game', appid });
}
/** Show one of the user's collections in the Library. */
export function openCollection(id: string | null) {
	setState({ libCollection: id });
	go({ kind: 'library' });
}

export const openClassicGamePage = (appid: number) => goNative(`/library/app/${appid}`, 'play');

/** Switch interface and show it: Steam leaves any Store/Community page for the library route first, otherwise its
 *  web view stays on top of the new interface (and Kestrel would follow Steam back to that page). */
export function switchInterface(id: string) {
	setState({ pickerOpen: false, commandOpen: false, panelOpen: false, settingsOpen: false });
	updateSettings({ ui: id });
	go({ kind: 'home' });
	setState({ space: 'play' });
}
