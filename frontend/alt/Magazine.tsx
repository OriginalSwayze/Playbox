// MAGAZINE — a glossy monthly. The cover is your most-played game in the chosen collection, with cover lines for
// the next few; the contents page lists features; each feature is a two-page spread with a pull quote and Play.
import { useEffect, useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Magazine() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const feats = useMemo(() => [...b.games].sort((x, y) => y.minutes - x.minutes).slice(0, 12), [b.games]);
	const [page, setPage] = useState(0); // 0 cover, 1 contents, 2.. features
	useEffect(() => { if (sel) { const i = feats.findIndex((g) => g.appid === sel.appid); setPage(i >= 0 ? i + 2 : 2); } }, [sel?.appid]);
	useEffect(() => { if (!sel) setPage(0); }, [b.cur]);
	const cover = feats[0];
	const feat: Game | null = page >= 2 ? (sel && !feats.some((g) => g.appid === sel.appid) ? sel : feats[page - 2] ?? null) : null;
	const issue = new Date().toLocaleDateString(undefined, { month: 'long', year: 'numeric' }).toUpperCase();
	const go = (p: number) => { setPage(p); if (p >= 2 && feats[p - 2]) select(feats[p - 2].appid); else select(null); };
	return (
		<AltPage className="mag" brand={<>KESTREL<i>monthly</i></>}>
			<div className="mag-app">
				<nav className="mag-issues">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => { b.setCur(i.id); select(null); }}>{i.name}</button>)}</nav>
				<div className="mag-stage2">
					<button className="mag-turn l" disabled={page === 0} onClick={() => go(page - 1)}>‹</button>
					{page === 0 && cover && (
						<article className="mag-cover" key={'c' + b.cur}>
							<Art g={cover} kind="hero" className="mag-cimg" />
							<h1 className="mag-mast">KESTREL</h1><p className="mag-issue">{issue} · THE {b.isle?.name.toUpperCase()} ISSUE</p>
							<div className="mag-lines">{feats.slice(1, 5).map((g, i) => <button key={g.appid} data-appid={g.appid} onClick={() => go(i + 3)}><b>{g.name}</b><span>{g.minutes ? `${formatPlaytime(g.minutes)} later` : 'The one you never played'}</span></button>)}</div>
							<button className="mag-lead" onClick={() => go(2)}><em>COVER STORY</em><b>{cover.name}</b><span>{formatPlaytime(cover.minutes)} with the game that defined your {b.isle?.name.toLowerCase()}</span></button>
						</article>
					)}
					{page === 1 && (
						<article className="mag-toc" key="toc"><h2>Contents</h2><div className="mag-toclist">{feats.map((g, i) => <button key={g.appid} data-appid={g.appid} onClick={() => go(i + 2)}><em>{String(i * 6 + 12).padStart(2, '0')}</em><span><b>{g.name}</b><i>{g.lastPlayed ? `Last seen ${formatAgo(g.lastPlayed).toLowerCase()}` : 'Never played'}</i></span><Art g={g} kind="capsule" /></button>)}</div></article>
					)}
					{feat && (
						<article className="mag-spread" key={feat.appid}>
							<div className="mag-l"><Art g={feat} kind="hero" /><p className="mag-cap">{feat.name}. Artwork from Steam.</p></div>
							<div className="mag-r">
								<em className="mag-kick">FEATURE</em><h2>{feat.name}</h2><p className="mag-dek">{feat.minutes ? `${formatPlaytime(feat.minutes)} in, it's still one of the defining games of your library.` : 'Bought, admired, never played. Is now the time?'}</p>
								<p className="mag-body">{feat.added ? `It arrived ${dateOf(feat.added, { month: 'long', year: 'numeric' })}. ` : ''}{feat.lastPlayed ? `The most recent session was ${formatAgo(feat.lastPlayed).toLowerCase()}. ` : 'There has never been a session. '}{feat.installed ? 'It is installed and ready.' : 'It is not installed right now.'}{feat.metacritic ? ` Critics gave it ${feat.metacritic}.` : ''}</p>
								<blockquote>“{feat.minutes2w ? `${formatPlaytime(feat.minutes2w)} in the last two weeks.` : feat.minutes > 6000 ? 'A hundred hours and counting.' : 'Every library needs one of these.'}”</blockquote>
								<PlayBtn g={feat} className="mag-go" label={['Play now', 'Install now']} /><Actions g={feat} className="mag-act" />
							</div>
						</article>
					)}
					<button className="mag-turn r" disabled={page >= feats.length + 1} onClick={() => go(page + 1)}>›</button>
				</div>
				<div className="mag-dots">{Array.from({ length: feats.length + 2 }, (_, i) => <i key={i} className={i === page ? 'on' : ''} onClick={() => go(i)} />)}</div>
			</div>
		</AltPage>
	);
}

export const magazineCss = tok('magazine', { bg: '#EDEAE4', s1: '#FFFFFF', s2: '#E3DFD7', s3: '#CFC9BD', fg: '#111111', fg2: '#333', fg3: '#777', acc: '#E4002B', on: '#fff', font: '"Didot", "Bodoni MT", Georgia, serif' }) + `
.mag-brand { font: 700 20px "Bodoni MT", Didot, Georgia, serif; letter-spacing: .1em; color: #111; } .mag-brand i { margin-left: 6px; font: italic 400 14px Georgia, serif; color: #E4002B; letter-spacing: 0; }
.mag-app { position: absolute; inset: 0; display: grid; grid-template-rows: 44px minmax(0, 1fr) 30px; }
.mag-issues { display: flex; gap: 2px; justify-content: center; align-items: center; overflow-x: auto; } .mag-issues button { flex: none; padding: 4px 12px; font: 600 11px "Segoe UI", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #777; } .mag-issues button.on { color: #111; box-shadow: inset 0 -2px #E4002B; }
.mag-stage2 { display: grid; grid-template-columns: 60px minmax(0, 1fr) 60px; align-items: center; padding: 10px 0; min-height: 0; }
.mag-turn { height: 100px; font: 300 60px Georgia, serif; color: #999; } .mag-turn:disabled { opacity: .2; }
.mag-cover { position: relative; justify-self: center; height: 100%; aspect-ratio: 8.5/11; overflow: hidden; background: #000; box-shadow: 0 20px 50px rgba(0,0,0,.35); animation: k-fade .4s both; color: #fff; }
.mag-cimg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.mag-mast { position: absolute; left: 0; right: 0; top: 14px; margin: 0; text-align: center; font: 900 clamp(60px, 9vh, 120px)/1 "Bodoni MT", Didot, Georgia, serif; letter-spacing: -.02em; color: #fff; mix-blend-mode: difference; }
.mag-issue { position: absolute; left: 0; right: 0; top: calc(14px + clamp(60px, 9vh, 120px)); margin: 0; text-align: center; font: 700 11px "Segoe UI", sans-serif; letter-spacing: .3em; text-shadow: 0 1px 4px rgba(0,0,0,.6); }
.mag-lines { position: absolute; left: 18px; top: 34%; display: grid; gap: 14px; width: 42%; } .mag-lines button { display: grid; text-align: left; color: #fff; text-shadow: 0 2px 8px rgba(0,0,0,.8); } .mag-lines b { font: 900 20px/1.05 "Segoe UI", sans-serif; text-transform: uppercase; } .mag-lines span { font: italic 14px Georgia, serif; }
.mag-lead { position: absolute; left: 18px; right: 18px; bottom: 22px; display: grid; text-align: left; color: #fff; text-shadow: 0 2px 10px rgba(0,0,0,.8); } .mag-lead em { justify-self: start; padding: 2px 8px; background: #E4002B; font: 800 11px "Segoe UI", sans-serif; font-style: normal; letter-spacing: .2em; }
.mag-lead b { font: 900 clamp(30px, 5vh, 54px)/1 "Bodoni MT", Georgia, serif; margin: 6px 0; } .mag-lead span { font: italic 16px Georgia, serif; }
.mag-toc { justify-self: center; height: 100%; aspect-ratio: 8.5/11; overflow-y: auto; padding: 30px 36px; background: #fff; box-shadow: 0 20px 50px rgba(0,0,0,.25); animation: k-fade .3s both; } .mag-toc h2 { margin: 0 0 18px; font: 900 54px "Bodoni MT", Georgia, serif; color: #E4002B; }
.mag-toclist button { display: grid; grid-template-columns: 40px 1fr 40px; gap: 14px; align-items: center; width: 100%; padding: 10px 0; border-top: 1px solid #111; text-align: left; } .mag-toclist em { font: 900 22px "Bodoni MT", Georgia, serif; font-style: normal; color: #E4002B; } .mag-toclist b { display: block; font: 700 17px Georgia, serif; } .mag-toclist i { font: italic 13px Georgia, serif; color: #777; } .mag-toclist img { width: 40px; }
.mag-spread { justify-self: center; display: grid; grid-template-columns: 1fr 1fr; height: 100%; width: 100%; max-width: 1240px; background: #fff; box-shadow: 0 20px 50px rgba(0,0,0,.25); animation: k-fade .35s both; }
.mag-l { position: relative; overflow: hidden; } .mag-l img { width: 100%; height: 100%; object-fit: cover; } .mag-cap { position: absolute; left: 12px; bottom: 8px; margin: 0; font: italic 11px Georgia, serif; color: #fff; text-shadow: 0 1px 3px #000; }
.mag-r { overflow-y: auto; padding: 34px 40px; } .mag-kick { font: 800 11px "Segoe UI", sans-serif; font-style: normal; letter-spacing: .3em; color: #E4002B; } .mag-r h2 { margin: 8px 0 12px; font: 900 48px/1 "Bodoni MT", Didot, Georgia, serif; }
.mag-dek { font: italic 20px/1.4 Georgia, serif; color: #333; } .mag-body { font: 16px/1.7 Georgia, serif; color: #222; columns: 2; column-gap: 24px; } .mag-body::first-letter { float: left; font: 900 54px/.85 "Bodoni MT", Georgia, serif; margin: 4px 8px 0 0; color: #E4002B; }
.mag-r blockquote { margin: 20px 0; padding: 14px 0; border-top: 3px solid #E4002B; border-bottom: 3px solid #E4002B; font: 900 italic 26px/1.2 "Bodoni MT", Georgia, serif; color: #111; }
.mag-go { height: 46px; padding: 0 30px; background: #111 !important; color: #fff !important; font: 700 13px "Segoe UI", sans-serif !important; letter-spacing: .2em; text-transform: uppercase; } .mag-act { margin-top: 12px; grid-template-columns: repeat(4, auto); justify-content: start; }
.mag-dots { display: flex; gap: 6px; justify-content: center; align-items: center; } .mag-dots i { width: 8px; height: 8px; border-radius: 50%; background: #CFC9BD; cursor: pointer; } .mag-dots i.on { background: #E4002B; }
`;
