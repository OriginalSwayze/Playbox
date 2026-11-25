// Kestrel: entry point. Runs in Steam's SharedJSContext and draws its shell into the main Steam window.
/* eslint-disable @typescript-eslint/no-explicit-any */
import { definePlugin, Field } from 'millennium';
import { Shell } from './shell/Shell';
import { Failsafe } from './shell/Failsafe';
import { bindKeys } from './shell/CommandBar';
import { getState, setState, subscribeState } from './state/store';
import { loadSettings } from './state/settings';
import { bindTilt } from './ui/motion';
import { bindGameMenu } from './shell/GameMenu';
import { mainWindow, whenMainWindow } from './steam/env';
import { snapshotLibrary } from './steam/library';
import { snapshotDownloads, snapshotFriends } from './steam/activity';
import { runningApps } from './steam/details';
import { snapshotCollections } from './steam/collections';
import { tokens } from './styles/tokens';
import { shell } from './styles/shell';
import { views } from './styles/views';
import { game } from './styles/game';
import { motion } from './styles/motion';
import { alt } from './styles/alt';
import { gazette } from './styles/gazette';
import { INTERFACE_CSS } from './alt/registry';
import { pickerCss } from './shell/InterfacePicker';

const ROOT_ID = 'kestrel-root';
const CSS_ID = 'kestrel-css';
let mounted: { doc: Document; root: any; unbind: () => void } | null = null;
let firstMount = true;
// Off switch: Ctrl+Shift+K hides Kestrel and shows Steam's own interface (and back). Also set after a crash.
let disabled = false;
let keyDoc: Document | null = null;
const onToggleKey = (e: KeyboardEvent) => {
	if (!(e.ctrlKey && e.shiftKey && (e.key === 'K' || e.key === 'k'))) return;
	e.preventDefault();
	e.stopPropagation();
	disabled = !disabled;
	if (disabled) unmount();
	console.log('[Kestrel]', disabled ? "off: showing Steam's own interface" : 'on');
};
function bindToggle(doc: Document | null) {
	if (doc === keyDoc) return;
	keyDoc?.removeEventListener('keydown', onToggleKey, true);
	keyDoc = doc;
	keyDoc?.addEventListener('keydown', onToggleKey, true);
}

function mount(doc: Document) {
	const RD = (window as any).SP_REACTDOM;
	const R = (window as any).SP_REACT;
	if (!RD?.createRoot || !R) { console.error('[Kestrel] Steam React not available; staying out of the way'); return; }
	let style = doc.getElementById(CSS_ID) as HTMLStyleElement | null;
	if (!style) { style = doc.createElement('style'); style.id = CSS_ID; doc.head.appendChild(style); }
	style.textContent = tokens + shell + views + game + motion + alt + gazette + pickerCss + INTERFACE_CSS.join('\n');
	let host = doc.getElementById(ROOT_ID);
	if (!host) { host = doc.createElement('div'); host.id = ROOT_ID; doc.body.appendChild(host); }
	doc.documentElement.classList.add('kestrel');

	// Reduced motion: Kestrel's setting, or Windows' preference when it is on Auto
	const mq = doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)');
	const applyCalm = () => {
		const m = getState().settings.motion;
		const calm = m === 'reduced' || (m === 'auto' && !!mq?.matches);
		doc.documentElement.classList.toggle('k-calm', calm);
		if (doc.documentElement.dataset.ui !== getState().settings.ui) doc.documentElement.dataset.ui = getState().settings.ui;
		if (calm !== getState().calm) setState({ calm });
	};
	mq?.addEventListener?.('change', applyCalm);
	const unsub = subscribeState(() => { applyCalm(); syncBrowserView(); });
	applyCalm();

	const root = RD.createRoot(host);
	root.render(R.createElement(Failsafe, { onCrash: () => { disabled = true; unmount(); } }, R.createElement(Shell)));
	const unKeys = bindKeys(doc);
	const unTilt = bindTilt(doc);
	const unMenu = bindGameMenu(doc);
	mounted = { doc, root, unbind: () => { unKeys(); unTilt(); unMenu(); unsub(); mq?.removeEventListener?.('change', applyCalm); } };

	// Start on the dashboard, with Steam parked on its light library route underneath
	const mw = mainWindow();
	if (mw && !/^\/library\/home/.test(mw.LocationPathName || '')) mw.Navigate('/library/home');
	// Open where the user asked on the first start; after a window rebuild, return to Home
	const start = firstMount && getState().settings.start === 'library' ? 'library' : 'home';
	firstMount = false;
	setState({ view: { kind: start }, space: 'play', history: [] });
	console.log('[Kestrel] shell mounted');
}

function unmount() {
	if (!mounted) return;
	// never leave Steam's store view hidden behind us
	if (browserHidden) { try { (window as any).MainWindowBrowserManager?.m_browser?.SetVisible?.(true); } catch { /* ignore */ } browserHidden = false; }
	try { mounted.root.unmount(); } catch { /* window already gone */ }
	mounted.unbind();
	mounted.doc.getElementById(ROOT_ID)?.remove();
	mounted.doc.getElementById(CSS_ID)?.remove();
	mounted.doc.documentElement.classList.remove('kestrel', 'k-calm');
	mounted = null;
}

/** Steam draws its Store/Community browser above the page, so nothing of Kestrel's can sit over it.
 *  While a Kestrel overlay is open on top of a Steam web page, hide that browser and bring it back after. */
let browserHidden = false;
function syncBrowserView() {
	const s = getState();
	const overlay = s.commandOpen || s.panelOpen || s.settingsOpen || s.pickerOpen;
	const onBrowser = /^\/browser/.test(mainWindow()?.LocationPathName || '');
	const want = overlay && s.view.kind === 'native' && onBrowser;
	if (want === browserHidden) return;
	try {
		const b = (window as any).MainWindowBrowserManager?.m_browser;
		// hide while an overlay is up; show again only if Steam is still on its browser route
		if (want) b?.SetVisible?.(false);
		else if (onBrowser) b?.SetVisible?.(true);
		browserHidden = want;
	} catch (e) { console.error('[Kestrel] browser view', e); }
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
let colSig = '';
function refresh(full: boolean) {
	try {
		if (full) {
			const lib = snapshotLibrary();
			const sig = lib.map((g) => `${g.appid}:${g.installed ? 1 : 0}:${g.lastPlayed}:${g.status}:${Math.round(g.progress)}`).join('|');
			if (sig !== libSig) { libSig = sig; setState({ library: lib }); }
			const cols = snapshotCollections();
			const csig = cols.map((c) => c.id + ':' + c.name + ':' + c.appids.length).join('|');
			if (csig !== colSig) { colSig = csig; setState({ collections: cols }); }
			const fr = snapshotFriends();
			const fsig = fr.map((f) => f.id + f.state + f.game).join('|');
			if (fsig !== frSig) { frSig = fsig; setState({ friends: fr }); }
		}
		const run = runningApps();
		if (run.join() !== getState().running.join()) setState({ running: run });
		const dl = snapshotDownloads();
		const dsig = JSON.stringify([dl.active?.appid, dl.active ? Math.round(dl.active.percent * 10) : 0, Math.round(dl.rate / 1e5), dl.queue.map((q) => q.appid)]);
		if (dsig !== dlSig) { dlSig = dsig; setState({ downloads: dl }); }
	} catch (e) {
		console.error('[Kestrel] refresh failed', e);
	}
}

async function start() {
	loadSettings();
	await whenMainWindow();
	let n = 0;
	setInterval(() => {
		// Steam can destroy and recreate its main window (closing to the tray, for example); follow it
		const doc = mainWindow()?.BrowserWindow.document ?? null;
		bindToggle(doc);
		if (mounted && (mounted.doc !== doc || !doc?.getElementById(ROOT_ID))) unmount();
		if (!mounted && !disabled && doc?.body) { mount(doc); refresh(true); }
		if (!mounted) return;
		syncRoute();
		// Work less while the window is hidden
		if (!doc?.hidden || n % 10 === 0) refresh(n % 4 === 0);
		n++;
	}, 750);
}

export default definePlugin(() => {
	(window as any).__kestrelLoaded = Date.now();
	(window as any).__kestrel = { getState, setState }; // for inspection from devtools
	start();
	return {
		title: 'Kestrel',
		icon: <span />,
		content: <Field label="Kestrel" description="A new interface for Steam. Ctrl+K opens the command bar; Ctrl+Shift+K switches between Kestrel and Steam's own interface." />,
	};
});
