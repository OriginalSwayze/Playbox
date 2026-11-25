// MENU BOARD — a café chalkboard. Collections are sections chalked in columns, games are dishes with dotted leaders and
// "prices" in hours; today's special is whatever you played last. Pick a dish and it's served on a plate; Order plays.
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useIslands, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';

export function Menuboard() {
	const islands = useIslands().filter((i) => i.id !== 'recent').slice(0, 6);
	const { recent } = useLibraryLists();
	const [sel, select] = useSelectedGame();
	const special = recent[0];
	return (
		<AltPage className="mnb" brand={<>☕ The Kestrel Café</>}>
			<div className="mnb-app">
				<div className="mnb-board">
					<h1>~ Menu ~</h1>
					{special && <button className="mnb-special" data-appid={special.appid} onClick={() => select(special.appid)}><em>Today's special</em><b>{special.name}</b><span>served {formatAgo(special.lastPlayed).toLowerCase()}</span></button>}
					<div className="mnb-cols">{islands.map((i, k) => (
						<section key={i.id} className="mnb-sec" style={{ ['--r' as string]: (k % 2 ? 1 : -1) * 0.6 + 'deg' }}>
							<h2>{i.name}</h2>
							{[...i.games].sort((a, b) => b.minutes - a.minutes).slice(0, 12).map((g) => <button key={g.appid} data-appid={g.appid} className={'mnb-item' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}><span>{g.name}</span><i /><b>{Math.round(g.minutes / 60)}</b></button>)}
							{i.games.length > 12 && <p className="mnb-more">…and {i.games.length - 12} more, ask staff</p>}
						</section>
					))}</div>
					<p className="mnb-foot">All prices in hours · ask about our unplayed options</p>
				</div>
				{sel && (
					<aside className="mnb-plate" key={sel.appid}>
						<div className="mnb-dish"><Art g={sel} kind="capsule" /></div>
						<h3>{sel.name}</h3><p>{sel.minutes ? `${formatPlaytime(sel.minutes)} served so far` : 'Never ordered before'}</p>
						<PlayBtn g={sel} className="mnb-go" label={['Order — Play', 'Prepare — Install']} /><Actions g={sel} className="mnb-act" /><button className="mnb-x" onClick={() => select(null)}>Clear the table</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const menuboardCss = tok('menuboard', { bg: '#5A3E28', s1: '#6B4B32', s2: '#7C583C', s3: '#8D6546', fg: '#F7F3EA', fg2: '#E4DCCB', fg3: '#B9AE98', acc: '#F4D35E', on: '#2A2A2A', top: '#3E2A1A', font: '"Segoe Print", "Chalkboard SE", "Comic Sans MS", cursive' }) + `
.mnb-brand { font: 700 18px var(--k-text); color: #F7F3EA; }
.mnb-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 20px; padding: 24px; background: repeating-linear-gradient(90deg, #6B4B32 0 6px, #5A3E28 6px 60px); }
.mnb-board { overflow-y: auto; padding: 26px 34px; border: 18px solid #8B5E34; border-image: linear-gradient(135deg, #A87443, #6B4423) 1; background: radial-gradient(80% 80% at 50% 40%, #3A4A42, #222C28); box-shadow: 0 20px 40px rgba(0,0,0,.6), inset 0 0 60px rgba(0,0,0,.6); color: #F7F3EA; }
.mnb-board h1 { margin: 0 0 10px; text-align: center; font: 700 46px var(--k-text); text-shadow: 0 0 2px rgba(255,255,255,.4); letter-spacing: .04em; }
.mnb-special { display: grid; justify-items: center; width: min(460px, 100%); margin: 0 auto 26px; padding: 10px 20px; border: 2px dashed #F4D35E; border-radius: 12px; color: #F4D35E; transform: rotate(-1.5deg); } .mnb-special em { font: 14px var(--k-text); font-style: normal; } .mnb-special b { font: 700 24px var(--k-text); } .mnb-special span { font: 13px var(--k-text); color: #E4DCCB; }
.mnb-cols { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 26px 40px; }
.mnb-sec { transform: rotate(var(--r)); } .mnb-sec h2 { margin: 0 0 8px; font: 700 24px var(--k-text); color: #9AD1D4; text-decoration: underline wavy rgba(154,209,212,.5); }
.mnb-item { display: flex; gap: 6px; align-items: baseline; width: 100%; padding: 2px 0; text-align: left; font: 16px var(--k-text); color: #F7F3EA; text-shadow: 0 0 1px rgba(255,255,255,.5); } .mnb-item span { max-width: 75%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .mnb-item i { flex: 1; border-bottom: 2px dotted rgba(247,243,234,.5); }
.mnb-item b { font-weight: 400; color: #F4D35E; } .mnb-item:hover { color: #F4D35E; } .mnb-item.on span { background: rgba(244,211,94,.18); border-radius: 4px; }
.mnb-more { margin: 6px 0 0; font: 13px var(--k-text); color: #B9AE98; } .mnb-foot { margin: 24px 0 0; text-align: center; font: 14px var(--k-text); color: #B9AE98; }
.mnb-plate { width: 320px; align-self: center; padding: 22px; border-radius: 18px; background: #F7F3EA; color: #2A2A2A; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,.5); animation: k-rise .35s var(--k-out) both; font-family: Georgia, serif; }
.mnb-dish { width: 210px; height: 210px; margin: 0 auto 14px; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle, #fff 58%, #E9E4D8 60%, #fff 66%, #D9D2C2 100%); box-shadow: 0 10px 20px rgba(0,0,0,.25); } .mnb-dish img { width: 120px; height: 120px; object-fit: cover; border-radius: 50%; }
.mnb-plate h3 { margin: 0 0 4px; font: 700 20px Georgia, serif; } .mnb-plate p { margin: 0 0 12px; font: italic 14px Georgia, serif; color: #5A4B33; }
.mnb-go { width: 100%; height: 46px; border-radius: 10px; background: #2A2A2A !important; color: #F7F3EA !important; font: 700 15px Georgia, serif !important; margin-bottom: 8px; } .mnb-act button { color: #2A2A2A !important; font-family: Georgia, serif !important; } .mnb-x { margin-top: 8px; color: #8B5E34; font: italic 14px Georgia, serif; }
`;
