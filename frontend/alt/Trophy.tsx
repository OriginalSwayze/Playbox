// TROPHY — a trophy room. Every game you have played is a trophy on a lit shelf, graded platinum, gold, silver or
// bronze by hours; unplayed games are empty plinths. The chosen trophy turns on a spotlit pedestal with its plaque.
import { useMemo, useRef } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { facts, useCursor, useKeepInView, useKeys, useStatus } from './lk';

type Grade = 'platinum' | 'gold' | 'silver' | 'bronze' | 'none';
const grade = (m: number): Grade => (m >= 6000 ? 'platinum' : m >= 1800 ? 'gold' : m >= 480 ? 'silver' : m > 0 ? 'bronze' : 'none');
const SHELVES: [Grade, string, string][] = [['platinum', 'Platinum', '100+ hours'], ['gold', 'Gold', '30+ hours'], ['silver', 'Silver', '8+ hours'], ['bronze', 'Bronze', 'played'], ['none', 'Unclaimed', 'not played yet']];

function Cup({ g }: { g: Grade }) {
	return (
		<svg viewBox="0 0 60 80" className={'pb-tro-cup ' + g}>
			<path className="m" d="M14 6 h32 v14 c0 12 -7 20 -16 22 c-9 -2 -16 -10 -16 -22 z" />
			<path className="h" d="M14 10 h-7 c0 9 4 14 9 15 M46 10 h7 c0 9 -4 14 -9 15" />
			<rect className="m" x="26" y="42" width="8" height="12" /><rect className="m" x="18" y="54" width="24" height="6" rx="1" /><rect className="b" x="14" y="60" width="32" height="12" rx="2" />
			<path className="s" d="M20 9 c0 10 2 17 7 22" />
		</svg>
	);
}

export function Trophy() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const shelves = useMemo(() => SHELVES.map(([k, n, d]) => ({ k, n, d, games: b.games.filter((g) => grade(g.minutes) === k).sort((x, y) => y.minutes - x.minutes).slice(0, k === 'none' ? 40 : 200) })).filter((s) => s.games.length), [b.games]);
	const flat = shelves.flatMap((s) => s.games);
	const c = useCursor(flat.length);
	const room = useRef<HTMLDivElement>(null);
	useKeepInView(room, '.on', c.i, c.keyMoved);
	const g: Game | undefined = sel ?? flat[c.i];
	const status = useStatus(g);
	useKeys((k) => {
		if (k === 'left' || k === 'up') { c.move(-1); select(null); } else if (k === 'right' || k === 'down') { c.move(1); select(null); }
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else return false;
	});
	const count = (k: Grade) => shelves.find((s) => s.k === k)?.games.length ?? 0;
	let n = -1;
	return (
		<AltPage className="pb-tro" brand={<>🏆 Trophy Room</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-tro-app">
				<div className="pb-tro-room" ref={room}>
					<div className="pb-tro-tally">{(['platinum', 'gold', 'silver', 'bronze'] as Grade[]).map((k) => <span key={k} className={k}><Cup g={k} /><b>{count(k)}</b></span>)}</div>
					{shelves.map((s) => (
						<section key={s.k} className={'pb-tro-shelf ' + s.k}>
							<h3>{s.n}<small>{s.d} · {s.games.length}</small></h3>
							<div className="pb-tro-row">{s.games.map((x) => { n++; const i = n; return (
								<button key={x.appid} data-appid={x.appid} className={'pb-tro-item' + (i === c.i ? ' on' : '')} onClick={() => { c.to(i); select(null); }} title={x.name}>
									{s.k === 'none' ? <i className="pb-tro-plinth" /> : <Cup g={s.k} />}<span className="pb-tro-plaque"><Art g={x} kind="header" /></span>
								</button>
							); })}</div>
						</section>
					))}
				</div>
				{g && (
					<aside className={'pb-tro-stand ' + grade(g.minutes)} key={g.appid}>
						<div className="pb-tro-spot" />
						<div className="pb-tro-turn"><Cup g={grade(g.minutes) === 'none' ? 'bronze' : grade(g.minutes)} /></div>
						<div className="pb-tro-ped" />
						<p className="pb-tro-gr">{grade(g.minutes) === 'none' ? 'Not yet earned' : grade(g.minutes) + ' trophy'}</p>
						<h2>{g.name}</h2>
						<p className="pb-tro-sub">{status} · {formatPlaytime(g.minutes)} · {formatAgo(g.lastPlayed)}</p>
						<PlayBtn g={g} className="pb-tro-play" label={['Play', 'Install']} />
						<button className="pb-tro-more" onClick={() => select(sel ? null : g.appid)}>{sel ? 'Hide details' : 'Details'}</button>
						{sel && <><dl>{facts(sel).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><Actions g={sel} className="pb-tro-act" /></>}
					</aside>
				)}
			</div>
		</AltPage>
	);
}

const serif = '"Georgia", "Times New Roman", serif';
export const trophyCss = tok('trophy', { bg: '#160F0A', s1: '#24190F', s2: '#302115', s3: '#3E2B1B', fg: '#F6ECDD', fg2: '#D6C4AA', fg3: '#988468', acc: '#E8B64A', on: '#2A1A00', top: '#100B07', font: '"Segoe UI", sans-serif' }) + `
.pb-tro-brand { font: italic 700 19px ${serif}; color: #E8B64A; }
.pb-tro-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 380px; background: radial-gradient(70% 50% at 40% 0%, #3A2716, #160F0A 70%); color: #F6ECDD; }
.pb-tro-room { overflow-y: auto; padding: 18px 30px 40px; scrollbar-width: thin; }
.pb-tro-tally { display: flex; gap: 26px; margin-bottom: 10px; } .pb-tro-tally span { display: flex; align-items: center; gap: 6px; } .pb-tro-tally .pb-tro-cup { width: 22px; } .pb-tro-tally b { font: 700 18px ${serif}; }
.pb-tro-shelf { margin-bottom: 18px; } .pb-tro-shelf h3 { display: flex; align-items: baseline; gap: 12px; margin: 0 0 6px; font: italic 700 20px ${serif}; } .pb-tro-shelf h3 small { font: 13px var(--k-text); font-style: normal; color: #988468; }
.pb-tro-row { display: flex; flex-wrap: wrap; gap: 10px 14px; padding: 14px 16px 0; background: linear-gradient(transparent calc(100% - 16px), #5A3A20 calc(100% - 16px), #3A2412); box-shadow: inset 0 30px 40px -30px rgba(255,220,150,.15); border-radius: 4px 4px 0 0; }
.pb-tro-item { position: relative; display: grid; justify-items: center; width: 82px; padding-bottom: 16px; transition: transform .15s; } .pb-tro-item:hover { transform: translateY(-4px); }
.pb-tro-item .pb-tro-cup { width: 48px; filter: drop-shadow(0 6px 6px rgba(0,0,0,.5)); } .pb-tro-plaque { display: block; width: 82px; margin-top: 2px; padding: 2px; background: #2A1A0C; box-shadow: 0 2px 4px rgba(0,0,0,.6); } .pb-tro-plaque img, .pb-tro-plaque .alt-noart { display: block; width: 100%; aspect-ratio: 460/215; object-fit: cover; font-size: 5px; }
.pb-tro-shelf.none .pb-tro-plaque img { filter: grayscale(1) brightness(.6); } .pb-tro-plinth { width: 40px; height: 54px; margin-top: 12px; background: linear-gradient(90deg, #3E2B1B, #5A3E28, #3E2B1B); }
.pb-tro-item.on .pb-tro-cup { filter: drop-shadow(0 0 12px rgba(255,220,120,.8)); } .pb-tro-item.on .pb-tro-plaque { box-shadow: 0 0 0 2px #E8B64A; }
.pb-tro-cup .m, .pb-tro-cup .h { stroke-width: 3; } .pb-tro-cup .h { fill: none; stroke-linecap: round; } .pb-tro-cup .b { fill: #2A1A0C; } .pb-tro-cup .s { fill: none; stroke: rgba(255,255,255,.55); stroke-width: 2.5; stroke-linecap: round; }
.pb-tro-cup.platinum .m { fill: #DCE6EE; } .pb-tro-cup.platinum .h { stroke: #B9C9D6; } .pb-tro-cup.gold .m { fill: #E8B64A; } .pb-tro-cup.gold .h { stroke: #C8932A; } .pb-tro-cup.silver .m { fill: #B9BEC6; } .pb-tro-cup.silver .h { stroke: #8F959E; } .pb-tro-cup.bronze .m { fill: #C47A44; } .pb-tro-cup.bronze .h { stroke: #9A5A2C; }
.pb-tro-cup.platinum { filter: drop-shadow(0 0 6px rgba(200,230,255,.6)); }
.pb-tro-stand { position: relative; display: flex; flex-direction: column; align-items: center; padding: 20px 26px 30px; overflow-y: auto; text-align: center; background: linear-gradient(#100B07, #1C130C); box-shadow: inset 1px 0 0 rgba(255,255,255,.05); }
.pb-tro-spot { position: absolute; left: 50%; top: 0; width: 260px; height: 330px; transform: translateX(-50%); background: linear-gradient(rgba(255,230,170,.22), transparent); clip-path: polygon(40% 0, 60% 0, 100% 100%, 0 100%); pointer-events: none; }
.pb-tro-turn { position: relative; margin-top: 30px; perspective: 400px; } .pb-tro-turn .pb-tro-cup { width: 150px; animation: pb-tro-spin 6s linear infinite; filter: drop-shadow(0 14px 14px rgba(0,0,0,.6)); } @keyframes pb-tro-spin { 0% { transform: rotateY(0); } 100% { transform: rotateY(360deg); } }
.pb-tro-ped { width: 180px; height: 22px; margin-top: -4px; border-radius: 50%; background: radial-gradient(#5A3E28, #2A1A0C 70%); box-shadow: 0 10px 20px rgba(0,0,0,.6); }
.pb-tro-gr { margin: 18px 0 4px; font: 700 12px var(--k-text); letter-spacing: .22em; text-transform: uppercase; color: #E8B64A; } .pb-tro-stand.platinum .pb-tro-gr { color: #CFE3F2; } .pb-tro-stand.silver .pb-tro-gr { color: #C8CDD4; } .pb-tro-stand.bronze .pb-tro-gr { color: #D88C55; } .pb-tro-stand.none .pb-tro-gr { color: #988468; }
.pb-tro-stand h2 { margin: 0 0 6px; font: italic 700 24px/1.2 ${serif}; } .pb-tro-sub { margin: 0 0 18px; font: 13.5px var(--k-text); color: #D6C4AA; }
.pb-tro-play { width: 220px; height: 46px; border-radius: 99px; background: linear-gradient(#F2C866, #C8932A) !important; color: #2A1A00 !important; font: 700 16px var(--k-text) !important; box-shadow: 0 6px 16px rgba(0,0,0,.4); } .pb-tro-more { margin-top: 10px; font: 600 13px var(--k-text); color: #D6C4AA; text-decoration: underline; }
.pb-tro-stand dl { width: 100%; margin: 18px 0 10px; text-align: left; } .pb-tro-stand dl div { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid rgba(255,255,255,.06); font: 13px var(--k-text); } .pb-tro-stand dt { color: #988468; } .pb-tro-stand dd { margin: 0; font-weight: 600; }
.pb-tro-act { width: 100%; text-align: left; } .pb-tro-act button { color: #D6C4AA !important; } .pb-tro-act button:hover { background: rgba(232,182,74,.1) !important; }
`;
