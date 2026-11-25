// VINYL — a record shop. Collections are crates of square sleeves you flick through; pull one and it goes on the
// turntable, which spins up with the game's art as its label. Drop the needle to play.
import { useEffect, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, gameCommands, useIslands, useSearch, useSelectedGame } from './common';

function Turntable({ g }: { g: Game | null }) {
	const [drop, setDrop] = useState(false);
	useEffect(() => setDrop(false), [g?.appid]);
	if (!g) return <aside className="vy-deck empty"><div className="vy-platter"><div className="vy-record idle" /></div><p>Pick a record from the crates.</p></aside>;
	const play = gameCommands(g)[0];
	return (
		<aside className="vy-deck" key={g.appid}>
			<div className="vy-platter">
				<div className={'vy-record spin' + (drop ? ' fast' : '')}><div className="vy-label"><Art g={g} kind="header" /></div></div>
				<div className={'vy-arm' + (drop ? ' down' : '')} />
			</div>
			<div className="vy-info">
				<div className="vy-side">Side A · {g.installed ? 'In stock' : 'On order'}</div>
				<h2>{g.name}</h2>
				<p>{formatPlaytime(g.minutes)} played{g.lastPlayed ? ` · last spun ${formatAgo(g.lastPlayed).toLowerCase()}` : ' · never spun'}</p>
				<button className="vy-needle" onClick={() => { setDrop(true); setTimeout(play.run, 650); }}>{g.installed ? 'Drop the needle' : 'Order it (install)'}</button>
				<Actions g={g} className="vy-actions" />
			</div>
		</aside>
	);
}

export function Vinyl() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const crates = found ? [{ id: 'q', name: `Search: ${q.trim()}`, games: found }] : islands;
	return (
		<AltPage className="vy" brand={<><i className="vy-dot" />Vinyl</>} search={q} onSearch={setQ} searchPlaceholder="Dig for a record">
			<div className="vy-shop">
				<div className="vy-crates">
					{crates.map((c) => (
						<section key={c.id} className="vy-crate">
							<div className="vy-tab">{c.name}<span>{c.games.length}</span></div>
							<div className="vy-row">
								{c.games.map((g) => (
									<button key={g.appid} data-appid={g.appid} className={'vy-sleeve' + (sel?.appid === g.appid ? ' out' : '') + (g.installed ? '' : ' dim')} onClick={() => select(g.appid)} title={g.name}>
										<Art g={g} kind="header" />
										<span>{g.name}</span>
									</button>
								))}
							</div>
						</section>
					))}
				</div>
				<Turntable g={sel} />
			</div>
		</AltPage>
	);
}

export const vinylCss = `
html.kestrel[data-ui="vinyl"] { --k-ink: #2A1C13; --k-s1: #35241A; --k-s2: #432E21; --k-s3: #55392A; --k-s4: #6A4734; --k-line: rgba(255,230,190,.1); --k-line-2: rgba(255,230,190,.2);
	--k-fg: #F6E8CF; --k-fg-2: #D3BB97; --k-fg-3: #9C8566; --k-accent: #E8742C; --k-accent-2: #F7A15C; --k-on-accent: #2A1206; --k-a10: rgba(232,116,44,.1); --k-a20: rgba(232,116,44,.18); --k-a40: rgba(232,116,44,.38); }
.vy-brand { display: flex; align-items: center; gap: 8px; font: 900 21px "Arial Black", "Segoe UI", sans-serif; letter-spacing: -.02em; color: #F6E8CF; }
.vy-dot { width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle, #E8742C 0 3px, #111 3.5px 8px, #333 8.5px); box-shadow: 0 0 0 1px #000; }
.vy-stage { background: #2A1C13; }
.vy-shop { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) 420px; background:
	repeating-linear-gradient(90deg, rgba(0,0,0,.05) 0 2px, transparent 2px 120px), linear-gradient(180deg, #3B2416, #24170F); }
.vy-crates { overflow-y: auto; padding: 26px 30px 60px; }
.vy-crate { margin-bottom: 34px; animation: k-rise 600ms var(--k-out) both; }
.vy-tab { display: inline-flex; gap: 10px; align-items: baseline; padding: 5px 14px 6px; margin-left: 10px; border-radius: 6px 6px 0 0; background: #E8742C; color: #2A1206; font: 900 14px "Arial Black", sans-serif; text-transform: uppercase; letter-spacing: .02em; }
.vy-tab span { font: 700 11px var(--k-text); opacity: .7; }
.vy-row { display: flex; gap: 0; padding: 26px 20px 18px 30px; overflow-x: auto; border-radius: 6px; perspective: 900px;
	background: linear-gradient(180deg, #6B4428, #4B2E19); box-shadow: inset 0 3px 0 rgba(255,220,170,.2), inset 0 -16px 20px rgba(0,0,0,.4), 0 16px 28px -14px #000; }
.vy-sleeve { position: relative; flex: none; width: 150px; height: 150px; margin-left: -96px; border-radius: 2px; overflow: visible; transform-origin: 50% 100%; transform: rotateX(18deg);
	transition: transform .45s var(--k-spring), margin .35s var(--k-out), filter .3s; box-shadow: 0 6px 14px -4px rgba(0,0,0,.8); }
.vy-sleeve:first-child { margin-left: 0; }
.vy-sleeve img, .vy-sleeve .alt-noart { width: 100%; height: 100%; object-fit: cover; border-radius: 2px; display: block; }
.vy-sleeve::after { content: ""; position: absolute; inset: 0; border-radius: 2px; background: linear-gradient(100deg, rgba(255,255,255,.18), transparent 40%, rgba(0,0,0,.25)); }
.vy-sleeve > span { position: absolute; left: 0; right: 0; bottom: -20px; font: 700 11px var(--k-text); color: #F6E8CF; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; opacity: 0; transition: opacity .2s; }
.vy-sleeve.dim { filter: saturate(.55) brightness(.8); }
.vy-sleeve:hover { transform: rotateX(0deg) translateY(-30px); margin-right: 60px; z-index: 2; filter: none; }
.vy-sleeve:hover > span, .vy-sleeve.out > span { opacity: 1; }
.vy-sleeve.out { transform: translateY(-40px); margin-right: 70px; z-index: 3; filter: none; box-shadow: 0 0 0 3px #E8742C, 0 20px 30px -10px #000; }
.vy-deck { position: relative; padding: 30px 28px; border-left: 1px solid rgba(0,0,0,.4); background: linear-gradient(180deg, #E9DCC1, #D6C5A4); color: #2A1C13; overflow-y: auto; box-shadow: inset 8px 0 20px -10px rgba(0,0,0,.5); }
.vy-deck.empty p { text-align: center; font: italic 15px Georgia, serif; color: #6A5440; }
.vy-platter { position: relative; width: 340px; height: 340px; margin: 0 auto 24px; border-radius: 16px; background: linear-gradient(145deg, #3A3A3A, #1B1B1B); box-shadow: 0 20px 40px -16px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.12); }
.vy-record { position: absolute; left: 20px; top: 20px; width: 290px; height: 290px; border-radius: 50%;
	background: repeating-radial-gradient(circle, #111 0 1.5px, #1d1d1d 1.5px 3px), #111; box-shadow: 0 0 0 2px #000, 0 8px 18px rgba(0,0,0,.6); }
.vy-record::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 30deg, transparent 0 20%, rgba(255,255,255,.09) 25%, transparent 30% 70%, rgba(255,255,255,.07) 75%, transparent 80%); }
.vy-record.spin { animation: vy-spin 1.8s linear infinite; }
.vy-record.fast { animation-duration: .9s; }
@keyframes vy-spin { to { transform: rotate(360deg); } }
.vy-label { position: absolute; left: 50%; top: 50%; width: 112px; height: 112px; margin: -56px; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 4px #E8742C; }
.vy-label img, .vy-label .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.vy-label::after { content: ""; position: absolute; left: 50%; top: 50%; width: 10px; height: 10px; margin: -5px; border-radius: 50%; background: #ddd; box-shadow: inset 0 1px 2px #000; }
.vy-arm { position: absolute; right: 18px; top: 26px; width: 12px; height: 210px; border-radius: 6px; background: linear-gradient(90deg, #ccc, #888); transform-origin: 6px 6px; transform: rotate(-4deg); transition: transform .6s var(--k-spring); box-shadow: 0 6px 10px rgba(0,0,0,.5); }
.vy-arm::before { content: ""; position: absolute; left: -10px; top: -10px; width: 32px; height: 32px; border-radius: 50%; background: radial-gradient(circle, #aaa, #555); }
.vy-arm::after { content: ""; position: absolute; left: -6px; bottom: -14px; width: 24px; height: 26px; border-radius: 4px; background: #222; }
.vy-arm.down { transform: rotate(22deg); }
.vy-side { font: 800 11px var(--k-text); letter-spacing: .14em; text-transform: uppercase; color: #B04E18; }
.vy-info h2 { margin: 6px 0 6px; font: 900 28px/1.05 "Arial Black", sans-serif; letter-spacing: -.02em; }
.vy-info p { margin: 0 0 18px; font: italic 15px Georgia, serif; color: #5A4634; }
.vy-needle { width: 100%; height: 50px; border-radius: 99px; background: #E8742C !important; color: #2A1206 !important; font: 900 16px "Arial Black", sans-serif !important; text-transform: uppercase; letter-spacing: .02em; box-shadow: 0 10px 20px -8px #B04E18, inset 0 2px 0 rgba(255,255,255,.3); transition: transform .3s var(--k-spring); }
.vy-needle:hover { transform: scale(1.03); }
.vy-actions { margin-top: 14px; }
.vy-actions button { color: #4A3624 !important; }
.vy-actions button:hover { background: rgba(0,0,0,.07) !important; color: #2A1C13 !important; }
`;
