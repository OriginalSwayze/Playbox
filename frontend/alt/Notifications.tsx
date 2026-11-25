// NOTIFICATIONS — a phone's lock screen and notification centre. A big clock, then stacks of notifications from your
// games grouped by collection ("You haven't played in 3 weeks", "Update available"…). Tap a stack to expand it,
// swipe-dismiss with ×, and open a notification to its card with Play.
import { useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

function note(g: Game): { t: string; at: number } {
	if (g.busy || g.status) return { t: g.status || 'Working…', at: Date.now() / 1000 };
	if (g.needsUpdate) return { t: 'An update is available', at: g.lastPlayed || g.added };
	if (g.minutes2w) return { t: `${formatPlaytime(g.minutes2w)} played this fortnight. Keep it up!`, at: g.lastPlayed };
	if (!g.minutes) return { t: g.installed ? "You installed me but we've never played" : 'Still waiting for our first session', at: g.added };
	return { t: `We haven't played since ${formatAgo(g.lastPlayed).toLowerCase()}`, at: g.lastPlayed };
}

export function Notifications() {
	const islands = useIslands().slice(0, 10);
	const [sel, select] = useSelectedGame();
	const [open, setOpen] = useState<Record<string, boolean>>({ recent: true });
	const [gone, setGone] = useState<Record<number, boolean>>({});
	const now = new Date();
	const stacks = useMemo(() => islands.map((i) => ({ i, items: i.games.filter((g) => !gone[g.appid]).map((g) => ({ g, ...note(g) })).sort((a, b) => b.at - a.at).slice(0, 12) })).filter((s) => s.items.length), [islands, gone]);
	return (
		<AltPage className="ntf" brand={<>🔔 Notifications</>}>
			<div className="ntf-app">
				{sel && <Art g={sel} kind="hero" className="ntf-wall" key={sel.appid} />}
				<div className="ntf-phone">
					<div className="ntf-lock"><span>🔒</span><b>{now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</b><em>{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</em></div>
					<div className="ntf-list">
						{stacks.map(({ i, items }) => (
							<section key={i.id} className={'ntf-stack' + (open[i.id] ? ' open' : '')}>
								<header><b>{i.name}</b>{open[i.id] && <button onClick={() => setOpen({ ...open, [i.id]: false })}>Show less</button>}<button onClick={() => setGone({ ...gone, ...Object.fromEntries(items.map((x) => [x.g.appid, true])) })}>×</button></header>
								{(open[i.id] ? items : items.slice(0, 1)).map(({ g, t, at }, k) => (
									<div key={g.appid} className="ntf-n" style={{ animationDelay: k * 40 + 'ms' }}>
										<button data-appid={g.appid} className="ntf-body" onClick={() => (open[i.id] ? select(g.appid) : setOpen({ ...open, [i.id]: true }))}><Art g={g} kind="capsule" /><span><b>{g.name}</b><em>{t}</em></span><time>{at ? formatAgo(at) : ''}</time></button>
										{open[i.id] && <button className="ntf-x" onClick={() => setGone({ ...gone, [g.appid]: true })}>×</button>}
									</div>
								))}
								{!open[i.id] && items.length > 1 && <div className="ntf-under"><i /><i /></div>}
								{!open[i.id] && items.length > 1 && <span className="ntf-count">{items.length - 1} more</span>}
							</section>
						))}
						{!stacks.length && <p className="ntf-none">No notifications</p>}
					</div>
				</div>
				{sel && <aside className="ntf-card" key={sel.appid}><Art g={sel} kind="header" /><h3>{sel.name}</h3><p>{note(sel).t}</p><PlayBtn g={sel} className="ntf-go" label={['Open — Play', 'Install']} /><Actions g={sel} /><button className="ntf-close" onClick={() => select(null)}>Dismiss</button></aside>}
			</div>
		</AltPage>
	);
}

export const notificationsCss = tok('notifications', { bg: '#0D0F1A', s1: 'rgba(255,255,255,.1)', s2: 'rgba(255,255,255,.16)', s3: 'rgba(255,255,255,.24)', fg: '#FFFFFF', fg2: 'rgba(255,255,255,.8)', fg3: 'rgba(255,255,255,.55)', acc: '#4F8BFF', on: '#fff', top: 'transparent', font: '"Segoe UI", system-ui, sans-serif' }) + `
html.kestrel[data-ui="notifications"] .k-top { position: relative; z-index: 2; border: 0; }
.ntf-brand { font: 600 16px var(--k-text); color: #fff; }
.ntf-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; overflow: hidden; background: linear-gradient(160deg, #3B2A6B, #0D0F1A 60%, #13324A); }
.ntf-wall { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: blur(30px) brightness(.5); animation: k-fade .6s both; }
.ntf-phone { position: relative; justify-self: center; width: min(460px, 100%); height: 100%; overflow-y: auto; padding: 10px 14px 40px; }
.ntf-lock { display: grid; justify-items: center; padding: 20px 0 30px; color: #fff; text-shadow: 0 2px 20px rgba(0,0,0,.3); } .ntf-lock span { font-size: 16px; opacity: .8; } .ntf-lock b { font: 200 92px/1 var(--k-text); } .ntf-lock em { font: 500 17px var(--k-text); font-style: normal; }
.ntf-stack { position: relative; margin-bottom: 14px; } .ntf-stack header { display: flex; gap: 8px; align-items: center; padding: 0 6px 6px; color: rgba(255,255,255,.85); font: 600 15px var(--k-text); } .ntf-stack header b { flex: 1; } .ntf-stack header button { padding: 3px 10px; border-radius: 99px; background: rgba(255,255,255,.16); color: #fff; font: 600 12px var(--k-text); }
.ntf-n { position: relative; margin-bottom: 6px; animation: k-rise .3s var(--k-out) both; } .ntf-body { position: relative; z-index: 1; display: flex; gap: 12px; align-items: center; width: 100%; padding: 12px 14px; border-radius: 20px; background: rgba(255,255,255,.18); backdrop-filter: blur(30px); text-align: left; color: #fff; }
.ntf-body img, .ntf-body .alt-noart { width: 38px; height: 38px; border-radius: 10px; object-fit: cover; font-size: 4px; flex: none; } .ntf-body span { flex: 1; min-width: 0; } .ntf-body b { display: block; font: 600 14px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .ntf-body em { font: 14px var(--k-text); font-style: normal; color: rgba(255,255,255,.85); }
.ntf-body time { align-self: flex-start; font: 12px var(--k-text); color: rgba(255,255,255,.6); white-space: nowrap; }
.ntf-x { position: absolute; right: -8px; top: -8px; z-index: 2; width: 24px; height: 24px; border-radius: 50%; background: rgba(60,60,70,.9); color: #fff; font-size: 13px; opacity: 0; transition: opacity .2s; } .ntf-n:hover .ntf-x { opacity: 1; }
.ntf-under i { display: block; height: 10px; margin: -14px 14px 0; border-radius: 0 0 16px 16px; background: rgba(255,255,255,.1); } .ntf-under i:last-child { margin: -4px 26px 0; background: rgba(255,255,255,.06); }
.ntf-count { position: absolute; right: 16px; bottom: -2px; font: 11px var(--k-text); color: rgba(255,255,255,.6); }
.ntf-none { text-align: center; color: rgba(255,255,255,.6); }
.ntf-card { position: relative; align-self: center; width: 340px; margin-right: 30px; padding: 14px; border-radius: 26px; background: rgba(255,255,255,.14); backdrop-filter: blur(30px); color: #fff; animation: k-rise .3s var(--k-out) both; } .ntf-card img { width: 100%; border-radius: 16px; } .ntf-card h3 { margin: 12px 4px 4px; font: 700 18px var(--k-text); } .ntf-card p { margin: 0 4px 12px; color: rgba(255,255,255,.8); }
.ntf-go { width: 100%; height: 44px; border-radius: 14px; background: #fff !important; color: #111 !important; font: 700 14px var(--k-text) !important; margin-bottom: 6px; } .ntf-card .alt-actions button { color: #fff !important; } .ntf-card .alt-actions button:hover { background: rgba(255,255,255,.12) !important; } .ntf-close { margin: 8px 4px 0; color: #fff; opacity: .8; font: 600 13px var(--k-text); }
`;
