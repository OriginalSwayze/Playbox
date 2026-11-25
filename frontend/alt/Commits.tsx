// COMMITS — a version-control client. Branches are collections, each a coloured lane in the graph; every game's last
// session is a commit on its branch, newest at the top, with a short hash and message. Select a commit for its
// details; Checkout plays the game.
import { useMemo } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useIslands, useSelectedGame } from './common';
import { tok } from './kit';
import { useState } from 'react';

const LANE = ['#F85149', '#3FB950', '#58A6FF', '#D29922', '#BC8CFF', '#39C5CF', '#FF7B72', '#A5D6FF'];
const hash = (g: Game) => ((g.appid * 2654435761) >>> 0).toString(16).padStart(8, '0').slice(0, 7);
const msg = (g: Game) => (g.minutes2w ? `play: ${formatPlaytime(g.minutes2w)} this fortnight` : g.minutes ? `play: session (total ${formatPlaytime(g.minutes)})` : 'chore: add to library');

export function Commits() {
	const islands = useIslands().filter((i) => i.id !== 'recent').slice(0, 8);
	const [sel, select] = useSelectedGame();
	const [only, setOnly] = useState<string | null>(null);
	const commits = useMemo(() => {
		const seen = new Set<number>(); const out: { g: Game; lane: number; at: number }[] = [];
		islands.forEach((i, k) => { if (only && i.id !== only) return; for (const g of i.games) { if (seen.has(g.appid)) continue; seen.add(g.appid); out.push({ g, lane: k, at: g.lastPlayed || g.added }); } });
		return out.filter((c) => c.at).sort((a, b) => b.at - a.at).slice(0, 200);
	}, [islands, only]);
	const lanes = islands.length;
	return (
		<AltPage className="git" brand={<>⑂ kestrel/library</>}>
			<div className="git-app">
				<nav className="git-side">
					<h5>Branches</h5>
					<button className={!only ? 'on' : ''} onClick={() => setOnly(null)}><i style={{ background: '#8B949E' }} />all branches</button>
					{islands.map((i, k) => <button key={i.id} className={only === i.id ? 'on' : ''} onClick={() => setOnly(i.id)}><i style={{ background: LANE[k % 8] }} />{i.name.toLowerCase().replace(/\s+/g, '-')}<em>{i.games.length}</em></button>)}
					<h5>Tags</h5><p>v{new Date().getFullYear()}.{new Date().getMonth() + 1}</p>
				</nav>
				<section className="git-log">
					<div className="git-hd"><span>Graph</span><span>Description</span><span>Date</span><span>Commit</span></div>
					{commits.map((c, i) => (
						<button key={c.g.appid} data-appid={c.g.appid} className={'git-row' + (sel?.appid === c.g.appid ? ' on' : '')} onClick={() => select(c.g.appid)}>
							<svg className="git-graph" width={lanes * 14 + 10} height="30">{Array.from({ length: lanes }, (_, l) => (!only || islands[l].id === only) && <line key={l} x1={8 + l * 14} x2={8 + l * 14} y1={i === 0 ? 15 : 0} y2="30" stroke={LANE[l % 8]} strokeWidth="2" opacity=".55" />)}<circle cx={8 + c.lane * 14} cy="15" r="5" fill={LANE[c.lane % 8]} stroke="#0D1117" strokeWidth="2" /></svg>
							<span className="git-desc"><b className="git-br" style={{ color: LANE[c.lane % 8] }}>{islands[c.lane].name.toLowerCase().replace(/\s+/g, '-')}</b>{msg(c.g)} — {c.g.name}</span>
							<span className="git-date">{formatAgo(c.at)}</span><code>{hash(c.g)}</code>
						</button>
					))}
				</section>
				<aside className="git-detail">
					{sel ? <div key={sel.appid}>
						<code className="git-h">commit {((sel.appid * 2654435761) >>> 0).toString(16).padStart(8, '0')}{(sel.appid * 97).toString(16).padStart(8, '0')}</code>
						<p className="git-auth"><Art g={sel} kind="capsule" /><span><b>{sel.name}</b><em>&lt;{sel.appid}@steam&gt;</em></span></p>
						<p className="git-msg">{msg(sel)}</p>
						<dl><dt>Date</dt><dd>{dateOf(sel.lastPlayed || sel.added, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</dd><dt>Changes</dt><dd className="add">+{Math.round(sel.minutes2w)} min</dd><dt>Total</dt><dd>{formatPlaytime(sel.minutes)}</dd><dt>Size</dt><dd>{sel.sizeOnDisk ? formatBytes(sel.sizeOnDisk) : '—'}</dd></dl>
						<PlayBtn g={sel} className="git-go" label={['git checkout → Play', 'git clone → Install']} /><Actions g={sel} className="git-act" />
					</div> : <p className="git-none">Select a commit</p>}
				</aside>
			</div>
		</AltPage>
	);
}

export const commitsCss = tok('commits', { bg: '#0D1117', s1: '#161B22', s2: '#21262D', s3: '#30363D', fg: '#E6EDF3', fg2: '#C9D1D9', fg3: '#8B949E', acc: '#238636', on: '#fff', top: '#010409', font: '"Segoe UI", system-ui, sans-serif' }) + `
.git-brand { font: 600 14px Consolas, monospace; color: #E6EDF3; }
.git-app { position: absolute; inset: 0; display: grid; grid-template-columns: 240px minmax(0, 1fr) 380px; font: 13px var(--k-text); color: #C9D1D9; }
.git-side { overflow-y: auto; padding: 12px 8px; background: #010409; border-right: 1px solid #30363D; } .git-side h5 { margin: 12px 8px 6px; font: 600 11px var(--k-text); text-transform: uppercase; color: #8B949E; }
.git-side button { display: flex; gap: 8px; align-items: center; width: 100%; padding: 5px 8px; border-radius: 6px; font: 13px Consolas, monospace; color: #C9D1D9; text-align: left; white-space: nowrap; overflow: hidden; } .git-side button.on { background: #21262D; color: #fff; } .git-side i { width: 10px; height: 10px; border-radius: 50%; flex: none; } .git-side em { margin-left: auto; font-style: normal; color: #8B949E; }
.git-side p { margin: 4px 8px; font: 13px Consolas, monospace; color: #8B949E; }
.git-log { overflow-y: auto; } .git-hd { position: sticky; top: 0; z-index: 1; display: grid; grid-template-columns: 130px minmax(0, 1fr) 110px 70px; gap: 10px; padding: 6px 12px; background: #161B22; border-bottom: 1px solid #30363D; font: 600 12px var(--k-text); color: #8B949E; }
.git-row { display: grid; grid-template-columns: 130px minmax(0, 1fr) 110px 70px; gap: 10px; align-items: center; width: 100%; height: 30px; padding: 0 12px; text-align: left; color: #C9D1D9; } .git-row:hover { background: #161B22; } .git-row.on { background: #1F6FEB33; }
.git-graph { overflow: visible; } .git-desc { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .git-br { margin-right: 8px; padding: 1px 6px; border-radius: 10px; background: #21262D; font: 600 11px Consolas, monospace; }
.git-date { color: #8B949E; font-size: 12px; } .git-row code { font: 12px Consolas, monospace; color: #58A6FF; }
.git-detail { overflow-y: auto; padding: 16px; background: #0D1117; border-left: 1px solid #30363D; } .git-detail > div { animation: k-fade .2s both; }
.git-h { display: block; font: 12px Consolas, monospace; color: #D29922; word-break: break-all; } .git-auth { display: flex; gap: 10px; align-items: center; margin: 14px 0; } .git-auth img { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; } .git-auth b { display: block; color: #E6EDF3; } .git-auth em { font: 12px Consolas, monospace; font-style: normal; color: #8B949E; }
.git-msg { padding: 10px 12px; border-radius: 6px; background: #161B22; border: 1px solid #30363D; font: 14px Consolas, monospace; color: #E6EDF3; }
.git-detail dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 14px; margin: 0 0 14px; } .git-detail dt { color: #8B949E; } .git-detail dd { margin: 0; } .git-detail .add { color: #3FB950; font-family: Consolas, monospace; }
.git-go { width: 100%; height: 36px; border-radius: 6px; background: #238636 !important; color: #fff !important; font: 600 13px Consolas, monospace !important; margin-bottom: 8px; } .git-act button { color: #C9D1D9 !important; } .git-act button:hover { background: #21262D !important; } .git-none { color: #8B949E; text-align: center; margin-top: 40px; }
`;
