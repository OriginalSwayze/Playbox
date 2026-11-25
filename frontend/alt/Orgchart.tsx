// ORG CHART — a company directory. Your most-played game is the CEO; each collection is a department headed by its
// most-played game, with its other games as reports. Drill into a department, and open anyone's profile card to
// "book a 1:1" (Play).
import { useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useIslands, useLibraryLists, useSelectedGame, type Island } from './common';
import { tok } from './kit';

const title = (g: Game, lead: boolean) => (lead ? 'Head of department' : g.minutes2w ? 'Senior specialist · on shift' : g.minutes > 3000 ? 'Senior specialist' : g.minutes ? 'Specialist' : 'New starter');

export function Orgchart() {
	const islands = useIslands().filter((i) => i.id !== 'recent');
	const { top } = useLibraryLists();
	const [sel, select] = useSelectedGame();
	const [dept, setDept] = useState<Island | null>(null);
	const heads = useMemo(() => islands.map((i) => ({ i, head: [...i.games].sort((a, b) => b.minutes - a.minutes)[0] })).filter((x) => x.head), [islands]);
	const ceo = top[0];
	const Card = ({ g, role, sm, onClick }: { g: Game; role: string; sm?: boolean; onClick?: () => void }) => (
		<button data-appid={g.appid} className={'org-card' + (sm ? ' sm' : '') + (sel?.appid === g.appid ? ' on' : '')} onClick={onClick ?? (() => select(g.appid))}>
			<span className="org-ph"><Art g={g} kind="capsule" />{g.minutes2w > 0 && <i className="org-on" />}</span><span><b>{g.name}</b><em>{role}</em></span>
		</button>
	);
	return (
		<AltPage className="org" brand={<><span className="org-logo">▲</span>Kestrel Inc. · People</>}>
			<div className="org-app">
				<section className="org-chart">
					<div className="org-crumbs"><button onClick={() => setDept(null)}>Kestrel Inc.</button>{dept && <> › <b>{dept.name}</b></>}</div>
					{!dept ? (<>
						{ceo && <div className="org-lvl"><Card g={ceo} role="Chief Executive (most played)" /></div>}
						<div className="org-line" />
						<div className="org-lvl wrap">{heads.map(({ i, head }) => <div key={i.id} className="org-dept"><span className="org-dn">{i.name}</span><Card g={head} role={`Head of ${i.name}`} onClick={() => setDept(i)} /><em>{i.games.length} people · click to open</em></div>)}</div>
					</>) : (<>
						<div className="org-lvl"><Card g={[...dept.games].sort((a, b) => b.minutes - a.minutes)[0]} role={`Head of ${dept.name}`} /></div>
						<div className="org-line" />
						<div className="org-lvl wrap">{[...dept.games].sort((a, b) => b.minutes - a.minutes).slice(1, 61).map((g) => <Card key={g.appid} g={g} role={title(g, false)} sm />)}</div>
					</>)}
				</section>
				{sel && (
					<aside className="org-prof" key={sel.appid}>
						<div className="org-cover"><Art g={sel} kind="hero" /></div><span className="org-big"><Art g={sel} kind="capsule" /></span>
						<h3>{sel.name}</h3><p className="org-role">{sel.appid === ceo?.appid ? 'Chief Executive' : title(sel, heads.some((h) => h.head.appid === sel.appid))}</p>
						<dl><dt>Started</dt><dd>{dateOf(sel.added)}</dd><dt>Hours logged</dt><dd>{formatPlaytime(sel.minutes)}</dd><dt>Last in office</dt><dd>{sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'Not yet'}</dd><dt>Status</dt><dd>{sel.installed ? '🟢 Available' : '⚪ Remote (not installed)'}</dd></dl>
						<PlayBtn g={sel} className="org-go" label={['Book a 1:1 (Play)', 'Onboard (Install)']} /><Actions g={sel} /><button className="org-x" onClick={() => select(null)}>Close</button>
					</aside>
				)}
			</div>
		</AltPage>
	);
}

export const orgchartCss = tok('orgchart', { bg: '#F5F7FB', s1: '#FFFFFF', s2: '#EBEFF6', s3: '#D7DEEA', fg: '#172033', fg2: '#42506A', fg3: '#7B879C', acc: '#3B5BDB', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.org-brand { display: flex; gap: 8px; align-items: center; font: 700 16px var(--k-text); color: #172033; } .org-logo { color: #3B5BDB; }
.org-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; }
.org-chart { overflow-y: auto; padding: 20px 30px 60px; display: grid; justify-items: center; align-content: start; }
.org-crumbs { justify-self: start; margin-bottom: 20px; font: 14px var(--k-text); color: #7B879C; } .org-crumbs button { color: #3B5BDB; font: 600 14px var(--k-text); }
.org-lvl { display: flex; gap: 16px; justify-content: center; } .org-lvl.wrap { flex-wrap: wrap; max-width: 1300px; }
.org-line { width: 2px; height: 30px; background: #B8C2D6; margin: 6px 0; }
.org-dept { display: grid; justify-items: center; gap: 6px; padding: 12px; border-radius: 14px; background: #EBEFF6; } .org-dn { font: 700 11px var(--k-text); letter-spacing: .08em; text-transform: uppercase; color: #3B5BDB; } .org-dept > em { font: 12px var(--k-text); font-style: normal; color: #7B879C; }
.org-card { display: flex; gap: 12px; align-items: center; width: 270px; padding: 12px; border-radius: 12px; background: #fff; text-align: left; box-shadow: 0 1px 3px rgba(23,32,51,.1), 0 0 0 1px #E3E8F0; transition: box-shadow .2s, transform .2s; animation: k-rise .35s var(--k-out) both; }
.org-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(23,32,51,.12), 0 0 0 1px #C9D3E6; } .org-card.on { box-shadow: 0 0 0 2px #3B5BDB; } .org-card.sm { width: 230px; padding: 10px; }
.org-ph { position: relative; width: 48px; height: 48px; flex: none; } .org-ph img, .org-ph .alt-noart { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; font-size: 6px; } .org-on { position: absolute; right: 0; bottom: 0; width: 12px; height: 12px; border-radius: 50%; background: #2FB344; box-shadow: 0 0 0 2px #fff; }
.org-card b { display: block; font: 600 14px var(--k-text); color: #172033; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; } .org-card em { font: 12px var(--k-text); font-style: normal; color: #7B879C; }
.org-prof { position: relative; width: 340px; overflow-y: auto; padding-bottom: 20px; background: #fff; border-left: 1px solid #E3E8F0; animation: k-fade .2s both; } .org-cover { height: 110px; overflow: hidden; } .org-cover img { width: 100%; height: 100%; object-fit: cover; }
.org-big { display: block; width: 90px; height: 90px; margin: -45px auto 0; border-radius: 50%; overflow: hidden; box-shadow: 0 0 0 4px #fff; position: relative; } .org-big img { width: 100%; height: 100%; object-fit: cover; }
.org-prof h3 { margin: 10px 20px 2px; font: 700 20px var(--k-text); text-align: center; } .org-role { margin: 0 0 14px; text-align: center; font: 13px var(--k-text); color: #7B879C; }
.org-prof dl { display: grid; grid-template-columns: auto 1fr; gap: 8px 14px; margin: 0 20px 14px; font: 14px var(--k-text); } .org-prof dt { color: #7B879C; } .org-prof dd { margin: 0; }
.org-go { width: calc(100% - 40px); margin: 0 20px 8px; height: 42px; border-radius: 10px; background: #3B5BDB !important; color: #fff !important; font: 600 14px var(--k-text) !important; } .org-prof .alt-actions { padding: 0 14px; } .org-x { margin: 8px 20px 0; color: #3B5BDB; font: 600 13px var(--k-text); }
`;
