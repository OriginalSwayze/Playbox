// FLIGHTS — a flight-booking site. Search from your library to a destination (collection), sort the results,
// pick a flight (a game: duration = hours played, direct if installed, one stop if it needs installing), choose a
// seat on the cabin map, then Book — which plays it.
import { useMemo, useState } from 'react';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const dep = (g: Game) => (g.lastPlayed ? new Date(g.lastPlayed * 1000) : new Date(2000, 0, 1, 6 + (g.appid % 14), (g.appid % 4) * 15));
const hm = (d: Date) => d.toTimeString().slice(0, 5);
const dur = (g: Game) => `${Math.floor(g.minutes / 60)}h ${g.minutes % 60}m`;
const fare = (g: Game) => 20 + (g.appid % 180);

export function Flights() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [sort, setSort] = useState<'best' | 'cheap' | 'long'>('best');
	const [seat, setSeat] = useState<string | null>(null);
	const res = useMemo(() => [...b.games].sort((x, y) => (sort === 'cheap' ? fare(x) - fare(y) : sort === 'long' ? y.minutes - x.minutes : y.lastPlayed - x.lastPlayed)).slice(0, 80), [b.games, sort]);
	const taken = (r: number, c: number) => ((sel?.appid ?? 0) * (r + 3) * (c + 7)) % 5 === 0;
	return (
		<AltPage className="flt" brand={<><span className="flt-plane">✈</span>skyhop</>}>
			<div className="flt-app">
				<div className="flt-search">
					<label><em>From</em><b>KST · Your library</b></label><span className="flt-swap">⇄</span>
					<label><em>To</em><select value={b.cur} onChange={(e) => { b.setQ(''); b.setCur(e.target.value); select(null); }}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select></label>
					<label><em>Search</em><input value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Any destination" spellCheck={false} /></label>
					<label><em>Passengers</em><b>1 adult · Economy</b></label>
				</div>
				<div className="flt-body">
					<section className="flt-res">
						<div className="flt-sorts">{([['best', 'Best'], ['cheap', 'Cheapest'], ['long', 'Longest']] as const).map(([k, n]) => <button key={k} className={sort === k ? 'on' : ''} onClick={() => setSort(k)}><b>{n}</b></button>)}</div>
						{res.map((g) => { const d = dep(g); const a = new Date(d.getTime() + g.minutes * 60000); return (
							<button key={g.appid} data-appid={g.appid} className={'flt-row' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => { select(g.appid); setSeat(null); }}>
								<span className="flt-air"><Art g={g} kind="capsule" /></span>
								<span className="flt-times"><b>{hm(d)} – {hm(a)}</b><em>{g.name}</em></span>
								<span className="flt-dur"><b>{dur(g)}</b><em>KST – {(g.name.replace(/[^A-Za-z]/g, '').toUpperCase() + 'XXX').slice(0, 3)}</em></span>
								<span className={'flt-stops' + (g.installed ? '' : ' one')}>{g.installed ? 'Direct' : '1 stop (install)'}</span>
								<span className="flt-fare"><b>£{fare(g)}</b><em>return</em></span>
							</button>); })}
					</section>
					{sel && (
						<aside className="flt-book" key={sel.appid}>
							<Art g={sel} kind="header" className="flt-hero" />
							<h3>{sel.name}</h3><p>{dur(sel)} · {sel.installed ? 'Direct' : '1 stop: install first'} · flown {formatPlaytime(sel.minutes)}</p>
							<h4>Choose a seat {seat && <b>· {seat}</b>}</h4>
							<div className="flt-cabin">{Array.from({ length: 10 }, (_, r) => <div key={r} className="flt-srow"><em>{r + 1}</em>{'ABC DEF'.split('').map((c, k) => c === ' ' ? <i key={k} /> : <button key={k} disabled={taken(r, k)} className={seat === `${r + 1}${c}` ? 'on' : ''} onClick={() => setSeat(`${r + 1}${c}`)} />)}</div>)}</div>
							<PlayBtn g={sel} className="flt-go" label={[`Book${seat ? ' seat ' + seat : ''} · Play`, 'Book · Install']} />
							<Actions g={sel} />
						</aside>
					)}
				</div>
			</div>
		</AltPage>
	);
}

export const flightsCss = tok('flights', { bg: '#F1F4F8', s1: '#FFFFFF', s2: '#E6ECF3', s3: '#CDD8E4', fg: '#0B1C2C', fg2: '#3B4D5F', fg3: '#6F8196', acc: '#0062E3', on: '#fff', top: '#05203C', topFg: '#FFFFFF', font: '"Segoe UI", system-ui, sans-serif' }) + `
.flt-brand { display: flex; gap: 6px; align-items: center; font: 800 20px var(--k-text); color: #fff; } .flt-plane { color: #00C2FF; }
.flt-app { position: absolute; inset: 0; display: grid; grid-template-rows: auto minmax(0, 1fr); }
.flt-search { display: flex; gap: 4px; align-items: stretch; padding: 16px 30px 22px; background: #05203C; }
.flt-search label { display: grid; gap: 2px; min-width: 200px; padding: 8px 14px; border-radius: 8px; background: #fff; } .flt-search em { font: 600 11px var(--k-text); font-style: normal; color: #6F8196; } .flt-search b { font: 600 15px var(--k-text); color: #0B1C2C; }
.flt-search select, .flt-search input { border: 0; outline: none; font: 600 15px var(--k-text); color: #0B1C2C; background: none; padding: 0; } .flt-swap { display: grid; place-items: center; width: 34px; color: #fff; font-size: 18px; }
.flt-body { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 20px; min-height: 0; padding: 18px 30px 0; }
.flt-res { overflow-y: auto; padding-bottom: 40px; } .flt-sorts { display: grid; grid-template-columns: repeat(3, 1fr); margin-bottom: 12px; border-radius: 10px; overflow: hidden; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.1); } .flt-sorts button { padding: 12px; font: 15px var(--k-text); color: #3B4D5F; } .flt-sorts button.on { background: #05203C; color: #fff; }
.flt-row { display: grid; grid-template-columns: 48px minmax(0, 1.6fr) 1fr 1fr auto; gap: 16px; align-items: center; width: 100%; margin-bottom: 10px; padding: 14px 18px; border-radius: 12px; background: #fff; text-align: left; box-shadow: 0 1px 3px rgba(0,0,0,.1); } .flt-row:hover { box-shadow: 0 4px 14px rgba(0,0,0,.14); } .flt-row.on { box-shadow: 0 0 0 2px #0062E3; }
.flt-air img, .flt-air .alt-noart { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; font-size: 5px; } .flt-row b { display: block; font: 700 17px var(--k-text); color: #0B1C2C; } .flt-row em { display: block; font: 13px var(--k-text); font-style: normal; color: #6F8196; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.flt-stops { font: 600 14px var(--k-text); color: #0C8346; } .flt-stops.one { color: #C2410C; } .flt-fare { text-align: right; } .flt-fare b { font-size: 22px; }
.flt-book { width: 360px; overflow-y: auto; padding: 16px; margin-bottom: 18px; border-radius: 14px; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.1); animation: k-fade .2s both; } .flt-hero { width: 100%; border-radius: 10px; } .flt-book h3 { margin: 10px 0 4px; font: 700 18px var(--k-text); } .flt-book p { margin: 0 0 12px; font: 13px var(--k-text); color: #6F8196; }
.flt-book h4 { margin: 0 0 8px; font: 700 14px var(--k-text); } .flt-book h4 b { color: #0062E3; }
.flt-cabin { display: grid; gap: 5px; justify-content: center; padding: 14px 20px; margin-bottom: 14px; border-radius: 60px 60px 14px 14px; background: #F1F4F8; } .flt-srow { display: grid; grid-template-columns: 20px repeat(3, 24px) 18px repeat(3, 24px); gap: 5px; align-items: center; } .flt-srow em { font: 11px var(--k-text); font-style: normal; color: #6F8196; }
.flt-srow button { height: 24px; border-radius: 6px 6px 3px 3px; background: #CDE3FF; } .flt-srow button:hover:not(:disabled) { background: #7DB4FF; } .flt-srow button.on { background: #0062E3; } .flt-srow button:disabled { background: #CDD8E4; cursor: not-allowed; }
.flt-go { width: 100%; height: 48px; border-radius: 10px; background: #0062E3 !important; color: #fff !important; font: 700 15px var(--k-text) !important; margin-bottom: 8px; }
`;
