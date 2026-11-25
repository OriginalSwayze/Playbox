// GACHA — a summon banner for deciding what to play. Pick a pool (your backlog, installed games, everything), pull
// once or ten times, and games burst out of the portal as cards with a rarity by how much you have played them. Your
// pulls are kept in a history; any card plays or opens its details.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';
import { Backdrop, facts, useKeys, useStatus } from './lk';

type Pool = 'backlog' | 'installed' | 'all';
const stars = (g: Game) => (g.minutes >= 3000 ? 5 : g.minutes >= 900 ? 4 : g.minutes >= 120 ? 3 : g.minutes > 0 ? 2 : 1);
const draw = (pool: Game[], n: number) => { const a = [...pool]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, n); };

export function Gacha() {
	const lists = useLibraryLists();
	const [sel, select] = useSelectedGame();
	const [pool, setPool] = useState<Pool>('backlog');
	const [pulled, setPulled] = useState<Game[] | null>(null);
	const [phase, setPhase] = useState<'idle' | 'portal' | 'reveal'>('idle');
	const [hist, setHist] = useState<Game[]>([]);
	const src = pool === 'backlog' ? (lists.unplayed.length ? lists.unplayed : lists.all) : pool === 'installed' ? lists.installed : lists.all;
	const banner = (lists.unplayed[0] ?? lists.top[0]) as Game | undefined;
	const status = useStatus(sel);
	const pull = (n: number) => {
		if (!src.length) return;
		const got = draw(src, n);
		setPulled(got); setPhase('portal'); select(null);
		setTimeout(() => { setPhase('reveal'); setHist((h) => [...got, ...h].slice(0, 40)); }, 1400);
	};
	useKeys((k) => {
		if (sel) { if (k === 'back') select(null); else if (k === 'enter') gameCommands(sel)[0].run(); else return false; return; }
		if (phase === 'reveal' && k === 'back') { setPhase('idle'); setPulled(null); } else if (k === 'enter' && phase !== 'portal') pull(1); else if (k === 'menu' && phase !== 'portal') pull(10); else return false;
	});
	const best = pulled ? Math.max(...pulled.map(stars)) : 0;
	return (
		<AltPage className="pb-gch" brand={<>✦ SUMMON</>}>
			<div className="pb-gch-app">
				<Backdrop g={phase === 'reveal' && pulled?.length === 1 ? pulled[0] : banner} className="pb-gch-bd" />
				<div className="pb-gch-sky" />
				<nav className="pb-gch-pools">{(['backlog', 'installed', 'all'] as Pool[]).map((p) => <button key={p} className={pool === p ? 'on' : ''} onClick={() => setPool(p)}><b>{p === 'backlog' ? 'Backlog Banner' : p === 'installed' ? 'Ready to Play' : 'Standard Banner'}</b><small>{(p === 'backlog' ? lists.unplayed : p === 'installed' ? lists.installed : lists.all).length} in pool</small></button>)}</nav>
				{phase === 'idle' && (
					<section className="pb-gch-banner">
						<p className="pb-gch-kick">LIMITED · {pool === 'backlog' ? 'NEVER PLAYED' : pool === 'installed' ? 'INSTALLED' : 'ALL GAMES'}</p>
						<h1>{pool === 'backlog' ? 'Clear the backlog' : pool === 'installed' ? 'Play something now' : 'Anything goes'}</h1>
						<p className="pb-gch-rates">★★★★★ 100+ h · ★★★★ 15+ h · ★★★ 2+ h · ★★ played · ★ new</p>
					</section>
				)}
				{phase === 'portal' && <div className="pb-gch-portal"><i /><i /><i /><b className={'s' + best} /></div>}
				{phase === 'reveal' && pulled && (
					<section className={'pb-gch-cards n' + pulled.length}>{pulled.map((g, i) => (
						<button key={g.appid + '-' + i} data-appid={g.appid} className={'pb-gch-card s' + stars(g)} style={{ animationDelay: i * 0.08 + 's' }} onClick={() => select(g.appid)}>
							<Art g={g} kind="capsule" /><span><em>{'★'.repeat(stars(g))}</em><b>{g.name}</b></span>
						</button>
					))}</section>
				)}
				<div className="pb-gch-btns">
					{phase === 'reveal' && <button className="pb-gch-again" onClick={() => { setPhase('idle'); setPulled(null); }}>Back to banner</button>}
					<button className="pb-gch-pull" disabled={phase === 'portal'} onClick={() => pull(1)}><b>Pull ×1</b><small>Enter</small></button>
					<button className="pb-gch-pull ten" disabled={phase === 'portal'} onClick={() => pull(10)}><b>Pull ×10</b><small>Y / Tab</small></button>
				</div>
				{hist.length > 0 && <aside className="pb-gch-hist"><h4>History</h4>{hist.map((g, i) => <button key={g.appid + '-' + i} className={'s' + stars(g)} onClick={() => select(g.appid)}><i>{stars(g)}★</i>{g.name}</button>)}</aside>}
				{sel && (
					<div className="pb-gch-detail" onMouseDown={(e) => e.target === e.currentTarget && select(null)}>
						<div key={sel.appid} className={'s' + stars(sel)}>
							<Art g={sel} kind="capsule" className="pb-gch-dimg" />
							<div><p className="pb-gch-dst">{'★'.repeat(stars(sel))}</p><h2>{sel.name}</h2><p className="pb-gch-dsub">{status} · {formatPlaytime(sel.minutes)} · {formatAgo(sel.lastPlayed)}</p>
								<dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
								<div className="pb-gch-drow"><PlayBtn g={sel} className="pb-gch-play" /><button onClick={() => select(null)}>Close</button></div><Actions g={sel} className="pb-gch-act" /></div>
						</div>
					</div>
				)}
			</div>
		</AltPage>
	);
}

const f = '"Segoe UI Variable Display", "Segoe UI", sans-serif';
export const gachaCss = tok('gacha', { bg: '#0E1230', s1: 'rgba(255,255,255,.12)', s2: 'rgba(255,255,255,.2)', s3: 'rgba(255,255,255,.28)', fg: '#FFFFFF', fg2: '#DCE2FF', fg3: '#98A2D6', acc: '#FFD86B', on: '#2A1C00', top: 'transparent', font: f }) + `
html.kestrel[data-ui="gacha"] .k-top { position: relative; z-index: 3; border: 0; background: linear-gradient(rgba(8,10,30,.7), transparent); }
.pb-gch-brand { font: 700 17px ${f}; letter-spacing: .3em; color: #FFD86B; text-shadow: 0 0 12px rgba(255,216,107,.6); }
.pb-gch-app { position: absolute; inset: 0; overflow: hidden; color: #fff; background: #0E1230; }
.pb-gch-bd { opacity: .55; } .pb-gch-sky { position: absolute; inset: 0; background: radial-gradient(50% 60% at 50% 45%, transparent, rgba(14,18,48,.9) 80%), linear-gradient(0deg, #0E1230 5%, transparent 40%); }
.pb-gch-pools { position: absolute; left: 24px; top: 60px; z-index: 2; display: grid; gap: 8px; width: 220px; } .pb-gch-pools button { display: grid; gap: 2px; padding: 12px 14px; text-align: left; border-radius: 10px; background: rgba(10,12,36,.7); box-shadow: inset 0 0 0 1px rgba(255,255,255,.12); }
.pb-gch-pools b { font: 700 14px ${f}; } .pb-gch-pools small { font: 12px ${f}; color: #98A2D6; } .pb-gch-pools button.on { background: linear-gradient(90deg, rgba(255,216,107,.3), rgba(10,12,36,.7)); box-shadow: inset 0 0 0 2px #FFD86B; }
.pb-gch-banner { position: absolute; left: 50%; bottom: 150px; transform: translateX(-50%); z-index: 2; text-align: center; animation: k-rise .5s var(--k-out) both; }
.pb-gch-kick { margin: 0; font: 700 12px ${f}; letter-spacing: .3em; color: #FFD86B; } .pb-gch-banner h1 { margin: 6px 0 10px; font: 800 italic 56px/1 ${f}; text-shadow: 0 4px 30px rgba(0,0,0,.6), 0 0 40px rgba(255,216,107,.3); } .pb-gch-rates { margin: 0; font: 13px ${f}; color: #DCE2FF; }
.pb-gch-portal { position: absolute; left: 50%; top: 45%; z-index: 2; width: 280px; height: 280px; transform: translate(-50%, -50%); } .pb-gch-portal i { position: absolute; inset: 0; border-radius: 50%; border: 3px solid rgba(160,200,255,.8); box-shadow: 0 0 40px rgba(160,200,255,.8), inset 0 0 40px rgba(160,200,255,.6); animation: pb-gch-ring 1.4s var(--k-out) both; }
.pb-gch-portal i:nth-child(2) { animation-delay: .15s; } .pb-gch-portal i:nth-child(3) { animation-delay: .3s; } @keyframes pb-gch-ring { from { transform: scale(0) rotate(0); opacity: 1; } to { transform: scale(1.6) rotate(180deg); opacity: 0; } }
.pb-gch-portal b { position: absolute; left: 50%; top: 50%; width: 60px; height: 60px; margin: -30px; border-radius: 50%; background: #9EC1FF; box-shadow: 0 0 80px 40px #9EC1FF; animation: pb-gch-orb 1.4s ease-in both; } .pb-gch-portal b.s4 { background: #C79BFF; box-shadow: 0 0 80px 40px #C79BFF; } .pb-gch-portal b.s5 { background: #FFD86B; box-shadow: 0 0 100px 60px #FFD86B; }
@keyframes pb-gch-orb { 0% { transform: scale(.2); } 80% { transform: scale(1.2); } 100% { transform: scale(8); opacity: 0; } }
.pb-gch-cards { position: absolute; left: 260px; right: 260px; top: 70px; bottom: 130px; z-index: 2; display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; align-content: center; } .pb-gch-cards.n1 { grid-template-columns: minmax(0, 280px); justify-content: center; }
.pb-gch-card { position: relative; border-radius: 12px; overflow: hidden; --c: #9EC1FF; box-shadow: 0 0 0 2px var(--c), 0 0 30px color-mix(in srgb, var(--c) 50%, transparent); animation: pb-gch-flip .6s var(--k-out) both; } .pb-gch-card.s4 { --c: #C79BFF; } .pb-gch-card.s5 { --c: #FFD86B; } .pb-gch-card.s1, .pb-gch-card.s2 { --c: #8FA0B8; }
@keyframes pb-gch-flip { from { transform: perspective(600px) rotateY(90deg) scale(.8); opacity: 0; } }
.pb-gch-card img, .pb-gch-card .alt-noart { width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block; } .pb-gch-card span { position: absolute; left: 0; right: 0; bottom: 0; padding: 30px 10px 10px; text-align: left; background: linear-gradient(transparent, rgba(0,0,0,.9)); }
.pb-gch-card em { display: block; font-style: normal; font-size: 13px; color: var(--c); letter-spacing: 1px; } .pb-gch-card b { display: block; font: 700 13px ${f}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-gch-card:hover { transform: translateY(-4px); }
.pb-gch-btns { position: absolute; right: 24px; bottom: 26px; z-index: 3; display: flex; gap: 12px; align-items: center; }
.pb-gch-pull { display: grid; justify-items: center; min-width: 170px; padding: 10px 20px; border-radius: 99px; background: linear-gradient(#FFE79E, #F2B636); color: #2A1C00; box-shadow: 0 6px 20px rgba(242,182,54,.4), inset 0 -3px 0 rgba(0,0,0,.15); } .pb-gch-pull b { font: 800 18px ${f}; } .pb-gch-pull small { font: 600 11px ${f}; opacity: .65; }
.pb-gch-pull.ten { background: linear-gradient(#D9C2FF, #9B6CFF); color: #1A0A3A; box-shadow: 0 6px 20px rgba(155,108,255,.4), inset 0 -3px 0 rgba(0,0,0,.15); } .pb-gch-pull:disabled { filter: grayscale(.8); opacity: .6; }
.pb-gch-again { padding: 12px 20px; border-radius: 99px; background: rgba(10,12,36,.75); font: 600 14px ${f}; color: #fff; box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
.pb-gch-hist { position: absolute; right: 24px; top: 60px; bottom: 110px; z-index: 2; width: 220px; padding: 12px; overflow-y: auto; border-radius: 12px; background: rgba(10,12,36,.7); scrollbar-width: none; } .pb-gch-hist h4 { margin: 0 0 8px; font: 700 12px ${f}; letter-spacing: .2em; text-transform: uppercase; color: #98A2D6; }
.pb-gch-hist button { display: flex; gap: 8px; width: 100%; padding: 5px 4px; text-align: left; font: 12.5px ${f}; color: #DCE2FF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-gch-hist i { flex: none; width: 26px; font-style: normal; color: #9EC1FF; } .pb-gch-hist .s4 i { color: #C79BFF; } .pb-gch-hist .s5 i { color: #FFD86B; }
.pb-gch-detail { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: rgba(5,6,20,.75); pointer-events: auto; animation: k-fade .2s both; }
.pb-gch-detail > div { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 24px; width: min(760px, 92%); padding: 22px; border-radius: 18px; background: #151A44; --c: #9EC1FF; box-shadow: 0 0 0 2px var(--c), 0 30px 80px #000; animation: k-rise .3s var(--k-out) both; } .pb-gch-detail .s4 { --c: #C79BFF; } .pb-gch-detail .s5 { --c: #FFD86B; }
.pb-gch-dimg { width: 100%; border-radius: 10px; } .pb-gch-dst { margin: 0; color: var(--c); font-size: 20px; letter-spacing: 2px; } .pb-gch-detail h2 { margin: 4px 0; font: 800 26px/1.1 ${f}; } .pb-gch-dsub { margin: 0 0 14px; font: 13px ${f}; color: #98A2D6; }
.pb-gch-detail dl { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 0 0 14px; } .pb-gch-detail dt { font: 11px ${f}; color: #98A2D6; } .pb-gch-detail dd { margin: 2px 0 0; font: 600 14px ${f}; }
.pb-gch-drow { display: flex; gap: 10px; margin-bottom: 8px; } .pb-gch-play { flex: 1; height: 44px; border-radius: 99px; background: linear-gradient(#FFE79E, #F2B636) !important; color: #2A1C00 !important; font: 800 16px ${f} !important; } .pb-gch-drow > button:last-child { padding: 0 20px; border-radius: 99px; background: rgba(255,255,255,.1); font: 600 14px ${f}; color: #fff; }
.pb-gch-act button { color: #DCE2FF !important; }
`;
