// ASSISTANT — ask your library questions. A conversational screen with suggestion chips ("What should I play
// tonight?", "What have I never touched?"…) and a prompt box; answers come back as messages with game cards, worked
// out from your real library by simple rules (no AI service involved). Any card opens with Play.
import { useEffect, useRef, useState } from 'react';
import { useKestrel } from '../state/store';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useLibraryLists, useSelectedGame } from './common';
import { tok } from './kit';

type Msg = { me?: boolean; text: string; games?: Game[] };
const CHIPS = ['What should I play tonight?', 'What have I never touched?', 'My most played', 'Recently added', 'What is installed but forgotten?', 'Surprise me'];

export function Assistant() {
	const library = useKestrel((s) => s.library);
	const { recent, unplayed, installed, top } = useLibraryLists();
	const [sel, select] = useSelectedGame();
	const [log, setLog] = useState<Msg[]>([{ text: `Hi! I know your ${library.length} games. Ask me anything about them, or pick a suggestion below.` }]);
	const [q, setQ] = useState('');
	const [typing, setTyping] = useState(false);
	const end = useRef<HTMLDivElement>(null);
	useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [log.length, typing]);
	const answer = (raw: string): Msg => {
		const t = raw.toLowerCase();
		const forgotten = installed.filter((g) => !g.lastPlayed || Date.now() / 1000 - g.lastPlayed > 180 * 86400);
		if (/tonight|should i play|recommend|suggest/.test(t)) { const pool = recent.filter((g) => g.installed).slice(0, 3); return { text: pool.length ? `Based on what you've been playing, these are ready to go:` : 'Nothing recent is installed. Here are some installed games instead:', games: pool.length ? pool : installed.slice(0, 3) }; }
		if (/never|untouched|backlog|unplayed/.test(t)) return { text: `You have ${unplayed.length} games you've never launched. Here are a few:`, games: unplayed.slice(0, 6) };
		if (/most|top|favou?rite/.test(t)) return { text: `Your most played: ${top[0]?.name ?? '—'} leads with ${formatPlaytime(top[0]?.minutes ?? 0)}.`, games: top.slice(0, 6) };
		if (/added|new|latest/.test(t)) { const n = [...library].sort((a, b) => b.added - a.added).slice(0, 6); return { text: 'Newest arrivals in your library:', games: n }; }
		if (/forgot|installed|disk|space/.test(t)) return { text: `${forgotten.length} installed games haven't been played in six months or more:`, games: forgotten.slice(0, 6) };
		if (/surprise|random|anything/.test(t)) { const g = library[Math.floor(Math.random() * library.length)]; return { text: g ? `How about ${g.name}? ${g.minutes ? `You've put ${formatPlaytime(g.minutes)} into it.` : "You've never played it."}` : 'Your library is empty.', games: g ? [g] : [] }; }
		const hits = library.filter((g) => g.name.toLowerCase().includes(t.trim())).slice(0, 6);
		if (hits.length) return { text: hits.length === 1 ? `${hits[0].name}: ${formatPlaytime(hits[0].minutes)} played, ${hits[0].lastPlayed ? 'last ' + formatAgo(hits[0].lastPlayed).toLowerCase() : 'never played'}.` : `I found ${hits.length} games matching “${raw}”:`, games: hits };
		return { text: "I'm not sure about that one. Try asking what to play, what you've never touched, your most played, or type a game's name." };
	};
	const ask = (text: string) => { if (!text.trim()) return; setLog((l) => [...l, { me: true, text }]); setQ(''); setTyping(true); setTimeout(() => { setTyping(false); setLog((l) => [...l, answer(text)]); }, 600); };
	return (
		<AltPage className="ast" brand={<><span className="ast-orb" />Ask Kestrel</>}>
			<div className="ast-app">
				<section className="ast-chat">
					<div className="ast-log">
						{log.map((m, i) => (
							<div key={i} className={'ast-msg' + (m.me ? ' me' : '')}>
								{!m.me && <span className="ast-av" />}<div><p>{m.text}</p>
									{m.games && m.games.length > 0 && <div className="ast-cards">{m.games.map((g) => <button key={g.appid} data-appid={g.appid} className={sel?.appid === g.appid ? 'on' : ''} onClick={() => select(g.appid)}><Art g={g} kind="capsule" /><b>{g.name}</b><em>{g.minutes ? formatPlaytime(g.minutes) : 'Unplayed'}</em></button>)}</div>}</div>
							</div>
						))}
						{typing && <div className="ast-msg"><span className="ast-av" /><div><p className="ast-dots"><i /><i /><i /></p></div></div>}
						<div ref={end} />
					</div>
					<div className="ast-chips">{CHIPS.map((c) => <button key={c} onClick={() => ask(c)}>{c}</button>)}</div>
					<form className="ast-box" onSubmit={(e) => { e.preventDefault(); ask(q); }}><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.stopPropagation()} placeholder="Ask about your games…" spellCheck={false} /><button type="submit">↑</button></form>
				</section>
				{sel && <aside className="ast-side" key={sel.appid}><Art g={sel} kind="header" /><h3>{sel.name}</h3><p>{formatPlaytime(sel.minutes)} · {sel.lastPlayed ? formatAgo(sel.lastPlayed) : 'never played'}</p><PlayBtn g={sel} className="ast-go" /><Actions g={sel} /><button className="ast-x" onClick={() => select(null)}>Close</button></aside>}
			</div>
		</AltPage>
	);
}

export const assistantCss = tok('assistant', { bg: '#FAF9F6', s1: '#FFFFFF', s2: '#F0EEE8', s3: '#E2DFD6', fg: '#1F1E1C', fg2: '#4A4843', fg3: '#8A867D', acc: '#7C5CFA', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.ast-brand { display: flex; gap: 9px; align-items: center; font: 600 17px var(--k-text); color: #1F1E1C; } .ast-orb { width: 22px; height: 22px; border-radius: 50%; background: conic-gradient(from 0deg, #7C5CFA, #4CC9F0, #F72585, #7C5CFA); animation: ast-spin 6s linear infinite; } @keyframes ast-spin { to { transform: rotate(360deg); } }
.ast-app { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) auto; }
.ast-chat { display: grid; grid-template-rows: minmax(0, 1fr) auto auto; max-width: 860px; width: 100%; margin: 0 auto; padding: 0 20px 18px; min-height: 0; }
.ast-log { overflow-y: auto; padding: 24px 0; }
.ast-msg { display: flex; gap: 12px; margin-bottom: 18px; animation: k-rise .35s var(--k-out) both; } .ast-msg.me { justify-content: flex-end; }
.ast-av { width: 30px; height: 30px; flex: none; border-radius: 50%; background: conic-gradient(from 90deg, #7C5CFA, #4CC9F0, #F72585, #7C5CFA); }
.ast-msg p { margin: 0; font: 15.5px/1.55 var(--k-text); color: #1F1E1C; } .ast-msg.me p { padding: 10px 16px; border-radius: 18px; background: #EDE8FF; }
.ast-cards { display: flex; gap: 10px; margin-top: 10px; overflow-x: auto; padding-bottom: 4px; } .ast-cards button { flex: none; display: grid; gap: 4px; width: 120px; padding: 6px; border-radius: 12px; background: #fff; box-shadow: 0 0 0 1px #E2DFD6; text-align: left; } .ast-cards button.on { box-shadow: 0 0 0 2px #7C5CFA; }
.ast-cards img, .ast-cards .alt-noart { width: 100%; aspect-ratio: 2/3; object-fit: cover; border-radius: 8px; } .ast-cards b { font: 600 12px var(--k-text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .ast-cards em { font: 11px var(--k-text); font-style: normal; color: #8A867D; }
.ast-dots { display: flex; gap: 4px; padding: 8px 0; } .ast-dots i { width: 8px; height: 8px; border-radius: 50%; background: #8A867D; animation: ast-b 1s ease-in-out infinite; } .ast-dots i:nth-child(2) { animation-delay: .15s; } .ast-dots i:nth-child(3) { animation-delay: .3s; } @keyframes ast-b { 50% { transform: translateY(-5px); opacity: .5; } }
.ast-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; } .ast-chips button { padding: 7px 14px; border-radius: 99px; background: #fff; box-shadow: 0 0 0 1px #E2DFD6; font: 13px var(--k-text); color: #4A4843; } .ast-chips button:hover { box-shadow: 0 0 0 1px #7C5CFA; color: #7C5CFA; }
.ast-box { display: flex; gap: 8px; padding: 8px 8px 8px 18px; border-radius: 24px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,.08), 0 0 0 1px #E2DFD6; } .ast-box input { flex: 1; border: 0; outline: none; background: none; font: 15px var(--k-text); color: #1F1E1C; } .ast-box button { width: 36px; height: 36px; border-radius: 50%; background: #7C5CFA; color: #fff; font: 700 16px var(--k-text); }
.ast-side { width: 320px; overflow-y: auto; padding: 18px; background: #fff; border-left: 1px solid #EDEAE2; animation: k-fade .2s both; } .ast-side img { width: 100%; border-radius: 12px; } .ast-side h3 { margin: 12px 0 4px; font: 700 18px var(--k-text); } .ast-side p { margin: 0 0 12px; color: #8A867D; font: 14px var(--k-text); }
.ast-go { width: 100%; height: 44px; border-radius: 12px; background: #7C5CFA !important; color: #fff !important; font: 700 14px var(--k-text) !important; margin-bottom: 8px; } .ast-x { margin-top: 8px; color: #7C5CFA; font: 600 13px var(--k-text); }
`;
