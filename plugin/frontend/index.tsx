// Kestrel: entry point. Runs in Steam's SharedJSContext and draws its shell into the main Steam window.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { definePlugin, Field } from 'millennium';
import { Shell } from './shell/Shell';
import { bindKeys } from './shell/CommandBar';
import { getState, setState } from './state/store';
import { mainWindow, whenMainWindow } from './steam/env';
import { snapshotLibrary } from './steam/library';
import { snapshotDownloads, snapshotFriends } from './steam/activity';
import { tokens } from './styles/tokens';
import { shell } from './styles/shell';
import { views } from './styles/views';

const ROOT_ID = 'kestrel-root';
const CSS_ID = 'kestrel-css';
let mounted: { doc: Document; root: any; unbind: () => void } | null = null;

function mount(doc: Document) {
	const RD = (window as any).SP_REACTDOM;
	const R = (window as any).SP_REACT;
	if (!RD?.createRoot || !R) { console.error('[Kestrel] Steam React not available; staying out of the way'); return; }
	let style = doc.getElementById(CSS_ID) as HTMLStyleElement | null;
	if (!style) { style = doc.createElement('style'); style.id = CSS_ID; doc.head.appendChild(style); }
	style.textContent = tokens + shell + views;
	let host = doc.getElementById(ROOT_ID);
	if (!host) { host = doc.createElement('div'); host.id = ROOT_ID; doc.body.appendChild(host); }
	doc.documentElement.classList.add('kestrel');

	// Reduced motion follows the system preference (a Kestrel setting is added in phase 7)
	const mq = doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)');
	const applyCalm = () => { const calm = !!mq?.matches; doc.documentElement.classList.toggle('k-calm', calm); setState({ calm }); };
	mq?.addEventListener?.('change', applyCalm);
	applyCalm();

	const root = RD.createRoot(host);
	root.render(R.createElement(Shell));
	mounted = { doc, root, unbind: bindKeys(doc) };

	// Start on the dashboard, with Steam parked on its light library route underneath
	const mw = mainWindow();
	if (mw && !/^\/library\/home/.test(mw.LocationPathName || '')) mw.Navigate('/library/home');
	setState({ view: { kind: 'home' }, space: 'play', history: [] });
	console.log('[Kestrel] shell mounted');
}

function unmount() {
	if (!mounted) return;
	try { mounted.root.unmount(); } catch { /* window already gone */ }
	mounted.unbind();
	mounted.doc.getElementById(ROOT_ID)?.remove();
	mounted.doc.getElementById(CSS_ID)?.remove();
	mounted.doc.documentElement.classList.remove('kestrel', 'k-calm');
	mounted = null;
}

/** Keep Kestrel's idea of where we are in step with Steam's own navigation. */
function syncRoute() {
	const mw = mainWindow();
	if (!mw) return;
	const path = mw.LocationPathName || '';
	const s = getState();
	if (s.view.kind !== 'native' && !/^\/library\/home/.test(path)) {
		// Steam navigated somewhere by itself (a link, a steam:// URL, a dialog): show it
		setState({ view: { kind: 'native' }, history: [...s.history, s.view].slice(-30), space: /^\/library/.test(path) ? 'play' : s.space });
	}
}

/** Refresh library, downloads and friends; publish only when something actually changed. */
let libSig = '';
let dlSig = '';
let frSig = '';
function refresh(full: boolean) {
	try {
		if (full) {
			const lib = snapshotLibrary();
			const sig = lib.map((g) => `${g.appid}:${g.installed ? 1 : 0}:${g.lastPlayed}:${g.status}:${Math.round(g.progress)}`).join('|');
			if (sig !== libSig) { libSig = sig; setState({ library: lib }); }
			const fr = snapshotFriends();
			const fsig = fr.map((f) => f.id + f.state + f.game).join('|');
			if (fsig !== frSig) { frSig = fsig; setState({ friends: fr }); }
		}
		const dl = snapshotDownloads();
		const dsig = JSON.stringify([dl.active?.appid, dl.active ? Math.round(dl.active.percent * 10) : 0, Math.round(dl.rate / 1e5), dl.queue.map((q) => q.appid)]);
		if (dsig !== dlSig) { dlSig = dsig; setState({ downloads: dl }); }
	} catch (e) {
		console.error('[Kestrel] refresh failed', e);
	}
}

async function start() {
	await whenMainWindow();
	let n = 0;
	setInterval(() => {
		// Steam can destroy and recreate its main window (closing to the tray, for example); follow it
		const doc = mainWindow()?.BrowserWindow.document ?? null;
		if (mounted && (mounted.doc !== doc || !doc?.getElementById(ROOT_ID))) unmount();
		if (!mounted && doc?.body) { mount(doc); refresh(true); }
		if (!mounted) return;
		syncRoute();
		// Work less while the window is hidden
		if (!doc?.hidden || n % 10 === 0) refresh(n % 4 === 0);
		n++;
	}, 750);
}

export default definePlugin(() => {
	(window as any).__kestrelLoaded = Date.now();
	start();
	return {
		title: 'Kestrel',
		icon: <span />,
		content: <Field label="Kestrel" description="A new interface for Steam. Press Ctrl+K anywhere in the main window to open the command bar." />,
	};
});
