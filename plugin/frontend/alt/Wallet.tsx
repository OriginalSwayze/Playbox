// WALLET — a phone wallet of passes. Each game is a pass (gift-card, membership or ticket style by how you've
// played it) in a fanned stack; tap a pass to bring it to the front with its barcode, details and Play.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const kind = (g: Game) => (g.minutes > 6000 ? 'Membership · Gold' : g.minutes > 0 ? 'Membership' : g.installed ? 'Ticket' : 'Gift pass');
const hue = (g: Game) => (g.appid * 47) % 360;

export function Wallet() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [n, setN] = useState(12);
	const passes = b.games.slice(0, n);
	return (
		<AltPage className="wal" brand={<>◧ Wallet</>}>
			<div className="wal-app">
				<nav className="wal-tabs">{b.islands.map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => { b.setCur(i.id); select(null); }}>{i.name}</button>)}</nav>
				<div className="wal-phone">
					{sel ? (
						<div className="wal-front" key={sel.appid}>
							<div className="wal-pass big" style={{ ['--h' as string]: hue(sel) }}>
								<div className="wal-ph"><span className="wal-logo"><Art g={sel} kind="capsule" /></span><b>{sel.name}</b><em>{kind(sel)}</em></div>
								<Art g={sel} kind="header" className="wal-strip" />
								<div className="wal-fields"><div><em>Hours</em><b>{Math.round(sel.minutes / 60)}</b></div><div><em>Member since</em><b>{dateOf(sel.added, { month: 'short', year: 'numeric' })}</b></div><div><em>Last visit</em><b>{sel.lastPlayed ? formatAgo(sel.lastPlayed) : '—'}</b></div></div>
								<div className="wal-qr">{Array.from({ length: 121 }, (_, i) => <i key={i} className={((sel.appid * (i + 7)) >> 3) % 3 === 0 || [0, 1, 2, 11, 12, 13, 22, 23, 24, 8, 9, 10, 19, 20, 21, 30, 31, 32].includes(i) ? 'on' : ''} />)}<span>{sel.appid}</span></div>
							</div>
							<div className="wal-under"><PlayBtn g={sel} className="wal-go" label={['Use pass — Play', 'Add to device — Install']} /><Actions g={sel} className="wal-act" /><p>{formatPlaytime(sel.minutes)} total</p><button className="wal-back" onClick={() => select(null)}>Done</button></div>
						</div>
					) : (
						<div className="wal-stack">{passes.map((g, i) => (
							<button key={g.appid} data-appid={g.appid} className="wal-pass" style={{ ['--h' as string]: hue(g), top: i * 62, zIndex: i }} onClick={() => select(g.appid)}>
								<div className="wal-ph"><span className="wal-logo"><Art g={g} kind="capsule" /></span><b>{g.name}</b><em>{kind(g)}</em></div>
							</button>))}
							{b.games.length > n && <button className="wal-more" style={{ top: passes.length * 62 + 170 }} onClick={() => setN(n + 12)}>Show {Math.min(12, b.games.length - n)} more passes</button>}
						</div>
					)}
				</div>
			</div>
		</AltPage>
	);
}

export const walletCss = tok('wallet', { bg: '#000000', s1: '#1C1C1E', s2: '#2C2C2E', s3: '#3A3A3C', fg: '#FFFFFF', fg2: '#D1D1D6', fg3: '#8E8E93', acc: '#30D158', on: '#000', font: '"Segoe UI", system-ui, sans-serif' }) + `
.wal-brand { font: 700 18px var(--k-text); color: #fff; }
.wal-app { position: absolute; inset: 0; display: grid; grid-template-rows: 44px minmax(0, 1fr); background: radial-gradient(circle at 50% 20%, #1C1C1E, #000 70%); }
.wal-tabs { display: flex; gap: 6px; justify-content: center; align-items: center; overflow-x: auto; } .wal-tabs button { flex: none; padding: 5px 14px; border-radius: 99px; background: #1C1C1E; font: 600 12px var(--k-text); color: #D1D1D6; } .wal-tabs button.on { background: #fff; color: #000; }
.wal-phone { position: relative; justify-self: center; width: min(420px, 100%); overflow-y: auto; padding: 16px 0 60px; }
.wal-stack { position: relative; min-height: 900px; }
.wal-pass { position: absolute; left: 0; right: 0; height: 220px; border-radius: 16px; overflow: hidden; text-align: left; color: #fff; background: linear-gradient(160deg, hsl(var(--h) 60% 45%), hsl(var(--h) 65% 28%)); box-shadow: 0 -6px 18px rgba(0,0,0,.45); transition: transform .3s var(--k-spring); } .wal-stack .wal-pass:hover { transform: translateY(-14px); }
.wal-ph { display: grid; grid-template-columns: 40px 1fr auto; gap: 10px; align-items: center; height: 62px; padding: 0 14px; } .wal-logo { width: 40px; height: 40px; border-radius: 10px; overflow: hidden; background: rgba(255,255,255,.2); } .wal-logo img, .wal-logo .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 5px; }
.wal-ph b { font: 700 16px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .wal-ph em { font: 600 11px var(--k-text); font-style: normal; text-transform: uppercase; letter-spacing: .06em; opacity: .85; }
.wal-more { position: absolute; left: 0; right: 0; height: 40px; border-radius: 12px; background: #1C1C1E; color: #30D158; font: 600 14px var(--k-text); }
.wal-front { animation: k-rise .4s var(--k-out) both; } .wal-pass.big { position: relative; height: auto; padding-bottom: 18px; box-shadow: 0 20px 40px rgba(0,0,0,.6); }
.wal-strip { width: 100%; height: 130px; object-fit: cover; display: block; }
.wal-fields { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 14px; } .wal-fields em { display: block; font: 600 10px var(--k-text); font-style: normal; text-transform: uppercase; letter-spacing: .08em; opacity: .75; } .wal-fields b { font: 600 17px var(--k-text); }
.wal-qr { position: relative; display: grid; grid-template-columns: repeat(11, 1fr); width: 150px; height: 150px; margin: 4px auto 22px; padding: 10px; border-radius: 10px; background: #fff; } .wal-qr i.on { background: #000; } .wal-qr span { position: absolute; left: 0; right: 0; bottom: -20px; text-align: center; font: 12px Consolas, monospace; color: rgba(255,255,255,.85); }
.wal-under { display: grid; gap: 8px; padding: 16px 0; } .wal-under p { margin: 0; text-align: center; font: 13px var(--k-text); color: #8E8E93; }
.wal-go { height: 50px; border-radius: 14px; background: #30D158 !important; color: #000 !important; font: 700 16px var(--k-text) !important; } .wal-act button { color: #D1D1D6 !important; } .wal-act button:hover { background: #1C1C1E !important; } .wal-back { color: #30D158; font: 600 15px var(--k-text); }
`;
