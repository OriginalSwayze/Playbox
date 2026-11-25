// HEATMAP — a contribution calendar. A year of squares, one per day, shaded by how many of your games had their last
// session (or joined the library) that day; pick a year, hover a day for counts, click it to list that day's games.
// A game opens with Play.
import { useMemo, useState } from 'react';
import { useKestrel } from '../state/store';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useSelectedGame } from './common';
import { tok } from './kit';

const dkey = (u: number) => { const d = new Date(u * 1000); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };

export function Heatmap() {
	const library = useKestrel((s) => s.library);
	const [sel, select] = useSelectedGame();
	const [what, setWhat] = useState<'played' | 'added'>('played');
	const years = useMemo(() => [...new Set(library.flatMap((g) => [g.lastPlayed, g.added]).filter(Boolean).map((u) => new Date(u * 1000).getFullYear()))].sort((a, b) => b - a), [library]);
	const [year, setYear] = useState(() => years[0] ?? new Date().getFullYear());
	const [day, setDay] = useState<string | null>(null);
	const map = useMemo(() => { const m = new Map<string, Game[]>(); for (const g of library) { const u = what === 'played' ? g.lastPlayed : g.added; if (!u) continue; const k = dkey(u); (m.get(k) ?? m.set(k, []).get(k)!).push(g); } return m; }, [library, what]);
	const start = new Date(year, 0, 1); const lead = start.getDay();
	const days = Array.from({ length: 371 }, (_, i) => new Date(year, 0, 1 - lead + i));
	const max = Math.max(1, ...days.map((d) => map.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)?.length ?? 0));
	const total = days.filter((d) => d.getFullYear() === year).reduce((n, d) => n + (map.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)?.length ?? 0), 0);
	const list = day ? map.get(day) ?? [] : [];
	const lvl = (n: number) => (n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)));
	return (
		<AltPage className="hm" brand={<>▦ Activity</>}>
			<div className="hm-app">
				<div className="hm-head"><h1>{total} {what === 'played' ? 'last sessions' : 'games added'} in {year}</h1>
					<div className="hm-seg"><button className={what === 'played' ? 'on' : ''} onClick={() => setWhat('played')}>Last played</button><button className={what === 'added' ? 'on' : ''} onClick={() => setWhat('added')}>Added</button></div>
					<div className="hm-years">{years.map((y) => <button key={y} className={y === year ? 'on' : ''} onClick={() => { setYear(y); setDay(null); }}>{y}</button>)}</div></div>
				<div className="hm-card">
					<div className="hm-months">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => <span key={m}>{m}</span>)}</div>
					<div className="hm-grid">{days.map((d) => { const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; const n = map.get(k)?.length ?? 0; const out = d.getFullYear() !== year; return <button key={k} className={'hm-d l' + (out ? 'x' : lvl(n)) + (day === k ? ' on' : '')} title={`${n} on ${d.toDateString()}`} disabled={out} onClick={() => setDay(day === k ? null : k)} />; })}</div>
					<div className="hm-legend">Less <i className="hm-d l0" /><i className="hm-d l1" /><i className="hm-d l2" /><i className="hm-d l3" /><i className="hm-d l4" /> More</div>
				</div>
				<div className="hm-bottom">
					<section className="hm-list">{day ? <><h3>{list.length} on {new Date(Number(day.split('-')[0]), Number(day.split('-')[1]), Number(day.split('-')[2])).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
						{list.map((g) => <button key={g.appid} data-appid={g.appid} className={sel?.appid === g.appid ? 'on' : ''} onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><span><b>{g.name}</b><em>{formatPlaytime(g.minutes)}</em></span></button>)}</> : <p>Click a square to see that day's games.</p>}</section>
					{sel && <aside className="hm-sel" key={sel.appid}><Art g={sel} kind="header" /><div><h3>{sel.name}</h3><p>Last played {dateOf(sel.lastPlayed)} · added {dateOf(sel.added)} · {formatPlaytime(sel.minutes)}</p><PlayBtn g={sel} className="hm-go" /><Actions g={sel} className="hm-act" /></div></aside>}
				</div>
			</div>
		</AltPage>
	);
}

export const heatmapCss = tok('heatmap', { bg: '#FFFFFF', s1: '#F6F8FA', s2: '#EAEEF2', s3: '#D0D7DE', fg: '#1F2328', fg2: '#424A53', fg3: '#656D76', acc: '#E65100', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.hm-brand { font: 600 16px var(--k-text); color: #1F2328; }
.hm-app { position: absolute; inset: 0; overflow-y: auto; padding: 24px 40px 60px; display: grid; gap: 16px; align-content: start; justify-items: center; }
.hm-head { display: flex; gap: 20px; align-items: center; flex-wrap: wrap; width: min(1100px, 100%); } .hm-head h1 { margin: 0; font: 600 22px var(--k-text); flex: 1; }
.hm-seg { display: flex; border-radius: 6px; box-shadow: inset 0 0 0 1px #D0D7DE; overflow: hidden; } .hm-seg button { padding: 5px 12px; font: 600 12px var(--k-text); color: #424A53; } .hm-seg button.on { background: #E65100; color: #fff; }
.hm-years { display: flex; gap: 4px; } .hm-years button { padding: 5px 10px; border-radius: 6px; font: 13px var(--k-text); color: #424A53; } .hm-years button.on { background: #0969DA; color: #fff; }
.hm-card { width: min(1100px, 100%); padding: 18px 20px; border-radius: 8px; box-shadow: inset 0 0 0 1px #D0D7DE; }
.hm-months { display: grid; grid-template-columns: repeat(12, 1fr); margin-bottom: 6px; font: 12px var(--k-text); color: #656D76; }
.hm-grid { display: grid; grid-template-rows: repeat(7, 1fr); grid-auto-flow: column; grid-auto-columns: 1fr; gap: 3px; }
.hm-d { aspect-ratio: 1; border-radius: 3px; box-shadow: inset 0 0 0 1px rgba(27,31,36,.06); } .hm-d.l0 { background: #EBEDF0; } .hm-d.l1 { background: #FFE0B2; } .hm-d.l2 { background: #FFB74D; } .hm-d.l3 { background: #FB8C00; } .hm-d.l4 { background: #E65100; } .hm-d.lx { background: transparent; box-shadow: none; }
.hm-grid .hm-d:not(:disabled):hover { box-shadow: 0 0 0 2px #0969DA; } .hm-d.on { box-shadow: 0 0 0 2px #1F2328 !important; }
.hm-legend { display: flex; gap: 4px; align-items: center; justify-content: flex-end; margin-top: 10px; font: 12px var(--k-text); color: #656D76; } .hm-legend .hm-d { width: 12px; display: inline-block; }
.hm-bottom { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 20px; width: min(1100px, 100%); }
.hm-list h3 { margin: 0 0 10px; font: 600 16px var(--k-text); } .hm-list p { color: #656D76; } .hm-list button { display: flex; gap: 10px; align-items: center; width: 100%; padding: 8px; border-radius: 6px; text-align: left; } .hm-list button:hover { background: #F6F8FA; } .hm-list button.on { background: #DDF4FF; }
.hm-list img, .hm-list .alt-noart { width: 32px; height: 48px; object-fit: cover; border-radius: 4px; font-size: 4px; } .hm-list b { display: block; font: 600 14px var(--k-text); } .hm-list em { font: 12px var(--k-text); font-style: normal; color: #656D76; }
.hm-sel { display: grid; grid-template-columns: 220px 300px; gap: 14px; padding: 14px; border-radius: 8px; box-shadow: inset 0 0 0 1px #D0D7DE; animation: k-fade .2s both; } .hm-sel img { width: 100%; border-radius: 6px; } .hm-sel h3 { margin: 0 0 4px; font: 600 17px var(--k-text); } .hm-sel p { margin: 0 0 10px; font: 13px var(--k-text); color: #656D76; }
.hm-go { width: 100%; height: 34px; border-radius: 6px; background: #E65100 !important; color: #fff !important; font: 600 13px var(--k-text) !important; margin-bottom: 6px; }
`;
