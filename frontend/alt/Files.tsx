// FILES — a file manager. The navigation pane lists collections as folders, the main view is a sortable details
// list (or large icons), and the preview pane on the right shows the selected game with Open.
import { useMemo, useState } from 'react';
import { Icon } from '../ui/icons';
import { formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

type Col = 'name' | 'lastPlayed' | 'type' | 'sizeOnDisk' | 'minutes';
const type = (g: Game) => (g.installed ? 'Application' : 'Shortcut (not installed)');

export function Files() {
	const b = useBrowse('all');
	const [sel, select] = useSelectedGame();
	const [sort, setSort] = useState<{ c: Col; d: 1 | -1 }>({ c: 'name', d: 1 });
	const [icons, setIcons] = useState(false);
	const rows = useMemo(() => [...b.games].sort((x, y) => {
		const a = sort.c === 'type' ? type(x) : sort.c === 'name' ? x.sortName : x[sort.c]; const c = sort.c === 'type' ? type(y) : sort.c === 'name' ? y.sortName : y[sort.c];
		return (a < c ? -1 : a > c ? 1 : 0) * sort.d;
	}).slice(0, 400), [b.games, sort]);
	const H = ({ c, label }: { c: Col; label: string }) => <button onClick={() => setSort({ c, d: sort.c === c ? (-sort.d as 1 | -1) : 1 })}>{label}{sort.c === c ? (sort.d > 0 ? ' ▴' : ' ▾') : ''}</button>;
	return (
		<AltPage className="fil" brand={<><span className="fil-folder" />Files</>}>
			<div className="fil-app">
				<div className="fil-tool">
					<span className="fil-crumb"><Icon name="library" size={14} /> This PC › Steam › <b>{b.found ? `Search results in Library` : b.isle?.name}</b></span>
					<label className="fil-q"><input value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder={`Search ${b.isle?.name ?? ''}`} spellCheck={false} /><Icon name="search" size={14} /></label>
				</div>
				<div className="fil-cmd"><span>{b.games.length} items{sel ? ' · 1 item selected' : ''}</span><button className={!icons ? 'on' : ''} onClick={() => setIcons(false)}>☰ Details</button><button className={icons ? 'on' : ''} onClick={() => setIcons(true)}>▦ Large icons</button></div>
				<nav className="fil-nav">
					<h5>Quick access</h5>
					{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(i.id); }}><span className="fil-folder sm" />{i.name}</button>)}
				</nav>
				<section className="fil-main">
					{icons ? (
						<div className="fil-icons">{rows.map((g) => <button key={g.appid} data-appid={g.appid} className={sel?.appid === g.appid ? 'on' : ''} onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><span>{g.name}</span></button>)}</div>
					) : (
						<div className="fil-table">
							<div className="fil-tr fil-th"><H c="name" label="Name" /><H c="lastPlayed" label="Date modified" /><H c="type" label="Type" /><H c="sizeOnDisk" label="Size" /><H c="minutes" label="Playtime" /></div>
							{rows.map((g) => (
								<div key={g.appid} data-appid={g.appid} className={'fil-tr' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>
									<span className="nm">{g.icon ? <img src={g.icon} alt="" /> : <i className="fil-blank" />}{g.name}</span>
									<span>{g.lastPlayed ? dateOf(g.lastPlayed, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
									<span>{type(g)}</span><span className="r">{g.sizeOnDisk ? formatBytes(g.sizeOnDisk) : ''}</span><span className="r">{g.minutes ? formatPlaytime(g.minutes) : ''}</span>
								</div>
							))}
						</div>
					)}
				</section>
				<aside className="fil-prev">
					{sel ? <div key={sel.appid}><Art g={sel} kind="capsule" className="fil-thumb" /><h3>{sel.name}</h3><p>{type(sel)}</p>
						<dl><dt>Date modified</dt><dd>{dateOf(sel.lastPlayed)}</dd><dt>Date created</dt><dd>{dateOf(sel.added)}</dd><dt>Size</dt><dd>{sel.sizeOnDisk ? formatBytes(sel.sizeOnDisk) : '—'}</dd><dt>App ID</dt><dd>{sel.appid}</dd></dl>
						<PlayBtn g={sel} className="fil-open" label={['Open', 'Install']} /><Actions g={sel} /></div>
						: <p className="fil-none">Select a file to preview.</p>}
				</aside>
			</div>
		</AltPage>
	);
}

export const filesCss = tok('files', { bg: '#FFFFFF', s1: '#F3F3F3', s2: '#E8E8E8', s3: '#D9D9D9', fg: '#1A1A1A', fg2: '#404040', fg3: '#707070', acc: '#0F6CBD', on: '#fff', top: '#F3F3F3', font: '"Segoe UI Variable Text", "Segoe UI", sans-serif' }) + `
.fil-brand { display: flex; gap: 9px; align-items: center; font: 600 14px var(--k-text); color: #1A1A1A; }
.fil-folder { width: 22px; height: 17px; border-radius: 2px 3px 3px 3px; background: linear-gradient(#FFD764, #F2B81F); position: relative; display: inline-block; flex: none; } .fil-folder::before { content: ""; position: absolute; left: 0; top: -3px; width: 9px; height: 4px; border-radius: 2px 2px 0 0; background: #E9AC12; }
.fil-folder.sm { transform: scale(.75); }
.fil-app { position: absolute; inset: 0; display: grid; grid-template-columns: 220px minmax(0, 1fr) 300px; grid-template-rows: 44px 38px minmax(0, 1fr); font: 13px var(--k-text); color: #1A1A1A; background: #fff; }
.fil-tool { grid-column: 1 / -1; display: flex; gap: 10px; align-items: center; padding: 6px 12px; background: #F3F3F3; }
.fil-crumb { flex: 1; display: flex; gap: 6px; align-items: center; height: 30px; padding: 0 10px; border-radius: 4px; background: #fff; border: 1px solid #E0E0E0; color: #404040; }
.fil-q { display: flex; align-items: center; width: 280px; height: 30px; padding: 0 10px; border-radius: 4px; background: #fff; border: 1px solid #E0E0E0; color: #707070; } .fil-q input { flex: 1; border: 0; outline: none; font: 13px var(--k-text); background: none; color: #1A1A1A; }
.fil-cmd { grid-column: 1 / -1; display: flex; gap: 4px; align-items: center; padding: 0 12px; border-bottom: 1px solid #E5E5E5; background: #F9F9F9; } .fil-cmd span { margin-right: auto; color: #707070; }
.fil-cmd button { height: 28px; padding: 0 10px; border-radius: 4px; color: #1A1A1A; font: 13px var(--k-text); } .fil-cmd button.on, .fil-cmd button:hover { background: #E8E8E8; }
.fil-nav { overflow-y: auto; padding: 8px 6px; border-right: 1px solid #E5E5E5; } .fil-nav h5 { margin: 4px 8px 4px; font: 600 12px var(--k-text); color: #707070; }
.fil-nav button { display: flex; gap: 8px; align-items: center; width: 100%; height: 30px; padding: 0 8px; border-radius: 4px; text-align: left; font: 13px var(--k-text); color: #1A1A1A; white-space: nowrap; overflow: hidden; } .fil-nav button:hover { background: #F0F0F0; } .fil-nav button.on { background: #E0EEF9; }
.fil-main { overflow: auto; }
.fil-tr { display: grid; grid-template-columns: minmax(240px, 2.6fr) 1.3fr 1.3fr .7fr .8fr; gap: 10px; align-items: center; height: 30px; padding: 0 14px; cursor: default; white-space: nowrap; } .fil-tr > span { overflow: hidden; text-overflow: ellipsis; color: #555; }
.fil-tr:not(.fil-th):hover { background: #F2F7FC; } .fil-tr.on { background: #CCE4F7; } .fil-tr .nm { display: flex; gap: 8px; align-items: center; color: #1A1A1A; } .fil-tr .nm img, .fil-blank { width: 16px; height: 16px; flex: none; } .fil-blank { background: #ddd; border-radius: 2px; }
.fil-tr .r { text-align: right; } .fil-th { position: sticky; top: 0; background: #fff; border-bottom: 1px solid #E5E5E5; z-index: 1; } .fil-th button { text-align: left; font: 13px var(--k-text); color: #404040; } .fil-th button:hover { background: #F0F0F0; }
.fil-icons { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 6px; padding: 12px; } .fil-icons button { display: grid; justify-items: center; gap: 6px; padding: 8px; border-radius: 4px; } .fil-icons button:hover { background: #F2F7FC; } .fil-icons button.on { background: #CCE4F7; }
.fil-icons img, .fil-icons .alt-noart { width: 84px; height: 126px; object-fit: cover; box-shadow: 0 2px 6px rgba(0,0,0,.2); } .fil-icons span { font: 12px var(--k-text); text-align: center; line-height: 1.25; max-height: 30px; overflow: hidden; color: #1A1A1A; }
.fil-prev { overflow-y: auto; padding: 18px; border-left: 1px solid #E5E5E5; background: #FAFAFA; } .fil-thumb { width: 150px; display: block; margin: 0 auto 14px; box-shadow: 0 4px 14px rgba(0,0,0,.2); }
.fil-prev h3 { margin: 0; font: 600 16px var(--k-text); } .fil-prev p { margin: 2px 0 14px; color: #707070; } .fil-prev dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 0 0 14px; } .fil-prev dt { color: #707070; } .fil-prev dd { margin: 0; }
.fil-open { width: 100%; height: 32px; border-radius: 4px; background: #0F6CBD !important; color: #fff !important; font: 600 13px var(--k-text) !important; margin-bottom: 8px; } .fil-none { color: #707070; text-align: center; margin-top: 40px; }
`;
