// CALENDAR — a calendar app. A month grid with your last session of each game on the day it happened (blue) and
// the day each game joined your library (green). Step through months; an event opens on the right.
import { useMemo, useState } from 'react';
import { useKestrel } from '../state/store';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useSelectedGame } from './common';
import { tok } from './kit';

const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function Calendar() {
	const library = useKestrel((s) => s.library);
	const [sel, select] = useSelectedGame();
	const latest = useMemo(() => Math.max(0, ...library.map((g) => g.lastPlayed)), [library]);
	const start = latest ? new Date(latest * 1000) : new Date();
	const [ym, setYm] = useState({ y: start.getFullYear(), m: start.getMonth() });
	const events = useMemo(() => {
		const m = new Map<string, { g: Game; kind: 'play' | 'add' }[]>();
		const push = (unix: number, g: Game, kind: 'play' | 'add') => { if (!unix) return; const k = key(new Date(unix * 1000)); (m.get(k) ?? m.set(k, []).get(k)!).push({ g, kind }); };
		for (const g of library) { push(g.lastPlayed, g, 'play'); push(g.added, g, 'add'); }
		return m;
	}, [library]);
	const first = new Date(ym.y, ym.m, 1);
	const lead = (first.getDay() + 6) % 7;
	const cells = Array.from({ length: 42 }, (_, i) => new Date(ym.y, ym.m, 1 - lead + i));
	const today = key(new Date());
	const shift = (n: number) => setYm(({ y, m }) => ({ y: y + Math.floor((m + n) / 12), m: (((m + n) % 12) + 12) % 12 }));
	const jump = (g: Game) => { const u = g.lastPlayed || g.added; if (u) { const d = new Date(u * 1000); setYm({ y: d.getFullYear(), m: d.getMonth() }); } select(g.appid); };
	const monthCount = cells.filter((d) => d.getMonth() === ym.m).reduce((n, d) => n + (events.get(key(d))?.length ?? 0), 0);
	return (
		<AltPage className="cal" brand={<><span className="cal-ico"><b>{new Date().getDate()}</b></span>Calendar</>}>
			<div className="cal-app">
				<aside className="cal-side">
					<button className="cal-today" onClick={() => setYm({ y: start.getFullYear(), m: start.getMonth() })}>Latest session</button>
					<div className="cal-mini">{MONTHS.map((n, i) => <button key={n} className={i === ym.m ? 'on' : ''} onClick={() => setYm({ ...ym, m: i })}>{n.slice(0, 3)}</button>)}</div>
					<div className="cal-years">{[0, -1, -2, -3, -4, -5].map((d) => <button key={d} className={ym.y === start.getFullYear() + d ? 'on' : ''} onClick={() => setYm({ ...ym, y: start.getFullYear() + d })}>{start.getFullYear() + d}</button>)}</div>
					<h5>My calendars</h5>
					<p><i className="play" />Last sessions</p><p><i className="add" />Added to library</p>
				</aside>
				<section className="cal-main">
					<header><button onClick={() => shift(-1)}>‹</button><button onClick={() => shift(1)}>›</button><h2>{MONTHS[ym.m]} {ym.y}</h2><span>{monthCount} events</span></header>
					<div className="cal-dow">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => <span key={d}>{d}</span>)}</div>
					<div className="cal-grid">
						{cells.map((d) => { const ev = events.get(key(d)) ?? []; return (
							<div key={key(d)} className={'cal-day' + (d.getMonth() !== ym.m ? ' out' : '') + (key(d) === today ? ' now' : '')}>
								<span className="cal-n">{d.getDate()}</span>
								{ev.slice(0, 3).map((e) => <button key={e.kind + e.g.appid} data-appid={e.g.appid} className={'cal-ev ' + e.kind + (sel?.appid === e.g.appid ? ' on' : '')} onClick={() => select(e.g.appid)}>{e.g.name}</button>)}
								{ev.length > 3 && <span className="cal-more">+{ev.length - 3} more</span>}
							</div>); })}
					</div>
				</section>
				{sel && (
					<aside className="cal-event" key={sel.appid}>
						<Art g={sel} kind="header" />
						<h3>{sel.name}</h3>
						<dl><dt>Last session</dt><dd><button onClick={() => jump(sel)}>{dateOf(sel.lastPlayed, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</button></dd>
							<dt>Added</dt><dd>{dateOf(sel.added, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</dd>
							<dt>Total time</dt><dd>{formatPlaytime(sel.minutes)}</dd></dl>
						<PlayBtn g={sel} className="cal-go" label={['Join now — Play', 'Install']} />
						<Actions g={sel} />
						<button className="cal-x" onClick={() => select(null)}>Close</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const calendarCss = tok('calendar', { bg: '#FFFFFF', s1: '#F1F3F4', s2: '#E8EAED', s3: '#DADCE0', fg: '#202124', fg2: '#3C4043', fg3: '#70757A', acc: '#1A73E8', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.cal-brand { display: flex; gap: 10px; align-items: center; font: 400 21px var(--k-text); color: #3C4043; }
.cal-ico { width: 28px; height: 28px; border-radius: 6px; background: #fff; box-shadow: inset 0 0 0 2px #1A73E8, inset 0 7px 0 #1A73E8; display: grid; place-items: center; padding-top: 6px; } .cal-ico b { font: 700 12px var(--k-text); color: #1A73E8; }
.cal-app { position: absolute; inset: 0; display: grid; grid-template-columns: 240px minmax(0, 1fr) auto; }
.cal-side { padding: 16px; overflow-y: auto; }
.cal-today { height: 48px; padding: 0 22px; border-radius: 16px; background: #fff; box-shadow: 0 1px 3px rgba(60,64,67,.3), 0 4px 8px 3px rgba(60,64,67,.15); font: 600 14px var(--k-text); color: #3C4043; margin-bottom: 20px; }
.cal-mini, .cal-years { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin-bottom: 14px; }
.cal-mini button, .cal-years button { height: 30px; border-radius: 15px; font: 13px var(--k-text); color: #3C4043; } .cal-mini button:hover, .cal-years button:hover { background: #F1F3F4; } .cal-mini .on, .cal-years .on { background: #1A73E8; color: #fff; }
.cal-side h5 { margin: 18px 0 8px; font: 600 14px var(--k-text); color: #3C4043; } .cal-side p { display: flex; gap: 10px; align-items: center; margin: 6px 0; font: 14px var(--k-text); color: #3C4043; }
.cal-side i { width: 16px; height: 16px; border-radius: 3px; } i.play { background: #1A73E8; } i.add { background: #188038; }
.cal-main { display: grid; grid-template-rows: 60px 26px minmax(0, 1fr); min-height: 0; border-left: 1px solid #DADCE0; }
.cal-main header { display: flex; gap: 6px; align-items: center; padding: 0 16px; } .cal-main header button { width: 36px; height: 36px; border-radius: 50%; font-size: 22px; color: #5F6368; } .cal-main header button:hover { background: #F1F3F4; }
.cal-main h2 { margin: 0 14px; font: 400 22px var(--k-text); color: #3C4043; } .cal-main header span { font: 13px var(--k-text); color: #70757A; }
.cal-dow { display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid #DADCE0; } .cal-dow span { text-align: center; font: 600 11px var(--k-text); color: #70757A; text-transform: uppercase; }
.cal-grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); grid-template-rows: repeat(6, minmax(0, 1fr)); }
.cal-day { min-width: 0; padding: 4px 4px; border-right: 1px solid #DADCE0; border-bottom: 1px solid #DADCE0; display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
.cal-day.out { background: #FAFAFA; } .cal-day.out .cal-n { color: #B0B3B8; }
.cal-n { align-self: center; width: 24px; height: 24px; border-radius: 50%; font: 500 12px/24px var(--k-text); text-align: center; color: #3C4043; } .cal-day.now .cal-n { background: #1A73E8; color: #fff; }
.cal-ev { padding: 2px 6px; border-radius: 4px; text-align: left; font: 500 12px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; flex: none; }
.cal-ev.play { background: #1A73E8; } .cal-ev.add { background: #E6F4EA; color: #137333; } .cal-ev.on { box-shadow: 0 0 0 2px #202124; }
.cal-more { padding: 0 6px; font: 600 11px var(--k-text); color: #3C4043; }
.cal-event { width: 360px; padding: 18px; overflow-y: auto; border-left: 1px solid #DADCE0; box-shadow: -8px 0 20px -12px rgba(0,0,0,.2); animation: k-fade .25s both; }
.cal-event img { width: 100%; border-radius: 10px; } .cal-event h3 { margin: 14px 0; font: 400 24px var(--k-text); color: #202124; }
.cal-event dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 14px; margin: 0 0 16px; font: 14px var(--k-text); } .cal-event dt { color: #70757A; } .cal-event dd { margin: 0; color: #202124; } .cal-event dd button { color: #1A73E8; text-decoration: underline; font: inherit; }
.cal-go { width: 100%; height: 40px; border-radius: 20px; background: #1A73E8 !important; color: #fff !important; font: 600 14px var(--k-text) !important; margin-bottom: 8px; }
.cal-x { margin-top: 10px; font: 600 13px var(--k-text); color: #1A73E8; }
`;
