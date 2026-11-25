// BRACKET — a knockout tournament. Sixteen games from a collection are seeded by hours played; click a game in each
// match to send it through, round by round, until a champion is crowned — then play the champion. "Auto" decides
// every match by hours.
import { useMemo, useState } from 'react';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const SEED = [0, 15, 7, 8, 3, 12, 4, 11, 1, 14, 6, 9, 2, 13, 5, 10];
const ROUNDS = ['Round of 16', 'Quarter-finals', 'Semi-finals', 'Final'];

export function Bracket() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const field = useMemo(() => [...b.games].sort((x, y) => y.minutes - x.minutes).slice(0, 16), [b.games]);
	const first = useMemo(() => SEED.map((s) => field[s] ?? null), [field]);
	const [wins, setWins] = useState<Record<string, number>>({});
	const key = b.cur + ':';
	const rounds: (Game | null)[][] = [first];
	for (let r = 0; r < 4; r++) { const prev = rounds[r]; const next: (Game | null)[] = []; for (let m = 0; m < prev.length / 2; m++) { const w = wins[key + r + ':' + m]; next.push(w ? prev.find((g) => g?.appid === w) ?? null : null); } rounds.push(next); }
	const champ = rounds[4][0];
	const pick = (r: number, m: number, g: Game | null) => { if (!g) return; const n = { ...wins, [key + r + ':' + m]: g.appid }; for (let rr = r + 1; rr < 4; rr++) Object.keys(n).forEach((k) => k.startsWith(key + rr + ':') && delete n[k]); setWins(n); select(g.appid); };
	const auto = () => { const n: Record<string, number> = {}; let cur = first; for (let r = 0; r < 4; r++) { const next: (Game | null)[] = []; for (let m = 0; m < cur.length / 2; m++) { const a = cur[m * 2], c = cur[m * 2 + 1]; const w = !a ? c : !c ? a : a.minutes >= c.minutes ? a : c; if (w) n[key + r + ':' + m] = w.appid; next.push(w); } cur = next; } setWins({ ...wins, ...n }); };
	const seed = (g: Game | null) => (g ? field.indexOf(g) + 1 : '');
	return (
		<AltPage className="brk" brand={<>🏆 Kestrel Cup</>}>
			<div className="brk-app">
				<div className="brk-bar"><select value={b.cur} onChange={(e) => b.setCur(e.target.value)}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select><button onClick={auto}>Auto (by hours)</button><button onClick={() => { const n = { ...wins }; Object.keys(n).forEach((k) => k.startsWith(key) && delete n[k]); setWins(n); }}>Reset</button></div>
				<section className="brk-tree">
					{rounds.slice(0, 4).map((round, r) => (
						<div key={r} className="brk-round"><h4>{ROUNDS[r]}</h4>
							<div className="brk-matches">{Array.from({ length: round.length / 2 }, (_, m) => { const a = round[m * 2], c = round[m * 2 + 1]; const w = wins[key + r + ':' + m]; return (
								<div key={m} className="brk-match">{[a, c].map((g, k) => <button key={k} data-appid={g?.appid} disabled={!g} className={'brk-slot' + (g && w === g.appid ? ' win' : w && g ? ' lose' : '') + (sel?.appid === g?.appid ? ' on' : '')} onClick={() => pick(r, m, g)}>
									<em>{seed(g)}</em>{g ? <><Art g={g} kind="capsule" /><span>{g.name}</span><b>{Math.round(g.minutes / 60)}</b></> : <span className="tbd">TBD</span>}</button>)}</div>); })}</div>
						</div>
					))}
					<div className="brk-round champ"><h4>Champion</h4>{champ ? <div className="brk-champ" key={champ.appid}><div className="brk-cup">🏆</div><Art g={champ} kind="capsule" /><b>{champ.name}</b><em>{formatPlaytime(champ.minutes)}</em><PlayBtn g={champ} className="brk-go" label={['Play the champion', 'Install the champion']} /></div> : <p className="brk-tbd">Pick the winners</p>}</div>
				</section>
				{sel && <aside className="brk-info" key={sel.appid}><b>{sel.name}</b><span>Seed {field.indexOf(sel) + 1 || '—'} · {formatPlaytime(sel.minutes)}</span><PlayBtn g={sel} className="brk-go sm" /><Actions g={sel} className="brk-act" /></aside>}
			</div>
		</AltPage>
	);
}

export const bracketCss = tok('bracket', { bg: '#0E1726', s1: '#16233A', s2: '#1E2F4D', s3: '#28406A', fg: '#F1F5FB', fg2: '#BCC9DC', fg3: '#7D8EA8', acc: '#FFC531', on: '#1E1500', font: '"Segoe UI", system-ui, sans-serif' }) + `
.brk-brand { font: 800 18px var(--k-text); color: #FFC531; }
.brk-app { position: absolute; inset: 0; display: grid; grid-template-rows: 50px minmax(0, 1fr) auto; }
.brk-bar { display: flex; gap: 10px; align-items: center; padding: 0 20px; } .brk-bar select, .brk-bar button { height: 32px; padding: 0 14px; border-radius: 8px; border: 0; background: #1E2F4D; color: #F1F5FB; font: 600 13px var(--k-text); }
.brk-tree { overflow: auto; display: flex; gap: 26px; padding: 10px 20px 20px; }
.brk-round { display: flex; flex-direction: column; flex: none; width: 230px; } .brk-round h4 { margin: 0 0 8px; font: 700 12px var(--k-text); letter-spacing: .1em; text-transform: uppercase; color: #7D8EA8; text-align: center; }
.brk-matches { flex: 1; display: flex; flex-direction: column; justify-content: space-around; gap: 10px; }
.brk-match { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); gap: 2px; padding: 3px; border-radius: 8px; background: #16233A; } .brk-round:not(.champ) .brk-match::after { content: ""; position: absolute; right: -14px; top: 50%; width: 14px; border-top: 2px solid #28406A; }
.brk-slot { min-width: 0; display: grid; grid-template-columns: 18px 24px minmax(0, 1fr) auto; gap: 6px; align-items: center; height: 36px; padding: 0 8px; border-radius: 6px; background: #1E2F4D; text-align: left; color: #F1F5FB; } .brk-slot:hover:not(:disabled) { background: #28406A; }
.brk-slot em { font: 700 11px var(--k-text); font-style: normal; color: #7D8EA8; } .brk-slot img, .brk-slot .alt-noart { width: 22px; height: 30px; object-fit: cover; border-radius: 3px; font-size: 3px; } .brk-slot span { font: 600 12px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .brk-slot b { font: 700 12px var(--k-text); color: #BCC9DC; }
.brk-slot.win { background: #FFC531; color: #1E1500; } .brk-slot.win b, .brk-slot.win em { color: #1E1500; } .brk-slot.lose { opacity: .45; } .brk-slot.on { box-shadow: inset 0 0 0 2px #fff; } .tbd { color: #7D8EA8; font-style: italic; }
.brk-round.champ { justify-content: center; } .brk-champ { display: grid; justify-items: center; gap: 6px; padding: 18px; border-radius: 16px; background: linear-gradient(160deg, #3A2E06, #16233A); box-shadow: 0 0 0 2px #FFC531, 0 0 40px rgba(255,197,49,.25); text-align: center; animation: whl-pop .6s var(--k-spring) both; } @keyframes whl-pop { from { transform: scale(.5); } }
.brk-cup { font-size: 40px; } .brk-champ img { width: 130px; border-radius: 8px; } .brk-champ b { font: 800 16px var(--k-text); } .brk-champ em { font: 12px var(--k-text); font-style: normal; color: #BCC9DC; } .brk-tbd { text-align: center; color: #7D8EA8; font-style: italic; }
.brk-go { width: 100%; height: 42px; border-radius: 10px; background: #FFC531 !important; color: #1E1500 !important; font: 800 14px var(--k-text) !important; } .brk-go.sm { width: auto; height: 34px; padding: 0 16px; }
.brk-info { display: flex; gap: 16px; align-items: center; padding: 10px 20px; background: #16233A; } .brk-info b { font: 700 15px var(--k-text); } .brk-info span { color: #7D8EA8; font: 13px var(--k-text); } .brk-act { grid-auto-flow: column; margin-left: auto; } .brk-act button { color: #BCC9DC !important; }
`;
