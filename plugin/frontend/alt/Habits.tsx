// HABITS — a habit tracker. Pin games as habits and give each a fortnightly goal; the ring fills with the hours you
// actually played in the last two weeks, and the counter shows days since you last kept the habit. Kept on this PC.
import { useState } from 'react';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';
import { useKestrel } from '../state/store';

const KEY = 'kestrel.habits';
const load = (): Record<number, number> => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
const save = (h: Record<number, number>) => { try { localStorage.setItem(KEY, JSON.stringify(h)); } catch { /* storage off */ } };
const since = (g: Game) => (g.lastPlayed ? Math.floor((Date.now() / 1000 - g.lastPlayed) / 86400) : null);

function Ring({ p, size = 84 }: { p: number; size?: number }) { const r = 34, C = 2 * Math.PI * r; return <svg width={size} height={size} viewBox="0 0 80 80" className="hab-ring"><circle cx="40" cy="40" r={r} className="t" /><circle cx="40" cy="40" r={r} className="v" strokeDasharray={`${C * Math.min(1, p)} ${C}`} transform="rotate(-90 40 40)" /></svg>; }

export function Habits() {
	const library = useKestrel((s) => s.library);
	const { recent } = useLibraryLists();
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [habits, setHabits] = useState<Record<number, number>>(() => { const h = load(); if (Object.keys(h).length) return h; return Object.fromEntries(recent.slice(0, 4).map((g) => [g.appid, 4])); });
	const set = (h: Record<number, number>) => { setHabits(h); save(h); };
	const mine = library.filter((g) => habits[g.appid]);
	const kept = mine.filter((g) => g.minutes2w / 60 >= habits[g.appid]).length;
	return (
		<AltPage className="hab" brand={<><span className="hab-logo">✓</span>Habits</>}>
			<div className="hab-app">
				<section className="hab-main">
					<header><h1>Your habits</h1><p>{kept} of {mine.length} goals met this fortnight</p></header>
					<div className="hab-grid">{mine.map((g) => { const goal = habits[g.appid]; const p = g.minutes2w / 60 / goal; const d = since(g); return (
						<div key={g.appid} className={'hab-card' + (p >= 1 ? ' done' : '') + (sel?.appid === g.appid ? ' on' : '')}>
							<button data-appid={g.appid} className="hab-top" onClick={() => select(g.appid)}><span className="hab-rw"><Ring p={p} /><Art g={g} kind="capsule" /></span><span><b>{g.name}</b><em>{(g.minutes2w / 60).toFixed(1)} of {goal} h · 2 weeks</em></span></button>
							<div className="hab-row"><span className={'hab-streak' + (d !== null && d <= 1 ? ' hot' : '')}>{d === null ? 'never kept' : d === 0 ? 'kept today' : `${d} day${d === 1 ? '' : 's'} ago`}</span>
								<span className="hab-goal"><button onClick={() => set({ ...habits, [g.appid]: Math.max(1, goal - 1) })}>−</button>{goal} h<button onClick={() => set({ ...habits, [g.appid]: goal + 1 })}>+</button></span></div>
						</div>); })}
						{!mine.length && <p className="hab-empty">No habits yet. Add some from the right.</p>}
					</div>
				</section>
				<aside className="hab-side">
					{sel ? <div className="hab-detail" key={sel.appid}><Art g={sel} kind="header" /><h3>{sel.name}</h3><p>{formatPlaytime(sel.minutes)} all time · {formatPlaytime(sel.minutes2w)} in 2 weeks</p><PlayBtn g={sel} className="hab-go" label={['Keep the habit — Play', 'Install']} />
						<button className="hab-toggle" onClick={() => { const h = { ...habits }; if (h[sel.appid]) delete h[sel.appid]; else h[sel.appid] = 4; set(h); }}>{habits[sel.appid] ? 'Remove habit' : 'Make it a habit'}</button><Actions g={sel} /><button className="hab-x" onClick={() => select(null)}>Close</button></div> : <>
						<h4>Add a habit</h4>
						<select value={b.cur} onChange={(e) => b.setCur(e.target.value)}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select>
						<input value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Search games" spellCheck={false} />
						<div className="hab-pick">{b.games.slice(0, 120).map((g) => <div key={g.appid}><button data-appid={g.appid} onClick={() => select(g.appid)}><Art g={g} kind="capsule" />{g.name}</button><button className={'hab-add' + (habits[g.appid] ? ' on' : '')} onClick={() => { const h = { ...habits }; if (h[g.appid]) delete h[g.appid]; else h[g.appid] = 4; set(h); }}>{habits[g.appid] ? '✓' : '+'}</button></div>)}</div>
					</>}
				</aside>
			</div>
		</AltPage>
	);
}

export const habitsCss = tok('habits', { bg: '#F7F5F0', s1: '#FFFFFF', s2: '#EFECE4', s3: '#E1DCD0', fg: '#23211C', fg2: '#4F4B42', fg3: '#8F897C', acc: '#2FB67C', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.hab-brand { display: flex; gap: 8px; align-items: center; font: 800 19px var(--k-text); color: #23211C; } .hab-logo { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 8px; background: #2FB67C; color: #fff; font-size: 15px; }
.hab-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 360px; }
.hab-main { overflow-y: auto; padding: 26px 34px 60px; } .hab-main h1 { margin: 0; font: 800 32px var(--k-text); } .hab-main header p { margin: 4px 0 22px; color: #8F897C; font: 15px var(--k-text); }
.hab-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }
.hab-card { padding: 16px; border-radius: 20px; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.05), 0 0 0 1px #EFECE4; animation: k-rise .4s var(--k-out) both; } .hab-card.done { background: #EAF8F1; } .hab-card.on { box-shadow: 0 0 0 2px #2FB67C; }
.hab-top { display: flex; gap: 14px; align-items: center; width: 100%; text-align: left; } .hab-rw { position: relative; width: 84px; height: 84px; flex: none; } .hab-rw img, .hab-rw .alt-noart { position: absolute; left: 17px; top: 17px; width: 50px; height: 50px; border-radius: 50%; object-fit: cover; font-size: 6px; }
.hab-ring .t { fill: none; stroke: #EFECE4; stroke-width: 7; } .hab-ring .v { fill: none; stroke: #2FB67C; stroke-width: 7; stroke-linecap: round; transition: stroke-dasharray .8s var(--k-out); }
.hab-top b { display: block; font: 700 16px var(--k-text); color: #23211C; } .hab-top em { font: 13px var(--k-text); font-style: normal; color: #8F897C; }
.hab-row { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; } .hab-streak { padding: 4px 10px; border-radius: 99px; background: #EFECE4; font: 600 12px var(--k-text); color: #4F4B42; } .hab-streak.hot { background: #FFE8CC; color: #C25E00; } .hab-streak.hot::before { content: "🔥 "; }
.hab-goal { display: flex; gap: 8px; align-items: center; font: 600 13px var(--k-text); } .hab-goal button { width: 26px; height: 26px; border-radius: 50%; background: #EFECE4; font: 700 15px var(--k-text); color: #23211C; }
.hab-empty { color: #8F897C; }
.hab-side { display: flex; flex-direction: column; gap: 8px; min-height: 0; padding: 20px; background: #fff; border-left: 1px solid #EFECE4; } .hab-side h4 { margin: 0; font: 700 16px var(--k-text); }
.hab-side select, .hab-side input { height: 36px; padding: 0 10px; border-radius: 10px; border: 1px solid #E1DCD0; background: #fff; font: 14px var(--k-text); color: #23211C; outline: none; }
.hab-pick { flex: 1; overflow-y: auto; } .hab-pick > div { display: flex; gap: 8px; align-items: center; padding: 6px 0; border-bottom: 1px solid #F3F1EC; } .hab-pick > div > button:first-child { flex: 1; display: flex; gap: 10px; align-items: center; text-align: left; font: 14px var(--k-text); color: #23211C; min-width: 0; }
.hab-pick img, .hab-pick .alt-noart { width: 30px; height: 45px; object-fit: cover; border-radius: 4px; flex: none; font-size: 5px; } .hab-add { width: 30px; height: 30px; border-radius: 50%; background: #EFECE4; font: 700 16px var(--k-text); color: #23211C; flex: none; } .hab-add.on { background: #2FB67C; color: #fff; }
.hab-detail img { width: 100%; border-radius: 12px; } .hab-detail h3 { margin: 12px 0 4px; font: 800 20px var(--k-text); } .hab-detail p { margin: 0 0 12px; color: #8F897C; }
.hab-go { width: 100%; height: 46px; border-radius: 14px; background: #2FB67C !important; color: #fff !important; font: 700 15px var(--k-text) !important; } .hab-toggle { width: 100%; margin: 8px 0; height: 38px; border-radius: 12px; background: #EFECE4; font: 600 14px var(--k-text); color: #23211C; } .hab-x { margin-top: 8px; color: #2FB67C; font: 600 13px var(--k-text); }
`;
