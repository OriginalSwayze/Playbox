// LAUNCHER — a keyboard launcher and nothing else. A single floating search bar over a blurred backdrop: type to
// fuzzy-match your games, ↑ ↓ to move, Enter to play, Tab to see details. With an empty query it suggests recent
// and never-played games.
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as KE } from 'react';
import { useKestrel } from '../state/store';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { AltPage, Art, gameCommands, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';

function score(name: string, q: string) {
	const n = name.toLowerCase(); if (n.startsWith(q)) return 3; if (n.split(/[^a-z0-9]+/).some((w) => w.startsWith(q))) return 2; if (n.includes(q)) return 1;
	let i = 0; for (const c of n) if (c === q[i]) i++; return i === q.length ? 0.5 : 0;
}

export function Launcher() {
	const library = useKestrel((s) => s.library);
	const { recent, unplayed } = useLibraryLists();
	const [sel, select] = useSelectedGame();
	const [q, setQ] = useState('');
	const [i, setI] = useState(0);
	const [info, setInfo] = useState(false);
	const box = useRef<HTMLInputElement>(null);
	const res = useMemo(() => { const t = q.trim().toLowerCase(); if (!t) return [...recent.slice(0, 6), ...unplayed.slice(0, 4)]; return library.map((g) => ({ g, s: score(g.name, t) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || b.g.lastPlayed - a.g.lastPlayed).slice(0, 9).map((x) => x.g); }, [q, library, recent, unplayed]);
	useEffect(() => setI(0), [q]);
	useEffect(() => { box.current?.focus(); }, []);
	const cur: Game | null = sel ?? res[i] ?? null;
	const key = (e: KE) => {
		e.stopPropagation();
		if (e.key === 'ArrowDown') { setI((x) => Math.min(res.length - 1, x + 1)); e.preventDefault(); } else if (e.key === 'ArrowUp') { setI((x) => Math.max(0, x - 1)); e.preventDefault(); }
		else if (e.key === 'Enter' && res[i]) gameCommands(res[i])[0].run(); else if (e.key === 'Tab' && res[i]) { e.preventDefault(); select(res[i].appid); setInfo(true); } else if (e.key === 'Escape') { setQ(''); setInfo(false); select(null); }
	};
	return (
		<AltPage className="lch" brand={<>⌘ Launcher</>}>
			<div className="lch-app" onClick={() => box.current?.focus()}>
				{cur && <Art g={cur} kind="hero" className="lch-back" key={cur.appid} />}
				<div className="lch-panel" onClick={(e) => e.stopPropagation()}>
					<label className="lch-bar"><span>⌕</span><input ref={box} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={key} placeholder="Launch a game…" spellCheck={false} /><kbd>↵</kbd></label>
					<div className="lch-body">
						<div className="lch-list">{!q.trim() && <h6>Suggestions</h6>}{res.map((g, k) => (
							<button key={g.appid} data-appid={g.appid} className={'lch-row' + (k === i ? ' on' : '')} onMouseEnter={() => { setI(k); if (sel && !info) select(null); }} onClick={() => { select(g.appid); setInfo(true); }} onDoubleClick={() => gameCommands(g)[0].run()}>
								{g.icon ? <img src={g.icon} alt="" /> : <i />}<span><b>{g.name}</b><em>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never played'}</em></span><kbd>{k === i ? (g.installed ? 'Play ↵' : 'Install ↵') : ''}</kbd>
							</button>))}{!res.length && <p className="lch-none">No matches for “{q}”.</p>}</div>
						{cur && (() => { const g = cur; return (
							<div className="lch-info" key={g.appid}><Art g={g} kind="capsule" /><h3>{g.name}</h3><dl><dt>Played</dt><dd>{formatPlaytime(g.minutes)}</dd><dt>Size</dt><dd>{g.sizeOnDisk ? formatBytes(g.sizeOnDisk) : '—'}</dd><dt>Status</dt><dd>{g.installed ? 'Installed' : 'Not installed'}</dd></dl>
								<div className="lch-acts">{gameCommands(g).map((c, k) => <button key={c.id} className={k ? '' : 'p'} onClick={c.run}>{k ? c.label : g.installed ? 'Play' : 'Install'}</button>)}</div></div>); })()}
					</div>
					<div className="lch-foot"><span>↑↓ select</span><span>↵ play</span><span>⇥ details</span><span>esc clear</span></div>
				</div>
			</div>
		</AltPage>
	);
}

export const launcherCss = tok('launcher', { bg: '#101014', s1: 'rgba(255,255,255,.08)', s2: 'rgba(255,255,255,.12)', s3: 'rgba(255,255,255,.2)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.75)', fg3: 'rgba(255,255,255,.5)', acc: '#FF6363', on: '#fff', top: 'transparent', font: '"Segoe UI", Inter, system-ui, sans-serif' }) + `
html.kestrel[data-ui="launcher"] .k-top { position: relative; z-index: 2; border: 0; }
.lch-brand { font: 600 16px var(--k-text); color: #fff; }
.lch-app { position: absolute; inset: 0; display: grid; place-items: start center; padding-top: 10vh; overflow: hidden; background: #101014; }
.lch-back { position: absolute; inset: -40px; width: calc(100% + 80px); height: calc(100% + 80px); object-fit: cover; filter: blur(40px) brightness(.45) saturate(1.3); animation: k-fade .6s both; }
.lch-panel { position: relative; width: min(760px, 92%); border-radius: 16px; background: rgba(28,28,34,.82); backdrop-filter: blur(30px); box-shadow: 0 0 0 1px rgba(255,255,255,.1), 0 30px 80px rgba(0,0,0,.6); overflow: hidden; }
.lch-bar { display: flex; gap: 12px; align-items: center; height: 64px; padding: 0 20px; border-bottom: 1px solid rgba(255,255,255,.08); color: rgba(255,255,255,.5); font-size: 22px; } .lch-bar input { flex: 1; border: 0; outline: none; background: none; font: 300 22px var(--k-text); color: #fff; }
kbd { padding: 2px 7px; border-radius: 5px; background: rgba(255,255,255,.1); font: 600 11px var(--k-text); color: rgba(255,255,255,.6); }
.lch-body { display: grid; grid-template-columns: minmax(0, 1fr) 240px; height: 400px; } .lch-list { overflow-y: auto; padding: 8px; } .lch-list h6 { margin: 6px 10px; font: 600 11px var(--k-text); color: rgba(255,255,255,.45); }
.lch-row { display: flex; gap: 12px; align-items: center; width: 100%; height: 48px; padding: 0 12px; border-radius: 10px; text-align: left; color: #fff; } .lch-row.on { background: rgba(255,255,255,.1); } .lch-row img, .lch-row > i { width: 24px; height: 24px; border-radius: 6px; background: rgba(255,255,255,.1); flex: none; }
.lch-row span { flex: 1; min-width: 0; } .lch-row b { display: block; font: 500 14px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .lch-row em { font: 12px var(--k-text); font-style: normal; color: rgba(255,255,255,.5); }
.lch-none { padding: 20px; color: rgba(255,255,255,.5); }
.lch-info { padding: 14px; border-left: 1px solid rgba(255,255,255,.08); overflow-y: auto; color: #fff; animation: k-fade .2s both; } .lch-info img { width: 110px; border-radius: 8px; display: block; margin: 0 auto 10px; } .lch-info h3 { margin: 0 0 10px; font: 600 15px var(--k-text); text-align: center; }
.lch-info dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; margin: 0 0 12px; font: 12px var(--k-text); } .lch-info dt { color: rgba(255,255,255,.5); } .lch-info dd { margin: 0; }
.lch-acts { display: grid; gap: 4px; } .lch-acts button { height: 30px; border-radius: 8px; background: rgba(255,255,255,.08); font: 500 12px var(--k-text); color: #fff; } .lch-acts button.p { background: #FF6363; } .lch-acts button:hover { filter: brightness(1.2); }
.lch-foot { display: flex; gap: 18px; padding: 10px 16px; border-top: 1px solid rgba(255,255,255,.08); font: 12px var(--k-text); color: rgba(255,255,255,.45); }
`;
