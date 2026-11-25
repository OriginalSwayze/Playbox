// JOBS — a job board. Each game is an opening: the "company" is its collection, the pay is your hours, "Remote" means
// installed, "Urgent" means played this fortnight. List on the left, the posting on the right; Easy apply plays.
import { useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const posted = (g: Game) => (g.added ? formatAgo(g.added) : 'a while ago');

export function Jobs() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [applied, setApplied] = useState<Record<number, boolean>>({});
	const [remote, setRemote] = useState(false);
	const list = b.games.filter((g) => !remote || g.installed).slice(0, 150);
	const job = sel ?? list[0] ?? null;
	const company = b.found ? 'Search results' : b.isle?.name ?? 'Library';
	return (
		<AltPage className="job" brand={<><span className="job-in">k</span>Hire</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Title, skill or company">
			<div className="job-app">
				<div className="job-filters"><select value={b.cur} onChange={(e) => { b.setQ(''); b.setCur(e.target.value); }}>{b.islands.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}</select><button className={remote ? 'on' : ''} onClick={() => setRemote(!remote)}>Remote only</button><span>{list.length} results</span></div>
				<div className="job-split">
					<aside className="job-list">{list.map((g) => (
						<button key={g.appid} data-appid={g.appid} className={'job-card' + (job?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>
							<span className="job-logo"><Art g={g} kind="capsule" /></span>
							<span><b>{g.name}</b><em>{company}</em><em>{g.installed ? 'Remote' : 'On-site'} · {Math.round(g.minutes / 60)} h/yr</em>{g.minutes2w > 0 && <i className="job-urg">Actively recruiting</i>}<small>{applied[g.appid] ? 'Applied · ' : ''}{posted(g)}</small></span>
						</button>
					))}</aside>
					{job && (
						<section className="job-post" key={job.appid}>
							<div className="job-banner"><Art g={job} kind="hero" /></div>
							<div className="job-ph"><span className="job-logo big"><Art g={job} kind="capsule" /></span><div><h1>{job.name}</h1><p>{company} · {job.installed ? 'Remote' : 'On-site (install required)'} · Posted {posted(job)}</p></div></div>
							<div className="job-tags"><span>💼 {job.minutes > 3000 ? 'Full-time' : job.minutes > 0 ? 'Part-time' : 'Internship'}</span><span>💰 {formatPlaytime(job.minutes)} so far</span><span>⭐ {job.metacritic ? `Rated ${job.metacritic}` : 'Unrated'}</span></div>
							<div className="job-cta">{applied[job.appid] ? <PlayBtn g={job} className="job-apply" label={['Start work (Play)', 'Onboard (Install)']} /> : <button className="job-apply" onClick={() => setApplied({ ...applied, [job.appid]: true })}>Easy apply</button>}<button className="job-save">Save</button></div>
							<h3>About the role</h3>
							<p>{job.minutes ? `You've already put in ${formatPlaytime(job.minutes)} here${job.lastPlayed ? `, most recently ${formatAgo(job.lastPlayed).toLowerCase()}` : ''}.` : 'A fresh opportunity: you have never worked here before.'} The position opened {dateOf(job.added, { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
							<h3>Requirements</h3><ul><li>{job.installed ? 'Workstation ready (installed)' : 'Install before your first day'}</li><li>{job.minutes2w ? `Recent activity: ${formatPlaytime(job.minutes2w)} in two weeks` : 'No recent activity required'}</li><li>A love of games</li></ul>
							<Actions g={job} className="job-act" />
						</section>
					)}
				</div>
			</div>
		</AltPage>
	);
}

export const jobsCss = tok('jobs', { bg: '#F4F2EE', s1: '#FFFFFF', s2: '#EEF3F8', s3: '#DCE6F1', fg: '#1D2226', fg2: '#434649', fg3: '#6E7275', acc: '#0B66C2', on: '#fff', top: '#FFFFFF', font: '"Segoe UI", system-ui, sans-serif' }) + `
.job-brand { display: flex; gap: 6px; align-items: center; font: 800 20px var(--k-text); color: #1D2226; } .job-in { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 5px; background: #E06C2B; color: #fff; font: 800 18px var(--k-text); }
.job-app { position: absolute; inset: 0; display: grid; grid-template-rows: 52px minmax(0, 1fr); }
.job-filters { display: flex; gap: 10px; align-items: center; padding: 0 24px; background: #fff; border-bottom: 1px solid #E0DFDC; } .job-filters select, .job-filters button { height: 32px; padding: 0 14px; border-radius: 16px; border: 1px solid #868686; background: #fff; font: 600 14px var(--k-text); color: #434649; }
.job-filters button.on { background: #01754F; border-color: #01754F; color: #fff; } .job-filters span { margin-left: auto; color: #6E7275; font: 14px var(--k-text); }
.job-split { display: grid; grid-template-columns: 420px minmax(0, 1fr); min-height: 0; max-width: 1300px; width: 100%; margin: 0 auto; background: #fff; box-shadow: 0 0 0 1px #E0DFDC; }
.job-list { overflow-y: auto; border-right: 1px solid #E0DFDC; }
.job-card { display: flex; gap: 12px; width: 100%; padding: 14px 16px; border-bottom: 1px solid #E0DFDC; text-align: left; } .job-card:hover { background: #F7F7F7; } .job-card.on { background: #EEF3F8; box-shadow: inset 3px 0 #0B66C2; }
.job-logo { width: 56px; height: 56px; flex: none; overflow: hidden; border-radius: 4px; background: #EEE; } .job-logo img, .job-logo .alt-noart { width: 100%; height: 100%; object-fit: cover; font-size: 6px; } .job-logo.big { width: 72px; height: 72px; }
.job-card b { display: block; font: 600 16px var(--k-text); color: #0A66C2; } .job-card em { display: block; font: 14px var(--k-text); font-style: normal; color: #434649; } .job-card small { display: block; margin-top: 4px; font: 12px var(--k-text); color: #01754F; }
.job-urg { display: inline-block; margin-top: 4px; font: 600 12px var(--k-text); font-style: normal; color: #915907; }
.job-post { overflow-y: auto; padding: 0 28px 40px; animation: k-fade .2s both; } .job-banner { margin: 0 -28px; height: 160px; overflow: hidden; } .job-banner img { width: 100%; height: 100%; object-fit: cover; }
.job-ph { display: flex; gap: 16px; align-items: flex-end; margin-top: -30px; } .job-ph .job-logo { box-shadow: 0 0 0 4px #fff; } .job-ph h1 { margin: 0; font: 700 26px var(--k-text); } .job-ph p { margin: 4px 0 0; font: 14px var(--k-text); color: #6E7275; }
.job-tags { display: flex; gap: 16px; margin: 16px 0; font: 14px var(--k-text); color: #434649; }
.job-cta { display: flex; gap: 10px; } .job-apply { height: 40px; padding: 0 22px; border-radius: 20px; background: #0B66C2 !important; color: #fff !important; font: 600 16px var(--k-text) !important; } .job-save { height: 40px; padding: 0 22px; border-radius: 20px; box-shadow: inset 0 0 0 1px #0B66C2; color: #0B66C2; font: 600 16px var(--k-text); }
.job-post h3 { margin: 24px 0 8px; font: 700 20px var(--k-text); } .job-post p, .job-post li { font: 15px/1.6 var(--k-text); color: #434649; } .job-act { margin-top: 20px; grid-template-columns: repeat(4, auto); justify-content: start; }
`;
