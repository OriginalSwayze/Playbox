// SEASON — a battle-pass track. Every game is a tier on one long road, ordered by hours; games you have played are
// unlocked rewards, the rest wait behind padlocks on the premium lane. Your season level is how many you have played,
// XP is your total hours. Left/right walk the tiers, Enter claims (plays) the focused reward.
import { useMemo, useRef } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, Chips, cycle, facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

const rar = (m: number) => (m >= 6000 ? 'legendary' : m >= 1800 ? 'epic' : m >= 300 ? 'rare' : 'common');

export function Season() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const tiers = useMemo(() => { const played = b.games.filter((g) => g.minutes > 0).sort((x, y) => x.minutes - y.minutes); const rest = b.games.filter((g) => g.minutes === 0); return [...played, ...rest].slice(0, 150); }, [b.games]);
	const level = tiers.filter((g) => g.minutes > 0).length;
	const xp = Math.round(tiers.reduce((a, g) => a + g.minutes, 0) / 60);
	const c = useCursor(tiers.length, Math.max(0, level - 1));
	const track = useRef<HTMLDivElement>(null);
	useKeepInView(track, '.on', c.i, c.keyMoved, 'center');
	const g: Game | undefined = sel ?? tiers[c.i];
	const status = useStatus(g);
	useKeys((k) => {
		if (k === 'left') { c.move(-1); select(null); } else if (k === 'right') { c.move(1); select(null); } else if (k === 'enter' && g) gameCommands(g)[0].run();
		else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else if (k === 'next' || k === 'prev') { cycle(b, k === 'next' ? 1 : -1); c.to(0); } else return false;
	});
	return (
		<AltPage className="pb-ssn" brand={<>SEASON <b>{new Date().getFullYear() - 2000}</b></>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-ssn-app">
				<Backdrop g={g} className="pb-ssn-bd" />
				<header className="pb-ssn-head">
					<div className="pb-ssn-lvl"><b>{level}</b><span>LEVEL</span></div>
					<div className="pb-ssn-xp"><p><span>SEASON PROGRESS</span><span>{xp.toLocaleString()} XP</span></p><i><b style={{ width: tiers.length ? (level / tiers.length) * 100 + '%' : 0 }} /></i><small>{tiers.length - level} tiers left · rewards unlock as you play</small></div>
					<Chips b={b} className="pb-ssn-chips" onPick={() => c.to(0)} />
				</header>
				{g && (
					<section className={'pb-ssn-feat ' + rar(g.minutes)} key={g.appid}>
						<p className="pb-ssn-rar">TIER {c.i + 1} · {g.minutes ? rar(g.minutes).toUpperCase() : 'LOCKED'}</p>
						<h1>{g.name}</h1>
						<p className="pb-ssn-sub">{status} · {g.minutes ? formatPlaytime(g.minutes) + ' earned' : 'Play to unlock'} · {formatAgo(g.lastPlayed)}</p>
						<div className="pb-ssn-btns"><PlayBtn g={g} className="pb-ssn-claim" label={[g.minutes ? 'PLAY' : 'UNLOCK', 'INSTALL']} /><button onClick={() => select(sel ? null : g.appid)}>{sel ? 'CLOSE' : 'PREVIEW'}</button></div>
						{sel && <div className="pb-ssn-more"><dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-ssn-act" /></div>}
					</section>
				)}
				<div className="pb-ssn-track" ref={track}>
					<div className="pb-ssn-lanes"><span>FREE</span><span>PREMIUM</span></div>
					{tiers.map((x, n) => (
						<button key={x.appid} data-appid={x.appid} className={'pb-ssn-tier ' + (x.minutes ? 'got ' + rar(x.minutes) : 'locked') + (n === c.i ? ' on' : '')} onClick={() => { c.to(n); select(null); }}>
							<em>{n + 1}</em>
							<span className="pb-ssn-free">{x.minutes > 0 ? <><Art g={x} kind="capsule" /><i>✓</i></> : <i className="pb-ssn-xpbox">{Math.max(1, Math.round((n + 1) * 1.5))}k XP</i>}</span>
							<span className="pb-ssn-prem">{x.minutes === 0 ? <><Art g={x} kind="capsule" /><i>🔒</i></> : <i className="pb-ssn-xpbox">{formatPlaytime(x.minutes)}</i>}</span>
						</button>
					))}
				</div>
			</div>
		</AltPage>
	);
}

const f = '"Bahnschrift", "Segoe UI", sans-serif';
export const seasonCss = tok('season', { bg: '#120B2E', s1: 'rgba(255,255,255,.1)', s2: 'rgba(255,255,255,.18)', s3: 'rgba(255,255,255,.26)', fg: '#FFFFFF', fg2: '#D9D2FF', fg3: '#9086C2', acc: '#FFE14A', on: '#1E1500', top: '#0C0720', font: f }) + `
.pb-ssn-brand { font: 800 18px ${f}; letter-spacing: .14em; color: #fff; } .pb-ssn-brand b { padding: 1px 6px; background: #FFE14A; color: #1E1500; }
.pb-ssn-app { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr) 270px; overflow: hidden; background: linear-gradient(135deg, #2A1366, #120B2E 55%, #0B1B3E); color: #fff; }
.pb-ssn-bd { opacity: .35; } .pb-ssn-bd img { mask: linear-gradient(90deg, transparent, #000 50%); -webkit-mask: linear-gradient(90deg, transparent 20%, #000 60%); }
.pb-ssn-head { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(0, 1fr); gap: 24px; align-items: center; padding: 16px 30px; }
.pb-ssn-lvl { display: grid; justify-items: center; width: 74px; height: 74px; align-content: center; background: linear-gradient(135deg, #FFE14A, #FF9F1A); color: #1E1500; clip-path: polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%); } .pb-ssn-lvl b { font: 800 28px/1 ${f}; } .pb-ssn-lvl span { font: 700 9px ${f}; letter-spacing: .2em; }
.pb-ssn-xp p { display: flex; justify-content: space-between; margin: 0 0 6px; font: 700 12px ${f}; letter-spacing: .14em; color: #D9D2FF; } .pb-ssn-xp i { display: block; height: 10px; background: rgba(255,255,255,.12); transform: skewX(-20deg); } .pb-ssn-xp i b { display: block; height: 100%; background: linear-gradient(90deg, #FFE14A, #FF9F1A); box-shadow: 0 0 14px rgba(255,225,74,.6); }
.pb-ssn-xp small { display: block; margin-top: 6px; font: 12px ${f}; color: #9086C2; } .pb-ssn-chips button { border-radius: 4px; }
.pb-ssn-feat { position: relative; align-self: center; max-width: 620px; padding: 0 30px; animation: k-rise .4s var(--k-out) both; --r: #9AA3B5; } .pb-ssn-feat.rare { --r: #4FB2FF; } .pb-ssn-feat.epic { --r: #C77DFF; } .pb-ssn-feat.legendary { --r: #FFB020; }
.pb-ssn-rar { display: inline-block; margin: 0 0 10px; padding: 4px 12px; font: 800 12px ${f}; letter-spacing: .2em; background: var(--r); color: #120B2E; }
.pb-ssn-feat h1 { margin: 0 0 8px; font: 800 clamp(30px, 3.6vw, 52px)/1 ${f}; text-transform: uppercase; text-shadow: 0 4px 20px rgba(0,0,0,.5); } .pb-ssn-sub { margin: 0 0 20px; font: 15px ${f}; color: #D9D2FF; }
.pb-ssn-btns { display: flex; gap: 10px; } .pb-ssn-claim { height: 50px; padding: 0 40px; background: #FFE14A !important; color: #1E1500 !important; font: 800 18px ${f} !important; letter-spacing: .12em; clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%); } .pb-ssn-btns > button:last-child { padding: 0 24px; background: rgba(255,255,255,.12); font: 700 14px ${f}; letter-spacing: .12em; color: #fff; clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%); }
.pb-ssn-more { display: grid; grid-template-columns: 1fr 220px; gap: 18px; margin-top: 18px; padding: 16px; background: rgba(12,7,32,.85); } .pb-ssn-more dl { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 0; } .pb-ssn-more dt { font: 11px ${f}; color: #9086C2; } .pb-ssn-more dd { margin: 2px 0 0; font: 600 14px ${f}; }
.pb-ssn-track { position: relative; display: flex; gap: 8px; padding: 10px 30px 18px 0; overflow-x: auto; background: rgba(8,4,24,.75); border-top: 1px solid rgba(255,255,255,.08); scrollbar-width: thin; }
.pb-ssn-lanes { position: sticky; left: 0; z-index: 2; flex: none; display: grid; grid-template-rows: 22px 1fr 1fr; gap: 8px; width: 96px; padding: 0 8px 0 24px; background: rgba(8,4,24,.95); font: 800 11px ${f}; letter-spacing: .16em; color: #9086C2; } .pb-ssn-lanes span { display: grid; align-items: center; } .pb-ssn-lanes span:first-child { grid-row: 2; } .pb-ssn-lanes span:last-child { color: #FFE14A; }
.pb-ssn-tier { flex: none; display: grid; grid-template-rows: 22px 1fr 1fr; gap: 8px; width: 104px; } .pb-ssn-tier em { display: grid; place-items: center; font: 800 12px ${f}; font-style: normal; color: #9086C2; background: rgba(255,255,255,.06); }
.pb-ssn-tier.got em { background: #FFE14A; color: #1E1500; } .pb-ssn-tier.on em { background: #fff; color: #120B2E; }
.pb-ssn-tier > span { position: relative; display: grid; place-items: center; overflow: hidden; background: rgba(255,255,255,.05); box-shadow: inset 0 -3px 0 var(--r, rgba(255,255,255,.1)); } .pb-ssn-tier.rare { --r: #4FB2FF; } .pb-ssn-tier.epic { --r: #C77DFF; } .pb-ssn-tier.legendary { --r: #FFB020; } .pb-ssn-tier.common { --r: #9AA3B5; }
.pb-ssn-tier img, .pb-ssn-tier .alt-noart { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; font-size: 7px; } .pb-ssn-prem img { filter: grayscale(.7) brightness(.55); }
.pb-ssn-tier > span > i { position: relative; font-style: normal; } .pb-ssn-free > i:not(.pb-ssn-xpbox) { position: absolute; right: 4px; top: 4px; display: grid; place-items: center; width: 18px; height: 18px; border-radius: 50%; background: #7CE36A; color: #0A2A00; font: 800 11px ${f}; }
.pb-ssn-prem > i:not(.pb-ssn-xpbox) { font-size: 20px; filter: drop-shadow(0 2px 4px #000); } .pb-ssn-xpbox { font: 700 12px ${f}; color: #9086C2; }
.pb-ssn-tier.on > span { box-shadow: inset 0 0 0 2px #fff, inset 0 -3px 0 var(--r, #fff); } .pb-ssn-tier:hover > span { background: rgba(255,255,255,.1); }
`;
