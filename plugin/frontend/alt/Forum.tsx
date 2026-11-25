// FORUM — an old-school message board. The index lists boards (collections) with topic counts and the latest post;
// a board lists topics (games) with replies and views; a topic is a thread with user panels and signatures.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { AltPage, Art, gameCommands, dateOf, useBrowse, useSelectedGame, type Island } from './common';
import { tok } from './kit';

const when = (g: Game) => (g.lastPlayed ? dateOf(g.lastPlayed, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never');

export function Forum() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [board, setBoard] = useState<Island | null>(null);
	const topics = b.found ?? board?.games ?? [];
	const latest = (i: Island) => [...i.games].sort((x, y) => y.lastPlayed - x.lastPlayed)[0];
	const crumbs = <div className="frm-crumbs"><button onClick={() => { setBoard(null); select(null); b.setQ(''); }}>Board index</button>{board && <> » <button onClick={() => select(null)}>{board.name}</button></>}{sel && <> » {sel.name}</>}</div>;
	return (
		<AltPage className="frm" brand={<><span className="frm-logo">K</span><span><b>Kestrel Boards</b><em>Discussion of one library</em></span></>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search the forum…">
			<div className="frm-app">
				<div className="frm-wrap">
					<div className="frm-nav"><span>FAQ</span><span>Members</span><span>Search</span><span className="r">Logged in as <b>you</b></span></div>
					{crumbs}
					{sel ? (
						<div key={sel.appid}>
							<h2 className="frm-title">{sel.name}</h2>
							<div className="frm-btns">{gameCommands(sel).map((c) => <button key={c.id} className={c.primary ? 'p' : ''} onClick={c.run}>{c.primary ? (sel.installed ? 'Play' : 'Install') : c.label}</button>)}</div>
							{[{ who: sel.name, g: sel, t: sel.minutes ? `Topic summary: ${formatPlaytime(sel.minutes)} played${sel.minutes2w ? `, ${formatPlaytime(sel.minutes2w)} of it in the last two weeks` : ''}.` : 'First post! Nobody has played this one yet.', at: sel.added },
								{ who: 'Kestrel', g: null, t: sel.installed ? 'Confirmed installed on this machine. Use the Play button above.' : 'Not installed. Hit Install above and it will download.', at: sel.lastPlayed || sel.added },
								{ who: 'Critic_Bot', g: null, t: sel.metacritic ? `Metascore is ${sel.metacritic}. ${sel.metacritic >= 80 ? 'Worth your time.' : 'Opinions vary.'}` : 'No score on file. Make up your own mind.', at: sel.lastPlayed }].map((p, i) => (
								<div key={i} className={'frm-post' + (i % 2 ? ' alt' : '')}>
									<div className="frm-user">{p.g ? <Art g={p.g} kind="capsule" /> : <span className="frm-ava">{p.who[0]}</span>}<b>{p.who}</b><em>{i === 0 ? 'Topic starter' : 'Moderator'}</em><span>Posts: {i === 0 ? Math.round(sel.minutes / 60) : 1024}</span></div>
									<div className="frm-body"><div className="frm-ph">#{i + 1} · Posted {p.at ? dateOf(p.at, { day: 'numeric', month: 'short', year: 'numeric' }) : 'some time ago'}</div><p>{p.t}</p>{i === 0 && <Art g={sel} kind="header" />}<div className="frm-sig">{i === 0 ? `Last played ${sel.lastPlayed ? formatAgo(sel.lastPlayed).toLowerCase() : 'never'}` : '— powered by Kestrel'}</div></div>
								</div>
							))}
						</div>
					) : board || b.found ? (
						<table className="frm-t"><thead><tr><th>Topics</th><th>Replies</th><th>Views</th><th>Last post</th></tr></thead><tbody>
							{topics.slice(0, 200).map((g) => <tr key={g.appid}><td><span className={'frm-dot' + (g.minutes2w ? ' hot' : '')} /><button data-appid={g.appid} className="frm-a" onClick={() => select(g.appid)}>{g.name}</button><em>{g.installed ? 'installed' : 'not installed'}</em></td><td>{Math.round(g.minutes2w / 30)}</td><td>{g.minutes}</td><td className="sm">{when(g)}</td></tr>)}
						</tbody></table>
					) : (
						<table className="frm-t"><thead><tr><th>Forum</th><th>Topics</th><th>Posts</th><th>Last post</th></tr></thead><tbody>
							{b.islands.map((i) => { const l = latest(i); return <tr key={i.id}><td><span className={'frm-dot' + (i.games.some((g) => g.minutes2w) ? ' hot' : '')} /><button className="frm-a big" onClick={() => setBoard(i)}>{i.name}</button><em>Everything about {i.name.toLowerCase()}.</em></td><td>{i.games.length}</td><td>{Math.round(i.games.reduce((n, g) => n + g.minutes, 0) / 60)}</td><td className="sm">{l ? <><button data-appid={l.appid} className="frm-a" onClick={() => { setBoard(i); select(l.appid); }}>{l.name}</button><br />{when(l)}</> : '—'}</td></tr>; })}
						</tbody></table>
					)}
					<div className="frm-foot">Kestrel Boards · {b.islands.length} forums · All times are local</div>
				</div>
			</div>
		</AltPage>
	);
}

export const forumCss = tok('forum', { bg: '#E6EAF0', s1: '#FFFFFF', s2: '#ECF0F5', s3: '#CAD3DF', fg: '#2A3340', fg2: '#47525F', fg3: '#7A8594', acc: '#2B6CB0', on: '#fff', top: '#2B4A73', topFg: '#FFFFFF', font: 'Verdana, Tahoma, sans-serif' }) + `
.frm-brand { display: flex; gap: 10px; align-items: center; color: #fff; } .frm-brand b { display: block; font: 700 17px Verdana, sans-serif; } .frm-brand em { display: block; font: 11px Verdana, sans-serif; opacity: .8; font-style: normal; }
.frm-logo { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 6px; background: linear-gradient(#FFB347, #E67E22); color: #fff; font: 900 18px Verdana, sans-serif; text-shadow: 0 1px 0 rgba(0,0,0,.3); }
.frm-app { position: absolute; inset: 0; overflow-y: auto; padding: 14px 20px 40px; font: 12.5px/1.5 Verdana, sans-serif; color: #2A3340; }
.frm-wrap { max-width: 1200px; margin: 0 auto; padding: 10px; background: #fff; border: 1px solid #CAD3DF; border-radius: 8px; }
.frm-nav { display: flex; gap: 16px; padding: 6px 10px; border-radius: 6px; background: #CADCEB; font-size: 12px; color: #105289; } .frm-nav .r { margin-left: auto; color: #47525F; }
.frm-crumbs { padding: 10px 4px; font-size: 12px; } .frm-crumbs button, .frm-a { color: #105289; font: inherit; } .frm-crumbs button:hover, .frm-a:hover { color: #D31141; text-decoration: underline; } .frm-a.big { font: 700 14px Verdana, sans-serif; }
.frm-t { width: 100%; border-collapse: separate; border-spacing: 0 2px; } .frm-t th { padding: 6px 10px; text-align: left; background: linear-gradient(#6A9FD4, #3E78B5); color: #fff; font: 700 11px Verdana, sans-serif; text-transform: uppercase; } .frm-t th:first-child { border-radius: 6px 0 0 0; } .frm-t th:last-child { border-radius: 0 6px 0 0; }
.frm-t td { padding: 7px 10px; background: #ECF3F7; border-bottom: 1px solid #fff; vertical-align: middle; } .frm-t tr:nth-child(even) td { background: #E1EBF2; } .frm-t td:not(:first-child) { width: 90px; text-align: center; } .frm-t td.sm { width: 220px; text-align: left; font-size: 11px; }
.frm-t td em { display: block; margin-left: 30px; font-size: 11px; font-style: normal; color: #7A8594; } .frm-dot { float: left; width: 20px; height: 20px; margin: 2px 10px 0 0; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #CFD8E3, #8A9AAE); } .frm-dot.hot { background: radial-gradient(circle at 35% 35%, #FFD08A, #E67E22); }
.frm-title { margin: 4px 0 10px; font: 700 20px Verdana, sans-serif; color: #105289; } .frm-btns { display: flex; gap: 6px; margin-bottom: 10px; }
.frm-btns button { padding: 4px 12px; border-radius: 4px; border: 1px solid #B4BAC0; background: linear-gradient(#fff, #E9E9E9); font: 700 11px Verdana, sans-serif; color: #2A3340; } .frm-btns button.p { background: linear-gradient(#5DADE2, #2B6CB0); color: #fff; border-color: #1F4E79; }
.frm-post { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 14px; margin-bottom: 6px; padding: 10px; border-radius: 7px; background: #ECF3F7; } .frm-post.alt { background: #E1EBF2; }
.frm-user { display: grid; justify-items: center; align-content: start; gap: 2px; padding-right: 10px; border-right: 1px solid #fff; text-align: center; } .frm-user img, .frm-ava { width: 80px; height: 80px; object-fit: cover; border-radius: 4px; } .frm-ava { display: grid; place-items: center; background: #6A9FD4; color: #fff; font: 700 30px Verdana, sans-serif; }
.frm-user b { color: #AA0000; font-size: 13px; } .frm-user em { font-style: normal; font-size: 11px; } .frm-user span { font-size: 11px; color: #7A8594; }
.frm-ph { padding-bottom: 4px; margin-bottom: 8px; border-bottom: 1px solid #CCD; font-size: 11px; color: #7A8594; } .frm-body p { margin: 0 0 10px; font-size: 13px; } .frm-body img { max-width: 460px; border-radius: 4px; }
.frm-sig { margin-top: 10px; padding-top: 4px; border-top: 1px solid #CCD; font: italic 11px Verdana, sans-serif; color: #7A8594; }
.frm-foot { margin-top: 10px; padding: 6px 10px; border-radius: 6px; background: #CADCEB; font-size: 11px; color: #47525F; }
`;
