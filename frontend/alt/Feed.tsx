// FEED — a social timeline. Your library posts about itself: what you played, what you added, what's waiting.
// Like and repost are yours to keep; opening a post shows its thread, with the game's actions as replies.
import { useMemo, useState } from 'react';
import { useKestrel } from '../state/store';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { AltPage, Art, gameCommands, useLibraryLists, useSearch, useSelectedGame } from './common';
import { tok } from './kit';

type Post = { id: string; g: Game; at: number; text: string; art: 'header' | 'hero' | null };
const handle = (g: Game) => '@' + g.name.replace(/[^\w]+/g, '').slice(0, 15).toLowerCase();

export function Feed() {
	const library = useKestrel((s) => s.library);
	const { top } = useLibraryLists();
	const [sel, select] = useSelectedGame();
	const [tab, setTab] = useState<'for' | 'new'>('for');
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const [likes, setLikes] = useState<Record<string, boolean>>({});
	const posts = useMemo(() => {
		const out: Post[] = [];
		for (const g of found ?? library) {
			if (g.lastPlayed) out.push({ id: 'p' + g.appid, g, at: g.lastPlayed, art: g.minutes2w ? 'hero' : 'header', text: g.minutes2w ? `${formatPlaytime(g.minutes2w)} this fortnight and counting. ${g.minutes > 6000 ? 'Send help.' : 'Having a great time.'}` : `Just finished a session. ${formatPlaytime(g.minutes)} all-time.` });
			if (g.added && (tab === 'new' || !g.lastPlayed)) out.push({ id: 'a' + g.appid, g, at: g.added, art: g.lastPlayed ? null : 'header', text: g.minutes ? `Joined the library.` : `Just arrived and still unplayed. ${g.installed ? 'Installed and waiting.' : 'Not even installed yet.'}` });
		}
		return out.sort((a, b) => b.at - a.at).slice(0, 150);
	}, [library, found, tab]);
	const P = ({ p }: { p: Post }) => (
		<article className="fed-post" data-appid={p.g.appid} onClick={() => select(p.g.appid)}>
			<span className="fed-ava"><Art g={p.g} kind="capsule" /></span>
			<div className="fed-body">
				<div className="fed-who"><b>{p.g.name}</b>{p.g.metacritic >= 80 && <i className="fed-tick">✓</i>}<span>{handle(p.g)} · {formatAgo(p.at)}</span></div>
				<p>{p.text}</p>
				{p.art && <div className="fed-media"><Art g={p.g} kind={p.art} /></div>}
				<div className="fed-bar" onClick={(e) => e.stopPropagation()}>
					<button>💬 {Math.round(p.g.minutes / 120)}</button><button>⟲ {Math.round(p.g.minutes2w / 30)}</button>
					<button className={likes[p.id] ? 'on' : ''} onClick={() => setLikes({ ...likes, [p.id]: !likes[p.id] })}>{likes[p.id] ? '♥' : '♡'} {Math.round(p.g.minutes / 60) + (likes[p.id] ? 1 : 0)}</button>
					<button onClick={gameCommands(p.g)[0].run}>{p.g.installed ? '▶ Play' : '⬇ Install'}</button>
				</div>
			</div>
		</article>
	);
	return (
		<AltPage className="fed" brand={<><span className="fed-logo">◐</span>Feed</>}>
			<div className="fed-app">
				<nav className="fed-nav">{['Home', 'Explore', 'Notifications', 'Messages', 'Bookmarks', 'Profile'].map((n, i) => <button key={n} className={i === 0 ? 'on' : ''} onClick={() => select(null)}>{n}</button>)}<button className="fed-postbtn" onClick={() => top[0] && select(top[0].appid)}>Post</button></nav>
				<section className="fed-col">
					{sel ? (
						<div key={sel.appid}>
							<header className="fed-head"><button onClick={() => select(null)}>←</button><b>Post</b></header>
							<article className="fed-thread">
								<div className="fed-who"><span className="fed-ava"><Art g={sel} kind="capsule" /></span><div><b>{sel.name}</b><span>{handle(sel)}</span></div></div>
								<p className="big">{sel.minutes ? `${formatPlaytime(sel.minutes)} together. Last time: ${sel.lastPlayed ? formatAgo(sel.lastPlayed).toLowerCase() : 'never'}.` : 'Still waiting for our first session.'}</p>
								<div className="fed-media"><Art g={sel} kind="hero" /></div>
								<div className="fed-stats"><b>{Math.round(sel.minutes / 60)}</b> Likes <b>{sel.metacritic || 0}</b> Critics</div>
							</article>
							{gameCommands(sel).map((c) => <button key={c.id} className={'fed-reply' + (c.primary ? ' p' : '')} onClick={c.run}><span className="fed-ava k">K</span><span><b>Kestrel</b> <em>@kestrel · replying to {handle(sel)}</em><br />{c.primary ? (sel.installed ? 'Play it now →' : 'Install it →') : c.label + ' →'}</span></button>)}
						</div>
					) : (
						<>
							<div className="fed-tabs"><button className={tab === 'for' ? 'on' : ''} onClick={() => setTab('for')}>For you</button><button className={tab === 'new' ? 'on' : ''} onClick={() => setTab('new')}>Everything</button></div>
							{posts.map((p) => <P key={p.id} p={p} />)}
						</>
					)}
				</section>
				<aside className="fed-right">
					<input className="fed-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" spellCheck={false} />
					<div className="fed-box"><h4>Trending this fortnight</h4>{[...library].filter((g) => g.minutes2w).sort((a, b) => b.minutes2w - a.minutes2w).slice(0, 6).map((g, i) => <button key={g.appid} onClick={() => select(g.appid)}><em>{i + 1} · Trending</em><b>#{g.name.replace(/\s+/g, '')}</b><em>{formatPlaytime(g.minutes2w)}</em></button>)}</div>
					<div className="fed-box"><h4>Who to play</h4>{top.slice(0, 4).map((g) => <button key={g.appid} className="fed-who2" onClick={() => select(g.appid)}><span className="fed-ava"><Art g={g} kind="capsule" /></span><b>{g.name}</b></button>)}</div>
				</aside>
			</div>
		</AltPage>
	);
}

export const feedCss = tok('feed', { bg: '#FFFFFF', s1: '#F2F4F7', s2: '#E7EAEE', s3: '#D7DBE0', fg: '#0F1419', fg2: '#3A4148', fg3: '#6A737C', acc: '#F0457A', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.fed-brand { display: flex; gap: 8px; align-items: center; font: 800 20px var(--k-text); color: #0F1419; } .fed-logo { color: #F0457A; font-size: 22px; }
.fed-app { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 600px 1fr; overflow-y: auto; }
.fed-nav { position: sticky; top: 0; align-self: start; justify-self: end; display: grid; gap: 4px; padding: 10px 24px; width: 240px; }
.fed-nav button { height: 50px; padding: 0 16px; border-radius: 25px; text-align: left; font: 400 19px var(--k-text); color: #0F1419; } .fed-nav button:hover { background: #F2F4F7; } .fed-nav button.on { font-weight: 800; }
.fed-postbtn { margin-top: 12px; background: #F0457A !important; color: #fff !important; font-weight: 700 !important; text-align: center !important; }
.fed-col { border-left: 1px solid #EFF3F4; border-right: 1px solid #EFF3F4; min-height: 100%; }
.fed-tabs { position: sticky; top: 0; z-index: 1; display: grid; grid-template-columns: 1fr 1fr; background: rgba(255,255,255,.85); backdrop-filter: blur(12px); border-bottom: 1px solid #EFF3F4; }
.fed-tabs button { height: 52px; font: 500 15px var(--k-text); color: #6A737C; } .fed-tabs button.on { font-weight: 700; color: #0F1419; box-shadow: inset 0 -4px #F0457A; }
.fed-post { display: flex; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #EFF3F4; cursor: pointer; animation: k-fade .3s both; } .fed-post:hover { background: #F7F9F9; }
.fed-ava { width: 40px; height: 40px; flex: none; border-radius: 50%; overflow: hidden; background: #E7EAEE; display: grid; place-items: center; } .fed-ava img { width: 100%; height: 100%; object-fit: cover; } .fed-ava.k { background: #F0457A; color: #fff; font: 800 16px var(--k-text); }
.fed-body { flex: 1; min-width: 0; } .fed-who { display: flex; gap: 5px; align-items: center; font: 15px var(--k-text); } .fed-who b { color: #0F1419; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .fed-who span { color: #6A737C; white-space: nowrap; }
.fed-tick { display: grid; place-items: center; width: 16px; height: 16px; border-radius: 50%; background: #F0457A; color: #fff; font: 700 10px var(--k-text); font-style: normal; }
.fed-body p { margin: 2px 0 10px; font: 15px/1.4 var(--k-text); color: #0F1419; } .fed-media { border-radius: 16px; overflow: hidden; border: 1px solid #E7EAEE; } .fed-media img { width: 100%; display: block; max-height: 320px; object-fit: cover; }
.fed-bar { display: flex; justify-content: space-between; margin-top: 10px; max-width: 440px; } .fed-bar button { font: 13px var(--k-text); color: #6A737C; padding: 4px 8px; border-radius: 99px; } .fed-bar button:hover { color: #F0457A; background: #FDE8EF; } .fed-bar button.on { color: #F0457A; }
.fed-head { position: sticky; top: 0; display: flex; gap: 24px; align-items: center; height: 52px; padding: 0 16px; background: rgba(255,255,255,.9); backdrop-filter: blur(12px); font: 700 20px var(--k-text); color: #0F1419; } .fed-head button { font-size: 20px; color: #0F1419; }
.fed-thread { padding: 12px 16px; border-bottom: 1px solid #EFF3F4; } .fed-thread .fed-who { gap: 12px; } .fed-thread .fed-who div { display: grid; } .fed-thread p.big { font: 22px/1.35 var(--k-text); color: #0F1419; margin: 12px 0; }
.fed-stats { padding: 14px 0 4px; font: 14px var(--k-text); color: #6A737C; } .fed-stats b { color: #0F1419; margin: 0 4px 0 14px; } .fed-stats b:first-child { margin-left: 0; }
.fed-reply { display: flex; gap: 12px; width: 100%; padding: 12px 16px; text-align: left; border-bottom: 1px solid #EFF3F4; font: 15px/1.4 var(--k-text); color: #0F1419; } .fed-reply:hover { background: #F7F9F9; } .fed-reply em { font-style: normal; color: #6A737C; } .fed-reply.p span:last-child { color: #F0457A; font-weight: 700; }
.fed-right { position: sticky; top: 0; align-self: start; padding: 10px 24px; width: 380px; display: grid; gap: 16px; }
.fed-q { height: 44px; padding: 0 20px; border-radius: 22px; border: 0; outline: none; background: #EFF3F4; font: 15px var(--k-text); color: #0F1419; } .fed-q:focus { box-shadow: inset 0 0 0 2px #F0457A; background: #fff; }
.fed-box { border: 1px solid #EFF3F4; border-radius: 16px; overflow: hidden; } .fed-box h4 { margin: 0; padding: 12px 16px; font: 800 20px var(--k-text); color: #0F1419; }
.fed-box > button { display: block; width: 100%; padding: 10px 16px; text-align: left; } .fed-box > button:hover { background: #F7F9F9; } .fed-box em { display: block; font: 13px var(--k-text); font-style: normal; color: #6A737C; } .fed-box b { font: 700 15px var(--k-text); color: #0F1419; }
.fed-who2 { display: flex !important; gap: 12px; align-items: center; }
`;
