// ANALYTICS — a product-analytics dashboard about your library: KPI cards, library growth over time, a top-games
// bar chart, an installed/not donut and an events table. Every number is real; segments are collections.
import { useMemo } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, hrs, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Analytics() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const gs = b.games;
	const growth = useMemo(() => {
		const dated = gs.filter((g) => g.added).sort((a, c) => a.added - c.added);
		if (!dated.length) return [];
		const out: { t: number; n: number }[] = []; const first = new Date(dated[0].added * 1000); const now = new Date();
		let i = 0;
		for (let d = new Date(first.getFullYear(), first.getMonth(), 1); d <= now; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) { const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime() / 1000; while (i < dated.length && dated[i].added < end) i++; out.push({ t: d.getTime() / 1000, n: i }); }
		return out;
	}, [gs]);
	const top = useMemo(() => [...gs].sort((a, c) => c.minutes - a.minutes).slice(0, 10), [gs]);
	const inst = gs.filter((g) => g.installed).length;
	const total = gs.reduce((n, g) => n + g.minutes, 0);
	const active = gs.filter((g) => g.minutes2w).length;
	const maxN = Math.max(1, ...growth.map((p) => p.n));
	const path = growth.map((p, i) => `${(i / Math.max(1, growth.length - 1)) * 600},${190 - (p.n / maxN) * 180}`).join(' ');
	const frac = gs.length ? inst / gs.length : 0, C = 2 * Math.PI * 60;
	const K = ({ l, v, s }: { l: string; v: string; s: string }) => <div className="anl-kpi"><span>{l}</span><b>{v}</b><em>{s}</em></div>;
	return (
		<AltPage className="anl" brand={<><span className="anl-logo">▮▮▮</span>Analytics</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Filter games">
			<div className="anl-app">
				<nav className="anl-nav"><h5>Segments</h5>{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}<em>{i.games.length}</em></button>)}</nav>
				<section className="anl-main">
					<header><h1>{b.found ? 'Filtered' : b.isle?.name}</h1><span>All time · updated just now</span></header>
					<div className="anl-kpis"><K l="Games" v={String(gs.length)} s={`${gs.filter((g) => !g.minutes).length} never opened`} /><K l="Total playtime" v={`${Math.round(total / 60).toLocaleString()} h`} s={`${(total / 60 / Math.max(1, gs.length)).toFixed(1)} h per game`} /><K l="Active (14 d)" v={String(active)} s={`${Math.round(gs.reduce((n, g) => n + g.minutes2w, 0) / 60)} h played`} /><K l="Installed" v={`${Math.round(frac * 100)}%`} s={`${inst} of ${gs.length}`} /></div>
					<div className="anl-row">
						<div className="anl-card wide"><h4>Library size over time</h4><svg viewBox="0 0 600 200" preserveAspectRatio="none" className="anl-line">{[0, 1, 2, 3].map((i) => <line key={i} x1="0" x2="600" y1={10 + i * 60} y2={10 + i * 60} />)}{growth.length > 1 && <><polygon points={`0,190 ${path} 600,190`} /><polyline points={path} /></>}</svg>
							<div className="anl-axis"><span>{growth[0] ? dateOf(growth[0].t, { month: 'short', year: 'numeric' }) : ''}</span><span>{maxN} games</span><span>Now</span></div></div>
						<div className="anl-card"><h4>Install rate</h4><svg viewBox="0 0 160 160" className="anl-donut"><circle cx="80" cy="80" r="60" className="t" /><circle cx="80" cy="80" r="60" className="v" strokeDasharray={`${C * frac} ${C}`} transform="rotate(-90 80 80)" /><text x="80" y="86">{Math.round(frac * 100)}%</text></svg><p><i className="a" />Installed {inst}</p><p><i />Not installed {gs.length - inst}</p></div>
					</div>
					<div className="anl-row">
						<div className="anl-card"><h4>Top 10 by playtime</h4>{top.map((g) => <button key={g.appid} data-appid={g.appid} className="anl-bar" onClick={() => select(g.appid)}><span>{g.name}</span><i style={{ width: (g.minutes / Math.max(1, top[0].minutes)) * 100 + '%' }} /><b>{hrs(g)} h</b></button>)}</div>
						<div className="anl-card wide"><h4>Recent events</h4><table><thead><tr><th>Event</th><th>Game</th><th>When</th><th>Value</th></tr></thead><tbody>
							{[...gs].filter((g) => g.lastPlayed).sort((a, c) => c.lastPlayed - a.lastPlayed).slice(0, 12).map((g) => <tr key={g.appid} onClick={() => select(g.appid)}><td><span className="anl-ev">session_end</span></td><td>{g.name}</td><td>{formatAgo(g.lastPlayed)}</td><td>{formatPlaytime(g.minutes)}</td></tr>)}</tbody></table></div>
					</div>
				</section>
				{sel && <aside className="anl-drill" key={sel.appid}><button className="anl-x" onClick={() => select(null)}>✕</button><Art g={sel} kind="header" /><h3>{sel.name}</h3><div className="anl-kpis sm"><K l="Hours" v={String(hrs(sel))} s="all time" /><K l="2 weeks" v={(sel.minutes2w / 60).toFixed(1)} s="hours" /><K l="Score" v={String(sel.metacritic || '—')} s="Metacritic" /><K l="Added" v={dateOf(sel.added, { month: 'short', year: '2-digit' })} s={sel.installed ? 'installed' : 'not installed'} /></div><PlayBtn g={sel} className="anl-go" /><Actions g={sel} /></aside>}
			</div>
		</AltPage>
	);
}

export const analyticsCss = tok('analytics', { bg: '#F6F7FB', s1: '#FFFFFF', s2: '#EEF0F6', s3: '#DDE1EB', fg: '#161A2C', fg2: '#454B63', fg3: '#8A90A6', acc: '#5B5BF7', on: '#fff', top: '#FFFFFF', font: '"Segoe UI", Inter, system-ui, sans-serif' }) + `
.anl-brand { display: flex; gap: 8px; align-items: center; font: 700 17px var(--k-text); color: #161A2C; } .anl-logo { color: #5B5BF7; letter-spacing: -2px; font-size: 13px; }
.anl-app { position: absolute; inset: 0; display: grid; grid-template-columns: 220px minmax(0, 1fr) auto; }
.anl-nav { overflow-y: auto; padding: 14px 10px; background: #fff; border-right: 1px solid #E6E8F0; } .anl-nav h5 { margin: 4px 10px 8px; font: 700 11px var(--k-text); text-transform: uppercase; letter-spacing: .08em; color: #8A90A6; }
.anl-nav button { display: flex; justify-content: space-between; width: 100%; padding: 8px 10px; border-radius: 8px; font: 500 13px var(--k-text); color: #454B63; text-align: left; } .anl-nav button.on { background: #EEEEFE; color: #5B5BF7; } .anl-nav em { font-style: normal; color: #8A90A6; }
.anl-main { overflow-y: auto; padding: 20px 26px 50px; display: grid; gap: 16px; align-content: start; }
.anl-main header { display: flex; align-items: baseline; gap: 14px; } .anl-main h1 { margin: 0; font: 700 24px var(--k-text); } .anl-main header span { font: 13px var(--k-text); color: #8A90A6; }
.anl-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; } .anl-kpi { padding: 16px; border-radius: 12px; background: #fff; box-shadow: 0 1px 2px rgba(22,26,44,.06), 0 0 0 1px #E6E8F0; }
.anl-kpi span { display: block; font: 600 12px var(--k-text); color: #8A90A6; } .anl-kpi b { display: block; margin: 6px 0 2px; font: 700 28px var(--k-text); color: #161A2C; } .anl-kpi em { font: 12px var(--k-text); font-style: normal; color: #1F9D6B; }
.anl-row { display: grid; grid-template-columns: 1fr 2fr; gap: 14px; } .anl-row:first-of-type { grid-template-columns: 2fr 1fr; }
.anl-card { padding: 16px; border-radius: 12px; background: #fff; box-shadow: 0 1px 2px rgba(22,26,44,.06), 0 0 0 1px #E6E8F0; min-width: 0; } .anl-card h4 { margin: 0 0 12px; font: 700 14px var(--k-text); color: #161A2C; }
.anl-line { width: 100%; height: 200px; display: block; } .anl-line line { stroke: #EEF0F6; } .anl-line polygon { fill: rgba(91,91,247,.12); } .anl-line polyline { fill: none; stroke: #5B5BF7; stroke-width: 2.5; vector-effect: non-scaling-stroke; }
.anl-axis { display: flex; justify-content: space-between; font: 12px var(--k-text); color: #8A90A6; }
.anl-donut { width: 160px; display: block; margin: 0 auto 10px; } .anl-donut circle { fill: none; stroke-width: 18; } .anl-donut .t { stroke: #EEF0F6; } .anl-donut .v { stroke: #5B5BF7; stroke-linecap: round; } .anl-donut text { font: 700 26px var(--k-text); fill: #161A2C; text-anchor: middle; }
.anl-card p { display: flex; gap: 8px; align-items: center; margin: 4px 0; font: 13px var(--k-text); color: #454B63; } .anl-card p i { width: 10px; height: 10px; border-radius: 3px; background: #EEF0F6; } .anl-card p i.a { background: #5B5BF7; }
.anl-bar { display: grid; grid-template-columns: 140px 1fr 60px; gap: 10px; align-items: center; width: 100%; padding: 5px 0; text-align: left; font: 13px var(--k-text); color: #454B63; } .anl-bar span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .anl-bar i { height: 12px; border-radius: 6px; background: linear-gradient(90deg, #5B5BF7, #9B8CFF); } .anl-bar b { text-align: right; color: #161A2C; } .anl-bar:hover span { color: #5B5BF7; }
.anl-card table { width: 100%; border-collapse: collapse; font: 13px var(--k-text); } .anl-card th { text-align: left; padding: 6px 8px; font: 600 11px var(--k-text); color: #8A90A6; text-transform: uppercase; border-bottom: 1px solid #EEF0F6; } .anl-card td { padding: 7px 8px; border-bottom: 1px solid #F3F4F8; color: #454B63; } .anl-card tr:hover td { background: #F8F8FF; cursor: pointer; }
.anl-ev { padding: 2px 8px; border-radius: 99px; background: #EEEEFE; color: #5B5BF7; font: 600 11px Consolas, monospace; }
.anl-drill { position: relative; width: 340px; overflow-y: auto; padding: 18px; background: #fff; border-left: 1px solid #E6E8F0; animation: k-fade .25s both; } .anl-drill > img { width: 100%; border-radius: 10px; } .anl-drill h3 { margin: 12px 0; font: 700 18px var(--k-text); }
.anl-x { position: absolute; right: 24px; top: 24px; width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,.5); color: #fff; } .anl-kpis.sm { grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; } .anl-kpis.sm b { font-size: 20px; }
.anl-go { width: 100%; height: 40px; border-radius: 10px; background: #5B5BF7 !important; color: #fff !important; font: 700 14px var(--k-text) !important; margin-bottom: 8px; }
`;
