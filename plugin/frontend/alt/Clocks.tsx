// CLOCKS — a clock app. "World clock" shows each game as an analogue clock set to the time of day you last played
// it; "Alarms" lists your unplayed games to set reminders on; "Stopwatch" reads a game's total playtime.
import { useEffect, useState } from 'react';
import { formatAgo, type Game } from '../steam/library';
import { Actions, AltPage, PlayBtn, Art, dateOf, useBrowse, useSelectedGame, useLibraryLists } from './common';
import { tok } from './kit';

function Face({ unix, size = 120 }: { unix: number; size?: number }) {
	const d = new Date(unix * 1000); const h = d.getHours() % 12, m = d.getMinutes();
	const night = d.getHours() < 6 || d.getHours() >= 19;
	return (
		<svg className={'clk-face' + (night ? ' night' : '')} width={size} height={size} viewBox="0 0 100 100">
			<circle cx="50" cy="50" r="48" className="bg" />
			{Array.from({ length: 12 }, (_, i) => <text key={i} x={50 + Math.sin(i * Math.PI / 6) * 38} y={53.5 + -Math.cos(i * Math.PI / 6) * 38} className="n">{i || 12}</text>)}
			{unix > 0 && <><line x1="50" y1="50" x2={50 + Math.sin((h + m / 60) * Math.PI / 6) * 22} y2={50 - Math.cos((h + m / 60) * Math.PI / 6) * 22} className="h" />
				<line x1="50" y1="50" x2={50 + Math.sin(m * Math.PI / 30) * 32} y2={50 - Math.cos(m * Math.PI / 30) * 32} className="m" /></>}
			<circle cx="50" cy="50" r="2.5" className="c" />
		</svg>
	);
}
const hm = (u: number) => (u ? new Date(u * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '--:--');

export function Clocks() {
	const b = useBrowse();
	const { unplayed } = useLibraryLists();
	const [sel, select] = useSelectedGame();
	const [tab, setTab] = useState<'world' | 'alarm' | 'watch'>('world');
	const [alarms, setAlarms] = useState<Record<number, boolean>>({});
	const [tick, setTick] = useState(0);
	useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 1000); return () => clearInterval(t); }, []);
	const g: Game | null = sel;
	const sw = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:${String(tick % 60).padStart(2, '0')}`;
	return (
		<AltPage className="clk" brand={<><Face unix={Date.now() / 1000} size={24} />Clocks</>}>
			<div className="clk-app">
				<nav className="clk-tabs">{([['world', 'World clock'], ['alarm', 'Alarms'], ['watch', 'Stopwatch']] as const).map(([id, n]) => <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{n}</button>)}</nav>
				{g ? (
					<section className="clk-detail" key={g.appid}>
						<button className="clk-back" onClick={() => select(null)}>‹ All clocks</button>
						<Face unix={g.lastPlayed} size={320} />
						<h1>{g.name}</h1>
						<p>{g.lastPlayed ? `Last session ended at ${hm(g.lastPlayed)} on ${dateOf(g.lastPlayed, { weekday: 'long', day: 'numeric', month: 'long' })} (${formatAgo(g.lastPlayed).toLowerCase()})` : 'No sessions yet'}</p>
						<div className="clk-sw">{sw(g.minutes)}</div><em className="clk-swl">total time on the stopwatch</em>
						<PlayBtn g={g} className="clk-go" label={['Start (Play)', 'Install']} />
						<Actions g={g} className="clk-act" />
					</section>
				) : tab === 'world' ? (
					<section className="clk-world">
						<div className="clk-isl">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => b.setCur(i.id)}>{i.name}</button>)}</div>
						<div className="clk-grid">{b.games.filter((x) => x.lastPlayed).slice(0, 60).map((x) => <button key={x.appid} data-appid={x.appid} className="clk-card" onClick={() => select(x.appid)}><Face unix={x.lastPlayed} /><b>{x.name}</b><span>{hm(x.lastPlayed)} · {formatAgo(x.lastPlayed)}</span></button>)}</div>
					</section>
				) : tab === 'alarm' ? (
					<section className="clk-alarms">{unplayed.slice(0, 80).map((x, i) => <div key={x.appid} className="clk-al"><span className="clk-at">{String(7 + (i % 14)).padStart(2, '0')}:{i % 2 ? '30' : '00'}</span><button data-appid={x.appid} onClick={() => select(x.appid)}><b>{x.name}</b><em>Never played · reminder</em></button><button className={'clk-tog' + (alarms[x.appid] ? ' on' : '')} onClick={() => setAlarms({ ...alarms, [x.appid]: !alarms[x.appid] })}><i /></button></div>)}</section>
				) : (
					<section className="clk-laps"><div className="clk-sw big">{sw(b.games.reduce((n, x) => n + x.minutes, 0))}</div><em className="clk-swl">{b.isle?.name}: all hours on the clock</em>
						<ol>{[...b.games].sort((x, y) => y.minutes - x.minutes).slice(0, 30).map((x, i) => <li key={x.appid}><span>Lap {i + 1}</span><button data-appid={x.appid} onClick={() => select(x.appid)}><Art g={x} kind="capsule" />{x.name}</button><b>{String(Math.floor(x.minutes / 60)).padStart(2, '0')}:{String(x.minutes % 60).padStart(2, '0')}:00</b></li>)}</ol></section>
				)}
			</div>
		</AltPage>
	);
}

export const clocksCss = tok('clocks', { bg: '#101114', s1: '#1C1D22', s2: '#26282E', s3: '#33353D', fg: '#F4F4F6', fg2: '#B4B6BE', fg3: '#74767F', acc: '#FF9F0A', on: '#1B1000', font: '"Segoe UI", system-ui, sans-serif' }) + `
.clk-brand { display: flex; gap: 8px; align-items: center; font: 600 18px var(--k-text); color: #F4F4F6; }
.clk-face .bg { fill: #F4F4F6; } .clk-face.night .bg { fill: #1C1D22; stroke: #33353D; } .clk-face .n { font: 600 8px var(--k-text); fill: #101114; text-anchor: middle; } .clk-face.night .n { fill: #F4F4F6; }
.clk-face .h { stroke: #101114; stroke-width: 3.5; stroke-linecap: round; } .clk-face .m { stroke: #101114; stroke-width: 2.2; stroke-linecap: round; } .clk-face.night .h, .clk-face.night .m { stroke: #F4F4F6; } .clk-face .c { fill: #FF9F0A; }
.clk-app { position: absolute; inset: 0; display: grid; grid-template-rows: 56px minmax(0, 1fr); }
.clk-tabs { display: flex; gap: 6px; justify-content: center; align-items: center; } .clk-tabs button { height: 36px; padding: 0 20px; border-radius: 18px; font: 600 14px var(--k-text); color: #B4B6BE; } .clk-tabs button.on { background: #26282E; color: #FF9F0A; }
.clk-world, .clk-alarms, .clk-laps, .clk-detail { overflow-y: auto; padding: 10px 40px 60px; }
.clk-isl { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; margin-bottom: 20px; } .clk-isl button { padding: 5px 12px; border-radius: 99px; background: #1C1D22; color: #B4B6BE; font: 600 12px var(--k-text); } .clk-isl button.on { background: #F4F4F6; color: #101114; }
.clk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 16px; }
.clk-card { display: grid; justify-items: center; gap: 6px; padding: 18px 10px; border-radius: 22px; background: #1C1D22; transition: transform .25s var(--k-spring); animation: k-rise .4s var(--k-out) both; } .clk-card:hover { transform: translateY(-4px); }
.clk-card b { font: 600 14px var(--k-text); color: #F4F4F6; text-align: center; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .clk-card span { font: 12px var(--k-text); color: #74767F; }
.clk-al { display: flex; gap: 20px; align-items: center; max-width: 760px; margin: 0 auto; padding: 14px 4px; border-bottom: 1px solid #26282E; } .clk-at { font: 200 46px var(--k-text); color: #F4F4F6; width: 150px; }
.clk-al > button:nth-child(2) { flex: 1; text-align: left; } .clk-al b { display: block; font: 600 16px var(--k-text); color: #F4F4F6; } .clk-al em { font: 13px var(--k-text); font-style: normal; color: #74767F; }
.clk-tog { width: 52px; height: 32px; border-radius: 16px; background: #33353D; position: relative; transition: background .25s; } .clk-tog i { position: absolute; left: 3px; top: 3px; width: 26px; height: 26px; border-radius: 50%; background: #fff; transition: transform .25s var(--k-spring); } .clk-tog.on { background: #34C759; } .clk-tog.on i { transform: translateX(20px); }
.clk-sw { text-align: center; font: 200 72px Consolas, "Segoe UI", monospace; color: #F4F4F6; font-variant-numeric: tabular-nums; } .clk-sw.big { font-size: 110px; } .clk-swl { display: block; text-align: center; font: 13px var(--k-text); font-style: normal; color: #74767F; margin-bottom: 20px; }
.clk-laps ol { list-style: none; max-width: 700px; margin: 0 auto; padding: 0; } .clk-laps li { display: grid; grid-template-columns: 70px 1fr auto; gap: 14px; align-items: center; padding: 10px 0; border-bottom: 1px solid #26282E; font: 15px var(--k-text); color: #B4B6BE; }
.clk-laps li button { display: flex; gap: 10px; align-items: center; text-align: left; color: #F4F4F6; font: 15px var(--k-text); } .clk-laps li img { width: 28px; height: 42px; object-fit: cover; border-radius: 3px; } .clk-laps li b { font: 500 16px Consolas, monospace; color: #F4F4F6; }
.clk-detail { display: grid; justify-items: center; align-content: start; gap: 8px; text-align: center; animation: k-fade .3s both; } .clk-back { justify-self: start; color: #FF9F0A; font: 600 14px var(--k-text); }
.clk-detail h1 { margin: 10px 0 0; font: 700 30px var(--k-text); color: #F4F4F6; } .clk-detail p { margin: 0 0 10px; color: #B4B6BE; font: 15px var(--k-text); }
.clk-go { width: 220px; height: 54px; border-radius: 27px; background: #FF9F0A !important; color: #1B1000 !important; font: 700 17px var(--k-text) !important; } .clk-act { width: 360px; }
`;
