// QUIZ — a game show about your own library. Two games, one question ("Which have you played more?", "Which did
// you play more recently?", "Which joined first?"). Pick one, the answer is revealed with the real numbers, and
// your streak climbs. Either contestant can be played from the reveal.
import { useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const QS: { q: string; v: (g: Game) => number; show: (g: Game) => string; ok: (g: Game) => boolean }[] = [
	{ q: 'Which have you played more?', v: (g) => g.minutes, show: (g) => formatPlaytime(g.minutes), ok: (g) => g.minutes > 0 },
	{ q: 'Which did you play more recently?', v: (g) => g.lastPlayed, show: (g) => (g.lastPlayed ? formatAgo(g.lastPlayed) : 'never'), ok: (g) => g.lastPlayed > 0 },
	{ q: 'Which joined your library first?', v: (g) => -g.added, show: (g) => dateOf(g.added), ok: (g) => g.added > 0 },
	{ q: 'Which scored higher with critics?', v: (g) => g.metacritic, show: (g) => String(g.metacritic), ok: (g) => g.metacritic > 0 },
];

export function Quiz() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const [round, setRound] = useState(0);
	const [pick, setPick] = useState<number | null>(null);
	const [streak, setStreak] = useState(0);
	const [best, setBest] = useState(0);
	const pair = useMemo(() => {
		const Q = QS[round % QS.length];
		const pool = b.games.filter(Q.ok);
		if (pool.length < 2) return null;
		const r = (n: number) => pool[(Math.imul(round + 7, 2654435761) >>> 0) % n + 0];
		const a = r(pool.length); let c = pool[(pool.indexOf(a) + 1 + (round * 13) % (pool.length - 1)) % pool.length];
		if (Q.v(c) === Q.v(a)) c = pool.find((x) => Q.v(x) !== Q.v(a)) ?? c;
		return { Q, a, c };
	}, [b.games, round]);
	const answer = (g: Game) => { if (!pair || pick !== null) return; setPick(g.appid); const right = pair.Q.v(g) >= pair.Q.v(g === pair.a ? pair.c : pair.a); const s = right ? streak + 1 : 0; setStreak(s); setBest(Math.max(best, s)); };
	const right = pair && pick !== null ? pair.Q.v(pick === pair.a.appid ? pair.a : pair.c) >= pair.Q.v(pick === pair.a.appid ? pair.c : pair.a) : null;
	return (
		<AltPage className="qz" brand={<><span className="qz-q">?</span>Quiz Night</>}>
			<div className="qz-app">
				<div className="qz-lights" />
				<header className="qz-head"><div><em>Round</em><b>{round + 1}</b></div><div><em>Streak</em><b>{streak}</b></div><div><em>Best</em><b>{best}</b></div><select value={b.cur} onChange={(e) => { b.setCur(e.target.value); setRound(0); setPick(null); }}>{b.islands.map((i) => <option key={i.id} value={i.id}>Category: {i.name}</option>)}</select></header>
				{sel ? (
					<section className="qz-card" key={sel.appid}><Art g={sel} kind="hero" className="qz-hero" /><div><h2>{sel.name}</h2><p>{formatPlaytime(sel.minutes)} played · {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never played'}</p><PlayBtn g={sel} className="qz-go" /><Actions g={sel} /><button className="qz-back" onClick={() => select(null)}>Back to the show</button></div></section>
				) : pair ? (
					<section className="qz-stage2">
						<h1 className="qz-question">{pair.Q.q}</h1>
						<div className="qz-pair">
							{[pair.a, pair.c].map((g, k) => { const won = pick !== null && pair.Q.v(g) >= pair.Q.v(k ? pair.a : pair.c); return (
								<div key={g.appid} className={'qz-pod' + (pick === g.appid ? ' picked' : '') + (pick !== null ? (won ? ' win' : ' lose') : '')}>
									<button data-appid={g.appid} onClick={() => answer(g)}><Art g={g} kind="capsule" /></button>
									<b>{g.name}</b>
									<span className="qz-val">{pick !== null ? pair.Q.show(g) : '???'}</span>
									{pick !== null && <button className="qz-info" onClick={() => select(g.appid)}>More</button>}
								</div>); })}
							<span className="qz-vs">VS</span>
						</div>
						{pick !== null && <div className={'qz-verdict ' + (right ? 'ok' : 'no')}><b>{right ? 'Correct!' : 'Not quite!'}</b><button onClick={() => { setPick(null); setRound(round + 1); }}>Next question →</button></div>}
					</section>
				) : <p className="qz-none">Not enough games in this category for a round.</p>}
			</div>
		</AltPage>
	);
}

export const quizCss = tok('quiz', { bg: '#1A0B3D', s1: '#2A1660', s2: '#3A2180', s3: '#4B2D9E', fg: '#FFFFFF', fg2: '#D9CCFF', fg3: '#A08ED8', acc: '#FFC400', on: '#2A1600', font: '"Segoe UI", system-ui, sans-serif' }) + `
.qz-brand { display: flex; gap: 8px; align-items: center; font: 900 20px var(--k-text); color: #FFC400; font-style: italic; text-transform: uppercase; letter-spacing: .02em; } .qz-q { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: #FFC400; color: #1A0B3D; font-style: normal; }
.qz-app { position: absolute; inset: 0; overflow-y: auto; background: radial-gradient(60% 50% at 50% 30%, #4B2D9E, #1A0B3D 80%); color: #fff; }
.qz-lights { position: absolute; left: 0; right: 0; top: 0; height: 14px; background: radial-gradient(circle, #FFC400 3px, transparent 4px) 0 0 / 28px 14px; animation: qz-chase 1s steps(2) infinite; opacity: .8; } @keyframes qz-chase { to { background-position: 14px 0; } }
.qz-head { display: flex; gap: 14px; justify-content: center; align-items: center; padding: 28px 20px 10px; } .qz-head > div { min-width: 100px; padding: 8px 16px; border-radius: 12px; background: rgba(0,0,0,.3); text-align: center; box-shadow: inset 0 0 0 2px #FFC400; }
.qz-head em { display: block; font: 700 11px var(--k-text); font-style: normal; letter-spacing: .15em; text-transform: uppercase; color: #FFC400; } .qz-head b { font: 900 30px var(--k-text); }
.qz-head select { height: 40px; padding: 0 10px; border-radius: 10px; border: 0; background: #2A1660; color: #fff; font: 600 13px var(--k-text); }
.qz-stage2 { display: grid; justify-items: center; padding: 10px 20px 40px; }
.qz-question { margin: 10px 0 24px; padding: 14px 40px; border-radius: 99px; background: linear-gradient(#4B2D9E, #2A1660); box-shadow: 0 0 0 3px #FFC400, 0 0 40px rgba(255,196,0,.35); font: 900 30px var(--k-text); text-align: center; }
.qz-pair { position: relative; display: flex; gap: 90px; } .qz-vs { position: absolute; left: 50%; top: 40%; transform: translate(-50%, -50%); display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: #FF3D7F; font: 900 22px var(--k-text); box-shadow: 0 0 30px #FF3D7F; }
.qz-pod { display: grid; justify-items: center; gap: 8px; width: 260px; text-align: center; transition: transform .4s var(--k-spring), opacity .4s; }
.qz-pod > button:first-child { border-radius: 16px; overflow: hidden; box-shadow: 0 0 0 4px #3A2180, 0 20px 40px -10px #000; transition: transform .25s var(--k-spring), box-shadow .25s; } .qz-pod > button:first-child:hover { transform: scale(1.04); box-shadow: 0 0 0 4px #FFC400, 0 20px 40px -10px #000; }
.qz-pod img, .qz-pod .alt-noart { width: 240px; height: 360px; object-fit: cover; display: block; } .qz-pod b { font: 800 17px var(--k-text); } .qz-val { padding: 6px 18px; border-radius: 10px; background: #000; color: #FFC400; font: 800 22px Consolas, monospace; min-width: 140px; }
.qz-pod.win { transform: scale(1.06); } .qz-pod.win > button:first-child { box-shadow: 0 0 0 5px #2EE59D, 0 0 50px rgba(46,229,157,.6); } .qz-pod.lose { opacity: .55; transform: scale(.95); }
.qz-info { font: 700 13px var(--k-text); color: #D9CCFF; text-decoration: underline; }
.qz-verdict { display: flex; gap: 20px; align-items: center; margin-top: 26px; padding: 12px 24px; border-radius: 16px; background: rgba(0,0,0,.35); animation: k-rise .4s var(--k-out) both; } .qz-verdict b { font: 900 26px var(--k-text); } .qz-verdict.ok b { color: #2EE59D; } .qz-verdict.no b { color: #FF3D7F; }
.qz-verdict button { height: 44px; padding: 0 22px; border-radius: 22px; background: #FFC400; color: #2A1600; font: 800 15px var(--k-text); }
.qz-card { display: grid; grid-template-columns: 1.3fr 1fr; gap: 28px; max-width: 1100px; margin: 20px auto; padding: 0 30px; animation: k-fade .3s both; } .qz-hero { width: 100%; border-radius: 16px; box-shadow: 0 0 0 3px #FFC400; }
.qz-card h2 { margin: 0 0 6px; font: 900 32px var(--k-text); } .qz-card p { color: #D9CCFF; } .qz-go { width: 100%; height: 50px; border-radius: 14px; background: #FFC400 !important; color: #2A1600 !important; font: 800 16px var(--k-text) !important; margin-bottom: 8px; } .qz-back { margin-top: 10px; color: #FFC400; font: 700 14px var(--k-text); }
.qz-none { text-align: center; color: #A08ED8; margin-top: 60px; }
`;
