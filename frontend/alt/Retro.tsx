// RETRO — an original late-90s style desktop, "Kestrel OS". Collections are folders on the desktop, games open in
// bevelled windows you can drag, stack, minimise to the taskbar and close; a game's Properties dialog has Play, and
// the Menu button lists recent games, every folder and Kestrel's settings.
import { useEffect, useMemo, useRef, useState, type PointerEvent as RPE, type ReactNode } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { setState, useKestrel } from '../state/store';
import { AltPage, Art, gameCommands, useIslands, useLibraryLists, useSelectedGame } from './common';

type Folder = { id: string; name: string; games: Game[] };
type Win = { key: string; kind: 'folder' | 'game'; ref: string; x: number; y: number; w: number; h: number; z: number; min: boolean };

function FolderIcon({ open }: { open?: boolean }) {
	return (
		<svg viewBox="0 0 32 32" className="rt-ficon"><path d="M2 8h10l3 3h15v17H2z" fill="#E8B84A" stroke="#6B4E12" /><path d={open ? 'M2 28l5-12h25l-5 12z' : 'M2 13h28v15H2z'} fill="#F6D47A" stroke="#6B4E12" /></svg>
	);
}

function Frame({ w, title, icon, active, onFocus, onMove, onMin, onClose, children, status }: {
	w: Win; title: string; icon: ReactNode; active: boolean; onFocus: () => void; onMove: (x: number, y: number) => void; onMin: () => void; onClose: () => void; children: ReactNode; status?: ReactNode;
}) {
	const drag = useRef<{ dx: number; dy: number } | null>(null);
	const down = (e: RPE) => { if ((e.target as HTMLElement).closest('button')) return; onFocus(); drag.current = { dx: e.clientX - w.x, dy: e.clientY - w.y }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
	const move = (e: RPE) => { if (drag.current) onMove(Math.max(-w.w + 80, e.clientX - drag.current.dx), Math.max(0, e.clientY - drag.current.dy)); };
	const up = () => { drag.current = null; };
	if (w.min) return null;
	return (
		<section className={'rt-win' + (active ? ' on' : '')} style={{ left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }} onPointerDown={onFocus}>
			<header className="rt-title" onPointerDown={down} onPointerMove={move} onPointerUp={up}>
				{icon}<b>{title}</b>
				<button className="rt-tb" onClick={onMin} aria-label="Minimise"><i className="min" /></button>
				<button className="rt-tb" onClick={onClose} aria-label="Close"><i className="x">×</i></button>
			</header>
			<div className="rt-body">{children}</div>
			{status && <footer className="rt-status">{status}</footer>}
		</section>
	);
}

function GameDialog({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const [tab, setTab] = useState(0);
	const cmds = gameCommands(g);
	return (
		<div className="rt-dialog">
			<div className="rt-tabs">{['General', 'Details', 'Shortcuts'].map((t, i) => <button key={t} className={tab === i ? 'on' : ''} onClick={() => setTab(i)}>{t}</button>)}</div>
			<div className="rt-panel">
				{tab === 0 && <>
					<div className="rt-gen"><span className="rt-gicon"><Art g={g} kind="capsule" /></span><b>{g.name}</b></div>
					<hr />
					<dl>
						<dt>Type:</dt><dd>Game ({g.installed ? 'installed' : 'not installed'})</dd>
						<dt>Location:</dt><dd>Steam Library</dd>
						<dt>Size:</dt><dd>{formatBytes(d.disk || g.sizeOnDisk) || '0 bytes'}</dd>
					</dl>
					<hr />
					<dl>
						<dt>Played:</dt><dd>{formatPlaytime(g.minutes)}</dd>
						<dt>Last opened:</dt><dd>{g.lastPlayed ? new Date(g.lastPlayed * 1000).toLocaleString() : '(never)'}</dd>
						<dt>Added:</dt><dd>{g.added ? new Date(g.added * 1000).toLocaleString() : '(unknown)'}</dd>
					</dl>
				</>}
				{tab === 1 && <>
					<div className="rt-shot"><Art g={g} kind="header" /></div>
					<dl>
						<dt>Developer:</dt><dd>{d.developer || '(unknown)'}</dd>
						<dt>Publisher:</dt><dd>{d.publisher || '(unknown)'}</dd>
						<dt>Achievements:</dt><dd>{d.achievements.total ? `${d.achievements.achieved} of ${d.achievements.total}` : '(none)'}</dd>
						<dt>Cloud:</dt><dd>{d.cloud || '(n/a)'}</dd>
						<dt>App ID:</dt><dd>{g.appid}</dd>
					</dl>
					{d.description[0] && <p className="rt-desc">{d.description[0]}</p>}
				</>}
				{tab === 2 && <div className="rt-short">{cmds.slice(1).map((c) => <button key={c.id} className="rt-btn wide" onClick={c.run}>{c.label}…</button>)}</div>}
			</div>
			<div className="rt-btns">
				<button className="rt-btn def" onClick={cmds[0].run}>{g.installed ? 'Play' : 'Install'}</button>
				<button className="rt-btn" onClick={close}>Close</button>
			</div>
		</div>
	);
}

export function Retro() {
	const lists = useLibraryLists();
	const islands = useIslands();
	const library = useKestrel((s) => s.library);
	const [sel, select] = useSelectedGame();
	const folders: Folder[] = useMemo(() => [
		{ id: 'installed', name: 'My Games', games: lists.installed },
		...islands.map((i) => ({ id: i.id, name: i.id === 'recent' ? 'Recent' : i.name, games: i.games })),
		{ id: 'all', name: 'Whole Library', games: [...lists.all].sort((a, b) => a.sortName.localeCompare(b.sortName)) },
	], [lists, islands]);
	const [wins, setWins] = useState<Win[]>([]);
	const zRef = useRef(10);
	const [picked, setPicked] = useState<string | null>(null);
	const [menu, setMenu] = useState(false);
	const [clock, setClock] = useState(new Date());
	useEffect(() => { const t = setInterval(() => setClock(new Date()), 20000); return () => clearInterval(t); }, []);
	const top = wins.filter((w) => !w.min).sort((a, b) => b.z - a.z)[0];
	const focus = (key: string) => { const nz = ++zRef.current; setWins((ws) => ws.map((w) => (w.key === key ? { ...w, z: nz, min: false } : w))); };
	const open = (kind: Win['kind'], ref: string) => {
		const key = kind + ':' + ref;
		setMenu(false);
		const nz = ++zRef.current;
		const size = kind === 'folder' ? { w: 640, h: 440 } : { w: 430, h: 520 };
		setWins((ws) => {
			if (ws.some((w) => w.key === key)) return ws.map((w) => (w.key === key ? { ...w, z: nz, min: false } : w));
			const n = ws.length % 8;
			return [...ws, { key, kind, ref, x: (kind === 'folder' ? 150 : 520) + n * 28, y: 30 + n * 26, ...size, z: nz, min: false }];
		});
	};
	const close = (key: string) => {
		setWins((ws) => ws.filter((w) => w.key !== key));
		if (key === 'game:' + sel?.appid) select(null);
	};
	// a game chosen elsewhere (command bar, menus) opens its Properties window
	useEffect(() => { if (sel) open('game', String(sel.appid)); }, [sel?.appid]);
	const title = (w: Win) => (w.kind === 'folder' ? folders.find((f) => f.id === w.ref)?.name ?? 'Folder' : (library.find((g) => g.appid === Number(w.ref))?.name ?? 'Game') + ' Properties');
	return (
		<AltPage className="rt" brand={<><i className="rt-logo" />Kestrel OS</>}>
			<div className="rt-desktop" onPointerDown={(e) => { if (e.target === e.currentTarget) { setPicked(null); setMenu(false); } }}>
				<div className="rt-icons">
					{folders.map((f) => (
						<button key={f.id} className={'rt-dicon' + (picked === f.id ? ' on' : '')} onClick={() => setPicked(f.id)} onDoubleClick={() => open('folder', f.id)} onKeyDown={(e) => e.key === 'Enter' && open('folder', f.id)}>
							<FolderIcon /><span>{f.name}</span>
						</button>
					))}
					<button className={'rt-dicon' + (picked === 'settings' ? ' on' : '')} onClick={() => setPicked('settings')} onDoubleClick={() => setState({ settingsOpen: true })}>
						<svg viewBox="0 0 32 32" className="rt-ficon"><rect x="3" y="5" width="26" height="18" fill="#C0C0C0" stroke="#222" /><rect x="6" y="8" width="20" height="12" fill="#2C5E8C" /><rect x="10" y="24" width="12" height="3" fill="#888" /></svg>
						<span>Control Panel</span>
					</button>
				</div>
				{wins.map((w) => {
					const f = w.kind === 'folder' ? folders.find((x) => x.id === w.ref) : null;
					const g = w.kind === 'game' ? library.find((x) => x.appid === Number(w.ref)) : null;
					const props = { w, title: title(w), active: top?.key === w.key, onFocus: () => top?.key !== w.key && focus(w.key), onMove: (x: number, y: number) => setWins((ws) => ws.map((v) => (v.key === w.key ? { ...v, x, y } : v))), onMin: () => setWins((ws) => ws.map((v) => (v.key === w.key ? { ...v, min: true } : v))), onClose: () => close(w.key) };
					if (f) return (
						<Frame key={w.key} {...props} icon={<FolderIcon open />} status={<><span>{f.games.length} object(s)</span><span>{formatBytes(f.games.reduce((s, x) => s + x.sizeOnDisk, 0)) || '0 bytes'}</span></>}>
							<div className="rt-files">{f.games.map((x) => (
								<button key={x.appid} data-appid={x.appid} className="rt-file" onDoubleClick={() => select(x.appid)} onKeyDown={(e) => e.key === 'Enter' && select(x.appid)} title={`${x.name}\n${formatPlaytime(x.minutes)}${x.lastPlayed ? ' · ' + formatAgo(x.lastPlayed) : ''}`}>
									<span className={'rt-gicon' + (x.installed ? '' : ' ghost')}><Art g={x} kind="capsule" /></span><span className="rt-fname">{x.name}</span>
								</button>
							))}</div>
						</Frame>
					);
					if (g) return <Frame key={w.key} {...props} icon={<span className="rt-mini"><Art g={g} kind="capsule" /></span>}><GameDialog g={g} close={() => close(w.key)} /></Frame>;
					return null;
				})}
				{menu && (
					<nav className="rt-menu">
						<div className="rt-menu-side"><b>Kestrel</b> OS</div>
						<div className="rt-menu-items">
							<h4>Recent games</h4>
							{lists.recent.slice(0, 6).map((g) => <button key={g.appid} onClick={() => { setMenu(false); select(g.appid); }}><span className="rt-mini"><Art g={g} kind="capsule" /></span>{g.name}</button>)}
							<hr />
							<h4>Folders</h4>
							{folders.map((f) => <button key={f.id} onClick={() => open('folder', f.id)}><FolderIcon />{f.name}</button>)}
							<hr />
							<button onClick={() => { setMenu(false); setState({ settingsOpen: true }); }}>Kestrel settings…</button>
						</div>
					</nav>
				)}
			</div>
			<footer className="rt-taskbar">
				<button className={'rt-start' + (menu ? ' down' : '')} onClick={() => setMenu(!menu)}><i className="rt-logo" />Menu</button>
				<i className="rt-sep" />
				<div className="rt-tasks">{wins.map((w) => <button key={w.key} className={top?.key === w.key ? 'down' : ''} onClick={() => (top?.key === w.key ? setWins((ws) => ws.map((v) => (v.key === w.key ? { ...v, min: true } : v))) : focus(w.key))}>{title(w)}</button>)}</div>
				<div className="rt-tray">{clock.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</div>
			</footer>
		</AltPage>
	);
}

export const retroCss = `
html.kestrel[data-ui="retro"] { --k-ink: #2E4A62; --k-s1: #D4D0C8; --k-s2: #C8C4BC; --k-s3: #B8B4AC; --k-s4: #A09C94; --k-line: rgba(0,0,0,.2); --k-line-2: rgba(0,0,0,.35);
	--k-fg: #000; --k-fg-2: #222; --k-fg-3: #555; --k-accent: #5A2D82; --k-accent-2: #7B4AA8; --k-on-accent: #FFF; --k-a10: rgba(90,45,130,.1); --k-a20: rgba(90,45,130,.2); --k-a40: rgba(90,45,130,.4);
	--rt-font: Tahoma, "Segoe UI", sans-serif; --rt-hi: #FFFFFF; --rt-lo: #808080; --rt-dk: #000; --rt-face: #D4D0C8;
	--rt-out: inset -1px -1px var(--rt-dk), inset 1px 1px var(--rt-hi), inset -2px -2px var(--rt-lo), inset 2px 2px #E8E6E0;
	--rt-in: inset -1px -1px var(--rt-hi), inset 1px 1px var(--rt-lo), inset -2px -2px #E8E6E0, inset 2px 2px var(--rt-dk); }
html.kestrel[data-ui="retro"] .k-top { background: var(--rt-face); box-shadow: inset 0 -1px var(--rt-lo), inset 0 -2px var(--rt-hi); border: 0; }
.rt-brand { display: flex; align-items: center; gap: 8px; font: 700 14px var(--rt-font); color: #000; }
.rt-logo { display: inline-block; width: 18px; height: 18px; background: conic-gradient(#E5484D 0 25%, #2E9E5B 0 50%, #1E88E5 0 75%, #F2C230 0); clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }
.rt-stage { background: #2E4A62; }
.rt-desktop { position: absolute; inset: 0 0 40px 0; z-index: 0; overflow: hidden; font: 12px var(--rt-font); color: #000;
	background: #2E4A62 repeating-conic-gradient(rgba(255,255,255,.035) 0 25%, transparent 0 50%) 0 0 / 4px 4px; }
.rt-icons { position: absolute; left: 10px; top: 10px; bottom: 10px; display: flex; flex-direction: column; flex-wrap: wrap; align-content: flex-start; gap: 6px; }
.rt-dicon { width: 86px; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 4px 2px; font: 12px var(--rt-font); color: #fff; }
.rt-dicon span { padding: 1px 3px; text-align: center; line-height: 1.2; text-shadow: 1px 1px #000; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.rt-dicon.on span { background: #5A2D82; text-shadow: none; outline: 1px dotted #fff; }
.rt-dicon.on .rt-ficon { filter: sepia(1) hue-rotate(220deg) saturate(3) brightness(.8); }
.rt-ficon { width: 36px; height: 36px; flex: none; }
.rt-win { position: absolute; display: flex; flex-direction: column; padding: 3px; background: var(--rt-face); box-shadow: var(--rt-out), 4px 4px 0 rgba(0,0,0,.25); min-width: 260px; animation: rt-open 160ms steps(4) both; }
@keyframes rt-open { from { transform: scale(.6); opacity: 0; } }
.rt-title { flex: none; display: flex; align-items: center; gap: 6px; height: 22px; padding: 0 3px 0 4px; background: linear-gradient(90deg, #808080, #B0B0B0); color: #D4D0C8; cursor: default; user-select: none; touch-action: none; }
.rt-win.on .rt-title { background: linear-gradient(90deg, #3E1A63, #8A55C4); color: #fff; }
.rt-title b { flex: 1; min-width: 0; font: 700 12px var(--rt-font); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rt-title .rt-ficon { width: 16px; height: 16px; }
.rt-tb { width: 18px; height: 16px; display: grid; place-items: center; background: var(--rt-face) !important; box-shadow: var(--rt-out); color: #000; }
.rt-tb:active { box-shadow: var(--rt-in); }
.rt-tb .min { width: 7px; height: 2px; margin-top: 6px; background: #000; } .rt-tb .x { font: 700 14px/1 var(--rt-font); font-style: normal; }
.rt-body { flex: 1; min-height: 0; margin-top: 3px; overflow: auto; background: #fff; box-shadow: var(--rt-in); }
.rt-body::-webkit-scrollbar { width: 16px; height: 16px; } .rt-body::-webkit-scrollbar-track { background: repeating-conic-gradient(#fff 0 25%, #D4D0C8 0 50%) 0 0 / 2px 2px; }
.rt-body::-webkit-scrollbar-thumb { background: var(--rt-face); box-shadow: var(--rt-out); }
.rt-status { flex: none; display: flex; gap: 3px; margin-top: 3px; } .rt-status span { flex: 1; padding: 2px 6px; box-shadow: inset -1px -1px #fff, inset 1px 1px #808080; font: 11px var(--rt-font); }
.rt-files { display: grid; grid-template-columns: repeat(auto-fill, 92px); gap: 10px 4px; padding: 10px; align-content: start; }
.rt-file { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 2px; font: 11.5px var(--rt-font); color: #000; }
.rt-file:focus { outline: none; } .rt-file:focus .rt-fname { background: #5A2D82; color: #fff; outline: 1px dotted #000; }
.rt-gicon { width: 40px; height: 54px; flex: none; box-shadow: 1px 1px 0 #000; } .rt-gicon img, .rt-gicon .alt-noart { width: 100%; height: 100%; object-fit: cover; display: block; font-size: 6px; padding: 1px; }
.rt-gicon.ghost { opacity: .55; filter: grayscale(.6); }
.rt-fname { padding: 0 2px; text-align: center; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.rt-mini { width: 14px; height: 16px; flex: none; display: inline-block; overflow: hidden; } .rt-mini img, .rt-mini .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 3px; }
.rt-dialog { height: 100%; display: flex; flex-direction: column; padding: 8px; background: var(--rt-face); }
.rt-win .rt-body:has(.rt-dialog) { background: var(--rt-face); box-shadow: none; }
.rt-tabs { display: flex; gap: 0; padding-left: 4px; }
.rt-tabs button { padding: 3px 10px; margin-bottom: -1px; font: 12px var(--rt-font); color: #000; background: var(--rt-face) !important; box-shadow: inset 1px 1px #fff, inset -1px 0 #000, inset -2px 0 #808080; border-radius: 3px 3px 0 0; }
.rt-tabs button.on { position: relative; z-index: 1; padding-bottom: 5px; margin-top: -2px; }
.rt-panel { flex: 1; min-height: 0; overflow-y: auto; padding: 12px; box-shadow: var(--rt-out); }
.rt-gen { display: flex; align-items: center; gap: 14px; } .rt-gen b { font: 12px var(--rt-font); }
.rt-panel hr { border: 0; height: 2px; margin: 10px 0; box-shadow: inset 0 1px #808080, inset 0 -1px #fff; }
.rt-panel dl { display: grid; grid-template-columns: 96px 1fr; gap: 6px 8px; margin: 0; font: 12px var(--rt-font); } .rt-panel dd { margin: 0; word-break: break-word; }
.rt-shot { margin-bottom: 10px; box-shadow: var(--rt-in); padding: 2px; } .rt-shot img, .rt-shot .alt-noart { width: 100%; display: block; }
.rt-desc { margin: 10px 0 0; font: 12px/1.45 var(--rt-font); }
.rt-short { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.rt-btns { display: flex; justify-content: flex-end; gap: 6px; padding-top: 8px; }
.rt-btn { min-width: 80px; height: 24px; padding: 0 10px; font: 12px var(--rt-font); color: #000; background: var(--rt-face) !important; box-shadow: var(--rt-out); }
.rt-btn:active { box-shadow: var(--rt-in); } .rt-btn.def { outline: 1px solid #000; outline-offset: -1px; font-weight: 700; } .rt-btn.wide { min-width: 200px; text-align: left; }
.rt-taskbar { position: absolute; left: 0; right: 0; bottom: 0; height: 40px; display: flex; align-items: center; gap: 4px; padding: 4px; background: var(--rt-face); box-shadow: inset 0 1px #E8E6E0, inset 0 2px #fff; font: 12px var(--rt-font); z-index: 50; }
.rt-start { display: flex; align-items: center; gap: 6px; height: 30px; padding: 0 10px; font: 700 13px var(--rt-font); color: #000; background: var(--rt-face) !important; box-shadow: var(--rt-out); }
.rt-start.down, .rt-tasks button.down { box-shadow: var(--rt-in); background: repeating-conic-gradient(#fff 0 25%, #D4D0C8 0 50%) 0 0 / 2px 2px !important; }
.rt-sep { width: 2px; height: 28px; box-shadow: inset 1px 0 #808080, inset -1px 0 #fff; }
.rt-tasks { flex: 1; min-width: 0; display: flex; gap: 4px; overflow: hidden; }
.rt-tasks button { flex: 0 1 180px; min-width: 60px; height: 30px; padding: 0 8px; text-align: left; font: 12px var(--rt-font); color: #000; background: var(--rt-face) !important; box-shadow: var(--rt-out); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rt-tray { height: 30px; display: flex; align-items: center; padding: 0 12px; box-shadow: inset -1px -1px #fff, inset 1px 1px #808080; }
.rt-menu { position: absolute; left: 4px; bottom: 2px; z-index: 1000000; display: flex; max-height: calc(100% - 10px); background: var(--rt-face); box-shadow: var(--rt-out), 4px 4px 0 rgba(0,0,0,.25); padding: 3px; animation: rt-menu 150ms steps(3) both; }
@keyframes rt-menu { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0); } }
.rt-menu-side { width: 26px; background: linear-gradient(#8A55C4, #3E1A63); color: #D4D0C8; writing-mode: vertical-rl; transform: rotate(180deg); padding: 8px 0; font: 18px var(--rt-font); }
.rt-menu-side b { color: #fff; font-weight: 900; }
.rt-menu-items { width: 280px; overflow-y: auto; padding: 2px; }
.rt-menu-items h4 { margin: 4px 8px 2px; font: 700 11px var(--rt-font); color: #555; }
.rt-menu-items button { width: 100%; display: flex; align-items: center; gap: 8px; height: 28px; padding: 0 8px; text-align: left; font: 12px var(--rt-font); color: #000; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rt-menu-items button .rt-ficon { width: 20px; height: 20px; } .rt-menu-items button .rt-mini { width: 18px; height: 22px; }
.rt-menu-items button:hover { background: #5A2D82 !important; color: #fff; }
.rt-menu-items hr { border: 0; height: 2px; margin: 3px 2px; box-shadow: inset 0 1px #808080, inset 0 -1px #fff; }
`;
