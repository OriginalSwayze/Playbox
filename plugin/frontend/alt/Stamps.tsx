// STAMPS — a stamp collector's album. Each collection is an album page; every game is a perforated stamp with its
// art, a denomination in hours and a postmark if you've played it. Lift one with the tongs (click) to see it under the
// magnifier; Post it plays.
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const denom = (g: Game) => (g.minutes >= 6000 ? Math.round(g.minutes / 60) + 'h' : g.minutes >= 60 ? Math.round(g.minutes / 60) + 'h' : g.minutes + 'm');
const tint = (g: Game) => ['#B23A48', '#2F6690', '#3A7D44', '#8E5572', '#C97B2E', '#4A4E69'][g.appid % 6];

export function Stamps() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	return (
		<AltPage className="stp" brand={<>✉ The Philatelist</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search the album">
			<div className="stp-app">
				<nav className="stp-tabs">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}>{i.name}</button>)}</nav>
				<section className="stp-page">
					<h2>{b.found ? 'Search' : b.isle?.name}<span>Page {b.islands.findIndex((i) => i.id === b.cur) + 1} · {b.games.length} stamps</span></h2>
					<div className="stp-grid">{b.games.slice(0, 120).map((g, i) => (
						<div key={g.appid} className="stp-mount">
							<button data-appid={g.appid} className={'stp-stamp' + (sel?.appid === g.appid ? ' on' : '') + (i % 7 === 3 ? ' wide' : '')} style={{ ['--t' as string]: tint(g) }} onClick={() => select(g.appid)}>
								<span className="stp-img"><Art g={g} kind={i % 7 === 3 ? 'header' : 'capsule'} /></span>
								<span className="stp-den">{denom(g)}</span><span className="stp-cty">KESTREL</span>
								{g.lastPlayed > 0 && <span className="stp-pm">{dateOf(g.lastPlayed, { day: '2-digit', month: 'short', year: '2-digit' })}</span>}
							</button>
							<em>{g.name}</em>
						</div>
					))}</div>
				</section>
				{sel && (
					<aside className="stp-loupe" key={sel.appid}>
						<div className="stp-lens"><div className="stp-stamp big" style={{ ['--t' as string]: tint(sel) }}><span className="stp-img"><Art g={sel} kind="capsule" /></span><span className="stp-den">{denom(sel)}</span><span className="stp-cty">KESTREL</span></div></div>
						<h3>{sel.name}</h3>
						<dl><dt>Issued</dt><dd>{dateOf(sel.added)}</dd><dt>Denomination</dt><dd>{formatPlaytime(sel.minutes)}</dd><dt>Postmark</dt><dd>{sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'Mint (never used)'}</dd><dt>Condition</dt><dd>{sel.installed ? 'In the album (installed)' : 'Loose (not installed)'}</dd></dl>
						<PlayBtn g={sel} className="stp-go" label={['Post it — Play', 'Mount it — Install']} /><Actions g={sel} /><button className="stp-x" onClick={() => select(null)}>Put back</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const stampsCss = tok('stamps', { bg: '#2E3A2F', s1: '#3A4A3B', s2: '#475A48', s3: '#566B57', fg: '#F2EEDD', fg2: '#D9D2B8', fg3: '#A39C82', acc: '#B23A48', on: '#fff', top: '#212B22', font: 'Georgia, "Times New Roman", serif' }) + `
.stp-brand { font: italic 700 18px Georgia, serif; color: #F2EEDD; }
.stp-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-rows: 40px minmax(0, 1fr); background: #2E3A2F; }
.stp-tabs { grid-column: 1 / -1; display: flex; gap: 4px; padding: 6px 20px 0; overflow-x: auto; } .stp-tabs button { flex: none; padding: 6px 14px; border-radius: 6px 6px 0 0; background: #566B57; font: 13px Georgia, serif; color: #F2EEDD; } .stp-tabs button.on { background: #F3EEDC; color: #2E3A2F; font-weight: 700; }
.stp-page { overflow-y: auto; margin: 0 0 16px 16px; padding: 22px 26px 40px; background: repeating-linear-gradient(transparent 0 23px, rgba(0,0,0,.05) 23px 24px), #F3EEDC; box-shadow: inset 0 0 40px rgba(120,100,60,.25), 0 10px 20px rgba(0,0,0,.4); }
.stp-page h2 { margin: 0 0 18px; padding-bottom: 8px; border-bottom: 1px solid #C8BE9F; font: italic 700 26px Georgia, serif; color: #3A3324; } .stp-page h2 span { margin-left: 14px; font: 13px Georgia, serif; color: #8A7F62; }
.stp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 24px 18px; }
.stp-mount { display: grid; justify-items: center; gap: 6px; } .stp-mount em { max-width: 140px; font: italic 12px Georgia, serif; color: #5A5038; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.stp-stamp { position: relative; width: 110px; height: 140px; padding: 8px; background: #FFFDF6; transition: transform .25s var(--k-spring); border: 5px dotted #F3EEDC; box-shadow: 0 3px 6px rgba(0,0,0,.25); background-clip: padding-box; }
.stp-stamp.wide { width: 150px; } .stp-stamp:hover { transform: rotate(-3deg) scale(1.05); } .stp-stamp.on { transform: translateY(-6px) rotate(2deg); }
.stp-img { display: block; width: 100%; height: 100%; border: 3px solid var(--t); overflow: hidden; background: var(--t); } .stp-img img, .stp-img .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: saturate(.85) contrast(1.05); font-size: 7px; }
.stp-den { position: absolute; right: 14px; top: 14px; padding: 0 4px; background: var(--t); color: #fff; font: 700 13px Georgia, serif; } .stp-cty { position: absolute; left: 14px; bottom: 14px; padding: 0 4px; background: rgba(255,253,246,.9); font: 700 8px Georgia, serif; letter-spacing: .2em; color: var(--t); }
.stp-pm { position: absolute; left: -6px; top: 34%; width: 74px; height: 74px; display: grid; place-items: center; border: 2px solid rgba(40,40,60,.55); border-radius: 50%; font: 700 9px Georgia, serif; color: rgba(40,40,60,.7); transform: rotate(-18deg); background: repeating-linear-gradient(0deg, transparent 0 6px, rgba(40,40,60,.25) 6px 7px) right / 40px 100% no-repeat; pointer-events: none; }
.stp-loupe { width: 340px; overflow-y: auto; padding: 20px; color: #F2EEDD; animation: k-fade .25s both; }
.stp-lens { width: 260px; height: 260px; margin: 0 auto 16px; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.25), transparent 50%), #F3EEDC; box-shadow: 0 0 0 12px #222, 0 0 0 16px #555, 0 20px 30px rgba(0,0,0,.6); overflow: hidden; }
.stp-stamp.big { width: 150px; height: 190px; transform: rotate(-4deg); } .stp-loupe h3 { margin: 0 0 12px; font: 700 20px Georgia, serif; text-align: center; }
.stp-loupe dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 0 0 14px; font: 14px Georgia, serif; } .stp-loupe dt { font-style: italic; color: #A39C82; } .stp-loupe dd { margin: 0; }
.stp-go { width: 100%; height: 44px; border-radius: 8px; background: #B23A48 !important; color: #fff !important; font: 700 15px Georgia, serif !important; margin-bottom: 8px; } .stp-loupe .alt-actions button { color: #D9D2B8 !important; font-family: Georgia, serif !important; } .stp-loupe .alt-actions button:hover { background: #3A4A3B !important; } .stp-x { margin-top: 8px; color: #F2EEDD; font: italic 14px Georgia, serif; }
`;
