// ENVELOPES — a budgeting app for your time. Each collection is an envelope with an hours budget for the fortnight
// (you set it); what you've "spent" is the real playtime of its games in the last two weeks. Transactions list the
// games that spent it. Budgets are kept on this PC.
import { useState } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSelectedGame, type Island } from './common';
import { tok } from './kit';

const KEY = 'kestrel.envelopes';
const load = (): Record<string, number> => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
const spent = (i: Island) => i.games.reduce((n, g) => n + g.minutes2w, 0) / 60;

export function Envelopes() {
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const [sel, select] = useSelectedGame();
	const [budget, setBudget] = useState<Record<string, number>>(load);
	const [cur, setCur] = useState<string | null>(null);
	const bud = (i: Island) => budget[i.id] ?? 10;
	const setB = (id: string, v: number) => { const n = { ...budget, [id]: Math.max(0, v) }; setBudget(n); try { localStorage.setItem(KEY, JSON.stringify(n)); } catch { /* storage off */ } };
	const env = islands.find((i) => i.id === cur) ?? null;
	const totalB = islands.reduce((n, i) => n + bud(i), 0), totalS = islands.reduce((n, i) => n + spent(i), 0);
	const tx = (env ? env.games : islands.flatMap((i) => i.games)).filter((g) => g.minutes2w).sort((a, b) => b.lastPlayed - a.lastPlayed);
	const seen = new Set<number>();
	return (
		<AltPage className="env" brand={<><span className="env-logo">✉</span>Envelopes</>}>
			<div className="env-app">
				<section className="env-main">
					<div className="env-sum"><div><em>Budgeted</em><b>{totalB.toFixed(0)} h</b></div><div><em>Spent (2 wk)</em><b>{totalS.toFixed(1)} h</b></div><div><em>Left</em><b className={totalB - totalS < 0 ? 'neg' : ''}>{(totalB - totalS).toFixed(1)} h</b></div></div>
					<div className="env-grid">{islands.map((i) => { const s = spent(i), b = bud(i), p = b ? s / b : s > 0 ? 2 : 0; return (
						<div key={i.id} className={'env-card' + (cur === i.id ? ' on' : '') + (p > 1 ? ' over' : '')} onClick={() => setCur(cur === i.id ? null : i.id)}>
							<div className="env-flap" /><b>{i.name}</b>
							<div className="env-bar"><i style={{ width: Math.min(100, p * 100) + '%' }} /></div>
							<div className="env-nums"><span>{s.toFixed(1)} h of {b} h</span><span className="env-adj" onClick={(e) => e.stopPropagation()}><button onClick={() => setB(i.id, b - 1)}>−</button><button onClick={() => setB(i.id, b + 1)}>+</button></span></div>
							<em>{p > 1 ? `Over by ${(s - b).toFixed(1)} h` : `${(b - s).toFixed(1)} h left`}</em>
						</div>); })}</div>
				</section>
				<aside className="env-tx">
					{sel ? <div className="env-detail" key={sel.appid}><button className="env-x" onClick={() => select(null)}>‹ Transactions</button><Art g={sel} kind="header" /><h3>{sel.name}</h3><p>Spent {formatPlaytime(sel.minutes2w)} in the last two weeks · {formatPlaytime(sel.minutes)} all time</p><PlayBtn g={sel} className="env-go" label={['Spend some time — Play', 'Install']} /><Actions g={sel} /></div> : <>
						<h4>{env ? env.name : 'All envelopes'} · transactions</h4>
						{tx.filter((g) => (seen.has(g.appid) ? false : (seen.add(g.appid), true))).slice(0, 100).map((g) => <button key={g.appid} data-appid={g.appid} className="env-row" onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><span><b>{g.name}</b><em>{g.lastPlayed ? formatAgo(g.lastPlayed) : ''}</em></span><strong>−{(g.minutes2w / 60).toFixed(1)} h</strong></button>)}
						{!tx.length && <p className="env-none">Nothing spent in the last two weeks.</p>}
						<h4 className="env-sub">Unspent games</h4>
						{(env ? env.games : islands[0]?.games ?? []).filter((g) => !g.minutes2w).slice(0, 30).map((g) => <button key={g.appid} data-appid={g.appid} className="env-row dim" onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><span><b>{g.name}</b><em>{formatPlaytime(g.minutes)} all time</em></span><strong>0.0 h</strong></button>)}
					</>}
				</aside>
			</div>
		</AltPage>
	);
}

export const envelopesCss = tok('envelopes', { bg: '#F3F6F4', s1: '#FFFFFF', s2: '#E7EDE9', s3: '#D4DED8', fg: '#16261E', fg2: '#3E5047', fg3: '#7F9087', acc: '#1E8E5A', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.env-brand { display: flex; gap: 8px; align-items: center; font: 800 19px var(--k-text); color: #16261E; } .env-logo { color: #1E8E5A; font-size: 22px; }
.env-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 400px; }
.env-main { overflow-y: auto; padding: 24px 30px 60px; }
.env-sum { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 22px; } .env-sum div { padding: 16px 18px; border-radius: 14px; background: #16261E; color: #fff; } .env-sum em { display: block; font: 600 12px var(--k-text); font-style: normal; opacity: .7; } .env-sum b { font: 800 30px var(--k-text); } .env-sum .neg { color: #FF8A80; }
.env-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
.env-card { position: relative; padding: 36px 18px 16px; border-radius: 6px; background: #F9F3E3; box-shadow: 0 4px 12px -6px rgba(0,0,0,.25), inset 0 0 0 1px #E8DDC0; cursor: pointer; overflow: hidden; transition: transform .25s var(--k-spring); animation: k-rise .4s var(--k-out) both; }
.env-card:hover { transform: translateY(-3px); } .env-card.on { box-shadow: 0 0 0 3px #1E8E5A, 0 8px 20px -8px rgba(0,0,0,.3); }
.env-flap { position: absolute; left: 0; right: 0; top: 0; height: 30px; background: linear-gradient(to bottom right, transparent 49.5%, #EFE5C9 50%) left / 50% 100% no-repeat, linear-gradient(to bottom left, transparent 49.5%, #EFE5C9 50%) right / 50% 100% no-repeat; transform: scaleY(-1); }
.env-card b { display: block; font: 700 16px var(--k-text); color: #16261E; margin-bottom: 10px; } .env-bar { height: 10px; border-radius: 5px; background: #E8DDC0; overflow: hidden; } .env-bar i { display: block; height: 100%; background: #1E8E5A; transition: width .5s; } .env-card.over .env-bar i { background: #D64545; }
.env-nums { display: flex; justify-content: space-between; align-items: center; margin: 8px 0 2px; font: 600 13px var(--k-text); color: #3E5047; } .env-adj button { width: 24px; height: 24px; margin-left: 4px; border-radius: 6px; background: #fff; box-shadow: inset 0 0 0 1px #D4DED8; font: 700 14px var(--k-text); }
.env-card em { font: 12px var(--k-text); font-style: normal; color: #7F9087; } .env-card.over em { color: #D64545; font-weight: 700; }
.env-tx { overflow-y: auto; padding: 18px; background: #fff; border-left: 1px solid #E7EDE9; } .env-tx h4 { margin: 0 0 10px; font: 700 15px var(--k-text); } .env-sub { margin-top: 20px !important; color: #7F9087; }
.env-row { display: flex; gap: 12px; align-items: center; width: 100%; padding: 8px 4px; border-bottom: 1px solid #F0F3F1; text-align: left; } .env-row:hover { background: #F7FAF8; } .env-row img, .env-row .alt-noart { width: 32px; height: 48px; object-fit: cover; border-radius: 4px; flex: none; font-size: 5px; }
.env-row span { flex: 1; min-width: 0; } .env-row b { display: block; font: 600 14px var(--k-text); color: #16261E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .env-row em { font: 12px var(--k-text); font-style: normal; color: #7F9087; } .env-row strong { font: 700 14px Consolas, monospace; color: #D64545; } .env-row.dim strong { color: #7F9087; }
.env-none { color: #7F9087; } .env-detail img { width: 100%; border-radius: 10px; margin-top: 10px; } .env-detail h3 { margin: 12px 0 4px; font: 800 20px var(--k-text); } .env-detail p { color: #3E5047; margin: 0 0 12px; } .env-x { color: #1E8E5A; font: 600 13px var(--k-text); }
.env-go { width: 100%; height: 44px; border-radius: 12px; background: #1E8E5A !important; color: #fff !important; font: 700 14px var(--k-text) !important; margin-bottom: 8px; }
`;
