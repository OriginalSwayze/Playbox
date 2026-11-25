// RHYTHM — a rhythm game's song select. Songs (games) curve down a wheel on the right; the jacket, a spinning record,
// the level, BPM and your high score fill the left over a pulsing equaliser. Up/down spin the wheel, left/right change
// the album (collection), Enter plays.
import { useMemo } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';
import { cycle, useCursor, useKeys, useStatus } from './lk';

const level = (g: Game) => Math.max(1, Math.min(15, Math.round(Math.sqrt(g.minutes / 30))));
const rankOf = (g: Game) => (g.minutes >= 6000 ? 'SSS' : g.minutes >= 3000 ? 'SS' : g.minutes >= 1200 ? 'S' : g.minutes >= 300 ? 'A' : g.minutes >= 60 ? 'B' : g.minutes > 0 ? 'C' : '—');
const tint = (g: Game) => (g.appid * 47) % 360;

export function Rhythm() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const gs = b.games.slice(0, 300);
	const c = useCursor(gs.length);
	const g = sel ?? gs[c.i];
	const status = useStatus(g);
	const bars = useMemo(() => Array.from({ length: 48 }, (_, i) => 0.4 + ((i * 37) % 11) / 18), []);
	useKeys((k) => {
		if (k === 'up') { c.move(-1, true); select(null); } else if (k === 'down') { c.move(1, true); select(null); }
		else if (k === 'left' || k === 'prev') { cycle(b, -1); c.to(0); } else if (k === 'right' || k === 'next') { cycle(b, 1); c.to(0); }
		else if (k === 'enter' && g) gameCommands(g)[0].run(); else if (k === 'menu' && g) select(sel ? null : g.appid); else if (k === 'back' && sel) select(null); else return false;
	});
	const bpm = g ? 80 + Math.min(120, Math.round(g.minutes2w / 6)) : 120;
	return (
		<AltPage className="pb-rhy" brand={<>♪ SONG SELECT</>} search={b.q} onSearch={(q) => { b.setQ(q); c.to(0); }}>
			<div className="pb-rhy-app" style={{ ['--h' as string]: g ? tint(g) : 300, ['--beat' as string]: 60 / bpm + 's' }} onWheel={(e) => { c.move(Math.sign(e.deltaY), true); select(null); }}>
				<div className="pb-rhy-eq">{bars.map((v, i) => <i key={i} style={{ ['--v' as string]: v, animationDelay: -(i % 7) * 0.13 + 's' }} />)}</div>
				{g && (
					<section className="pb-rhy-left" key={g.appid}>
						<div className="pb-rhy-jacket"><div className="pb-rhy-disc" /><Art g={g} kind="capsule" /></div>
						<div className="pb-rhy-meta">
							<p className="pb-rhy-album">{b.found ? 'SEARCH' : b.isle?.name.toUpperCase()}</p>
							<h1>{g.name}</h1>
							<div className="pb-rhy-stats"><div><small>LEVEL</small><b>{level(g)}</b></div><div><small>BPM</small><b>{bpm}</b></div><div><small>RANK</small><b className="rank">{rankOf(g)}</b></div></div>
							<p className="pb-rhy-score"><small>HIGH SCORE</small>{(g.minutes * 1000 + (g.appid % 997)).toLocaleString()}</p>
							<p className="pb-rhy-sub">{status} · {formatPlaytime(g.minutes)} · {formatAgo(g.lastPlayed)}</p>
							<div className="pb-rhy-btns"><PlayBtn g={g} className="pb-rhy-go" label={['START ♪', 'DOWNLOAD']} /><button onClick={() => select(sel ? null : g.appid)}>{sel ? 'CLOSE' : 'OPTIONS'}</button></div>
							{sel && <Actions g={sel} className="pb-rhy-act" />}
						</div>
					</section>
				)}
				<div className="pb-rhy-wheel">{gs.map((x, n) => {
					const d = n - c.i;
					if (Math.abs(d) > 7) return null;
					return (
						<button key={x.appid} data-appid={x.appid} className={'pb-rhy-song' + (d === 0 ? ' on' : '')} style={{ ['--d' as string]: d, ['--a' as string]: Math.abs(d), ['--hh' as string]: tint(x) }} onClick={() => (d === 0 ? gameCommands(x)[0].run() : (c.to(n), select(null)))}>
							<Art g={x} kind="header" /><span><b>{x.name}</b><em>Lv.{level(x)} · {rankOf(x)}</em></span>
						</button>
					);
				})}</div>
				<p className="pb-rhy-keys">▲▼ SONG · ◀▶ ALBUM · ⏎ START · {c.i + 1}/{gs.length}</p>
			</div>
		</AltPage>
	);
}

const f = '"Bahnschrift", "Segoe UI", sans-serif';
export const rhythmCss = tok('rhythm', { bg: '#0D0618', s1: 'rgba(255,255,255,.1)', s2: 'rgba(255,255,255,.18)', s3: 'rgba(255,255,255,.26)', fg: '#FFFFFF', fg2: '#E2D4FF', fg3: '#9A86C4', acc: '#FF3FA4', on: '#fff', top: '#0A0414', font: f }) + `
.pb-rhy-brand { font: 800 16px ${f}; letter-spacing: .2em; color: #FF3FA4; }
.pb-rhy-app { position: absolute; inset: 0; overflow: hidden; color: #fff; background: radial-gradient(70% 90% at 25% 50%, hsl(var(--h) 70% 22%), #0D0618 70%); transition: background .6s; }
.pb-rhy-eq { position: absolute; left: 0; right: 0; bottom: 0; height: 40%; display: flex; gap: 4px; align-items: flex-end; padding: 0 10px; opacity: .35; }
.pb-rhy-eq i { flex: 1; height: calc(var(--v) * 100%); background: linear-gradient(0deg, hsl(var(--h) 90% 60%), transparent); transform-origin: bottom; animation: pb-rhy-beat var(--beat) ease-in-out infinite alternate; } @keyframes pb-rhy-beat { from { transform: scaleY(.3); } }
.pb-rhy-left { position: absolute; left: 50px; top: 50%; transform: translateY(-50%); display: grid; grid-template-columns: auto minmax(0, 380px); gap: 40px; align-items: center; width: 56%; animation: pb-rhy-in .4s var(--k-out) both; } @keyframes pb-rhy-in { from { opacity: 0; transform: translate(-30px, -50%); } }
.pb-rhy-jacket { position: relative; width: min(300px, 22vw); } .pb-rhy-jacket img, .pb-rhy-jacket .alt-noart { position: relative; width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 6px; box-shadow: 0 20px 50px rgba(0,0,0,.6), 0 0 0 3px hsl(var(--h) 90% 65%); }
.pb-rhy-disc { position: absolute; top: 8%; left: 38%; width: 84%; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, hsl(var(--h) 80% 55%) 0 10%, #111 11% 13%, #1a1a1a 14%, #050505 60%, #222 61%, #050505 70%); box-shadow: 0 10px 30px rgba(0,0,0,.6); animation: pb-rhy-spin calc(var(--beat) * 8) linear infinite; } @keyframes pb-rhy-spin { to { transform: rotate(360deg); } }
.pb-rhy-album { margin: 0 0 6px; font: 700 12px ${f}; letter-spacing: .25em; color: hsl(var(--h) 90% 70%); } .pb-rhy-meta h1 { margin: 0 0 16px; font: 800 clamp(26px, 2.8vw, 40px)/1.05 ${f}; }
.pb-rhy-stats { display: flex; gap: 10px; margin-bottom: 14px; } .pb-rhy-stats div { display: grid; justify-items: center; min-width: 74px; padding: 8px 10px; border-radius: 10px; background: rgba(0,0,0,.4); box-shadow: inset 0 0 0 1px rgba(255,255,255,.12); }
.pb-rhy-stats small { font: 700 10px ${f}; letter-spacing: .2em; color: #9A86C4; } .pb-rhy-stats b { font: 800 26px ${f}; } .pb-rhy-stats .rank { color: #FFD23F; text-shadow: 0 0 14px rgba(255,210,63,.6); }
.pb-rhy-score { margin: 0 0 4px; font: 800 34px ${f}; letter-spacing: .04em; font-variant-numeric: tabular-nums; } .pb-rhy-score small { display: block; font: 700 11px ${f}; letter-spacing: .25em; color: #9A86C4; } .pb-rhy-sub { margin: 0 0 18px; font: 14px ${f}; color: #E2D4FF; }
.pb-rhy-btns { display: flex; gap: 10px; } .pb-rhy-go { height: 50px; padding: 0 34px; border-radius: 99px; background: linear-gradient(90deg, #FF3FA4, hsl(var(--h) 90% 60%)) !important; color: #fff !important; font: 800 18px ${f} !important; letter-spacing: .1em; box-shadow: 0 0 24px rgba(255,63,164,.5); animation: pb-rhy-pulse var(--beat) ease-in-out infinite alternate; } @keyframes pb-rhy-pulse { to { transform: scale(1.04); } }
.pb-rhy-btns > button:last-child { height: 50px; padding: 0 22px; border-radius: 99px; background: rgba(255,255,255,.12); font: 700 14px ${f}; letter-spacing: .1em; color: #fff; }
.pb-rhy-act { margin-top: 12px; } .pb-rhy-act button { color: #E2D4FF !important; }
.pb-rhy-wheel { position: absolute; right: 0; top: 50%; width: 44%; height: 0; }
.pb-rhy-song { position: absolute; right: 0; top: calc(var(--d) * 76px - 34px); display: flex; align-items: center; gap: 12px; width: calc(100% - var(--a) * var(--a) * 10px); height: 68px; padding: 0 20px 0 8px; text-align: left; border-radius: 34px 0 0 34px; background: linear-gradient(90deg, hsl(var(--hh) 60% 28%), hsl(var(--hh) 60% 14%)); opacity: calc(1 - var(--a) * .1); transition: top .25s var(--k-out), width .25s var(--k-out), opacity .25s; box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); }
.pb-rhy-song img, .pb-rhy-song .alt-noart { flex: none; width: 112px; height: 52px; object-fit: cover; border-radius: 26px 4px 4px 26px; font-size: 6px; } .pb-rhy-song span { min-width: 0; } .pb-rhy-song b { display: block; font: 700 16px ${f}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .pb-rhy-song em { font: 600 12px ${f}; font-style: normal; color: #9A86C4; }
.pb-rhy-song.on { height: 84px; top: -42px; padding-left: 10px; background: linear-gradient(90deg, #FF3FA4, hsl(var(--hh) 80% 40%)); box-shadow: 0 0 30px rgba(255,63,164,.5), inset 0 0 0 2px #fff; } .pb-rhy-song.on img { width: 140px; height: 66px; } .pb-rhy-song.on em { color: #fff; } .pb-rhy-song.on b { font-size: 19px; }
.pb-rhy-keys { position: absolute; left: 50px; bottom: 16px; margin: 0; font: 700 12px ${f}; letter-spacing: .18em; color: #9A86C4; }
`;
