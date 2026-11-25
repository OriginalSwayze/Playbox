// GARDEN — every game is a plant that has grown with the hours you gave it: a seed you have never played, a sprout,
// a sapling, a bush, a tree. Collections are garden beds, recent games flower, installed ones sit in watered soil,
// and a plant opens as its seed packet with Play on the back.
import { useMemo, useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { Actions, AltPage, Art, gameCommands, useIslands, useSearch, useSelectedGame } from './common';

const STAGES = ['Seed', 'Sprout', 'Sapling', 'Bush', 'Tree'];
const stage = (g: Game) => (!g.minutes ? 0 : g.minutes < 120 ? 1 : g.minutes < 1200 ? 2 : g.minutes < 6000 ? 3 : 4);
const blooming = (g: Game) => g.lastPlayed > 0 && Date.now() / 1000 - g.lastPlayed < 30 * 86400;

/** A small procedural plant: shape by growth stage, size within the stage by hours, flower colour by app id. */
function Plant({ g }: { g: Game }) {
	const s = stage(g);
	const hue = (g.appid * 137) % 360;
	const leaf = `hsl(${95 + (g.appid % 40)} 45% ${34 + (g.appid % 10)}%)`;
	const leaf2 = `hsl(${105 + (g.appid % 30)} 50% ${44 + (g.appid % 8)}%)`;
	const grow = Math.min(1, Math.log10(1 + g.minutes) / 5);
	const flowers = blooming(g);
	const fl = (x: number, y: number, k: number) => (
		<g key={k} transform={`translate(${x} ${y})`}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} rx="3.2" ry="5.5" cy="-4.5" fill={`hsl(${hue} 80% 70%)`} transform={`rotate(${a})`} />)}<circle r="2.6" fill="#FFD84A" /></g>
	);
	return (
		<svg viewBox="0 0 100 120" className={'gd-svg s' + s}>
			{s === 0 && <><ellipse cx="50" cy="112" rx="14" ry="5" fill="#6B4A2E" /><ellipse cx="50" cy="108" rx="5" ry="3.5" fill="#C9A66B" /></>}
			{s === 1 && <g className="gd-sway"><path d="M50 112 Q50 98 50 92" stroke={leaf} strokeWidth="2.5" fill="none" /><path d="M50 94 Q38 84 34 92 Q42 98 50 94" fill={leaf2} /><path d="M50 94 Q62 84 66 92 Q58 98 50 94" fill={leaf} /></g>}
			{s === 2 && <g className="gd-sway">
				<path d={`M50 112 Q48 ${90 - grow * 10} 50 ${70 - grow * 14}`} stroke="#5E7B3A" strokeWidth="3" fill="none" />
				{[0, 1, 2, 3].map((i) => <path key={i} d={`M50 ${100 - i * 9} q${i % 2 ? 16 : -16} -10 ${i % 2 ? 20 : -20} -2 q${i % 2 ? -10 : 10} 6 ${i % 2 ? -20 : 20} 2`} fill={i % 2 ? leaf : leaf2} />)}
				{flowers && fl(50, 66 - grow * 14, 0)}
			</g>}
			{s === 3 && <g className="gd-sway">
				<path d="M50 112 L50 86" stroke="#6B4A2E" strokeWidth="4" />
				{[[50, 66, 26], [33, 78, 18], [67, 78, 18], [42, 58, 16], [60, 60, 15]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r * (0.8 + grow * 0.25)} fill={i % 2 ? leaf2 : leaf} />)}
				{flowers && [[38, 64], [62, 70], [50, 52], [30, 80]].map(([x, y], i) => fl(x, y, i))}
			</g>}
			{s === 4 && <g className="gd-sway slow">
				<path d="M50 114 L48 70 M49 88 L36 74 M49 82 L64 68" stroke="#5A3B22" strokeWidth="6" strokeLinecap="round" fill="none" />
				{[[50, 42, 30], [28, 56, 22], [72, 54, 22], [40, 28, 20], [62, 30, 20], [50, 62, 20]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r * (0.85 + grow * 0.2)} fill={i % 2 ? leaf2 : leaf} />)}
				{flowers ? [[34, 40], [64, 44], [50, 24], [26, 58], [74, 58], [48, 54]].map(([x, y], i) => fl(x, y, i)) : [[36, 48], [62, 38], [70, 62]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4" fill={`hsl(${hue} 70% 55%)`} />)}
			</g>}
		</svg>
	);
}

function Packet({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const go = gameCommands(g)[0];
	const s = stage(g);
	return (
		<div className="gd-dim" onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<div className="gd-packet">
				<section className="gd-front">
					<em>Kestrel Seed Co. · No. {g.appid}</em>
					<div className="gd-pic"><Art g={g} kind="capsule" /></div>
					<h2>{g.name}</h2>
					<p>{d.developer ? `Cultivated by ${d.developer}` : ' '}</p>
				</section>
				<section className="gd-back">
					<h3>Growing notes</h3>
					<div className="gd-growth">{STAGES.map((n, i) => <span key={n} className={i <= s ? 'on' : ''}><i />{n}</span>)}</div>
					<dl>
						<dt>Growth</dt><dd>{STAGES[s]} · {formatPlaytime(g.minutes)}</dd>
						<dt>Last watered</dt><dd>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'}</dd>
						<dt>In bloom</dt><dd>{blooming(g) ? 'Yes, played this month' : 'Not this month'}</dd>
						<dt>Harvest</dt><dd>{d.achievements.total ? `${d.achievements.achieved} of ${d.achievements.total} achievements` : 'Nothing to pick'}</dd>
						<dt>Soil</dt><dd>{g.installed ? `Planted · ${formatBytes(d.disk || g.sizeOnDisk) || 'installed'}` : 'Not planted (not installed)'}</dd>
					</dl>
					<button className="gd-water" onClick={go.run}>{g.installed ? 'Water it · play' : 'Plant it · install'}</button>
					<Actions g={g} className="gd-actions" />
				</section>
				<button className="gd-close" onClick={close} aria-label="Close">×</button>
			</div>
		</div>
	);
}

export function Garden() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [q, setQ] = useState('');
	const [open, setOpen] = useState<Record<string, boolean>>({});
	const found = useSearch(q);
	const beds = found ? [{ id: 'q', name: `Found: ${q.trim()}`, games: found.slice(0, 80) }] : islands.map((i) => (i.id === 'recent' ? { ...i, name: 'Greenhouse · recently played' } : i));
	const census = useMemo(() => {
		const all = new Map<number, Game>();
		for (const i of islands) for (const g of i.games) all.set(g.appid, g);
		const c = [0, 0, 0, 0, 0];
		for (const g of all.values()) c[stage(g)]++;
		return c;
	}, [islands]);
	const LIMIT = 48;
	return (
		<AltPage className="gd" brand={<><i className="gd-leaf" />Garden</>} search={q} onSearch={setQ} searchPlaceholder="Find a plant">
			<div className="gd-grounds">
				<div className="gd-sky"><i className="gd-sun" /><i className="gd-cloud a" /><i className="gd-cloud b" /></div>
				<div className="gd-census">{STAGES.map((n, i) => <span key={n}><b>{census[i]}</b>{n.toLowerCase()}{census[i] === 1 ? '' : n === 'Bush' ? 'es' : 's'}</span>)}</div>
				{beds.map((b) => {
					const all = open[b.id] || b.games.length <= LIMIT;
					return (
						<section key={b.id} className="gd-bed">
							<header><b>{b.name}</b><span>{b.games.length} plant{b.games.length === 1 ? '' : 's'}</span></header>
							<div className="gd-soil">
								{(all ? b.games : b.games.slice(0, LIMIT)).map((g) => (
									<button key={g.appid} data-appid={g.appid} className={'gd-plant' + (g.installed ? ' wet' : '') + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)} title={`${g.name} · ${STAGES[stage(g)]} · ${formatPlaytime(g.minutes)}`}>
										<Plant g={g} />
										<span className="gd-stake">{g.name}</span>
									</button>
								))}
								{!all && <button className="gd-more" onClick={() => setOpen({ ...open, [b.id]: true })}>+ {b.games.length - LIMIT} more</button>}
							</div>
						</section>
					);
				})}
			</div>
			{sel && <Packet key={sel.appid} g={sel} close={() => select(null)} />}
		</AltPage>
	);
}

export const gardenCss = `
html.kestrel[data-ui="garden"] { --k-ink: #EAF2DC; --k-s1: #FBFDF5; --k-s2: #EEF4E0; --k-s3: #DCE8C6; --k-s4: #C4D6A6; --k-line: rgba(50,70,30,.14); --k-line-2: rgba(50,70,30,.26);
	--k-fg: #2E3B1F; --k-fg-2: #4F6136; --k-fg-3: #7A8A60; --k-accent: #5E9E3A; --k-accent-2: #7FBF56; --k-on-accent: #FFF; --k-a10: rgba(94,158,58,.1); --k-a20: rgba(94,158,58,.18); --k-a40: rgba(94,158,58,.4);
	--gd-hand: "Ink Free", "Segoe Print", cursive; }
html.kestrel[data-ui="garden"] .k-top { background: #FBFDF5; border-bottom: 1px solid rgba(50,70,30,.14); }
.gd-brand { display: flex; align-items: center; gap: 8px; font: 700 22px var(--gd-hand); color: #3E6B26; }
.gd-leaf { width: 20px; height: 20px; background: #5E9E3A; border-radius: 0 80% 0 80%; transform: rotate(-10deg); }
.gd-stage { background: #EAF2DC; }
.gd-grounds { position: absolute; inset: 0; overflow-y: auto; padding: 0 0 60px; background: linear-gradient(#CFE8F5 0, #E6F2DA 220px, #EAF2DC 260px); }
.gd-grounds::-webkit-scrollbar { width: 10px; } .gd-grounds::-webkit-scrollbar-thumb { background: #B9CC98; border-radius: 5px; }
.gd-sky { position: relative; height: 120px; overflow: hidden; }
.gd-sun { position: absolute; right: 12%; top: 22px; width: 62px; height: 62px; border-radius: 50%; background: #FFD84A; box-shadow: 0 0 0 12px rgba(255,216,74,.25), 0 0 60px rgba(255,200,60,.6); }
.gd-cloud { position: absolute; height: 26px; border-radius: 20px; background: #fff; opacity: .9; animation: gd-drift 60s linear infinite; }
.gd-cloud::before, .gd-cloud::after { content: ""; position: absolute; border-radius: 50%; background: #fff; }
.gd-cloud::before { width: 36px; height: 36px; left: 16px; top: -16px; } .gd-cloud::after { width: 26px; height: 26px; left: 44px; top: -10px; }
.gd-cloud.a { width: 110px; top: 40px; left: -10%; } .gd-cloud.b { width: 80px; top: 70px; left: -30%; animation-duration: 90s; animation-delay: -30s; }
@keyframes gd-drift { to { transform: translateX(130vw); } }
.gd-census { display: flex; justify-content: center; gap: 26px; margin: -40px auto 14px; position: relative; font: 600 14px var(--gd-hand); color: #4F6136; }
.gd-census b { margin-right: 6px; font: 700 22px var(--gd-hand); color: #2E3B1F; }
.gd-bed { max-width: 1500px; margin: 0 auto 26px; padding: 0 32px; animation: k-rise 500ms var(--k-out) both; }
.gd-bed > header { display: flex; align-items: baseline; gap: 12px; margin: 0 0 6px 8px; }
.gd-bed > header b { font: 700 24px var(--gd-hand); color: #2E3B1F; } .gd-bed > header span { font: 13px var(--k-text); color: #7A8A60; }
.gd-soil { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 4px 2px; padding: 10px 16px 16px; border-radius: 18px;
	background: linear-gradient(transparent 0 calc(100% - 22px), #8A6240 calc(100% - 22px)), linear-gradient(#DDEBC8, #CFE2B4); box-shadow: inset 0 -26px 0 -4px #7A5536, 0 10px 20px -12px rgba(60,40,20,.5); }
.gd-plant { position: relative; width: 104px; display: flex; flex-direction: column; align-items: center; padding: 0 2px 2px; border-radius: 10px; transition: transform .25s var(--k-spring); }
.gd-plant:hover { transform: translateY(-4px); } .gd-plant:hover .gd-svg { filter: drop-shadow(0 6px 6px rgba(40,60,20,.3)) saturate(1.2); }
.gd-plant.on .gd-stake { background: #FFF6C8; box-shadow: 0 0 0 2px #E0B840; }
.gd-svg { width: 100px; height: 120px; overflow: visible; transition: filter .2s; }
.gd-svg.s0 { height: 120px; }
.gd-sway { transform-origin: 50px 112px; animation: gd-sway 5s ease-in-out infinite alternate; } .gd-sway.slow { animation-duration: 8s; }
.gd-plant:nth-child(3n) .gd-sway { animation-delay: -2s; } .gd-plant:nth-child(3n+1) .gd-sway { animation-delay: -3.5s; }
@keyframes gd-sway { from { transform: rotate(-2deg); } to { transform: rotate(2deg); } }
.gd-stake { max-width: 100px; margin-top: -2px; padding: 2px 6px; border-radius: 3px; background: #F4E6C8; box-shadow: 0 1px 0 #B89466; font: 600 11.5px/1.25 var(--gd-hand); color: #4A3520; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.gd-plant.wet::after { content: ""; position: absolute; bottom: 24px; left: 50%; width: 46px; height: 8px; margin-left: -23px; border-radius: 50%; background: rgba(70,40,20,.35); z-index: -1; }
.gd-more { align-self: center; padding: 10px 16px; margin: 0 0 30px 10px; border-radius: 99px; font: 700 14px var(--gd-hand); color: #3E6B26; background: #FBFDF5 !important; box-shadow: 0 2px 0 #B9CC98; }
.gd-dim { position: absolute; inset: 0; z-index: 8; display: grid; place-items: center; padding: 28px; background: rgba(40,55,25,.55); animation: k-fade 220ms both; }
.gd-packet { position: relative; display: flex; width: min(860px, 96%); max-height: 100%; filter: drop-shadow(0 30px 40px rgba(30,40,15,.45)); animation: gd-pop 500ms var(--k-spring) both; }
@keyframes gd-pop { from { transform: translateY(30px) rotate(3deg) scale(.9); opacity: 0; } to { transform: none; opacity: 1; } }
.gd-front { flex: 0 0 330px; display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 22px 24px; border-radius: 6px 0 0 6px; background: #F6E9C6; border: 2px dashed #B89466; border-right: 0; text-align: center; }
.gd-front em { font: 700 11px var(--k-text); font-style: normal; letter-spacing: .2em; text-transform: uppercase; color: #8A6240; }
.gd-pic { width: 200px; aspect-ratio: 2 / 3; padding: 8px; background: #fff; box-shadow: 0 0 0 3px #5E9E3A; } .gd-pic img, .gd-pic .alt-noart { width: 100%; height: 100%; object-fit: cover; display: block; }
.gd-front h2 { margin: 6px 0 0; font: 700 26px/1.15 var(--gd-hand); color: #2E3B1F; } .gd-front p { margin: 0; font: italic 13px var(--k-text); color: #6B5A3A; }
.gd-back { flex: 1; min-width: 0; overflow-y: auto; padding: 22px 26px; border-radius: 0 6px 6px 0; background: #FFFBEF; border: 2px dashed #B89466; }
.gd-back h3 { margin: 0 0 12px; font: 700 24px var(--gd-hand); color: #3E6B26; }
.gd-growth { display: flex; gap: 6px; margin-bottom: 14px; }
.gd-growth span { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; font: 600 12px var(--gd-hand); color: #A9B48F; }
.gd-growth i { width: 100%; height: 8px; border-radius: 4px; background: #E3EAD2; } .gd-growth .on { color: #3E6B26; } .gd-growth .on i { background: #5E9E3A; }
.gd-back dl { display: grid; grid-template-columns: 120px 1fr; gap: 8px 12px; margin: 0 0 16px; font: 14px var(--k-text); }
.gd-back dt { font: 700 14px var(--gd-hand); color: #7A8A60; } .gd-back dd { margin: 0; color: #2E3B1F; }
.gd-water { height: 44px; padding: 0 22px; border-radius: 99px; background: #5E9E3A !important; color: #fff; font: 700 16px var(--gd-hand); box-shadow: 0 3px 0 #3E6B26; transition: transform .2s var(--k-spring); }
.gd-water:hover { transform: translateY(-2px); background: #6DAE48 !important; }
.gd-actions { margin-top: 12px; }
.gd-close { position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; font: 22px/1 var(--k-text); color: #6B5A3A; } .gd-close:hover { background: rgba(0,0,0,.06); }
`;
