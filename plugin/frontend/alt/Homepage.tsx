// HOMEPAGE — a personal web page from 1997. Tiled background, a scrolling marquee, a frames-style link bar of
// collections, a hit counter of your total hours, blinking NEW! on unplayed games and a guestbook per game.
import { useState } from 'react';
import { useKestrel } from '../state/store';
import { formatAgo, formatPlaytime } from '../steam/library';
import { AltPage, Art, gameCommands, useBrowse, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';

export function Homepage() {
	const library = useKestrel((s) => s.library);
	const { recent } = useLibraryLists();
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [signed, setSigned] = useState<Record<number, boolean>>({});
	const hits = String(Math.round(library.reduce((n, g) => n + g.minutes, 0) / 60)).padStart(7, '0');
	return (
		<AltPage className="web" brand={<>~kestrel/index.html</>}>
			<div className="web-app">
				<div className="web-frame-l">
					<div className="web-logo">✦ MY GAMES ✦</div>
					<p className="web-small">Best viewed at 800×600</p>
					<hr />
					{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => { b.setCur(i.id); select(null); }}>» {i.name}</button>)}
					<hr />
					<div className="web-counter">You are visitor<br /><span>{hits.split('').map((d, k) => <i key={k}>{d}</i>)}</span><br />(hours played)</div>
					<div className="web-ring">◄ Prev | GameRing | Next ►</div>
				</div>
				<div className="web-frame-r">
					<div className="web-marquee"><span>★ Welcome to my homepage!!! ★ Last updated {recent[0] ? formatAgo(recent[0].lastPlayed).toLowerCase() : 'never'} ★ {library.length} games and counting ★ Sign my guestbook!!! ★</span></div>
					{sel ? (
						<div className="web-page" key={sel.appid}>
							<h1 className="web-rainbow">{sel.name}</h1>
							<table className="web-t"><tbody><tr><td><Art g={sel} kind="capsule" /></td><td>
								<p><b>Hours:</b> {formatPlaytime(sel.minutes)}</p><p><b>Last played:</b> {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never!!'}</p><p><b>Installed?</b> {sel.installed ? 'YES' : 'no :('}</p><p><b>Score:</b> {sel.metacritic || '???'}/100</p>
								<p>{gameCommands(sel).map((c, k) => <span key={c.id}>{k > 0 && ' | '}<button className="web-a" onClick={c.run}>{c.primary ? (sel.installed ? 'CLICK HERE TO PLAY!!!' : 'CLICK HERE TO INSTALL') : c.label}</button></span>)}</p>
							</td></tr></tbody></table>
							<h3>~*~ Guestbook ~*~</h3>
							<div className="web-gb"><p><b>Kestrel</b> wrote: cool game!!! {sel.minutes > 600 ? 'u play this a LOT lol' : 'u should play it more'}</p>{signed[sel.appid] && <p><b>You</b> wrote: signed your guestbook :)</p>}<button className="web-btn" onClick={() => setSigned({ ...signed, [sel.appid]: true })}>Sign Guestbook</button></div>
							<p><button className="web-a" onClick={() => select(null)}>&lt;&lt; Back to my games</button></p>
						</div>
					) : (
						<div className="web-page">
							<h1 className="web-rainbow">{b.isle?.name}</h1>
							<p className="web-uc">🚧 This page is under construction 🚧</p>
							<ul className="web-ul">{b.games.slice(0, 150).map((g) => <li key={g.appid}><button data-appid={g.appid} className="web-a" onClick={() => select(g.appid)}>{g.name}</button>{!g.minutes && <span className="web-new">NEW!</span>}{g.minutes2w > 0 && <span className="web-hot">HOT</span>}</li>)}</ul>
							<p className="web-small">© 1997 Kestrel. Made with Notepad.</p>
						</div>
					)}
				</div>
			</div>
		</AltPage>
	);
}

export const homepageCss = tok('homepage', { bg: '#000033', s1: '#C0C0C0', s2: '#A0A0A0', s3: '#808080', fg: '#FFFFFF', fg2: '#DDDDDD', fg3: '#AAAAAA', acc: '#FFFF00', on: '#000', top: '#C0C0C0', topFg: '#000000', font: '"Times New Roman", Times, serif' }) + `
.web-brand { font: 13px "Courier New", monospace; color: #000; }
.web-app { position: absolute; inset: 0; display: grid; grid-template-columns: 230px minmax(0, 1fr); background: #000033 radial-gradient(circle, #fff 1px, transparent 1.5px) 0 0 / 40px 40px; font: 16px "Times New Roman", serif; color: #fff; }
.web-frame-l { overflow-y: auto; padding: 12px; background: #000066; border-right: 6px ridge #C0C0C0; text-align: center; }
.web-logo { font: 700 22px "Comic Sans MS", "Comic Sans", cursive; color: #FFFF00; text-shadow: 2px 2px #FF00FF; } .web-small { font: 11px Arial, sans-serif; color: #AAA; }
.web-frame-l hr, .web-page hr { border: 0; height: 4px; background: linear-gradient(90deg, red, orange, yellow, lime, cyan, blue, magenta); }
.web-frame-l > button { display: block; width: 100%; padding: 2px 0; text-align: left; font: 15px "Times New Roman", serif; color: #00FFFF; text-decoration: underline; } .web-frame-l > button:hover { color: #FF00FF; } .web-frame-l > button.on { color: #FFFF00; font-weight: 700; }
.web-counter { margin: 14px 0; font: 13px Arial, sans-serif; } .web-counter span { display: inline-flex; gap: 2px; margin: 6px 0; } .web-counter i { display: inline-block; width: 16px; padding: 2px 0; background: #000; color: #0F0; font: 700 16px "Courier New", monospace; font-style: normal; border: 1px solid #555; }
.web-ring { font: 12px Arial, sans-serif; color: #FF99FF; }
.web-frame-r { overflow-y: auto; }
.web-marquee { overflow: hidden; white-space: nowrap; background: #000; border-bottom: 3px groove #C0C0C0; color: #FFFF00; font: 700 16px "Comic Sans MS", cursive; padding: 4px 0; } .web-marquee span { display: inline-block; padding-left: 100%; animation: web-mq 22s linear infinite; } @keyframes web-mq { to { transform: translateX(-100%); } }
.web-page { padding: 16px 30px 40px; }
.web-rainbow { margin: 6px 0 10px; text-align: center; font: 700 40px "Comic Sans MS", cursive; background: linear-gradient(90deg, red, orange, yellow, lime, cyan, blue, magenta); -webkit-background-clip: text; color: transparent; }
.web-uc { text-align: center; color: #FFCC00; font: 700 18px Arial, sans-serif; animation: web-blink 1s steps(2) infinite; } @keyframes web-blink { 50% { opacity: 0; } }
.web-ul { columns: 2; line-height: 1.7; } .web-a { font: inherit; color: #00FFFF; text-decoration: underline; text-align: left; } .web-a:hover { color: #FF00FF; } .web-a:visited { color: #CC99FF; }
.web-new { margin-left: 6px; color: #FF0000; font: 700 12px Arial, sans-serif; animation: web-blink 1s steps(2) infinite; } .web-hot { margin-left: 6px; padding: 0 3px; background: #FF6600; color: #fff; font: 700 11px Arial, sans-serif; }
.web-t { margin: 0 auto; border: 4px outset #C0C0C0; background: #000066; } .web-t td { padding: 12px; vertical-align: top; } .web-t img { width: 200px; border: 3px solid #FFFF00; } .web-t p { margin: 6px 0; }
.web-page h3 { text-align: center; color: #FF99FF; font: 700 22px "Comic Sans MS", cursive; } .web-gb { max-width: 600px; margin: 0 auto 14px; padding: 10px; background: #FFFFCC; color: #000; border: 3px dashed #FF00FF; } .web-gb p { margin: 4px 0; font: 14px Arial, sans-serif; }
.web-btn { padding: 2px 10px; background: #C0C0C0; border: 2px outset #fff; font: 13px Arial, sans-serif; color: #000; }
`;
