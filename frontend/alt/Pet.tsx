// PET — a pocket virtual pet. Every game hatches its own pixel creature (generated from its app ID). Its happiness
// comes from recent play, hunger from days since you last played, energy from being installed. A and C cycle pets,
// B feeds it — which plays the game.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

function sprite(appid: number) {
	let x = appid * 2654435761 >>> 0; const bits: boolean[] = [];
	for (let i = 0; i < 40; i++) { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0; bits.push((x & 3) !== 0); }
	const rows: boolean[][] = [];
	for (let r = 0; r < 8; r++) { const half = bits.slice(r * 4, r * 4 + 4); rows.push([...half, ...[...half].reverse()]); }
	rows[3][2] = rows[3][5] = false; // eyes
	return rows;
}
const days = (g: Game) => (g.lastPlayed ? Math.floor((Date.now() / 1000 - g.lastPlayed) / 86400) : 999);
const Bar = ({ v }: { v: number }) => <span className="pet-bar">{Array.from({ length: 5 }, (_, i) => <i key={i} className={i < Math.round(v * 5) ? 'on' : ''} />)}</span>;

export function Pet() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [i, setI] = useState(0);
	const [fed, setFed] = useState(false);
	const list = b.games.slice(0, 150);
	const g = sel ?? list[i % Math.max(1, list.length)] ?? null;
	const step = (d: number) => { const k = (list.findIndex((x) => x.appid === g?.appid) + d + list.length) % Math.max(1, list.length); setI(k); select(list[k]?.appid ?? null); setFed(false); };
	const happy = g ? Math.min(1, g.minutes2w / 300) : 0, hunger = g ? Math.max(0, 1 - Math.min(1, days(g) / 60)) : 0, energy = g?.installed ? 1 : 0.2;
	const mood = !g ? '' : g.minutes2w ? '♥' : days(g) > 60 ? '💤' : '♪';
	return (
		<AltPage className="pet" brand={<>Pocket Pet</>}>
			<div className="pet-app">
				<div className="pet-egg">
					<div className="pet-ring">
						<div className="pet-lcd">
							<div className="pet-icons"><span>🍖</span><span>💡</span><span>🎮</span><span>💉</span></div>
							{g && <div className="pet-scene" key={g.appid}>
								<div className={'pet-sprite' + (fed ? ' eat' : '') + (days(g) > 60 ? ' sleep' : '')}>{sprite(g.appid).map((r, ri) => r.map((on, ci) => <i key={ri + '-' + ci} className={on ? 'on' : ''} />))}</div>
								<span className="pet-mood">{mood}</span>
							</div>}
							<div className="pet-name">{g?.name ?? 'No pet'}</div>
						</div>
					</div>
					<div className="pet-btns"><button onClick={() => step(-1)}>A</button><button onClick={() => { if (g) { setFed(true); setTimeout(() => gameCommands(g)[0].run(), 700); } }}>B</button><button onClick={() => step(1)}>C</button></div>
					<span className="pet-brandmark">KESTREL·PET</span>
				</div>
				<aside className="pet-stats">
					{g && <div key={g.appid}><h3>{g.name}</h3>
						<p>Happiness <Bar v={happy} /></p><p>Fullness <Bar v={hunger} /></p><p>Energy <Bar v={energy} /></p>
						<dl><dt>Age</dt><dd>{g.added ? Math.floor((Date.now() / 1000 - g.added) / 86400) + ' days' : '?'}</dd><dt>Weight</dt><dd>{formatPlaytime(g.minutes)}</dd><dt>Last fed</dt><dd>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'}</dd></dl>
						<p className="pet-hint">A / C: switch pet · B: feed ({g.installed ? 'play' : 'install'})</p><Actions g={g} className="pet-act" /></div>}
					<h4>Other pets</h4>
					<select value={b.cur} onChange={(e) => { b.setCur(e.target.value); setI(0); select(null); }}>{b.islands.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
					<div className="pet-list">{list.slice(0, 60).map((x) => <button key={x.appid} data-appid={x.appid} className={g?.appid === x.appid ? 'on' : ''} onClick={() => { select(x.appid); setFed(false); }} title={x.name}><span className="pet-mini">{sprite(x.appid).map((r, ri) => r.map((on, ci) => <i key={ri + '-' + ci} className={on ? 'on' : ''} />))}</span></button>)}</div>
				</aside>
			</div>
		</AltPage>
	);
}

export const petCss = tok('pet', { bg: '#FBE3EC', s1: '#FFFFFF', s2: '#F7D2DF', s3: '#EFB9CC', fg: '#3D1F2B', fg2: '#6B3A4E', fg3: '#A06F83', acc: '#E2457E', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.pet-brand { font: 800 18px var(--k-text); color: #E2457E; }
.pet-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 360px; align-items: center; background: radial-gradient(circle at 40% 50%, #FFF0F5, #F7C6D7); }
.pet-egg { position: relative; justify-self: center; width: 360px; height: 450px; border-radius: 50% 50% 46% 46% / 58% 58% 42% 42%; background: radial-gradient(circle at 35% 30%, #FFB3CF, #E2457E 70%); box-shadow: 0 30px 50px -20px rgba(120,20,60,.6), inset -10px -20px 30px rgba(0,0,0,.2), inset 10px 10px 30px rgba(255,255,255,.4); display: grid; justify-items: center; align-content: center; gap: 22px; }
.pet-ring { padding: 14px; border-radius: 22px; background: #fff; box-shadow: inset 0 2px 6px rgba(0,0,0,.25); }
.pet-lcd { width: 190px; height: 170px; display: grid; grid-template-rows: 22px 1fr 20px; padding: 6px; border-radius: 10px; background: #B7C9A5; box-shadow: inset 0 0 12px rgba(0,0,0,.25); font: 11px "Lucida Console", monospace; color: #1F2A17; }
.pet-icons { display: flex; justify-content: space-around; filter: grayscale(1) contrast(2); opacity: .55; font-size: 12px; }
.pet-scene { position: relative; display: grid; place-items: center; } .pet-mood { position: absolute; right: 18px; top: 4px; font-size: 14px; animation: pet-bob 1s steps(2) infinite; filter: grayscale(1) contrast(2); }
.pet-sprite, .pet-mini { display: grid; grid-template-columns: repeat(8, 1fr); } .pet-sprite { width: 80px; height: 80px; gap: 1px; animation: pet-bob 1s steps(2) infinite; } @keyframes pet-bob { 50% { transform: translateY(-4px); } }
.pet-sprite i { background: transparent; } .pet-sprite i.on { background: #1F2A17; } .pet-sprite.eat { animation: pet-eat .2s steps(2) 4; } @keyframes pet-eat { 50% { transform: scale(1.1, .9); } } .pet-sprite.sleep { animation: none; opacity: .7; }
.pet-name { text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pet-btns { display: flex; gap: 24px; } .pet-btns button { width: 48px; height: 48px; border-radius: 50%; background: radial-gradient(circle at 40% 35%, #FFF3B0, #F2C14E); box-shadow: 0 5px 0 #B8860B, 0 8px 12px rgba(0,0,0,.25); font: 800 15px var(--k-text); color: #6B4A00; } .pet-btns button:active { transform: translateY(4px); box-shadow: 0 1px 0 #B8860B; }
.pet-brandmark { font: 800 11px var(--k-text); letter-spacing: .3em; color: rgba(255,255,255,.8); }
.pet-stats { height: 100%; overflow-y: auto; padding: 22px; background: rgba(255,255,255,.7); backdrop-filter: blur(8px); } .pet-stats h3 { margin: 0 0 12px; font: 800 20px var(--k-text); } .pet-stats p { display: flex; justify-content: space-between; align-items: center; margin: 6px 0; font: 600 14px var(--k-text); }
.pet-bar { display: flex; gap: 3px; } .pet-bar i { width: 18px; height: 14px; border-radius: 3px; background: #F7D2DF; } .pet-bar i.on { background: #E2457E; }
.pet-stats dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 14px 0; font: 14px var(--k-text); } .pet-stats dt { color: #A06F83; } .pet-stats dd { margin: 0; }
.pet-hint { font: 12px var(--k-text) !important; color: #A06F83; } .pet-stats h4 { margin: 18px 0 8px; font: 700 14px var(--k-text); } .pet-stats select { width: 100%; height: 32px; margin-bottom: 8px; border-radius: 8px; border: 1px solid #EFB9CC; }
.pet-list { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; } .pet-list button { padding: 6px; border-radius: 8px; background: #fff; } .pet-list button.on { background: #E2457E; } .pet-list button.on .pet-mini i.on { background: #fff; }
.pet-mini { width: 100%; aspect-ratio: 1; } .pet-mini i.on { background: #3D1F2B; }
`;
