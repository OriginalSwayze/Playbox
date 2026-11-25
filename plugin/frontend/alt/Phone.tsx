// PHONE — an early-2000s mobile phone. The backlit screen shows a menu of games; the D-pad moves, the soft keys select
// and go back, and the number pad jumps by letter (2 = ABC…). A game's screen offers Play under Options.
import { useEffect, useRef, useState } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { AltPage, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const KEYS = [['1', '.,'], ['2', 'abc'], ['3', 'def'], ['4', 'ghi'], ['5', 'jkl'], ['6', 'mno'], ['7', 'pqrs'], ['8', 'tuv'], ['9', 'wxyz'], ['*', '+'], ['0', '␣'], ['#', '⇧']];

export function Phone() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const [i, setI] = useState(0);
	const [menu, setMenu] = useState<'list' | 'opts'>('list');
	const [mode, setMode] = useState<'games' | 'folders'>('folders');
	const list = useRef<HTMLDivElement>(null);
	const items = mode === 'folders' ? b.islands.map((x) => x.name) : b.games.map((g) => g.name);
	const opts = sel ? gameCommands(sel) : [];
	useEffect(() => { list.current?.querySelector('.on')?.scrollIntoView({ block: 'nearest' }); }, [i, mode, menu]);
	const up = () => setI((x) => Math.max(0, x - 1));
	const down = () => setI((x) => Math.min((sel ? (menu === 'opts' ? opts.length : 1) : items.length) - 1, x + 1));
	const ok = () => {
		if (sel) { if (menu === 'list') { setMenu('opts'); setI(0); } else opts[i]?.run(); return; }
		if (mode === 'folders') { const isl = b.islands[i]; if (isl) { b.setCur(isl.id); setMode('games'); setI(0); } } else { const g = b.games[i]; if (g) { select(g.appid); setMenu('list'); setI(0); } }
	};
	const back = () => { if (sel) { if (menu === 'opts') { setMenu('list'); setI(0); } else { select(null); setI(0); } } else if (mode === 'games') { setMode('folders'); setI(0); } };
	const t9 = (letters: string) => { if (mode !== 'games' || sel) return; const k = b.games.findIndex((g) => letters.includes(g.name[0]?.toLowerCase())); if (k >= 0) setI(k); };
	return (
		<AltPage className="fph" brand={<>KESTREL·MOBILE</>}>
			<div className="fph-app">
				<div className="fph-phone">
					<div className="fph-ear" />
					<div className="fph-screen">
						<div className="fph-status"><span>▂▄▆█</span><b>{new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</b><span>▮▮▮▯</span></div>
						<div className="fph-head">{sel ? (menu === 'opts' ? 'Options' : sel.name) : mode === 'folders' ? 'Menu' : b.isle?.name}</div>
						<div className="fph-list" ref={list}>
							{sel ? (menu === 'opts' ? opts.map((o, k) => <div key={o.id} className={k === i ? 'on' : ''} onClick={() => { setI(k); o.run(); }}>{k + 1} {o.primary ? (sel.installed ? 'Play' : 'Install') : o.label}</div>)
								: <div className="fph-info"><p>Played: {formatPlaytime(sel.minutes)}</p><p>Last: {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never'}</p><p>{sel.installed ? 'Installed' : 'Not installed'}</p><p className="on">▸ Options</p></div>)
								: items.slice(0, 400).map((n, k) => <div key={k} data-appid={mode === 'games' ? b.games[k]?.appid : undefined} className={k === i ? 'on' : ''} onClick={() => { if (mode === 'games') { const g = b.games[k]; if (g) { select(g.appid); setMenu('list'); setI(0); } } else { setI(k); const isl = b.islands[k]; if (isl) { b.setCur(isl.id); setMode('games'); setI(0); } } }}>{mode === 'folders' ? '▣' : '♦'} {n}</div>)}
						</div>
						<div className="fph-soft"><span>{sel ? (menu === 'list' ? 'Options' : 'Select') : 'Select'}</span><span>Back</span></div>
					</div>
					<div className="fph-nav">
						<button className="fph-sk l" onClick={ok}>—</button>
						<div className="fph-dpad"><button className="u" onClick={up}>▲</button><button className="l" onClick={back}>◀</button><button className="c" onClick={ok}>OK</button><button className="r" onClick={ok}>▶</button><button className="d" onClick={down}>▼</button></div>
						<button className="fph-sk r" onClick={back}>—</button>
						<button className="fph-call" onClick={() => sel && gameCommands(sel)[0].run()}>✆</button><button className="fph-end" onClick={() => { select(null); setMode('folders'); setI(0); setMenu('list'); }}>✆</button>
					</div>
					<div className="fph-keys">{KEYS.map(([k, l]) => <button key={k} onClick={() => t9(l)}><b>{k}</b><em>{l}</em></button>)}</div>
				</div>
				<p className="fph-help">Arrows move · OK selects · ◀ goes back · number keys jump to a letter · green key plays the open game</p>
			</div>
		</AltPage>
	);
}

export const phoneCss = tok('phone', { bg: '#20324A', s1: '#2B4060', s2: '#355078', s3: '#406090', fg: '#EAF1FA', fg2: '#BFD0E6', fg3: '#8FA6C4', acc: '#9ED36A', on: '#16240A', top: '#182638', font: '"Segoe UI", system-ui, sans-serif' }) + `
.fph-brand { font: 800 14px var(--k-text); letter-spacing: .2em; color: #EAF1FA; }
.fph-app { position: absolute; inset: 0; display: grid; place-items: center; align-content: center; gap: 14px; background: radial-gradient(circle at 50% 40%, #355078, #182638); overflow-y: auto; }
.fph-phone { width: 300px; padding: 20px 22px 26px; border-radius: 60px 60px 70px 70px; background: linear-gradient(160deg, #C9CFD6, #7D868F); box-shadow: 0 30px 60px -20px #000, inset 0 2px 0 #fff, inset 0 -6px 14px rgba(0,0,0,.3); }
.fph-ear { width: 60px; height: 6px; margin: 4px auto 14px; border-radius: 3px; background: #3A4048; box-shadow: inset 0 1px 2px #000; }
.fph-screen { height: 250px; display: grid; grid-template-rows: 18px 24px minmax(0, 1fr) 20px; padding: 6px 8px; border-radius: 8px; background: #9ED36A; box-shadow: inset 0 0 0 4px #2B3A20, inset 0 0 30px rgba(40,70,10,.5); font: 13px "Lucida Console", Consolas, monospace; color: #1A2A0C; }
.fph-status { display: flex; justify-content: space-between; font-size: 10px; } .fph-head { border-bottom: 2px solid #1A2A0C; font-weight: 700; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fph-list { overflow: hidden; padding-top: 3px; } .fph-list > div { padding: 1px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer; } .fph-list > div.on, .fph-info p.on { background: #1A2A0C; color: #9ED36A; }
.fph-info p { margin: 2px 0; padding: 1px 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fph-soft { display: flex; justify-content: space-between; border-top: 1px solid #1A2A0C; font-weight: 700; font-size: 12px; }
.fph-nav { display: grid; grid-template-columns: 1fr auto 1fr; grid-template-rows: 1fr 1fr; gap: 6px 10px; align-items: center; margin: 16px 0 12px; }
.fph-sk { height: 22px; border-radius: 10px; background: linear-gradient(#EEF1F4, #B9C0C8); box-shadow: 0 2px 0 #5D656D; color: #3A4048; } .fph-sk.l { grid-column: 1; } .fph-sk.r { grid-column: 3; grid-row: 1; }
.fph-dpad { grid-column: 2; grid-row: 1 / 3; position: relative; width: 104px; height: 104px; border-radius: 50%; background: radial-gradient(circle, #D9DEE3 30%, #A8B0B8); box-shadow: 0 3px 0 #5D656D, inset 0 1px 0 #fff; }
.fph-dpad button { position: absolute; width: 34px; height: 34px; font: 700 11px var(--k-text); color: #3A4048; } .fph-dpad .u { left: 35px; top: 2px; } .fph-dpad .d { left: 35px; bottom: 2px; } .fph-dpad .l { left: 2px; top: 35px; } .fph-dpad .r { right: 2px; top: 35px; }
.fph-dpad .c { left: 30px; top: 30px; width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(#F3F5F7, #C3CAD1); box-shadow: 0 2px 0 #5D656D; }
.fph-call, .fph-end { height: 26px; border-radius: 12px; font-size: 16px; color: #fff; box-shadow: 0 2px 0 #3A4048; } .fph-call { background: #3DAA4D; grid-column: 1; grid-row: 2; } .fph-end { background: #D9423B; grid-column: 3; grid-row: 2; transform: rotate(135deg); }
.fph-keys { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px 12px; }
.fph-keys button { display: grid; justify-items: center; height: 38px; border-radius: 18px 18px 22px 22px; background: linear-gradient(#F3F5F7, #BEC5CD); box-shadow: 0 3px 0 #5D656D, inset 0 1px 0 #fff; color: #2B3036; } .fph-keys button:active { transform: translateY(2px); box-shadow: 0 1px 0 #5D656D; }
.fph-keys b { font: 700 16px/1.2 var(--k-text); } .fph-keys em { font: 9px var(--k-text); font-style: normal; letter-spacing: .1em; text-transform: uppercase; color: #5D656D; }
.fph-help { margin: 0; font: 12px var(--k-text); color: #8FA6C4; text-align: center; }
`;
