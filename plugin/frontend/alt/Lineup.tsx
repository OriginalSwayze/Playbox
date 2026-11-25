// LINEUP — a music-festival poster. Your most-played games headline in huge type, the rest of the bill shrinks
// tier by tier; the day tabs are collections. Click any act for its set card; "Get tickets" plays it.
import { useMemo } from 'react';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const TIERS = [3, 6, 12, 24, 60];

export function Lineup() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const acts = useMemo(() => [...b.games].sort((x, y) => y.minutes - x.minutes).slice(0, TIERS.reduce((a, c) => a + c, 0)), [b.games]);
	let k = 0;
	const tiers = TIERS.map((n) => { const t = acts.slice(k, k + n); k += n; return t; }).filter((t) => t.length);
	return (
		<AltPage className="fst" brand={<>KESTREL FEST</>}>
			<div className="fst-app">
				<nav className="fst-days">{b.islands.slice(0, 7).map((i) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => { b.setCur(i.id); select(null); }}>{i.name}</button>)}</nav>
				<section className="fst-poster">
					<div className="fst-sun" />
					<p className="fst-pre">Kestrel presents</p>
					<h1 className="fst-title">{(b.isle?.name ?? 'Library').toUpperCase()}</h1>
					<p className="fst-dates">{b.games.length} acts · {Math.round(b.games.reduce((n, g) => n + g.minutes, 0) / 60).toLocaleString()} hours of music</p>
					{tiers.map((t, ti) => (
						<div key={ti} className={'fst-tier t' + ti}>
							{t.map((g, i) => <span key={g.appid}>{i > 0 && <i>•</i>}<button data-appid={g.appid} className={sel?.appid === g.appid ? 'on' : ''} onClick={() => select(g.appid)}>{g.name}</button></span>)}
						</div>
					))}
					<p className="fst-foot">+ many more · {b.games.filter((g) => !g.minutes).length} debut acts never heard before</p>
				</section>
				{sel && (
					<div className="fst-card" key={sel.appid}>
						<Art g={sel} kind="hero" />
						<div><em>{acts.indexOf(sel) >= 0 && acts.indexOf(sel) < 3 ? 'Headliner' : 'On the bill'}</em><h2>{sel.name}</h2><p>{formatPlaytime(sel.minutes)} on stage · {sel.lastPlayed ? 'last set ' + formatAgo(sel.lastPlayed).toLowerCase() : 'debut performance'}</p>
							<PlayBtn g={sel} className="fst-go" label={['Get tickets — Play', 'Get tickets — Install']} /><Actions g={sel} className="fst-act" /><button className="fst-x" onClick={() => select(null)}>Close</button></div>
					</div>
				)}
			</div>
		</AltPage>
	);
}

export const lineupCss = tok('lineup', { bg: '#1A0E2E', s1: '#2A1748', s2: '#3A2060', s3: '#4B2A78', fg: '#FFF3E0', fg2: '#FFD9B0', fg3: '#C9A27E', acc: '#FF5E3A', on: '#fff', top: '#12091F', font: '"Bahnschrift Condensed", "Arial Narrow", Impact, sans-serif' }) + `
.fst-brand { font: 700 17px var(--k-text); letter-spacing: .2em; color: #FFB347; }
.fst-app { position: absolute; inset: 0; display: grid; grid-template-rows: 48px minmax(0, 1fr); background: linear-gradient(180deg, #2B1055 0%, #7A1F5C 45%, #F2643B 85%, #FFB347 100%); }
.fst-days { display: flex; gap: 4px; justify-content: center; align-items: center; background: rgba(0,0,0,.35); } .fst-days button { padding: 6px 16px; font: 700 16px var(--k-text); letter-spacing: .1em; text-transform: uppercase; color: #FFD9B0; } .fst-days button.on { background: #FFF3E0; color: #2B1055; }
.fst-poster { position: relative; overflow-y: auto; padding: 30px 6% 60px; text-align: center; color: #FFF3E0; }
.fst-sun { position: absolute; left: 50%; top: 40px; width: 380px; height: 380px; margin-left: -190px; border-radius: 50%; background: repeating-linear-gradient(transparent 0 14px, rgba(43,16,85,.5) 14px 20px), radial-gradient(circle, #FFE08A, #FF8A3D); opacity: .35; pointer-events: none; }
.fst-pre { position: relative; margin: 0; font: 700 20px var(--k-text); letter-spacing: .4em; text-transform: uppercase; } .fst-title { position: relative; margin: 4px 0; font: 900 clamp(60px, 10vw, 150px)/.9 Impact, var(--k-text); letter-spacing: .02em; color: #FFF3E0; text-shadow: 6px 6px 0 #FF5E3A, 12px 12px 0 #2B1055; }
.fst-dates { position: relative; margin: 10px 0 30px; font: 700 22px var(--k-text); letter-spacing: .15em; text-transform: uppercase; color: #FFD9B0; }
.fst-tier { position: relative; margin: 0 auto 14px; max-width: 1200px; line-height: 1.05; } .fst-tier span { white-space: nowrap; } .fst-tier i { margin: 0 .4em; font-style: normal; color: #FF5E3A; }
.fst-tier button { font: inherit; color: inherit; text-transform: uppercase; } .fst-tier button:hover { color: #FFE08A; } .fst-tier button.on { color: #2B1055; background: #FFE08A; padding: 0 .2em; }
.fst-tier.t0 { font: 900 clamp(40px, 5.4vw, 84px) Impact, var(--k-text); } .fst-tier.t1 { font: 800 clamp(26px, 3.2vw, 48px) var(--k-text); } .fst-tier.t2 { font: 700 clamp(20px, 2.2vw, 32px) var(--k-text); } .fst-tier.t3 { font: 700 clamp(16px, 1.6vw, 22px) var(--k-text); } .fst-tier.t4 { font: 600 15px var(--k-text); opacity: .85; }
.fst-foot { position: relative; margin-top: 30px; font: 700 16px var(--k-text); letter-spacing: .2em; text-transform: uppercase; }
.fst-card { position: absolute; right: 24px; bottom: 24px; width: 420px; border-radius: 18px; overflow: hidden; background: #1A0E2E; box-shadow: 0 20px 50px rgba(0,0,0,.6); animation: k-rise .35s var(--k-out) both; color: #FFF3E0; } .fst-card > img { width: 100%; height: 160px; object-fit: cover; }
.fst-card > div { padding: 16px 18px; } .fst-card em { font: 700 13px var(--k-text); font-style: normal; letter-spacing: .2em; text-transform: uppercase; color: #FF5E3A; } .fst-card h2 { margin: 4px 0; font: 900 30px Impact, var(--k-text); } .fst-card p { margin: 0 0 12px; font: 15px "Segoe UI", sans-serif; color: #FFD9B0; }
.fst-go { width: 100%; height: 46px; border-radius: 10px; background: #FF5E3A !important; color: #fff !important; font: 700 18px var(--k-text) !important; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 8px; }
.fst-act button { color: #FFD9B0 !important; } .fst-act button:hover { background: rgba(255,255,255,.08) !important; } .fst-x { margin-top: 6px; color: #FFB347; font: 700 14px var(--k-text); letter-spacing: .1em; text-transform: uppercase; }
`;
