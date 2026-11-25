// NOTES — a notes app in three columns: folders (collections), notes (games) and the open note. Each note starts
// with what Steam knows, and below the line you can write your own; it's kept on this PC.
import { useEffect, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const KEY = 'kestrel.notes.';
const load = (id: number) => { try { return localStorage.getItem(KEY + id) ?? ''; } catch { return ''; } };
const save = (id: number, t: string) => { try { t ? localStorage.setItem(KEY + id, t) : localStorage.removeItem(KEY + id); } catch { /* storage off */ } };
const snippet = (g: Game) => load(g.appid).split('\n')[0] || (g.minutes ? `${formatPlaytime(g.minutes)} played` : 'No additional text');

function Editor({ g }: { g: Game }) {
	const [text, setText] = useState(() => load(g.appid));
	useEffect(() => setText(load(g.appid)), [g.appid]);
	const checks = [
		{ t: 'Install it', done: g.installed },
		{ t: 'Play it for the first time', done: g.minutes > 0 },
		{ t: 'Put in ten hours', done: g.minutes >= 600 },
		{ t: 'Play it this fortnight', done: g.minutes2w > 0 },
	];
	return (
		<article className="nts-note" key={g.appid}>
			<time>{dateOf(g.lastPlayed || g.added, { day: 'numeric', month: 'long', year: 'numeric' })} at {new Date((g.lastPlayed || g.added || 0) * 1000).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</time>
			<h1>{g.name}</h1>
			<p>{g.minutes ? `Played ${formatPlaytime(g.minutes)} in total` : 'Not played yet'}{g.lastPlayed ? `, last ${formatAgo(g.lastPlayed).toLowerCase()}` : ''}. {g.installed ? 'Installed on this PC.' : 'Not installed.'}{g.metacritic ? ` Metascore ${g.metacritic}.` : ''}</p>
			<ul className="nts-checks">{checks.map((c) => <li key={c.t} className={c.done ? 'done' : ''}><i />{c.t}</li>)}</ul>
			<div className="nts-tools"><PlayBtn g={g} className="nts-go" /><Actions g={g} className="nts-act" /></div>
			<hr />
			<textarea value={text} onChange={(e) => { setText(e.target.value); save(g.appid, e.target.value); }} onKeyDown={(e) => e.stopPropagation()} placeholder="Your notes…" spellCheck />
		</article>
	);
}

export function Notes() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	return (
		<AltPage className="nts" brand={<><span className="nts-pad" />Notes</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search">
			<div className="nts-app">
				<aside className="nts-folders">
					<h5>Kestrel</h5>
					{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}><span className="nts-fi">▭</span>{i.name}<em>{i.games.length}</em></button>)}
				</aside>
				<section className="nts-list">
					<h4>{b.found ? 'Search results' : b.isle?.name}</h4>
					{b.games.slice(0, 300).map((g) => (
						<button key={g.appid} data-appid={g.appid} className={'nts-item' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>
							<b>{g.name}</b><span><time>{g.lastPlayed ? dateOf(g.lastPlayed, { day: 'numeric', month: 'numeric', year: '2-digit' }) : 'No date'}</time>{snippet(g)}</span>
						</button>
					))}
				</section>
				{sel ? <Editor g={sel} /> : <div className="nts-blank">No note selected</div>}
			</div>
		</AltPage>
	);
}

export const notesCss = tok('notes', { bg: '#FFFFFF', s1: '#F2F1EE', s2: '#E9E7E2', s3: '#DDD9D0', fg: '#1E1E1E', fg2: '#4A4A4A', fg3: '#8A8780', acc: '#E0A800', on: '#1E1E1E', top: '#F6F5F2', font: '"Segoe UI", system-ui, sans-serif' }) + `
.nts-brand { display: flex; gap: 9px; align-items: center; font: 600 18px var(--k-text); color: #1E1E1E; }
.nts-pad { width: 20px; height: 24px; border-radius: 4px; background: linear-gradient(#F5C400 0 6px, #fff 6px), repeating-linear-gradient(transparent 0 4px, #ddd 4px 5px); box-shadow: 0 0 0 1px #ccc; }
.nts-app { position: absolute; inset: 0; display: grid; grid-template-columns: 220px 320px minmax(0, 1fr); }
.nts-folders { overflow-y: auto; padding: 12px 8px; background: #F6F5F2; border-right: 1px solid #E4E2DC; }
.nts-folders h5 { margin: 6px 10px 6px; font: 700 11px var(--k-text); color: #8A8780; }
.nts-folders button { display: flex; gap: 8px; align-items: center; width: 100%; padding: 6px 10px; border-radius: 6px; font: 14px var(--k-text); color: #1E1E1E; text-align: left; }
.nts-folders button.on { background: #F5DB7A; } .nts-folders button:hover:not(.on) { background: #ECEAE4; } .nts-fi { color: #D9A600; } .nts-folders em { margin-left: auto; font-style: normal; font-size: 12px; color: #8A8780; }
.nts-list { overflow-y: auto; padding: 10px 10px; border-right: 1px solid #E4E2DC; background: #FBFAF8; } .nts-list h4 { margin: 4px 10px 10px; font: 700 18px var(--k-text); color: #1E1E1E; }
.nts-item { display: block; width: 100%; padding: 10px 12px; border-radius: 8px; text-align: left; border-bottom: 1px solid #EEECE7; } .nts-item.on { background: #F5DB7A; border-color: transparent; }
.nts-item b { display: block; font: 700 14px var(--k-text); color: #1E1E1E; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nts-item span { display: block; font: 13px var(--k-text); color: #6E6B64; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .nts-item time { margin-right: 8px; color: #1E1E1E; }
.nts-note { overflow-y: auto; padding: 18px 60px 60px; animation: k-fade .25s both; display: flex; flex-direction: column; }
.nts-note time { align-self: center; font: 12px var(--k-text); color: #8A8780; }
.nts-note h1 { margin: 16px 0 10px; font: 700 28px var(--k-text); color: #1E1E1E; } .nts-note p { margin: 0 0 14px; font: 16px/1.6 var(--k-text); color: #1E1E1E; max-width: 70ch; }
.nts-checks { list-style: none; margin: 0 0 18px; padding: 0; display: grid; gap: 8px; } .nts-checks li { display: flex; gap: 10px; align-items: center; font: 16px var(--k-text); color: #1E1E1E; }
.nts-checks i { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid #B7B3AA; } .nts-checks li.done { color: #8A8780; text-decoration: line-through; } .nts-checks li.done i { border: 0; background: #E0A800; box-shadow: inset 0 0 0 4px #fff, inset 0 0 0 9px #E0A800; }
.nts-tools { display: flex; gap: 16px; align-items: flex-start; } .nts-go { height: 36px; padding: 0 18px; border-radius: 8px; background: #E0A800 !important; color: #1E1E1E !important; font: 700 14px var(--k-text) !important; }
.nts-act { grid-auto-flow: column; } .nts-note hr { width: 100%; border: 0; border-top: 1px solid #E4E2DC; margin: 22px 0 14px; }
.nts-note textarea { flex: 1; min-height: 240px; border: 0; outline: none; resize: none; background: transparent; font: 16px/1.6 var(--k-text); color: #1E1E1E; }
.nts-blank { display: grid; place-items: center; color: #8A8780; font: 15px var(--k-text); }
`;
