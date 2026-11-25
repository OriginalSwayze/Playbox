// TICKER — a trading terminal for your time. Each game is a symbol priced in hours played; "today's move" is the
// last two weeks. A scrolling tape runs along the top, the watchlist is a collection, and the order ticket plays.
import { useMemo } from 'react';
import { formatAgo, type Game } from '../steam/library';
import { Actions, AltPage, PlayBtn, dateOf, hrs, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const sym = (g: Game) => (g.name.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).map((w) => w[0]).join('') + g.name.replace(/[^A-Za-z]/g, '')).toUpperCase().slice(0, 4).padEnd(3, 'X');
const move = (g: Game) => (g.minutes ? (g.minutes2w / Math.max(1, g.minutes - g.minutes2w)) * 100 : 0);
const pct = (n: number) => (n > 0 ? '+' : '') + n.toFixed(2) + '%';

export function Ticker() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const g = sel ?? b.games[0] ?? null;
	const ranked = useMemo(() => [...b.games].sort((x, y) => y.minutes - x.minutes).slice(0, 40), [b.games]);
	const tape = useMemo(() => [...b.islands.find((i) => i.id === 'recent')?.games ?? []], [b.islands]);
	const max = Math.max(1, ...ranked.map((x) => x.minutes));
	const pts = ranked.map((x, i) => `${(i / Math.max(1, ranked.length - 1)) * 1000},${300 - (x.minutes / max) * 280}`).join(' ');
	const cap = b.games.reduce((n, x) => n + x.minutes, 0) / 60;
	return (
		<AltPage className="tkr" brand={<><span className="tkr-up">▲</span>TICKER</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Symbol or name">
			<div className="tkr-app">
				<div className="tkr-tape"><div>{[...tape, ...tape].map((x, i) => <button key={i} onClick={() => select(x.appid)}><b>{sym(x)}</b> {hrs(x).toFixed(1)} <span className={move(x) > 0 ? 'up' : 'flat'}>{move(x) > 0 ? '▲' : '■'} {pct(move(x))}</span></button>)}</div></div>
				<aside className="tkr-watch">
					<div className="tkr-lists">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}</button>)}</div>
					<div className="tkr-row tkr-h"><span>Symbol</span><span>Last</span><span>Chg%</span></div>
					{b.games.slice(0, 200).map((x) => (
						<button key={x.appid} data-appid={x.appid} className={'tkr-row' + (g?.appid === x.appid ? ' on' : '')} onClick={() => select(x.appid)}>
							<span><b>{sym(x)}</b><em>{x.name}</em></span><span>{hrs(x).toFixed(1)}</span><span className={move(x) > 0 ? 'up' : 'flat'}>{pct(move(x))}</span>
						</button>
					))}
				</aside>
				<section className="tkr-main">
					<div className="tkr-idx"><div><span>{b.found ? 'SEARCH' : (b.isle?.name ?? '').toUpperCase()} INDEX</span><b>{cap.toFixed(1)} h</b></div><div><span>Constituents</span><b>{b.games.length}</b></div><div><span>Active (2 wk)</span><b className="up">{b.games.filter((x) => x.minutes2w).length}</b></div><div><span>Never traded</span><b>{b.games.filter((x) => !x.minutes).length}</b></div></div>
					<div className="tkr-chart">
						<h4>Top 40 by hours</h4>
						<svg viewBox="0 0 1000 300" preserveAspectRatio="none"><defs><linearGradient id="tkrg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#21D07A" stopOpacity=".35" /><stop offset="1" stopColor="#21D07A" stopOpacity="0" /></linearGradient></defs>
							{[0, 1, 2, 3].map((i) => <line key={i} x1="0" x2="1000" y1={20 + i * 93} y2={20 + i * 93} />)}
							{ranked.length > 1 && <><polygon points={`0,300 ${pts} 1000,300`} fill="url(#tkrg)" /><polyline points={pts} /></>}
						</svg>
					</div>
					{g && (
						<div className="tkr-quote" key={g.appid}>
							<div className="tkr-q1"><span className="tkr-sym">{sym(g)}</span><h2>{g.name}</h2><b className="tkr-px">{hrs(g).toFixed(1)}<small> HRS</small></b><span className={move(g) > 0 ? 'up' : 'flat'}>{move(g) > 0 ? '▲' : '■'} {(g.minutes2w / 60).toFixed(1)} ({pct(move(g))}) past 2 wk</span></div>
							<dl><dt>Listed</dt><dd>{dateOf(g.added)}</dd><dt>Last trade</dt><dd>{g.lastPlayed ? formatAgo(g.lastPlayed) : '—'}</dd><dt>Rating</dt><dd>{g.metacritic || '—'}</dd><dt>Holding</dt><dd>{g.installed ? 'On disk' : 'Not held'}</dd></dl>
							<div className="tkr-ticket"><PlayBtn g={g} className="tkr-buy" label={['PLAY', 'INSTALL']} /><Actions g={g} className="tkr-act" /></div>
						</div>
					)}
				</section>
			</div>
		</AltPage>
	);
}

export const tickerCss = tok('ticker', { bg: '#0B0E11', s1: '#161A1E', s2: '#1E2329', s3: '#2B3139', fg: '#EAECEF', fg2: '#B7BDC6', fg3: '#707A8A', acc: '#21D07A', on: '#04140B', top: '#0B0E11', font: '"Segoe UI", system-ui, sans-serif' }) + `
.tkr-brand { display: flex; gap: 6px; align-items: center; font: 800 18px Consolas, monospace; letter-spacing: .1em; color: #EAECEF; } .tkr-up { color: #21D07A; }
.tkr-app { position: absolute; inset: 0; display: grid; grid-template-columns: 360px minmax(0, 1fr); grid-template-rows: 34px minmax(0, 1fr); font: 13px var(--k-text); color: #EAECEF; }
.up { color: #21D07A !important; } .flat { color: #707A8A !important; }
.tkr-tape { grid-column: 1 / -1; overflow: hidden; background: #161A1E; border-bottom: 1px solid #2B3139; white-space: nowrap; } .tkr-tape > div { display: inline-flex; gap: 28px; padding: 0 14px; line-height: 34px; animation: tkr-tape 60s linear infinite; }
.tkr-tape:hover > div { animation-play-state: paused; } .tkr-tape button { font: 13px Consolas, monospace; color: #B7BDC6; } .tkr-tape b { color: #EAECEF; } @keyframes tkr-tape { to { transform: translateX(-50%); } }
.tkr-watch { overflow-y: auto; border-right: 1px solid #2B3139; background: #0F1316; }
.tkr-lists { display: flex; gap: 4px; flex-wrap: wrap; padding: 10px; border-bottom: 1px solid #2B3139; max-height: 100px; overflow-y: auto; } .tkr-lists button { padding: 3px 9px; border-radius: 4px; font: 600 12px var(--k-text); color: #B7BDC6; background: #1E2329; } .tkr-lists button.on { background: #21D07A; color: #04140B; }
.tkr-row { display: grid; grid-template-columns: minmax(0, 1fr) 64px 76px; gap: 8px; align-items: center; width: 100%; padding: 6px 12px; text-align: left; font: 13px Consolas, monospace; color: #EAECEF; } .tkr-row > span:not(:first-child) { text-align: right; }
.tkr-row:hover { background: #1E2329; } .tkr-row.on { background: #1E2B24; box-shadow: inset 3px 0 #21D07A; } .tkr-row b { display: block; } .tkr-row em { display: block; font: 11px var(--k-text); font-style: normal; color: #707A8A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tkr-h { position: sticky; top: 0; background: #0F1316; color: #707A8A; font: 600 11px var(--k-text); text-transform: uppercase; border-bottom: 1px solid #2B3139; }
.tkr-main { overflow-y: auto; padding: 16px 20px 40px; display: grid; gap: 14px; align-content: start; }
.tkr-idx { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; } .tkr-idx > div { padding: 12px 14px; border-radius: 6px; background: #161A1E; } .tkr-idx span { display: block; font: 600 11px var(--k-text); color: #707A8A; text-transform: uppercase; } .tkr-idx b { font: 600 22px Consolas, monospace; }
.tkr-chart { padding: 12px 14px; border-radius: 6px; background: #161A1E; } .tkr-chart h4 { margin: 0 0 8px; font: 600 12px var(--k-text); color: #707A8A; text-transform: uppercase; }
.tkr-chart svg { width: 100%; height: 260px; display: block; } .tkr-chart line { stroke: #2B3139; stroke-dasharray: 4 6; } .tkr-chart polyline { fill: none; stroke: #21D07A; stroke-width: 2.5; vector-effect: non-scaling-stroke; }
.tkr-quote { display: grid; grid-template-columns: 1.2fr 1fr 1fr; gap: 16px; padding: 16px; border-radius: 6px; background: #161A1E; animation: k-fade .25s both; }
.tkr-sym { padding: 2px 8px; border-radius: 4px; background: #2B3139; font: 700 12px Consolas, monospace; } .tkr-q1 h2 { margin: 8px 0 4px; font: 600 18px var(--k-text); } .tkr-px { display: block; font: 600 40px Consolas, monospace; } .tkr-px small { font-size: 14px; color: #707A8A; }
.tkr-quote dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 14px; margin: 0; align-content: start; } .tkr-quote dt { color: #707A8A; } .tkr-quote dd { margin: 0; text-align: right; font-family: Consolas, monospace; }
.tkr-buy { width: 100%; height: 44px; border-radius: 4px; background: #21D07A !important; color: #04140B !important; font: 800 15px var(--k-text) !important; letter-spacing: .08em; margin-bottom: 8px; }
`;
