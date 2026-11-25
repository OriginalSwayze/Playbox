// CHRONICLE — your gaming life as a timeline. Years and months run down a glowing spine; the games you last played
// in each month hang off it as cards, and games that joined your library that month line up beside them.
import { useMemo, useRef, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { useKestrel } from '../state/store';
import { Actions, AltPage, Art, gameCommands, useSelectedGame } from './common';

type Month = { key: string; year: number; month: number; played: Game[]; added: Game[] };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function Drawer({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const play = gameCommands(g)[0];
	return (
		<aside className="ch-drawer" key={g.appid}>
			<button className="ch-x" onClick={close} aria-label="Close">×</button>
			<div className="ch-hero"><Art g={g} kind="hero" /></div>
			<h2>{g.name}</h2>
			<ul className="ch-facts">
				{g.added > 0 && <li><b>{new Date(g.added * 1000).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</b> joined your library</li>}
				{g.lastPlayed > 0 && <li><b>{new Date(g.lastPlayed * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</b> last played</li>}
				<li><b>{formatPlaytime(g.minutes)}</b> in total{g.minutes2w ? `, ${formatPlaytime(g.minutes2w)} in the last two weeks` : ''}</li>
				{d.achievements.total > 0 && <li><b>{d.achievements.achieved} of {d.achievements.total}</b> achievements</li>}
			</ul>
			<button className="ch-play" onClick={play.run}>{play.label}</button>
			<Actions g={g} />
		</aside>
	);
}

export function Chronicle() {
	const library = useKestrel((s) => s.library);
	const [sel, select] = useSelectedGame();
	const [q, setQ] = useState('');
	const scroller = useRef<HTMLDivElement>(null);
	const months = useMemo(() => {
		const t = q.trim().toLowerCase();
		const map = new Map<string, Month>();
		const at = (ts: number) => { const d = new Date(ts * 1000); const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`; if (!map.has(key)) map.set(key, { key, year: d.getFullYear(), month: d.getMonth(), played: [], added: [] }); return map.get(key)!; };
		for (const g of library) {
			if (t && !g.name.toLowerCase().includes(t)) continue;
			if (g.lastPlayed) at(g.lastPlayed).played.push(g);
			if (g.added) at(g.added).added.push(g);
		}
		const list = [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
		list.forEach((m) => { m.played.sort((a, b) => b.lastPlayed - a.lastPlayed); m.added.sort((a, b) => b.added - a.added); });
		return list;
	}, [library, q]);
	const years = [...new Set(months.map((m) => m.year))];
	const jump = (y: number) => scroller.current?.querySelector(`[data-year="${y}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	let lastYear = 0;
	return (
		<AltPage className="ch" brand="Chronicle" search={q} onSearch={setQ} searchPlaceholder="Find a game in your history">
			<div className="ch-wrap">
				<nav className="ch-years">{years.map((y) => <button key={y} onClick={() => jump(y)}>{y}</button>)}</nav>
				<div className="ch-scroll" ref={scroller}>
					<div className="ch-spine" />
					{months.map((m) => {
						const yearHead = m.year !== lastYear;
						lastYear = m.year;
						return (
							<div key={m.key}>
								{yearHead && <div className="ch-year" data-year={m.year}>{m.year}</div>}
								<section className="ch-month">
									<div className="ch-node"><b>{MONTHS[m.month]}</b><span>{m.played.length ? `${m.played.length} played` : ''}{m.played.length && m.added.length ? ' · ' : ''}{m.added.length ? `${m.added.length} added` : ''}</span></div>
									<div className="ch-events">
										{m.played.map((g, i) => (
											<button key={g.appid} data-appid={g.appid} className={'ch-card ' + (i % 2 ? 'r' : 'l')} onClick={() => select(g.appid)}>
												<div className="ch-art"><Art g={g} kind="header" /></div>
												<div className="ch-tx"><em>Last played {new Date(g.lastPlayed * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</em><b>{g.name}</b>
													<i className="ch-bar"><i style={{ width: `${Math.min(100, Math.log10(1 + g.minutes) * 25)}%` }} /></i><span>{formatPlaytime(g.minutes)} · {formatAgo(g.lastPlayed)}</span></div>
											</button>
										))}
										{m.added.length > 0 && (
											<div className="ch-added">
												<span>Joined the library</span>
												<div>{m.added.slice(0, 18).map((g) => <button key={g.appid} data-appid={g.appid} title={g.name} onClick={() => select(g.appid)}><Art g={g} kind="capsule" /></button>)}{m.added.length > 18 && <em>+{m.added.length - 18}</em>}</div>
											</div>
										)}
									</div>
								</section>
							</div>
						);
					})}
				</div>
				{sel && <Drawer g={sel} close={() => select(null)} />}
			</div>
		</AltPage>
	);
}

export const chronicleCss = `
html.kestrel[data-ui="chronicle"] { --k-ink: #0B0D1F; --k-s1: #12152E; --k-s2: #1A1E3D; --k-s3: #23284F; --k-s4: #2F3566; --k-line: rgba(160,180,255,.1); --k-line-2: rgba(160,180,255,.2);
	--k-fg: #EEF0FF; --k-fg-2: #A9AFD6; --k-fg-3: #6D74A3; --k-accent: #6FFFCB; --k-accent-2: #B4FFE5; --k-on-accent: #032419; --k-a10: rgba(111,255,203,.08); --k-a20: rgba(111,255,203,.16); --k-a40: rgba(111,255,203,.35); }
.ch-brand { font: 300 21px var(--k-display); letter-spacing: .3em; text-transform: uppercase; color: #B4FFE5; }
.ch-stage { background: #0B0D1F; }
.ch-wrap { position: absolute; inset: 0; display: grid; grid-template-columns: 110px minmax(0, 1fr); }
.ch-years { overflow-y: auto; padding: 24px 0; border-right: 1px solid var(--k-line); }
.ch-years button { display: block; width: 100%; padding: 8px 0; font: 600 15px var(--k-display) !important; color: #6D74A3 !important; }
.ch-years button:hover { color: #6FFFCB !important; }
.ch-scroll { position: relative; overflow-y: auto; padding: 30px 40px 120px; scroll-behavior: smooth; }
.ch-spine { position: absolute; left: 50%; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: linear-gradient(180deg, #6FFFCB, #4D6BFF 60%, transparent); box-shadow: 0 0 18px rgba(111,255,203,.5); }
.ch-year { position: relative; z-index: 1; width: max-content; margin: 30px auto 24px; padding: 8px 22px; border-radius: 99px; background: #0B0D1F; box-shadow: inset 0 0 0 2px #6FFFCB, 0 0 30px rgba(111,255,203,.3); font: 800 30px var(--k-display); letter-spacing: .04em; color: #EEF0FF; }
.ch-month { position: relative; margin-bottom: 28px; content-visibility: auto; contain-intrinsic-size: 1px 400px; }
.ch-node { position: relative; z-index: 1; width: max-content; margin: 0 auto 16px; padding: 5px 14px; border-radius: 8px; background: #1A1E3D; text-align: center; box-shadow: 0 0 0 1px var(--k-line-2); }
.ch-node b { display: block; font: 700 14px var(--k-display); color: #B4FFE5; }
.ch-node span { font-size: 11.5px; color: #6D74A3; }
.ch-events { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 80px; }
.ch-card { position: relative; display: flex; gap: 12px; padding: 10px; border-radius: 14px; text-align: left; background: #12152E; box-shadow: inset 0 0 0 1px var(--k-line); transition: transform .35s var(--k-spring), box-shadow .3s; animation: k-rise 500ms var(--k-out) both; }
.ch-card.l { grid-column: 1; } .ch-card.r { grid-column: 2; }
.ch-card::after { content: ""; position: absolute; top: 50%; width: 40px; height: 2px; background: rgba(111,255,203,.35); }
.ch-card.l::after { right: -40px; } .ch-card.r::after { left: -40px; }
.ch-card::before { content: ""; position: absolute; top: calc(50% - 5px); width: 10px; height: 10px; border-radius: 50%; background: #6FFFCB; box-shadow: 0 0 10px #6FFFCB; }
.ch-card.l::before { right: -45px; } .ch-card.r::before { left: -45px; }
.ch-card:hover { transform: translateY(-3px); box-shadow: inset 0 0 0 1px rgba(111,255,203,.45), 0 16px 30px -16px #000; }
.ch-art { flex: none; width: 150px; aspect-ratio: 460/215; border-radius: 8px; overflow: hidden; }
.ch-art img, .ch-art .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.ch-tx { min-width: 0; flex: 1; }
.ch-tx em { font: 600 11px var(--k-small); font-style: normal; letter-spacing: .06em; text-transform: uppercase; color: #6FFFCB; }
.ch-tx b { display: block; margin: 2px 0 6px; font: 650 14.5px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ch-bar { display: block; height: 4px; border-radius: 99px; background: #23284F; overflow: hidden; margin-bottom: 4px; }
.ch-bar i { display: block; height: 100%; background: linear-gradient(90deg, #4D6BFF, #6FFFCB); }
.ch-tx span { font-size: 12px; color: #6D74A3; }
.ch-added { grid-column: 1 / -1; display: flex; align-items: center; gap: 14px; margin: 4px auto 0; max-width: 100%; padding: 8px 12px; border-radius: 12px; background: rgba(77,107,255,.08); box-shadow: inset 0 0 0 1px rgba(77,107,255,.25); position: relative; z-index: 1; }
.ch-added > span { font: 600 11px var(--k-small); letter-spacing: .06em; text-transform: uppercase; color: #A9AFD6; white-space: nowrap; }
.ch-added > div { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
.ch-added button { width: 30px; height: 45px; border-radius: 4px; overflow: hidden; transition: transform .25s var(--k-spring); }
.ch-added button:hover { transform: scale(1.4); z-index: 2; }
.ch-added img, .ch-added .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 6px; }
.ch-added em { font: 600 12px var(--k-text); font-style: normal; color: #6D74A3; }
.ch-drawer { position: absolute; top: 14px; right: 14px; bottom: 14px; width: 360px; z-index: 6; overflow-y: auto; padding: 0 0 20px; border-radius: 18px; background: rgba(18,21,46,.97); box-shadow: inset 0 0 0 1px var(--k-line-2), var(--k-float); animation: at-in 450ms var(--k-out) both; }
@keyframes at-in { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: none; } }
.ch-x { position: absolute; right: 12px; top: 10px; z-index: 1; width: 34px; height: 34px; border-radius: 50%; background: rgba(0,0,0,.5) !important; font-size: 22px !important; line-height: 1; }
.ch-hero { height: 170px; overflow: hidden; } .ch-hero img, .ch-hero .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.ch-drawer h2 { margin: 14px 20px 10px; font: 700 22px var(--k-display); }
.ch-facts { margin: 0 20px 16px; padding: 0 0 0 16px; border-left: 2px solid #6FFFCB; list-style: none; font-size: 13.5px; color: #A9AFD6; }
.ch-facts li { margin-bottom: 8px; } .ch-facts b { color: #EEF0FF; }
.ch-play { display: block; width: calc(100% - 40px); margin: 0 20px 10px; height: 46px; border-radius: 12px; background: linear-gradient(90deg, #4D6BFF, #6FFFCB) !important; color: #031024 !important; font: 750 15px var(--k-text) !important; }
.ch-drawer .alt-actions { margin: 0 12px; }
`;
