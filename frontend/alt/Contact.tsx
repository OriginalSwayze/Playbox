// CONTACT SHEET — a darkroom. Each collection is a roll of film printed as a contact sheet: strips of black-and-white
// frames with sprocket holes and edge numbers. Mark a frame with the red grease pencil (click) and an enlargement
// comes out of the developer tray; Print it plays.
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Contact() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const frames = b.games.slice(0, 72);
	const strips = Array.from({ length: Math.ceil(frames.length / 6) }, (_, i) => frames.slice(i * 6, i * 6 + 6));
	return (
		<AltPage className="cts" brand={<>Darkroom</>}>
			<div className="cts-app">
				<nav className="cts-rolls">{b.islands.map((i, k) => <button key={i.id} className={b.cur === i.id ? 'on' : ''} onClick={() => b.setCur(i.id)}><i>ROLL {String(k + 1).padStart(2, '0')}</i>{i.name}</button>)}</nav>
				<section className="cts-sheet">
					<div className="cts-paper">
						<p className="cts-label">{(b.isle?.name ?? '').toUpperCase()} · KESTREL 400 · {frames.length} EXP.</p>
						{strips.map((s, si) => (
							<div key={si} className="cts-strip">
								<div className="cts-sprk" />
								<div className="cts-frames">{s.map((g, fi) => { const n = si * 6 + fi + 1; return (
									<button key={g.appid} data-appid={g.appid} className={'cts-frame' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>
										<Art g={g} kind="header" /><span className="cts-n">{n}</span><span className="cts-na">{n}A</span>
									</button>); })}</div>
								<div className="cts-sprk" />
							</div>
						))}
					</div>
				</section>
				{sel && (
					<aside className="cts-tray" key={sel.appid}>
						<div className="cts-print"><Art g={sel} kind="hero" /></div>
						<p className="cts-note">“{sel.name}” — {sel.minutes ? formatPlaytime(sel.minutes) + ' exposure' : 'unexposed'}{sel.lastPlayed ? ', shot ' + formatAgo(sel.lastPlayed).toLowerCase() : ''}</p>
						<PlayBtn g={sel} className="cts-go" label={['Print it — Play', 'Develop — Install']} /><Actions g={sel} className="cts-act" /><button className="cts-x" onClick={() => select(null)}>Back to the sheet</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const contactCss = tok('contact', { bg: '#1A0806', s1: '#2A0F0B', s2: '#3A1610', s3: '#4A1D15', fg: '#FFD9CF', fg2: '#E0A898', fg3: '#A8705F', acc: '#FF3B2F', on: '#1A0806', top: '#120403', font: '"Courier New", Consolas, monospace' }) + `
.cts-brand { font: 700 15px var(--k-text); letter-spacing: .3em; color: #FF6B5F; text-transform: uppercase; }
.cts-app { position: absolute; inset: 0; display: grid; grid-template-columns: 200px minmax(0, 1fr) auto; background: radial-gradient(70% 70% at 50% 30%, #3A0E08, #120403); }
.cts-rolls { overflow-y: auto; padding: 14px 10px; } .cts-rolls button { display: grid; width: 100%; margin-bottom: 6px; padding: 8px 10px; border-radius: 4px; text-align: left; font: 13px "Courier New", monospace; color: #E0A898; background: rgba(0,0,0,.25); } .cts-rolls button i { font-style: normal; font-size: 10px; color: #A8705F; } .cts-rolls button.on { background: #FF3B2F; color: #1A0806; } .cts-rolls button.on i { color: #1A0806; }
.cts-sheet { overflow-y: auto; padding: 24px; display: grid; justify-items: center; align-content: start; }
.cts-paper { width: min(1000px, 100%); padding: 22px 24px 30px; background: #F4F1EA; box-shadow: 0 20px 40px rgba(0,0,0,.6); transform: rotate(-.4deg); }
.cts-label { margin: 0 0 12px; font: 700 12px "Courier New", monospace; letter-spacing: .2em; color: #333; }
.cts-strip { margin-bottom: 14px; background: #141414; padding: 0 10px; } .cts-sprk { height: 16px; background: radial-gradient(ellipse 5px 4px, #F4F1EA 98%, transparent) 0 50% / 20px 16px repeat-x; }
.cts-frames { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.cts-frame { position: relative; aspect-ratio: 3/2; background: #000; } .cts-frame img, .cts-frame .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: grayscale(1) contrast(1.15) brightness(.95); }
.cts-n, .cts-na { position: absolute; bottom: -14px; font: 700 9px "Courier New", monospace; color: #E0A82E; } .cts-n { left: 2px; } .cts-na { right: 2px; }
.cts-frame:hover img { filter: grayscale(.4) contrast(1.1); } .cts-frame.on::after { content: ""; position: absolute; inset: -8px -10px; border: 3px solid #E3261B; border-radius: 48% 52% 45% 55% / 55% 45% 55% 45%; transform: rotate(-3deg); pointer-events: none; }
.cts-tray { width: 380px; overflow-y: auto; padding: 22px; background: rgba(0,0,0,.35); animation: k-fade .4s both; }
.cts-print { padding: 14px; background: #F4F1EA; box-shadow: 0 10px 30px rgba(0,0,0,.6); animation: cts-dev 2.4s ease-out both; } .cts-print img { width: 100%; display: block; filter: grayscale(1) contrast(1.1); } @keyframes cts-dev { from { filter: brightness(3) contrast(.2); } to { filter: none; } }
.cts-note { margin: 14px 0; font: italic 14px Georgia, serif; color: #FFD9CF; }
.cts-go { width: 100%; height: 44px; border-radius: 4px; background: #FF3B2F !important; color: #1A0806 !important; font: 700 14px "Courier New", monospace !important; letter-spacing: .1em; margin-bottom: 6px; } .cts-act button { color: #E0A898 !important; font-family: "Courier New", monospace !important; } .cts-act button:hover { background: rgba(255,59,47,.12) !important; } .cts-x { margin-top: 8px; color: #FF6B5F; font: 13px "Courier New", monospace; }
`;
