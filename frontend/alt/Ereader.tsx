// E-READER — an e-ink reader. Your library is a list of books with reading progress (hours towards 25), covers in
// greyscale; open one and read it a page at a time — tap the edges to turn, change the type size. "Play" is the
// last page's button.
import { useEffect, useState } from 'react';
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const prog = (g: Game) => Math.min(100, Math.round((g.minutes / 1500) * 100));
function pages(g: Game): string[] {
	return [
		`Chapter One\n\n${g.name} came into this library ${g.added ? 'on ' + dateOf(g.added, { day: 'numeric', month: 'long', year: 'numeric' }) : 'on a day nobody wrote down'}. ${g.minutes ? 'It did not stay on the shelf for long.' : 'It has stayed on the shelf ever since, spine uncracked.'}`,
		`Chapter Two\n\n${g.minutes ? `Over time it has been read for ${formatPlaytime(g.minutes)}. ${g.lastPlayed ? `The last time anyone opened it was ${formatAgo(g.lastPlayed).toLowerCase()}.` : ''}` : 'Not a single page of it has been turned.'} ${g.minutes2w ? `In the last fortnight alone it was opened for ${formatPlaytime(g.minutes2w)}.` : ''}`,
		`Chapter Three\n\n${g.installed ? `It is downloaded to this device${g.sizeOnDisk ? `, taking ${formatBytes(g.sizeOnDisk)}` : ''}.` : 'It is not on this device; it lives in the cloud for now.'} ${g.metacritic ? `Critics gave it ${g.metacritic} out of a hundred.` : ''}`,
		`The End\n\nThere is only one way to find out what happens next.`,
	];
}

export function Ereader() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [p, setP] = useState(0);
	const [size, setSize] = useState(22);
	useEffect(() => setP(0), [sel?.appid]);
	const pg = sel ? pages(sel) : [];
	return (
		<AltPage className="erd" brand={<>▯ Reader</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search library">
			<div className="erd-app">
				<div className="erd-device">
					{sel ? (
						<div className="erd-book" key={sel.appid}>
							<div className="erd-bar"><button onClick={() => select(null)}>‹ Library</button><span>{sel.name}</span><span className="erd-sz"><button onClick={() => setSize(Math.max(16, size - 2))}>A−</button><button onClick={() => setSize(Math.min(32, size + 2))}>A+</button></span></div>
							<div className="erd-page" style={{ fontSize: size }} key={p}>
								{p === 0 && <Art g={sel} kind="capsule" className="erd-cover" />}
								{pg[p].split('\n').map((l, i) => (i === 0 ? <h2 key={i}>{l}</h2> : l ? <p key={i}>{l}</p> : null))}
								{p === pg.length - 1 && <div className="erd-end"><PlayBtn g={sel} className="erd-go" label={['Play', 'Install']} /><Actions g={sel} className="erd-act" /></div>}
							</div>
							<button className="erd-tap l" onClick={() => setP(Math.max(0, p - 1))} aria-label="Previous page" /><button className="erd-tap r" onClick={() => setP(Math.min(pg.length - 1, p + 1))} aria-label="Next page" />
							<div className="erd-foot"><span>Page {p + 1} of {pg.length}</span><i><b style={{ width: ((p + 1) / pg.length) * 100 + '%' }} /></i><span>{prog(sel)}% read</span></div>
						</div>
					) : (
						<div className="erd-lib">
							<div className="erd-bar"><span>Library</span><select value={b.cur} onChange={(e) => b.setCur(e.target.value)}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
							<div className="erd-list">{b.games.slice(0, 120).map((g) => <button key={g.appid} data-appid={g.appid} onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><span><b>{g.name}</b><em>{g.installed ? 'On device' : 'In cloud'} · {g.lastPlayed ? formatAgo(g.lastPlayed) : 'New'}</em><i><b style={{ width: prog(g) + '%' }} /></i></span><strong>{prog(g)}%</strong></button>)}</div>
						</div>
					)}
				</div>
			</div>
		</AltPage>
	);
}

export const ereaderCss = tok('ereader', { bg: '#D8D6D0', s1: '#F2F1EC', s2: '#E6E4DD', s3: '#CFCCC3', fg: '#1A1A1A', fg2: '#3A3A3A', fg3: '#6F6E69', acc: '#1A1A1A', on: '#F2F1EC', font: 'Georgia, "Bookerly", serif' }) + `
.erd-brand { font: 700 18px Georgia, serif; color: #1A1A1A; }
.erd-app { position: absolute; inset: 0; display: grid; place-items: center; padding: 20px; background: #D8D6D0; }
.erd-device { position: relative; width: min(720px, 100%); height: 100%; padding: 26px 26px 50px; border-radius: 28px; background: #2B2B2B; box-shadow: 0 30px 60px -20px rgba(0,0,0,.5), inset 0 1px 0 #444; }
.erd-book, .erd-lib { position: relative; height: 100%; display: grid; grid-template-rows: 40px minmax(0, 1fr) auto; background: #F2F1EC; color: #1A1A1A; filter: contrast(1.05); overflow: hidden; }
.erd-book img, .erd-lib img { filter: grayscale(1) contrast(1.1); }
.erd-bar { display: flex; gap: 12px; align-items: center; padding: 0 16px; border-bottom: 1px solid #1A1A1A; font: 14px Georgia, serif; } .erd-bar span:nth-child(2) { flex: 1; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.erd-bar button, .erd-bar select { font: 14px Georgia, serif; color: #1A1A1A; background: transparent; border: 0; } .erd-sz button { padding: 2px 8px; border: 1px solid #1A1A1A !important; margin-left: 4px; }
.erd-page { overflow: hidden; padding: 30px 46px; line-height: 1.6; animation: erd-flash .35s steps(2) both; } @keyframes erd-flash { 0% { filter: invert(1); } 100% { filter: none; } }
.erd-page h2 { margin: 0 0 18px; font: 700 1.2em Georgia, serif; text-align: center; letter-spacing: .04em; } .erd-page p { margin: 0 0 1em; text-align: justify; hyphens: auto; }
.erd-cover { display: block; height: 240px; margin: 0 auto 20px; box-shadow: 0 0 0 1px #1A1A1A; }
.erd-end { display: grid; gap: 8px; margin-top: 20px; position: relative; z-index: 2; } .erd-go { height: 46px; border: 2px solid #1A1A1A !important; background: #1A1A1A !important; color: #F2F1EC !important; font: 700 16px Georgia, serif !important; }
.erd-act button { color: #1A1A1A !important; font-family: Georgia, serif !important; } .erd-act button:hover { background: #E6E4DD !important; }
.erd-tap { position: absolute; top: 40px; bottom: 40px; width: 22%; z-index: 1; } .erd-tap.l { left: 0; } .erd-tap.r { right: 0; }
.erd-foot { display: flex; gap: 12px; align-items: center; padding: 8px 16px; font: 12px Georgia, serif; border-top: 1px solid #CFCCC3; } .erd-foot i, .erd-list i { flex: 1; height: 3px; background: #CFCCC3; display: block; } .erd-foot i b, .erd-list i b { display: block; height: 100%; background: #1A1A1A; }
.erd-list { overflow-y: auto; } .erd-list > button { display: flex; gap: 14px; align-items: center; width: 100%; padding: 10px 16px; border-bottom: 1px solid #CFCCC3; text-align: left; color: #1A1A1A; }
.erd-list img, .erd-list .alt-noart { width: 48px; height: 72px; object-fit: cover; box-shadow: 0 0 0 1px #1A1A1A; flex: none; font-size: 6px; } .erd-list span { flex: 1; min-width: 0; display: grid; gap: 4px; } .erd-list b { font: 700 16px Georgia, serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .erd-list em { font: italic 13px Georgia, serif; color: #6F6E69; } .erd-list strong { font: 14px Georgia, serif; }
`;
