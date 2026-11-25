// WIZARD — a classic setup wizard on a full-screen gradient. Welcome → choose a component group (collection) →
// choose a game → review → Finish, which launches (or installs) it. Back and Next work like you'd expect.
import { useState } from 'react';
import { formatBytes, formatPlaytime } from '../steam/library';
import { AltPage, Art, gameCommands, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const STEPS = ['Welcome', 'Component group', 'Select game', 'Ready'];

export function Wizard() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [step, setStep] = useState(0);
	const [agree, setAgree] = useState(true);
	const s = sel && step < 3 ? 3 : step;
	const next = () => setStep(Math.min(3, s + 1));
	const back = () => { if (s === 3) select(null); setStep(Math.max(0, s - 1)); };
	return (
		<AltPage className="wiz" brand={<>Kestrel Setup</>}>
			<div className="wiz-app">
				<h1 className="wiz-big">Kestrel Setup</h1>
				<div className="wiz-win">
					<div className="wiz-title"><span>Kestrel Setup Wizard — {STEPS[s]}</span><i>✕</i></div>
					<div className="wiz-body">
						<div className="wiz-side">{sel && s === 3 ? <Art g={sel} kind="capsule" /> : <div className="wiz-logo">K</div>}<ol>{STEPS.map((x, i) => <li key={x} className={i === s ? 'on' : i < s ? 'done' : ''}>{x}</li>)}</ol></div>
						<div className="wiz-main">
							{s === 0 && <><h2>Welcome to the Kestrel Setup Wizard</h2><p>This wizard will guide you through starting a game from your library of {b.islands.find((i) => i.id === 'all')?.games.length ?? 0} titles.</p><p>It is recommended that you close all other applications before continuing.</p><p>Click Next to continue, or Cancel to exit Setup.</p></>}
							{s === 1 && <><h2>Select Components</h2><p>Which group of games would you like to choose from?</p><div className="wiz-list">{b.islands.map((i) => <label key={i.id}><input type="radio" checked={b.cur === i.id} onChange={() => b.setCur(i.id)} /> {i.name} <em>({i.games.length})</em></label>)}</div></>}
							{s === 2 && <><h2>Select Game</h2><p>Choose the game to set up from <b>{b.isle?.name}</b>.</p><input className="wiz-q" value={b.q} onChange={(e) => b.setQ(e.target.value)} placeholder="Filter…" spellCheck={false} /><div className="wiz-list">{b.games.slice(0, 150).map((g) => <label key={g.appid} data-appid={g.appid} onClick={() => select(g.appid)}><input type="radio" readOnly checked={false} /> {g.name} <em>{g.installed ? `(installed, ${g.sizeOnDisk ? formatBytes(g.sizeOnDisk) : 'size unknown'})` : '(download required)'}</em></label>)}</div></>}
							{s === 3 && sel && <div key={sel.appid}><h2>Ready to {sel.installed ? 'Launch' : 'Install'}</h2><p>Setup is now ready to {sel.installed ? 'launch' : 'install'} <b>{sel.name}</b>.</p>
								<div className="wiz-sum"><p>Game: {sel.name}</p><p>App ID: {sel.appid}</p><p>Playtime: {formatPlaytime(sel.minutes)}</p><p>Added: {dateOf(sel.added)}</p><p>Status: {sel.installed ? 'Installed' : 'Not installed'}</p></div>
								<label className="wiz-ok"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> Launch {sel.name} when I click Finish</label>
								<div className="wiz-extra">{gameCommands(sel).slice(1).map((c) => <button key={c.id} onClick={c.run}>{c.label}…</button>)}</div></div>}
						</div>
					</div>
					<div className="wiz-btns"><button onClick={back} disabled={s === 0}>&lt; Back</button>{s < 3 ? <button className="def" onClick={next} disabled={s === 2}>Next &gt;</button> : <button className="def" disabled={!agree || !sel} onClick={() => sel && gameCommands(sel)[0].run()}>Finish</button>}<button onClick={() => { select(null); setStep(0); }}>Cancel</button></div>
				</div>
			</div>
		</AltPage>
	);
}

export const wizardCss = tok('wizard', { bg: '#00007A', s1: '#D4D0C8', s2: '#C4C0B8', s3: '#A8A49C', fg: '#000000', fg2: '#222', fg3: '#555', acc: '#000080', on: '#fff', top: '#000050', topFg: '#FFFFFF', font: 'Tahoma, "MS Sans Serif", "Segoe UI", sans-serif' }) + `
.wiz-brand { font: 700 14px Tahoma, sans-serif; color: #fff; }
.wiz-app { position: absolute; inset: 0; display: grid; place-items: center; background: linear-gradient(#0000FF, #000040); overflow: hidden; }
.wiz-big { position: absolute; left: 30px; top: 16px; margin: 0; font: italic 700 46px "Times New Roman", serif; color: #fff; text-shadow: 4px 4px 0 #000; }
.wiz-win { width: min(720px, 94%); background: #D4D0C8; box-shadow: inset -1px -1px #404040, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #DFDFDF, 10px 10px 0 rgba(0,0,0,.4); font: 12px Tahoma, sans-serif; color: #000; }
.wiz-title { display: flex; justify-content: space-between; align-items: center; height: 24px; margin: 3px; padding: 0 6px; background: linear-gradient(90deg, #0A246A, #A6CAF0); color: #fff; font-weight: 700; } .wiz-title i { font-style: normal; display: grid; place-items: center; width: 16px; height: 14px; background: #D4D0C8; color: #000; font-size: 10px; box-shadow: inset -1px -1px #404040, inset 1px 1px #fff; }
.wiz-body { display: grid; grid-template-columns: 170px minmax(0, 1fr); height: 380px; margin: 0 3px; background: #fff; }
.wiz-side { padding: 14px; background: linear-gradient(#1E3C8C, #5A8AD8); color: #fff; overflow: hidden; } .wiz-side img { width: 100%; border: 2px solid #fff; } .wiz-logo { display: grid; place-items: center; height: 120px; font: italic 900 80px "Times New Roman", serif; text-shadow: 3px 3px 0 #000; }
.wiz-side ol { margin: 14px 0 0; padding-left: 18px; line-height: 1.8; } .wiz-side li { opacity: .6; } .wiz-side li.on { opacity: 1; font-weight: 700; } .wiz-side li.done { opacity: .85; }
.wiz-main { padding: 16px 20px; overflow-y: auto; } .wiz-main h2 { margin: 0 0 12px; font: 700 14px Tahoma, sans-serif; } .wiz-main p { margin: 0 0 10px; line-height: 1.5; }
.wiz-list { display: grid; height: 230px; overflow-y: auto; padding: 4px; background: #fff; box-shadow: inset 1px 1px #808080, inset -1px -1px #fff, inset 2px 2px #404040; } .wiz-list label { display: flex; gap: 6px; align-items: center; padding: 2px 4px; cursor: default; white-space: nowrap; } .wiz-list label:hover { background: #0A246A; color: #fff; } .wiz-list em { font-style: normal; color: #666; } .wiz-list label:hover em { color: #ccc; }
.wiz-q { width: 100%; height: 22px; margin-bottom: 6px; padding: 0 4px; border: 0; box-shadow: inset 1px 1px #808080, inset 2px 2px #404040; font: 12px Tahoma, sans-serif; }
.wiz-sum { padding: 8px 10px; margin-bottom: 10px; background: #fff; box-shadow: inset 1px 1px #808080, inset 2px 2px #404040; font: 12px "Courier New", monospace; } .wiz-sum p { margin: 2px 0; }
.wiz-ok { display: flex; gap: 6px; align-items: center; } .wiz-extra { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
.wiz-btns { display: flex; gap: 6px; justify-content: flex-end; padding: 10px 12px; border-top: 1px solid #808080; box-shadow: inset 0 1px #fff; }
.wiz-btns button, .wiz-extra button { min-width: 80px; height: 24px; padding: 0 10px; background: #D4D0C8; box-shadow: inset -1px -1px #404040, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #DFDFDF; font: 12px Tahoma, sans-serif; color: #000; } .wiz-btns button:disabled { color: #808080; text-shadow: 1px 1px #fff; }
.wiz-btns .def { outline: 1px solid #000; outline-offset: -1px; } .wiz-btns button:active:not(:disabled) { box-shadow: inset 1px 1px #404040, inset -1px -1px #fff; }
`;
