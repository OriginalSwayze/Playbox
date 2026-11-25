// ZINE — a photocopied punk fanzine. Cut-out covers taped at angles, ransom-note headlines made of mismatched letters,
// highlighter scribbles and staples; each collection is an issue. Click a cutout for its review page; PLAY IT is
// stamped at the bottom.
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const FONTS = ['Impact', 'Georgia', '"Courier New"', '"Arial Black"', '"Times New Roman"', 'Verdana', '"Comic Sans MS"'];
function Ransom({ text, seed = 0 }: { text: string; seed?: number }) {
	return <span className="zin-ransom">{text.split('').map((c, i) => { const k = (i * 7 + seed) % 7; return c === ' ' ? <i key={i} className="sp" /> : <i key={i} style={{ fontFamily: FONTS[k], transform: `rotate(${((i * 13 + seed) % 11) - 5}deg)`, background: k % 3 === 0 ? '#111' : k % 3 === 1 ? '#FFF' : '#F5E663', color: k % 3 === 0 ? '#FFF' : '#111' }}>{c}</i>; })}</span>;
}

export function Zine() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const n = b.islands.findIndex((i) => i.id === b.cur) + 1;
	return (
		<AltPage className="zin" brand={<>KESTREL ZINE #{n}</>}>
			<div className="zin-app">
				<nav className="zin-issues">{b.islands.map((i, k) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => { b.setCur(i.id); select(null); }}>#{k + 1} {i.name}</button>)}</nav>
				{sel ? (
					<article className="zin-review" key={sel.appid}>
						<h1><Ransom text={sel.name.slice(0, 26).toUpperCase()} seed={sel.appid % 7} /></h1>
						<div className="zin-cols"><div className="zin-pic"><Art g={sel} kind="capsule" /><span className="zin-tape" /><span className="zin-tape b" /><p className="zin-caption">{sel.name}</p></div>
							<div className="zin-text"><p className="zin-type">{sel.minutes ? `we put ${formatPlaytime(sel.minutes).toUpperCase()} into this thing.` : 'NEVER PLAYED IT. NOT EVEN ONCE.'} {sel.lastPlayed ? `last time was ${formatAgo(sel.lastPlayed).toLowerCase()}.` : ''} {sel.installed ? "it's on the drive right now." : "it's not even installed. typical."}</p>
								<p className="zin-hand">{sel.metacritic ? `critics say ${sel.metacritic}. who cares!!` : 'no score. good.'}</p>
								<PlayBtn g={sel} className="zin-stamp" label={['PLAY IT!', 'GET IT!']} /><Actions g={sel} className="zin-act" /><button className="zin-back" onClick={() => select(null)}>← back to the issue</button></div></div>
					</article>
				) : (
					<section className="zin-page">
						<h1><Ransom text={(b.isle?.name ?? 'LIBRARY').toUpperCase().slice(0, 22)} seed={n} /></h1>
						<p className="zin-sub">ISSUE #{n} · {b.games.length} GAMES · PHOTOCOPIED WITH LOVE · FREE</p>
						<div className="zin-wall">{b.games.slice(0, 48).map((g, i) => (
							<button key={g.appid} data-appid={g.appid} className={'zin-cut s' + (i % 5)} style={{ transform: `rotate(${((g.appid % 17) - 8) * 0.9}deg)` }} onClick={() => select(g.appid)}>
								<Art g={g} kind={i % 4 === 0 ? 'header' : 'capsule'} /><span className="zin-cap">{g.name}</span>{i % 3 === 0 && <span className="zin-tape" />}{g.minutes2w > 0 && <span className="zin-star">HOT!</span>}
							</button>))}</div>
					</section>
				)}
			</div>
		</AltPage>
	);
}

export const zineCss = tok('zine', { bg: '#EDEAE3', s1: '#FFFFFF', s2: '#E0DCD2', s3: '#CFC9BC', fg: '#111111', fg2: '#333', fg3: '#666', acc: '#FF2E88', on: '#fff', top: '#111111', topFg: '#FFFFFF', font: '"Courier New", monospace' }) + `
.zin-brand { font: 900 16px Impact, sans-serif; letter-spacing: .08em; color: #F5E663; }
.zin-app { position: absolute; inset: 0; display: grid; grid-template-rows: 40px minmax(0, 1fr); background: #EDEAE3 repeating-radial-gradient(circle at 30% 40%, rgba(0,0,0,.025) 0 1px, transparent 1px 3px); }
.zin-issues { display: flex; gap: 6px; align-items: center; padding: 0 16px; overflow-x: auto; background: #111; } .zin-issues button { flex: none; padding: 3px 10px; font: 700 12px "Courier New", monospace; color: #EDEAE3; } .zin-issues button.on { background: #FF2E88; color: #fff; transform: rotate(-2deg); }
.zin-page, .zin-review { overflow-y: auto; padding: 24px 40px 60px; filter: contrast(1.05); }
.zin-page h1, .zin-review h1 { margin: 0; text-align: center; } .zin-ransom { display: inline-flex; flex-wrap: wrap; justify-content: center; gap: 3px; } .zin-ransom i { display: inline-block; padding: 2px 6px; font-style: normal; font-size: 46px; line-height: 1; box-shadow: 2px 2px 0 rgba(0,0,0,.25); } .zin-ransom i.sp { width: 18px; padding: 0; box-shadow: none; }
.zin-sub { margin: 14px 0 24px; text-align: center; font: 700 13px "Courier New", monospace; letter-spacing: .2em; }
.zin-wall { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 22px; }
.zin-cut { position: relative; padding: 8px 8px 30px; background: #fff; box-shadow: 3px 4px 0 rgba(0,0,0,.2); transition: transform .2s; clip-path: polygon(2% 0, 98% 3%, 100% 96%, 4% 100%, 0 50%); } .zin-cut:hover { transform: scale(1.05) rotate(0deg) !important; z-index: 2; }
.zin-cut img, .zin-cut .alt-noart { width: 100%; display: block; filter: grayscale(1) contrast(1.6) brightness(1.05); mix-blend-mode: multiply; } .zin-cut:hover img { filter: grayscale(.2) contrast(1.3); }
.zin-cut.s1 { background: #F5E663; } .zin-cut.s3 { background: #FFD1E3; }
.zin-cap { position: absolute; left: 8px; right: 8px; bottom: 6px; font: 700 12px "Courier New", monospace; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: left; }
.zin-tape { position: absolute; left: 30%; top: -10px; width: 70px; height: 20px; background: rgba(240,230,180,.7); transform: rotate(-6deg); box-shadow: 0 1px 2px rgba(0,0,0,.1); } .zin-tape.b { left: auto; right: -14px; top: 40%; transform: rotate(80deg); }
.zin-star { position: absolute; right: -8px; top: -8px; padding: 6px 8px; border-radius: 50%; background: #FF2E88; color: #fff; font: 900 12px Impact, sans-serif; transform: rotate(14deg); }
.zin-cols { display: grid; grid-template-columns: 340px minmax(0, 1fr); gap: 40px; max-width: 1100px; margin: 26px auto 0; } .zin-pic { position: relative; padding: 12px; background: #fff; transform: rotate(-3deg); box-shadow: 4px 6px 0 rgba(0,0,0,.25); } .zin-pic img { width: 100%; filter: grayscale(1) contrast(1.5); }
.zin-caption { margin: 10px 0 0; font: 700 14px "Courier New", monospace; text-align: center; }
.zin-type { font: 18px/1.6 "Courier New", monospace; background: linear-gradient(transparent 60%, #F5E663 60%); display: inline; } .zin-hand { margin-top: 20px; font: 26px "Segoe Print", "Comic Sans MS", cursive; color: #FF2E88; transform: rotate(-2deg); }
.zin-stamp { margin: 20px 0 10px; height: 64px; padding: 0 30px; border: 5px solid #FF2E88; border-radius: 8px; background: transparent !important; color: #FF2E88 !important; font: 900 34px Impact, sans-serif !important; letter-spacing: .06em; transform: rotate(-4deg); } .zin-stamp:hover { background: #FF2E88 !important; color: #fff !important; }
.zin-act button { font-family: "Courier New", monospace !important; color: #111 !important; text-transform: uppercase; } .zin-back { margin-top: 12px; font: 700 14px "Courier New", monospace; text-decoration: underline; }
`;
