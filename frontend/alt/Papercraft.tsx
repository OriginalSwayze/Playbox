// PAPERCRAFT — a layered paper-cut diorama. Hills of coloured card stack into depth with soft shadows; your games hang
// as paper tags on strings from a washing line (one line per collection). Pull a tag to unfold it into a card; the
// paper button plays.
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

const TAGS = ['#F28B82', '#FBBC04', '#CCFF90', '#A7FFEB', '#AECBFA', '#D7AEFB', '#FDCFE8', '#E6C9A8'];

export function Papercraft() {
	const islands = useIslands().slice(0, 4);
	const [sel, select] = useSelectedGame();
	return (
		<AltPage className="ppr" brand={<>✂ papercraft</>}>
			<div className="ppr-app">
				<div className="ppr-sky"><span className="ppr-sun" /><span className="ppr-cloud a" /><span className="ppr-cloud b" /></div>
				<div className="ppr-lines">{islands.map((i, k) => (
					<div key={i.id} className="ppr-line">
						<span className="ppr-label">{i.name}</span>
						<div className="ppr-tags">{i.games.slice(0, 14).map((g, n) => (
							<button key={g.appid} data-appid={g.appid} className={'ppr-tag' + (sel?.appid === g.appid ? ' on' : '')} style={{ background: TAGS[(k * 3 + n) % 8], animationDelay: -((g.appid % 30) / 10) + 's' }} onClick={() => select(g.appid)}>
								<i className="ppr-hole" /><Art g={g} kind="capsule" /><b>{g.name}</b>
							</button>))}</div>
					</div>))}</div>
				<div className="ppr-hill h1" /><div className="ppr-hill h2" /><div className="ppr-hill h3" /><div className="ppr-hill h4" />
				{sel && (
					<div className="ppr-open" onClick={() => select(null)}>
						<div className="ppr-card" key={sel.appid} onClick={(e) => e.stopPropagation()}>
							<div className="ppr-fold"><Art g={sel} kind="header" /></div>
							<div className="ppr-inside"><h2>{sel.name}</h2><p>{sel.minutes ? `${formatPlaytime(sel.minutes)} together` : 'Not played yet'}{sel.lastPlayed ? ` · ${formatAgo(sel.lastPlayed).toLowerCase()}` : ''}</p>
								<PlayBtn g={sel} className="ppr-go" label={['Play', 'Install']} /><Actions g={sel} className="ppr-act" /></div>
						</div>
					</div>
				)}
			</div>
		</AltPage>
	);
}

export const papercraftCss = tok('papercraft', { bg: '#BFE3F2', s1: '#FFFFFF', s2: '#F3EEE4', s3: '#E3DBCC', fg: '#2E3440', fg2: '#4C566A', fg3: '#7B8496', acc: '#E85D4A', on: '#fff', top: '#F7F3EA', font: '"Segoe UI", "Trebuchet MS", sans-serif' }) + `
.ppr-brand { font: 800 18px var(--k-text); color: #2E3440; }
.ppr-app { position: absolute; inset: 0; overflow: hidden; background: linear-gradient(#9FD3EC, #DFF2F8); }
.ppr-sky { position: absolute; inset: 0; pointer-events: none; } .ppr-sun { position: absolute; right: 12%; top: 40px; width: 110px; height: 110px; border-radius: 50%; background: #FFD166; box-shadow: 6px 8px 0 rgba(0,0,0,.08); }
.ppr-cloud { position: absolute; height: 46px; border-radius: 30px; background: #fff; box-shadow: 4px 6px 0 rgba(0,0,0,.06); animation: ppr-drift 60s linear infinite; } .ppr-cloud.a { width: 180px; top: 70px; left: 10%; } .ppr-cloud.b { width: 130px; top: 150px; left: 55%; animation-duration: 80s; } @keyframes ppr-drift { to { transform: translateX(300px); } }
.ppr-hill { position: absolute; left: -10%; right: -10%; border-radius: 50% 50% 0 0; box-shadow: 0 -8px 16px rgba(0,0,0,.12); pointer-events: none; } .h1 { bottom: -120px; height: 300px; background: #8FD694; } .h2 { bottom: -170px; height: 300px; left: 20%; background: #6CC17A; } .h3 { bottom: -200px; height: 280px; right: 30%; background: #4FA663; } .h4 { bottom: -230px; height: 260px; background: #3B8A50; }
.ppr-lines { position: absolute; inset: 0 0 90px; z-index: 2; overflow-y: auto; padding: 20px 30px; display: grid; gap: 34px; align-content: start; }
.ppr-line { position: relative; padding-top: 14px; } .ppr-line::before { content: ""; position: absolute; left: -30px; right: -30px; top: 14px; height: 2px; background: #6B4E31; border-radius: 1px; transform: rotate(-.4deg); }
.ppr-label { position: absolute; left: 0; top: -12px; padding: 2px 10px; background: #fff; font: 800 13px var(--k-text); color: #2E3440; box-shadow: 2px 3px 0 rgba(0,0,0,.12); transform: rotate(-2deg); z-index: 1; }
.ppr-tags { display: flex; gap: 14px; padding: 8px 10px 0; overflow-x: auto; }
.ppr-tag { position: relative; flex: none; width: 110px; padding: 18px 8px 10px; border-radius: 8px 8px 4px 4px; clip-path: polygon(20% 0, 80% 0, 100% 14%, 100% 100%, 0 100%, 0 14%); box-shadow: 3px 4px 0 rgba(0,0,0,.12); transform-origin: 50% -10px; animation: ppr-sway 4s ease-in-out infinite alternate; }
@keyframes ppr-sway { from { transform: rotate(-3deg); } to { transform: rotate(3deg); } } .ppr-tag:hover { animation-play-state: paused; transform: translateY(6px); } .ppr-tag.on { outline: 3px dashed #2E3440; outline-offset: -6px; }
.ppr-hole { position: absolute; left: 50%; top: 6px; width: 8px; height: 8px; margin-left: -4px; border-radius: 50%; background: #BFE3F2; box-shadow: inset 1px 1px 0 rgba(0,0,0,.2); }
.ppr-tag img, .ppr-tag .alt-noart { width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 3px; box-shadow: 0 0 0 3px rgba(255,255,255,.7); font-size: 7px; } .ppr-tag b { display: block; margin-top: 6px; font: 700 11px/1.2 var(--k-text); color: #2E3440; text-align: center; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.ppr-open { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: rgba(46,52,64,.35); animation: k-fade .2s both; }
.ppr-card { display: grid; grid-template-columns: 1fr 1fr; width: min(820px, 92%); perspective: 1400px; filter: drop-shadow(8px 10px 0 rgba(0,0,0,.15)); }
.ppr-fold { background: #fff; padding: 16px; transform-origin: right center; animation: ppr-unfold .7s var(--k-out) both; } .ppr-fold img { width: 100%; height: 100%; object-fit: cover; } @keyframes ppr-unfold { from { transform: rotateY(-100deg); } }
.ppr-inside { padding: 24px; background: #F7F3EA; background-image: repeating-linear-gradient(transparent 0 26px, rgba(0,0,0,.05) 26px 27px); } .ppr-inside h2 { margin: 0 0 8px; font: 800 24px var(--k-text); } .ppr-inside p { margin: 0 0 16px; color: #4C566A; }
.ppr-go { width: 100%; height: 48px; border-radius: 6px; background: #E85D4A !important; color: #fff !important; font: 800 16px var(--k-text) !important; box-shadow: 3px 4px 0 #A33A2B; margin-bottom: 10px; } .ppr-go:active { transform: translate(2px, 3px); box-shadow: 1px 1px 0 #A33A2B; }
.ppr-act button { color: #2E3440 !important; } .ppr-act button:hover { background: rgba(0,0,0,.06) !important; }
`;
