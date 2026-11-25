// LOADOUT — a shooter's loadout screen. Your five most-played games are the equipped slots down the left, the selected
// one sits on the bench with stat bars and a rarity, and the armory below holds the rest. DEPLOY plays it.
import { useMemo, useRef, useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { useKestrel } from '../state/store';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Chips, useKeys, useStatus } from './lk';

const SLOTS = ['PRIMARY', 'SECONDARY', 'SIDEARM', 'TACTICAL', 'LETHAL'];
const tier = (m: number) => (m >= 6000 ? ['MYTHIC', '#FF4D4D'] : m >= 1800 ? ['LEGENDARY', '#FFB020'] : m >= 600 ? ['EPIC', '#B36BFF'] : m >= 120 ? ['RARE', '#3FA9FF'] : m > 0 ? ['UNCOMMON', '#5BD45B'] : ['STANDARD', '#9AA0A6']);
const bars = (g: Game): [string, number][] => [['EXPERIENCE', Math.min(1, Math.sqrt(g.minutes / 12000))], ['RECENT USE', Math.min(1, g.minutes2w / 1200)], ['RATING', (g.metacritic || 0) / 100], ['READINESS', g.installed ? 1 : 0.1], ['PAYLOAD', g.sizeOnDisk ? Math.min(1, g.sizeOnDisk / 150e9) : 0]];

export function Loadout() {
	const library = useKestrel((s) => s.library);
	const top = useMemo(() => [...library].sort((a, b) => b.minutes - a.minutes).slice(0, 5), [library]);
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const [pick, setPick] = useState<Game | null>(null);
	const armory = b.games.slice(0, 120);
	const g = sel ?? pick ?? top[0];
	const status = useStatus(g);
	const rail = useRef<HTMLDivElement>(null);
	const all = [...top, ...armory];
	useKeys((k) => {
		const i = g ? all.findIndex((x) => x.appid === g.appid) : -1;
		const to = (n: number) => { const x = all[Math.max(0, Math.min(all.length - 1, n))]; if (x) { setPick(x); select(null); rail.current?.querySelector(`[data-appid="${x.appid}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } };
		if (k === 'up' || k === 'left') to(i - 1); else if (k === 'down' || k === 'right') to(i + 1); else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else return false;
	});
	const [tn, tc] = g ? tier(g.minutes) : ['', ''];
	return (
		<AltPage className="pb-lo" brand={<>LOADOUT</>} search={b.q} onSearch={b.setQ}>
			<div className="pb-lo-app">
				<aside className="pb-lo-slots">{top.map((x, n) => (
					<button key={x.appid} data-appid={x.appid} className={g?.appid === x.appid ? 'on' : ''} style={{ ['--t' as string]: tier(x.minutes)[1] }} onClick={() => { setPick(x); select(null); }}>
						<small>{SLOTS[n]}</small><Art g={x} kind="header" /><span>{x.name}</span>
					</button>
				))}</aside>
				{g && (
					<section className="pb-lo-bench" key={g.appid} style={{ ['--t' as string]: tc }}>
						<div className="pb-lo-show"><Art g={g} kind="hero" /><i className="pb-lo-grid" /></div>
						<div className="pb-lo-spec">
							<p className="pb-lo-tier">{tn}</p>
							<h1>{g.name}</h1>
							<p className="pb-lo-sub">{status.toUpperCase()} · {formatPlaytime(g.minutes)} IN SERVICE · LAST DEPLOYED {formatAgo(g.lastPlayed).toUpperCase()}</p>
							<div className="pb-lo-bars">{bars(g).map(([k, v]) => <div key={k}><span>{k}</span><i><b style={{ width: Math.round(v * 100) + '%' }} /></i></div>)}</div>
							<div className="pb-lo-btns"><PlayBtn g={g} className="pb-lo-go" label={['DEPLOY', 'REQUISITION']} /><button onClick={() => select(sel ? null : g.appid)}>{sel ? 'CLOSE' : 'INSPECT'}</button></div>
							{sel && <div className="pb-lo-insp"><p>SIZE {g.installed ? formatBytes(g.sizeOnDisk) || '—' : 'NOT ISSUED'} · APP {g.appid}</p><Actions g={sel} className="pb-lo-act" /></div>}
						</div>
					</section>
				)}
				<div className="pb-lo-armory">
					<div className="pb-lo-ahead"><b>ARMORY</b><Chips b={b} className="pb-lo-chips" /></div>
					<div className="pb-lo-rail" ref={rail}>{armory.map((x) => (
						<button key={x.appid} data-appid={x.appid} className={g?.appid === x.appid ? 'on' : ''} style={{ ['--t' as string]: tier(x.minutes)[1] }} onClick={() => { setPick(x); select(null); }}>
							<Art g={x} kind="header" /><span>{x.name}</span>
						</button>
					))}</div>
				</div>
			</div>
		</AltPage>
	);
}

const cond = '"Bahnschrift SemiCondensed", "Bahnschrift", "Arial Narrow", sans-serif';
export const loadoutCss = tok('loadout', { bg: '#0D0F0C', s1: '#181B16', s2: '#22261F', s3: '#2D3229', fg: '#E8EBE3', fg2: '#B4BAAA', fg3: '#757C6C', acc: '#FF7A1A', on: '#1A0B00', top: '#0A0B09', font: cond }) + `
.pb-lo-brand { font: 700 20px ${cond}; letter-spacing: .3em; color: #FF7A1A; }
.pb-lo-app { position: absolute; inset: 0; display: grid; grid-template-columns: 250px minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) 190px; background: linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px) 0 0 / 100% 40px, #0D0F0C; color: #E8EBE3; }
.pb-lo-slots { display: grid; gap: 8px; align-content: start; padding: 18px 14px; overflow-y: auto; border-right: 1px solid rgba(255,255,255,.06); }
.pb-lo-slots button { position: relative; display: grid; gap: 4px; padding: 8px; text-align: left; background: #181B16; box-shadow: inset 3px 0 0 var(--t); transition: background .15s; } .pb-lo-slots button:hover { background: #22261F; } .pb-lo-slots button.on { background: #2D3229; box-shadow: inset 3px 0 0 var(--t), inset 0 0 0 1px var(--t); }
.pb-lo-slots small { font: 700 11px ${cond}; letter-spacing: .2em; color: #757C6C; } .pb-lo-slots img, .pb-lo-slots .alt-noart { width: 100%; aspect-ratio: 460/215; object-fit: cover; } .pb-lo-slots span { font: 600 14px ${cond}; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pb-lo-bench { display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(320px, 1fr); gap: 30px; align-items: center; padding: 24px 34px; min-height: 0; }
.pb-lo-show { position: relative; aspect-ratio: 16/9; max-height: 100%; overflow: hidden; background: #181B16; box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); clip-path: polygon(0 0, 100% 0, 100% calc(100% - 26px), calc(100% - 26px) 100%, 0 100%); animation: pb-lo-in .5s var(--k-out) both; }
@keyframes pb-lo-in { from { opacity: 0; transform: translateX(-20px); } } .pb-lo-show img, .pb-lo-show .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.pb-lo-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,122,26,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,122,26,.12) 1px, transparent 1px); background-size: 40px 40px; mix-blend-mode: screen; box-shadow: inset 0 0 80px rgba(0,0,0,.7); }
.pb-lo-spec { animation: k-rise .45s var(--k-out) both; } .pb-lo-tier { display: inline-block; margin: 0 0 8px; padding: 3px 10px; font: 700 12px ${cond}; letter-spacing: .25em; color: #0D0F0C; background: var(--t); }
.pb-lo-spec h1 { margin: 0 0 6px; font: 700 clamp(28px, 3vw, 44px)/1 ${cond}; text-transform: uppercase; } .pb-lo-sub { margin: 0 0 20px; font: 600 12.5px ${cond}; letter-spacing: .1em; color: #757C6C; }
.pb-lo-bars { display: grid; gap: 9px; margin-bottom: 22px; } .pb-lo-bars div { display: grid; grid-template-columns: 110px 1fr; gap: 12px; align-items: center; font: 600 12px ${cond}; letter-spacing: .12em; color: #B4BAAA; }
.pb-lo-bars i { position: relative; height: 6px; background: #2D3229; } .pb-lo-bars i::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, transparent 0 calc(10% - 2px), #0D0F0C calc(10% - 2px) 10%); } .pb-lo-bars b { display: block; height: 100%; background: #E8EBE3; transition: width .6s var(--k-out); }
.pb-lo-btns { display: flex; gap: 10px; } .pb-lo-go { flex: 1; height: 54px; background: #FF7A1A !important; color: #1A0B00 !important; font: 700 22px ${cond} !important; letter-spacing: .3em; clip-path: polygon(0 0, 100% 0, 100% 70%, calc(100% - 14px) 100%, 0 100%); } .pb-lo-go:hover { background: #FF923F !important; }
.pb-lo-btns > button:last-child { padding: 0 22px; background: #22261F; font: 700 15px ${cond}; letter-spacing: .2em; color: #E8EBE3; } .pb-lo-btns > button:last-child:hover { background: #2D3229; }
.pb-lo-insp { margin-top: 14px; } .pb-lo-insp p { margin: 0 0 8px; font: 600 12px ${cond}; letter-spacing: .12em; color: #757C6C; } .pb-lo-act button { font-family: ${cond} !important; text-transform: uppercase; letter-spacing: .06em; border-radius: 0 !important; }
.pb-lo-armory { grid-column: 1 / -1; display: grid; grid-template-rows: auto minmax(0, 1fr); padding: 10px 20px 14px; background: #0A0B09; border-top: 1px solid rgba(255,122,26,.25); }
.pb-lo-ahead { display: flex; align-items: center; gap: 20px; margin-bottom: 10px; } .pb-lo-ahead b { font: 700 14px ${cond}; letter-spacing: .3em; color: #FF7A1A; } .pb-lo-chips { flex: 1; min-width: 0; } .pb-lo-chips button { border-radius: 0; font-family: ${cond}; text-transform: uppercase; letter-spacing: .08em; }
.pb-lo-rail { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: thin; } .pb-lo-rail button { flex: none; width: 200px; text-align: left; background: #181B16; box-shadow: inset 0 -3px 0 var(--t); transition: transform .15s; } .pb-lo-rail button:hover { transform: translateY(-3px); } .pb-lo-rail button.on { box-shadow: inset 0 -3px 0 var(--t), inset 0 0 0 1px var(--t); }
.pb-lo-rail img, .pb-lo-rail .alt-noart { display: block; width: 100%; aspect-ratio: 460/215; object-fit: cover; } .pb-lo-rail span { display: block; padding: 6px 8px 8px; font: 600 13px ${cond}; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;
