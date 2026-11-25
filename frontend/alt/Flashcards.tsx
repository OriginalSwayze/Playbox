// FLASHCARDS — a study app. A collection is a deck; each card shows a game's cover on the front and its facts on
// the back. Flip it (click or Space), then rate how well you "know" it; the session tracks your progress.
import { useEffect, useState } from 'react';
import { mainWindow } from '../steam/env';
import { formatAgo, formatPlaytime } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, dateOf, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

export function Flashcards() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [i, setI] = useState(0);
	const [flip, setFlip] = useState(false);
	const [score, setScore] = useState<Record<number, 'again' | 'good' | 'easy'>>({});
	const deck = b.games.slice(0, 100);
	const card = sel ?? deck[i % Math.max(1, deck.length)] ?? null;
	useEffect(() => { setI(0); setFlip(false); }, [b.cur, b.q]);
	const rate = (r: 'again' | 'good' | 'easy') => { if (!card) return; setScore({ ...score, [card.appid]: r }); setFlip(false); if (sel) select(null); setI((x) => x + 1); };
	useEffect(() => {
		const doc = mainWindow()?.BrowserWindow.document;
		const k = (e: KeyboardEvent) => { const t = e.target as HTMLElement; if (t?.tagName === 'INPUT') return; if (e.key === ' ') setFlip((f) => !f); else if (flip && e.key === '1') rate('again'); else if (flip && e.key === '2') rate('good'); else if (flip && e.key === '3') rate('easy'); else return; e.preventDefault(); e.stopPropagation(); };
		doc?.addEventListener('keydown', k, true);
		return () => doc?.removeEventListener('keydown', k, true);
	});
	const done = deck.filter((g) => score[g.appid]).length;
	return (
		<AltPage className="fls" brand={<><span className="fls-logo">❏</span>Flashcards</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search cards">
			<div className="fls-app">
				<aside className="fls-decks"><h5>Decks</h5>{b.islands.map((d) => { const n = d.games.slice(0, 100).filter((g) => score[g.appid]).length; return <button key={d.id} className={b.cur === d.id && !b.found ? 'on' : ''} onClick={() => { b.setQ(''); b.setCur(d.id); }}><b>{d.name}</b><span><i style={{ width: (n / Math.max(1, Math.min(100, d.games.length))) * 100 + '%' }} /></span><em>{n}/{Math.min(100, d.games.length)}</em></button>; })}</aside>
				<section className="fls-study">
					<div className="fls-prog"><span>{done} of {deck.length} studied</span><i><b style={{ width: (done / Math.max(1, deck.length)) * 100 + '%' }} /></i><span className="r">Again {Object.values(score).filter((s) => s === 'again').length} · Good {Object.values(score).filter((s) => s === 'good').length} · Easy {Object.values(score).filter((s) => s === 'easy').length}</span></div>
					{card ? <>
						<div className={'fls-card' + (flip ? ' flip' : '')} data-appid={card.appid} key={card.appid} onClick={() => setFlip(!flip)}>
							<div className="fls-front"><Art g={card} kind="capsule" /><p>Do you know this game?</p><em>Click or press Space to flip</em></div>
							<div className="fls-back"><h2>{card.name}</h2><dl><dt>Played</dt><dd>{card.minutes ? formatPlaytime(card.minutes) : 'Never'}</dd><dt>Last time</dt><dd>{card.lastPlayed ? formatAgo(card.lastPlayed) : '—'}</dd><dt>Added</dt><dd>{dateOf(card.added)}</dd><dt>Installed</dt><dd>{card.installed ? 'Yes' : 'No'}</dd><dt>Metascore</dt><dd>{card.metacritic || '—'}</dd></dl>
								<div onClick={(e) => e.stopPropagation()}><PlayBtn g={card} className="fls-go" label={['Practise (Play)', 'Install']} /><Actions g={card} className="fls-act" /></div></div>
						</div>
						<div className={'fls-rate' + (flip ? ' on' : '')}><button className="a" onClick={() => rate('again')}>Again<em>1</em></button><button className="g" onClick={() => rate('good')}>Good<em>2</em></button><button className="e" onClick={() => rate('easy')}>Easy<em>3</em></button></div>
					</> : <p className="fls-empty">This deck is empty.</p>}
				</section>
			</div>
		</AltPage>
	);
}

export const flashcardsCss = tok('flashcards', { bg: '#EEF1FF', s1: '#FFFFFF', s2: '#E3E7FB', s3: '#CDD3F2', fg: '#1C2142', fg2: '#454B73', fg3: '#8A90B4', acc: '#4255FF', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.fls-brand { display: flex; gap: 8px; align-items: center; font: 800 19px var(--k-text); color: #4255FF; }
.fls-app { position: absolute; inset: 0; display: grid; grid-template-columns: 280px minmax(0, 1fr); }
.fls-decks { overflow-y: auto; padding: 16px 12px; background: #fff; border-right: 1px solid #E3E7FB; } .fls-decks h5 { margin: 0 8px 10px; font: 700 12px var(--k-text); color: #8A90B4; text-transform: uppercase; }
.fls-decks button { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; width: 100%; padding: 10px; border-radius: 10px; text-align: left; } .fls-decks button:hover { background: #F4F6FF; } .fls-decks button.on { background: #E3E7FB; }
.fls-decks b { font: 600 14px var(--k-text); color: #1C2142; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .fls-decks span { grid-column: 1; height: 6px; border-radius: 3px; background: #E3E7FB; overflow: hidden; } .fls-decks span i { display: block; height: 100%; background: #23B26D; } .fls-decks em { grid-row: 1 / 3; grid-column: 2; align-self: center; font: 600 12px var(--k-text); font-style: normal; color: #8A90B4; }
.fls-study { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; justify-items: center; gap: 20px; padding: 20px 30px 30px; overflow: hidden; }
.fls-prog { display: flex; gap: 14px; align-items: center; width: min(760px, 100%); font: 600 13px var(--k-text); color: #454B73; } .fls-prog i { flex: 1; height: 8px; border-radius: 4px; background: #CDD3F2; } .fls-prog b { display: block; height: 100%; border-radius: 4px; background: #4255FF; transition: width .4s; } .fls-prog .r { color: #8A90B4; font-weight: 400; }
.fls-card { position: relative; width: min(760px, 100%); height: 100%; max-height: 520px; perspective: 1600px; cursor: pointer; animation: k-rise .4s var(--k-out) both; }
.fls-front, .fls-back { position: absolute; inset: 0; border-radius: 20px; background: #fff; box-shadow: 0 14px 40px -16px rgba(28,33,66,.35); backface-visibility: hidden; transition: transform .6s var(--k-out); display: grid; place-content: center; justify-items: center; padding: 30px; text-align: center; }
.fls-back { transform: rotateY(180deg); } .fls-card.flip .fls-front { transform: rotateY(-180deg); } .fls-card.flip .fls-back { transform: rotateY(0); }
.fls-front img, .fls-front .alt-noart { height: min(320px, 50vh); border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,.2); } .fls-front p { margin: 18px 0 4px; font: 600 20px var(--k-text); color: #1C2142; } .fls-front em { font: 13px var(--k-text); font-style: normal; color: #8A90B4; }
.fls-back h2 { margin: 0 0 16px; font: 800 32px var(--k-text); color: #1C2142; } .fls-back dl { display: grid; grid-template-columns: auto auto; gap: 8px 24px; margin: 0 0 18px; font: 16px var(--k-text); text-align: left; } .fls-back dt { color: #8A90B4; } .fls-back dd { margin: 0; color: #1C2142; font-weight: 600; }
.fls-go { height: 42px; padding: 0 22px; border-radius: 21px; background: #4255FF !important; color: #fff !important; font: 700 14px var(--k-text) !important; } .fls-act { grid-template-columns: repeat(4, auto); margin-top: 8px; }
.fls-rate { display: flex; gap: 14px; opacity: .35; pointer-events: none; transition: opacity .3s; } .fls-rate.on { opacity: 1; pointer-events: auto; }
.fls-rate button { position: relative; width: 150px; height: 54px; border-radius: 14px; font: 700 16px var(--k-text); color: #fff; } .fls-rate em { position: absolute; right: 8px; top: 6px; font: 11px var(--k-text); font-style: normal; opacity: .7; } .fls-rate .a { background: #F25C54; } .fls-rate .g { background: #4255FF; } .fls-rate .e { background: #23B26D; }
.fls-empty { color: #8A90B4; }
`;
