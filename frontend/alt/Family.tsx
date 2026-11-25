// FAMILY TREE — a genealogy chart. You sit at the top, your collections are the children, their most-played games
// the grandchildren — each in an oval portrait with "born" (added) and "last seen" dates. Click a portrait for the
// family record; Visit plays the game.
import { useState } from 'react';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useIslands, useSelectedGame } from './common';
import { tok } from './kit';

const yr = (u: number) => (u ? new Date(u * 1000).getFullYear() : '?');

export function Family() {
	const islands = useIslands().filter((i) => i.id !== 'recent').slice(0, 7);
	const [sel, select] = useSelectedGame();
	const [more, setMore] = useState(4);
	const P = ({ g }: { g: Game }) => (
		<button data-appid={g.appid} className={'fam-p' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>
			<span className="fam-oval"><Art g={g} kind="capsule" /></span><b>{g.name}</b><em>{yr(g.added)} – {g.lastPlayed ? yr(g.lastPlayed) : 'never seen'}</em>
		</button>
	);
	return (
		<AltPage className="fam" brand={<>The Kestrel Family Tree</>}>
			<div className="fam-app">
				<div className="fam-tree">
					<div className="fam-root"><span className="fam-oval you">You</span><b>The Player</b><em>Head of the library</em></div>
					<div className="fam-kids" style={{ gridTemplateColumns: `repeat(${islands.length}, max-content)` }}>
						{islands.map((i) => (
							<div key={i.id} className="fam-branch">
								<div className="fam-kid"><b>{i.name}</b><em>{i.games.length} descendants</em></div>
								<div className="fam-gkids">{[...i.games].sort((a, b) => b.minutes - a.minutes).slice(0, more).map((g) => <P key={g.appid} g={g} />)}</div>
							</div>
						))}
					</div>
					<button className="fam-more" onClick={() => setMore(more === 4 ? 8 : 4)}>{more === 4 ? 'Show more descendants' : 'Show fewer'}</button>
				</div>
				{sel && (
					<aside className="fam-rec" key={sel.appid}>
						<h4>Family record</h4><Art g={sel} kind="capsule" className="fam-photo" /><h3>{sel.name}</h3>
						<dl><dt>Born</dt><dd>{dateOf(sel.added, { day: 'numeric', month: 'long', year: 'numeric' })}</dd><dt>Last seen</dt><dd>{sel.lastPlayed ? dateOf(sel.lastPlayed, { day: 'numeric', month: 'long', year: 'numeric' }) : 'Never'}</dd><dt>Time together</dt><dd>{formatPlaytime(sel.minutes)}</dd><dt>Lives</dt><dd>{sel.installed ? 'At home (installed)' : 'Abroad (not installed)'}</dd></dl>
						<PlayBtn g={sel} className="fam-go" label={['Visit — Play', 'Bring home — Install']} /><Actions g={sel} /><button className="fam-x" onClick={() => select(null)}>Close record</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const familyCss = tok('family', { bg: '#F3EAD7', s1: '#FBF5E8', s2: '#EADFC7', s3: '#D9CAA9', fg: '#3B2A17', fg2: '#5C4630', fg3: '#8E7758', acc: '#7A4E24', on: '#FBF5E8', top: '#E6D9BC', font: 'Georgia, "Book Antiqua", serif' }) + `
.fam-brand { font: italic 700 18px Georgia, serif; color: #3B2A17; }
.fam-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; background: radial-gradient(80% 80% at 50% 30%, #FBF5E8, #E9DCBF); }
.fam-tree { overflow: auto; padding: 30px 30px 60px; display: grid; justify-items: center; align-content: start; }
.fam-root { position: relative; display: grid; justify-items: center; padding-bottom: 30px; } .fam-root::after { content: ""; position: absolute; bottom: 0; left: 50%; height: 30px; border-left: 2px solid #8E7758; }
.fam-root b { font: 700 18px Georgia, serif; } .fam-root em, .fam-kid em, .fam-p em { font: italic 12px Georgia, serif; color: #8E7758; font-style: italic; }
.fam-oval { display: block; width: 84px; height: 104px; border-radius: 50%; overflow: hidden; border: 4px double #7A4E24; background: #EADFC7; box-shadow: 0 4px 10px rgba(59,42,23,.3); } .fam-oval img, .fam-oval .alt-noart { width: 100%; height: 100%; object-fit: cover; filter: sepia(.45) contrast(1.05); font-size: 7px; }
.fam-oval.you { display: grid; place-items: center; font: italic 700 22px Georgia, serif; color: #7A4E24; }
.fam-kids { display: grid; gap: 30px; position: relative; padding-top: 30px; } .fam-kids::before { content: ""; position: absolute; top: 0; left: 80px; right: 80px; border-top: 2px solid #8E7758; }
.fam-branch { position: relative; display: grid; justify-items: center; } .fam-branch::before { content: ""; position: absolute; top: -30px; left: 50%; height: 30px; border-left: 2px solid #8E7758; }
.fam-kid { display: grid; justify-items: center; padding: 10px 18px; border-radius: 10px; background: #FBF5E8; box-shadow: 0 0 0 1px #D9CAA9, 0 3px 8px rgba(59,42,23,.15); position: relative; margin-bottom: 26px; } .fam-kid::after { content: ""; position: absolute; bottom: -26px; left: 50%; height: 26px; border-left: 2px solid #8E7758; } .fam-kid b { font: 700 15px Georgia, serif; }
.fam-gkids { display: grid; gap: 14px; justify-items: center; position: relative; } .fam-gkids::before { content: ""; position: absolute; top: 0; bottom: 60px; left: 50%; border-left: 2px dotted #B59E7A; z-index: -1; }
.fam-p { display: grid; justify-items: center; gap: 4px; width: 150px; text-align: center; transition: transform .2s var(--k-spring); } .fam-p:hover { transform: scale(1.05); } .fam-p b { font: 700 13px/1.2 Georgia, serif; color: #3B2A17; } .fam-p.on .fam-oval { border-color: #B8860B; box-shadow: 0 0 0 4px rgba(184,134,11,.35); }
.fam-more { margin-top: 26px; padding: 8px 18px; border-radius: 99px; box-shadow: inset 0 0 0 1px #7A4E24; font: italic 14px Georgia, serif; color: #7A4E24; }
.fam-rec { width: 320px; overflow-y: auto; padding: 22px; background: #FBF5E8; border-left: 1px solid #D9CAA9; box-shadow: -8px 0 20px -12px rgba(59,42,23,.4); animation: k-fade .25s both; }
.fam-rec h4 { margin: 0 0 12px; font: italic 14px Georgia, serif; color: #8E7758; border-bottom: 1px solid #D9CAA9; padding-bottom: 6px; } .fam-photo { display: block; width: 150px; margin: 0 auto 12px; border: 10px solid #fff; box-shadow: 0 4px 12px rgba(0,0,0,.2); filter: sepia(.4); transform: rotate(-2deg); }
.fam-rec h3 { margin: 0 0 12px; font: 700 20px Georgia, serif; text-align: center; } .fam-rec dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 0 0 14px; font: 14px Georgia, serif; } .fam-rec dt { font-style: italic; color: #8E7758; } .fam-rec dd { margin: 0; }
.fam-go { width: 100%; height: 44px; border-radius: 8px; background: #7A4E24 !important; color: #FBF5E8 !important; font: 700 15px Georgia, serif !important; margin-bottom: 8px; } .fam-rec .alt-actions button { color: #5C4630 !important; font-family: Georgia, serif !important; } .fam-x { margin-top: 8px; color: #7A4E24; font: italic 14px Georgia, serif; }
`;
