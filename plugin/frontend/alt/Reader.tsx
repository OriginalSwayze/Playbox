// READER — a feed reader. Subscriptions are collections (unread = unplayed), the middle column is a magazine-style
// list of stories, and the reading pane sets each game as a long-form article in a quiet serif.
import { useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const mins = (g: Game) => Math.max(1, Math.round(g.minutes / 60));
function body(g: Game) {
	return [
		g.minutes ? `Over ${formatPlaytime(g.minutes)}, ${g.name} has become one of the fixtures of this library. ${g.minutes2w ? `It has had ${formatPlaytime(g.minutes2w)} of attention in the past fortnight alone, which says something about where it stands right now.` : `It has been quiet lately, though: the last session was ${g.lastPlayed ? formatAgo(g.lastPlayed).toLowerCase() : 'a long time ago'}.`}`
			: `${g.name} arrived ${g.added ? 'on ' + dateOf(g.added, { day: 'numeric', month: 'long', year: 'numeric' }) : 'some time ago'} and has been waiting patiently ever since. Nobody has opened it yet.`,
		g.installed ? `It is installed on this PC${g.sizeOnDisk ? `, taking up ${formatBytes(g.sizeOnDisk)}` : ''}, and can start the moment you ask.` : 'It is not installed at the moment; installing it is a single button away.',
		g.metacritic ? `Critics scored it ${g.metacritic}${g.metacritic >= 85 ? ', which puts it among the very well received' : g.metacritic >= 70 ? ', a solid reception' : ', a mixed reception'}.` : 'There is no critics’ score on file for it.',
	];
}

export function Reader() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [read, setRead] = useState<Record<number, boolean>>({});
	const unread = (g: Game) => !read[g.appid] && g.minutes === 0;
	return (
		<AltPage className="rss" brand={<><span className="rss-ico" />Reader</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search stories">
			<div className="rss-app">
				<nav className="rss-subs">
					<h5>Feeds</h5>
					{b.islands.map((i) => { const n = i.games.filter(unread).length; return <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}><span className="rss-fav">{i.name[0]}</span>{i.name}{n > 0 && <em>{n}</em>}</button>; })}
				</nav>
				<section className="rss-list">
					<header><h2>{b.found ? 'Search' : b.isle?.name}</h2><button onClick={() => setRead(Object.fromEntries(b.games.map((g) => [g.appid, true])))}>Mark all as read</button></header>
					{b.games.slice(0, 200).map((g, i) => (
						<button key={g.appid} data-appid={g.appid} className={'rss-story' + (sel?.appid === g.appid ? ' on' : '') + (unread(g) ? ' new' : '') + (i % 7 === 0 ? ' lead' : '')} onClick={() => { select(g.appid); setRead((r) => ({ ...r, [g.appid]: true })); }}>
							<span className="rss-tx"><em>{b.isle?.name ?? 'Library'} · {g.lastPlayed ? formatAgo(g.lastPlayed) : dateOf(g.added)}</em><b>{g.name}</b><span>{body(g)[0].slice(0, 130)}…</span></span>
							<span className="rss-th"><Art g={g} kind={i % 7 === 0 ? 'hero' : 'header'} /></span>
						</button>
					))}
				</section>
				<article className="rss-read">
					{sel ? <div key={sel.appid}>
						<p className="rss-kick">{b.isle?.name ?? 'Library'} · {mins(sel)} min read</p>
						<h1>{sel.name}</h1>
						<p className="rss-by">By Kestrel · {dateOf(sel.lastPlayed || sel.added, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
						<figure><Art g={sel} kind="hero" /><figcaption>{sel.name}. Artwork from Steam.</figcaption></figure>
						{body(sel).map((p, i) => <p key={i} className={i === 0 ? 'rss-drop' : ''}>{p}</p>)}
						<div className="rss-tools"><PlayBtn g={sel} className="rss-go" label={['Play now', 'Install']} /><Actions g={sel} className="rss-act" /></div>
					</div> : <div className="rss-none"><span>☰</span><p>Choose a story.</p></div>}
				</article>
			</div>
		</AltPage>
	);
}

export const readerCss = tok('reader', { bg: '#FBFAF7', s1: '#FFFFFF', s2: '#F1EEE7', s3: '#E3DED3', fg: '#1D1B17', fg2: '#4A463E', fg3: '#8C877C', acc: '#2BA36B', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.rss-brand { display: flex; gap: 9px; align-items: center; font: 700 18px var(--k-text); color: #1D1B17; }
.rss-ico { width: 20px; height: 20px; border-radius: 5px; background: radial-gradient(circle at 25% 75%, #fff 0 2.5px, transparent 3px), radial-gradient(circle at 25% 75%, transparent 0 6px, #fff 6px 8px, transparent 8px 11px, #fff 11px 13px, transparent 13px), #2BA36B; }
.rss-app { position: absolute; inset: 0; display: grid; grid-template-columns: 240px 440px minmax(0, 1fr); }
.rss-subs { overflow-y: auto; padding: 12px 8px; background: #F4F2EC; border-right: 1px solid #E6E1D6; } .rss-subs h5 { margin: 6px 10px; font: 700 11px var(--k-text); text-transform: uppercase; letter-spacing: .08em; color: #8C877C; }
.rss-subs button { display: flex; gap: 10px; align-items: center; width: 100%; padding: 7px 10px; border-radius: 6px; text-align: left; font: 14px var(--k-text); color: #1D1B17; } .rss-subs button:hover { background: #ECE8DF; } .rss-subs button.on { background: #DDEFE5; font-weight: 600; }
.rss-fav { width: 18px; height: 18px; border-radius: 4px; background: #2BA36B; color: #fff; font: 700 11px/18px var(--k-text); text-align: center; flex: none; } .rss-subs em { margin-left: auto; font: 600 12px var(--k-text); font-style: normal; color: #2BA36B; }
.rss-list { overflow-y: auto; border-right: 1px solid #E6E1D6; background: #fff; } .rss-list header { position: sticky; top: 0; z-index: 1; display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; background: #fff; border-bottom: 1px solid #EFEBE3; }
.rss-list h2 { margin: 0; font: 700 22px Georgia, serif; color: #1D1B17; } .rss-list header button { font: 600 12px var(--k-text); color: #2BA36B; }
.rss-story { display: grid; grid-template-columns: minmax(0, 1fr) 110px; gap: 14px; width: 100%; padding: 16px 18px; text-align: left; border-bottom: 1px solid #F1EEE7; } .rss-story:hover { background: #FBFAF7; } .rss-story.on { background: #EFF7F2; }
.rss-story em { display: block; font: 600 11px var(--k-text); font-style: normal; color: #8C877C; text-transform: uppercase; letter-spacing: .04em; }
.rss-story b { display: block; margin: 4px 0; font: 700 17px/1.25 Georgia, serif; color: #8C877C; } .rss-story.new b { color: #1D1B17; } .rss-story.new em::before { content: "● "; color: #2BA36B; }
.rss-tx > span { font: 13px/1.45 var(--k-text); color: #6C675D; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.rss-th img, .rss-th .alt-noart { width: 110px; height: 74px; object-fit: cover; border-radius: 6px; }
.rss-story.lead { grid-template-columns: 1fr; } .rss-story.lead .rss-th { order: -1; } .rss-story.lead .rss-th img { width: 100%; height: 180px; } .rss-story.lead b { font-size: 21px; }
.rss-read { overflow-y: auto; padding: 40px 0 80px; } .rss-read > div { max-width: 680px; margin: 0 auto; padding: 0 30px; animation: k-fade .3s both; }
.rss-kick { margin: 0; font: 700 12px var(--k-text); letter-spacing: .1em; text-transform: uppercase; color: #2BA36B; } .rss-read h1 { margin: 10px 0 10px; font: 700 44px/1.1 Georgia, serif; color: #1D1B17; } .rss-by { margin: 0 0 22px; font: 14px var(--k-text); color: #8C877C; }
.rss-read figure { margin: 0 0 26px; } .rss-read figure img { width: 100%; border-radius: 4px; } .rss-read figcaption { margin-top: 6px; font: italic 13px Georgia, serif; color: #8C877C; }
.rss-read p { font: 19px/1.7 Georgia, serif; color: #2B2822; } .rss-drop::first-letter { float: left; margin: 6px 10px 0 0; font: 700 64px/.8 Georgia, serif; color: #2BA36B; }
.rss-tools { display: flex; gap: 20px; align-items: flex-start; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E6E1D6; } .rss-go { height: 42px; padding: 0 26px; border-radius: 21px; background: #2BA36B !important; color: #fff !important; font: 700 14px var(--k-text) !important; }
.rss-none { display: grid; place-items: center; height: 100%; color: #8C877C; font: 16px Georgia, serif; text-align: center; } .rss-none span { font-size: 40px; color: #2BA36B; }
`;
