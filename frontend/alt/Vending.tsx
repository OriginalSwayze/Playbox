// VENDING — a games vending machine. Games stand in coiled slots behind the glass, coded A1 to F6; key a code on
// the keypad (or the keyboard), the coil turns, the game drops into the tray, and its label reads like a snack's.
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { mainWindow } from '../steam/env';
import { Actions, AltPage, Art, gameCommands, useIslands, useLibraryLists, useSelectedGame } from './common';

const ROWS = 'ABCDEF';
const COLS = 6;
const PER = ROWS.length * COLS;

function Facts({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const go = gameCommands(g)[0];
	const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
	return (
		<div className="vd-dim" onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<article className="vd-pack">
				<div className="vd-wrapper"><Art g={g} kind="hero" /><b>{g.name}</b></div>
				<div className="vd-facts">
					<h2>Game Facts</h2>
					<p className="vd-serv">Serving size 1 game · servings so far {g.minutes ? Math.max(1, Math.round(g.minutes / 90)) : 0}</p>
					<div className="vd-rule thick" />
					<div className="vd-row big"><b>Hours played</b><b>{(g.minutes / 60).toFixed(g.minutes < 600 ? 1 : 0)}</b></div>
					<div className="vd-rule" />
					<p className="vd-dv">% Completion*</p>
					<div className="vd-row"><span><b>Achievements</b> {d.achievements.total ? `${d.achievements.achieved} of ${d.achievements.total}` : 'none'}</span><b>{pct(d.achievements.achieved, d.achievements.total)}%</b></div>
					<div className="vd-row"><span><b>This fortnight</b> {formatPlaytime(g.minutes2w)}</span><b>{pct(g.minutes2w, Math.max(g.minutes, 1))}%</b></div>
					<div className="vd-row"><span><b>Size on disk</b> {formatBytes(d.disk || g.sizeOnDisk) || 'not installed'}</span><b /></div>
					<div className="vd-row"><span><b>Last eaten</b> {g.lastPlayed ? formatAgo(g.lastPlayed) : 'still sealed'}</span><b /></div>
					<div className="vd-rule thick" />
					<p className="vd-ing"><b>Ingredients:</b> {[d.developer, d.publisher].filter(Boolean).filter((x, i, a) => a.indexOf(x) === i).join(', ') || 'unknown'}{d.platforms.length ? `; made for ${d.platforms.join(', ')}` : ''}.</p>
					<p className="vd-note">* Completion is achievements unlocked, and the share of your hours from the last two weeks.</p>
					<button className="vd-eat" onClick={go.run}>{g.installed ? 'Play now' : 'Install'}</button>
					<Actions g={g} className="vd-actions" />
				</div>
				<button className="vd-close" onClick={close} aria-label="Close">×</button>
			</article>
		</div>
	);
}

export function Vending() {
	const lists = useLibraryLists();
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const [sel, select] = useSelectedGame();
	const [machine, setMachine] = useState('installed');
	const [page, setPage] = useState(0);
	const [code, setCode] = useState('');
	const [msg, setMsg] = useState('');
	const [spinning, setSpinning] = useState<number | null>(null);
	const [tray, setTray] = useState<Game | null>(null);
	const machines = useMemo(() => [
		{ id: 'installed', name: 'Installed', games: lists.installed },
		{ id: 'recent', name: 'Recently played', games: lists.recent },
		{ id: 'sealed', name: 'Still sealed', games: lists.unplayed },
		...islands.map((i) => ({ id: i.id, name: i.name, games: i.games })),
	].filter((m) => m.games.length), [lists, islands]);
	const m = machines.find((x) => x.id === machine) ?? machines[0];
	const pages = m ? Math.max(1, Math.ceil(m.games.length / PER)) : 1;
	const stock = m ? m.games.slice(page * PER, page * PER + PER) : [];
	const timer = useRef(0);

	const vend = (c: string) => {
		const r = ROWS.indexOf(c[0]);
		const n = Number(c[1]) - 1;
		const g = stock[r * COLS + n];
		if (!g) { setMsg('Sold out'); setCode(''); return; }
		setMsg(g.name);
		setSpinning(g.appid);
		window.clearTimeout(timer.current);
		timer.current = window.setTimeout(() => { setSpinning(null); setTray(g); setCode(''); }, 900);
	};
	const press = (k: string) => {
		if (spinning) return;
		if (k === 'CLR') { setCode(''); setMsg(''); return; }
		if (ROWS.includes(k)) { setCode(k); setMsg(''); return; }
		if (/^[1-6]$/.test(k) && code.length === 1) { const c = code + k; setCode(c); vend(c); }
	};
	const pressRef = useRef(press);
	pressRef.current = press;
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const t = e.target as HTMLElement;
			if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) || e.ctrlKey || e.altKey || e.metaKey) return;
			const k = e.key.toUpperCase();
			const clr = e.key === 'Escape' || e.key === 'Backspace';
			if (!(ROWS.includes(k) && e.key.length === 1) && !/^[1-6]$/.test(k) && !clr) return;
			// claim the key so Steam's hidden library does not type-ahead to a game
			e.preventDefault(); e.stopPropagation();
			pressRef.current(clr ? 'CLR' : k);
		};
		const win = mainWindow()?.BrowserWindow; // keys arrive in Steam's main window, not this shared context
		win?.addEventListener('keydown', onKey, true);
		return () => { win?.removeEventListener('keydown', onKey, true); window.clearTimeout(timer.current); };
	}, []);
	useEffect(() => { setPage(0); setCode(''); setMsg(''); }, [machine]);

	return (
		<AltPage className="vd" brand={<><b>SNAX</b>&nbsp;for gamers</>}>
			<div className="vd-room">
				<div className="vd-machine">
					<div className="vd-head"><b>{m?.name ?? 'Empty'}</b><span>{m?.games.length ?? 0} items · rack {page + 1}/{pages}</span></div>
					<div className="vd-glass">
						{ROWS.split('').map((row, r) => (
							<div className="vd-shelf" key={row}>
								{Array.from({ length: COLS }, (_, n) => {
									const g = stock[r * COLS + n];
									const c = row + (n + 1);
									return (
										<button key={c} className={'vd-slot' + (g ? '' : ' empty') + (spinning === g?.appid ? ' spin' : '') + (code === c ? ' on' : '')} onClick={() => g && !spinning && (setCode(c), vend(c))} disabled={!g} title={g?.name}>
											{g && <span className="vd-item"><Art g={g} kind="capsule" /></span>}
											<i className="vd-coil" />
											<span className="vd-price"><b>{c}</b>{g ? (g.minutes ? `${Math.round(g.minutes / 60)}h` : 'NEW') : '—'}</span>
										</button>
									);
								})}
							</div>
						))}
						<i className="vd-shine" />
					</div>
					<div className="vd-tray">
						{tray ? (
							<button key={tray.appid} className="vd-drop" onClick={() => select(tray.appid)}>
								<Art g={tray} kind="capsule" /><span><b>{tray.name}</b><em>Push flap to open · {formatPlaytime(tray.minutes)}</em></span>
							</button>
						) : <span className="vd-push">PUSH</span>}
					</div>
				</div>
				<aside className="vd-panel">
					<div className="vd-display"><b>{code.padEnd(2, '_')}</b><span>{msg || (code ? 'Choose a number' : 'Make a selection')}</span></div>
					<div className="vd-keys">
						{[...ROWS].map((k) => <button key={k} className={code[0] === k ? 'on' : ''} onClick={() => press(k)}>{k}</button>)}
						{['1', '2', '3', '4', '5', '6'].map((k) => <button key={k} onClick={() => press(k)}>{k}</button>)}
						<button className="clr" onClick={() => press('CLR')}>CLR</button>
					</div>
					{tray && <div className="vd-quick">{(() => { const go = gameCommands(tray)[0]; return <button className="vd-eat" onClick={go.run}>{tray.installed ? 'Play' : 'Install'} {tray.name.length > 20 ? tray.name.slice(0, 19) + '…' : tray.name}</button>; })()}</div>}
					<div className="vd-racks">
						<button disabled={page === 0} onClick={() => setPage(page - 1)}>◀ Rack</button>
						<button disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Rack ▶</button>
					</div>
					<label className="vd-pick"><span>Machine</span>
						<select value={m?.id} onChange={(e) => setMachine(e.target.value)}>{machines.map((x) => <option key={x.id} value={x.id}>{x.name} ({x.games.length})</option>)}</select>
					</label>
					<p className="vd-help">Type a letter and a number, or click a slot.</p>
				</aside>
			</div>
			{sel && <Facts key={sel.appid} g={sel} close={() => select(null)} />}
		</AltPage>
	);
}

export const vendingCss = `
html.kestrel[data-ui="vending"] { --k-ink: #10141C; --k-s1: #1A2030; --k-s2: #232B3E; --k-s3: #2E384F; --k-s4: #3A4663; --k-line: rgba(255,255,255,.1); --k-line-2: rgba(255,255,255,.2);
	--k-fg: #F2F4F8; --k-fg-2: #B8C0D0; --k-fg-3: #7D879C; --k-accent: #FF3B3B; --k-accent-2: #FF6B6B; --k-on-accent: #FFF; --k-a10: rgba(255,59,59,.08); --k-a20: rgba(255,59,59,.16); --k-a40: rgba(255,59,59,.35);
	--vd-lcd: "Cascadia Mono", Consolas, monospace; }
html.kestrel[data-ui="vending"] .k-top { background: #C81E1E; border-bottom: 3px solid #8A0F0F; }
html.kestrel[data-ui="vending"] .k-top { --k-fg: #FFFFFF; --k-fg-2: #FFE9E9; --k-fg-3: #FFD0D0; --k-s2: rgba(255,255,255,.14); }
.vd-brand { font: 600 16px var(--k-text); color: #FFE9E9; font-style: italic; } .vd-brand b { font: 900 24px var(--k-display); font-style: italic; letter-spacing: .04em; color: #fff; text-shadow: 2px 2px 0 #8A0F0F; }
.vd-stage { background: #10141C; }
.vd-room { position: absolute; inset: 0; display: flex; justify-content: center; align-items: flex-start; gap: 0; padding: 22px 30px; overflow: auto;
	background: linear-gradient(#10141C 70%, #1A2030), repeating-linear-gradient(90deg, transparent 0 80px, rgba(255,255,255,.02) 80px 81px); }
.vd-machine { flex: 0 1 900px; min-width: 620px; padding: 16px 16px 20px; border-radius: 16px 0 0 16px; background: linear-gradient(90deg, #A3171B, #D42828 8%, #C81E1E 92%, #8A0F0F); box-shadow: 0 40px 60px -20px #000; animation: k-rise 500ms var(--k-out) both; }
.vd-head { display: flex; align-items: baseline; justify-content: space-between; padding: 4px 8px 12px; color: #fff; }
.vd-head b { font: 800 22px var(--k-display); text-transform: uppercase; letter-spacing: .06em; } .vd-head span { font: 600 13px var(--k-text); color: #FFD0D0; }
.vd-glass { position: relative; padding: 10px 14px 4px; border-radius: 8px; background: linear-gradient(#1A1F2A, #0C0F15); box-shadow: inset 0 0 0 6px #2A2F3A, inset 0 0 40px rgba(0,0,0,.8); overflow: hidden; }
.vd-shine { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,.07) 38%, transparent 46%, transparent 60%, rgba(255,255,255,.04) 64%, transparent 70%); }
.vd-shelf { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; padding: 10px 4px 0; border-bottom: 6px solid #3C4455; box-shadow: 0 6px 0 #232836; margin-bottom: 10px; }
.vd-slot { position: relative; display: flex; flex-direction: column; align-items: center; height: 176px; justify-content: flex-end; }
.vd-slot.empty { opacity: .35; cursor: default; }
.vd-item { position: relative; z-index: 1; height: 128px; aspect-ratio: 2 / 3; margin-bottom: -10px; transform-origin: 50% 100%; transition: transform .25s var(--k-spring), filter .2s; box-shadow: 0 6px 12px -4px #000; }
.vd-item img, .vd-item .alt-noart { width: 100%; height: 100%; object-fit: cover; border-radius: 3px; display: block; }
.vd-slot:not(.empty):hover .vd-item { transform: translateY(-6px) rotate(-3deg); filter: brightness(1.15); }
.vd-slot.on .vd-item { filter: brightness(1.2) drop-shadow(0 0 10px rgba(255,220,120,.6)); }
.vd-slot.spin .vd-item { animation: vd-fall 900ms cubic-bezier(.5,0,.9,.4) forwards; }
@keyframes vd-fall { 0% { transform: none; } 30% { transform: translateY(-4px) rotate(3deg); } 45% { transform: translateY(0) rotate(-8deg); } 100% { transform: translateY(900px) rotate(40deg); opacity: 0; } }
.vd-coil { position: relative; z-index: 2; width: 92%; height: 18px; border-radius: 9px; background: repeating-linear-gradient(100deg, #9AA3B5 0 3px, #5A6276 3px 6px, transparent 6px 12px); opacity: .9; }
.vd-slot.spin .vd-coil { animation: vd-turn 300ms linear 3; }
@keyframes vd-turn { to { background-position: 12px 0; } }
.vd-price { display: flex; gap: 6px; align-items: center; margin-top: 4px; padding: 1px 8px; border-radius: 3px; background: #F6F1D8; font: 700 11px var(--vd-lcd); color: #333; }
.vd-price b { color: #C81E1E; }
.vd-tray { height: 92px; margin: 14px 40px 0; border-radius: 6px; background: linear-gradient(#090B10, #1A1F2A); box-shadow: inset 0 10px 18px #000; display: grid; place-items: center; overflow: hidden; }
.vd-push { font: 800 18px var(--k-display); letter-spacing: .5em; color: #3C4455; }
.vd-drop { display: flex; align-items: center; gap: 14px; height: 74px; padding: 0 18px 0 8px; border-radius: 6px; background: rgba(255,255,255,.06); animation: vd-land 500ms var(--k-spring) both; }
@keyframes vd-land { from { transform: translateY(-80px) rotate(-12deg); opacity: 0; } to { transform: none; opacity: 1; } }
.vd-drop img, .vd-drop .alt-noart { height: 64px; width: 43px; object-fit: cover; border-radius: 3px; transform: rotate(-80deg) translateX(-6px); }
.vd-drop span { display: flex; flex-direction: column; text-align: left; } .vd-drop b { font: 700 15px var(--k-text); color: #fff; } .vd-drop em { font: 12px var(--k-text); font-style: normal; color: #B8C0D0; }
.vd-drop:hover { background: rgba(255,255,255,.12); }
.vd-panel { flex: none; width: 250px; display: flex; flex-direction: column; gap: 14px; padding: 60px 18px 18px; border-radius: 0 16px 16px 0; background: linear-gradient(90deg, #2A2F3A, #3C4455 30%, #2A2F3A); box-shadow: 0 40px 60px -20px #000; align-self: stretch; animation: k-rise 500ms 80ms var(--k-out) both; }
.vd-display { padding: 12px 14px; border-radius: 6px; background: #0F1A0F; box-shadow: inset 0 0 0 2px #000, inset 0 0 16px rgba(80,255,120,.12); font-family: var(--vd-lcd); }
.vd-display b { display: block; font-size: 34px; letter-spacing: .2em; color: #6CFF8F; text-shadow: 0 0 8px rgba(108,255,143,.6); }
.vd-display span { display: block; min-height: 16px; font-size: 12px; color: #4CCB6A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vd-keys { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.vd-keys button { height: 42px; border-radius: 8px; font: 800 17px var(--k-display); color: #1A1F2A; background: linear-gradient(#F4F5F8, #C9CED9) !important; box-shadow: 0 3px 0 #7D879C, 0 4px 8px rgba(0,0,0,.4); transition: transform .08s, box-shadow .08s; }
.vd-keys button:active { transform: translateY(3px); box-shadow: 0 0 0 #7D879C; }
.vd-keys button.on { background: linear-gradient(#FFE08A, #F5C04A) !important; }
.vd-keys button.clr { grid-column: span 3; background: linear-gradient(#FF6B6B, #C81E1E) !important; color: #fff; box-shadow: 0 3px 0 #8A0F0F, 0 4px 8px rgba(0,0,0,.4); }
.vd-eat { width: 100%; height: 42px; border-radius: 8px; background: #22C55E !important; color: #05250F !important; font: 800 14px var(--k-text); box-shadow: 0 3px 0 #15803D; }
.vd-eat:hover { background: #34D96F !important; }
.vd-racks { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.vd-racks button { height: 34px; border-radius: 6px; font: 700 12.5px var(--k-text); color: #F2F4F8; background: #1A1F2A !important; }
.vd-racks button:disabled { opacity: .35; }
.vd-pick { display: flex; flex-direction: column; gap: 5px; font: 700 11px var(--k-text); letter-spacing: .12em; text-transform: uppercase; color: #B8C0D0; }
.vd-pick select { height: 36px; padding: 0 8px; border-radius: 6px; border: 0; background: #1A1F2A; color: #F2F4F8; font: 600 13px var(--k-text); letter-spacing: 0; text-transform: none; }
.vd-help { margin: auto 0 0; font: 12px var(--k-text); color: #7D879C; }
.vd-dim { position: absolute; inset: 0; z-index: 8; display: grid; place-items: center; padding: 30px; background: rgba(5,7,10,.8); animation: k-fade 200ms both; }
.vd-pack { position: relative; display: flex; width: min(900px, 96%); max-height: 100%; border-radius: 14px; overflow: hidden; background: #fff; animation: vd-land 500ms var(--k-spring) both; }
.vd-wrapper { position: relative; flex: 1; min-width: 0; background: #C81E1E; }
.vd-wrapper img, .vd-wrapper .alt-noart { width: 100%; height: 100%; object-fit: cover; opacity: .9; clip-path: polygon(0 3%, 5% 0, 10% 3%, 15% 0, 20% 3%, 25% 0, 30% 3%, 35% 0, 40% 3%, 45% 0, 50% 3%, 55% 0, 60% 3%, 65% 0, 70% 3%, 75% 0, 80% 3%, 85% 0, 90% 3%, 95% 0, 100% 3%, 100% 97%, 95% 100%, 90% 97%, 85% 100%, 80% 97%, 75% 100%, 70% 97%, 65% 100%, 60% 97%, 55% 100%, 50% 97%, 45% 100%, 40% 97%, 35% 100%, 30% 97%, 25% 100%, 20% 97%, 15% 100%, 10% 97%, 5% 100%, 0 97%); }
.vd-wrapper b { position: absolute; left: 22px; right: 22px; bottom: 28px; font: 900 36px/1.05 var(--k-display); font-style: italic; color: #fff; text-shadow: 3px 3px 0 #C81E1E, 0 0 20px rgba(0,0,0,.6); text-transform: uppercase; }
.vd-facts { flex: none; width: 340px; overflow-y: auto; padding: 16px 18px; color: #000; font-family: Arial, Helvetica, sans-serif; border: 2px solid #000; margin: 12px; }
.vd-facts h2 { margin: 0; font: 900 34px/1 "Arial Black", Arial, sans-serif; letter-spacing: -.02em; }
.vd-serv { margin: 4px 0 4px; font-size: 13px; }
.vd-rule { height: 1px; background: #000; margin: 4px 0; } .vd-rule.thick { height: 9px; }
.vd-row { display: flex; justify-content: space-between; gap: 8px; padding: 3px 0; border-bottom: 1px solid #000; font-size: 13.5px; }
.vd-row.big { font-size: 20px; border: 0; } .vd-row span b { font-weight: 900; }
.vd-dv { margin: 2px 0; text-align: right; font: 700 12px Arial, sans-serif; }
.vd-ing { font-size: 12.5px; line-height: 1.4; margin: 8px 0 6px; } .vd-note { font-size: 11px; color: #333; margin: 0 0 12px; }
.vd-actions button { font-family: Arial, sans-serif !important; color: #000 !important; } .vd-actions button:hover { background: #EEE; }
.vd-close { position: absolute; top: 10px; left: 10px; width: 34px; height: 34px; border-radius: 50%; background: rgba(0,0,0,.55) !important; color: #fff; font: 22px/1 var(--k-text); }
`;
