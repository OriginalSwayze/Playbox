// CHAT — a messenger. Every game is a conversation, newest first; the game talks to you about your time
// together, and the quick replies above the composer are its actions. The composer searches.
import { formatAgo, formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Art, AltPage, gameCommands, dateOf, useLibraryLists, useSearch, useSelectedGame } from './common';
import { tok } from './kit';
import { useState } from 'react';

function lines(g: Game): { me?: boolean; t: string; at?: string }[] {
	const out: { me?: boolean; t: string; at?: string }[] = [];
	out.push({ t: `Hi! I'm ${g.name}. You added me ${g.added ? 'on ' + dateOf(g.added) : 'a while ago'}.`, at: dateOf(g.added) });
	if (!g.minutes) out.push({ t: "We haven't actually played yet 👀" }, { me: true, t: 'I know. Soon.' });
	else out.push({ t: `We've spent ${formatPlaytime(g.minutes)} together.` }, { me: true, t: g.minutes > 6000 ? 'And I regret nothing.' : 'Not bad!' });
	if (g.minutes2w) out.push({ t: `${formatPlaytime(g.minutes2w)} in the last two weeks — you're on a roll.` });
	if (g.lastPlayed) out.push({ t: `Last time was ${formatAgo(g.lastPlayed).toLowerCase()}.`, at: dateOf(g.lastPlayed) });
	out.push({ t: g.installed ? `I'm installed${g.sizeOnDisk ? ` (${formatBytes(g.sizeOnDisk)})` : ''} and ready whenever you are.` : "I'm not installed right now. Want me to download?" });
	if (g.metacritic) out.push({ t: `Critics gave me ${g.metacritic}. Just saying.` });
	if (g.status) out.push({ t: `Status: ${g.status}` });
	return out;
}
const preview = (g: Game) => (g.lastPlayed ? `Last played ${formatAgo(g.lastPlayed).toLowerCase()}` : g.minutes ? formatPlaytime(g.minutes) : 'Say hi 👋');

export function Chat() {
	const { recent, all } = useLibraryLists();
	const [q, setQ] = useState('');
	const found = useSearch(q);
	const [sel, select] = useSelectedGame();
	const convs = found ?? [...recent, ...all.filter((g) => !g.lastPlayed)].slice(0, 200);
	const cmds = sel ? gameCommands(sel) : [];
	return (
		<AltPage className="cht" brand={<><span className="cht-logo">✦</span>Chats</>}>
			<div className="cht-app">
				<aside className="cht-list">
					<label className="cht-find"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats" spellCheck={false} /></label>
					{convs.map((g) => (
						<button key={g.appid} data-appid={g.appid} className={'cht-conv' + (sel?.appid === g.appid ? ' on' : '')} onClick={() => select(g.appid)}>
							<span className={'cht-ava' + (g.installed ? ' online' : '')}><Art g={g} kind="capsule" /></span>
							<span className="cht-tx"><b>{g.name}</b><em>{preview(g)}</em></span>
							<span className="cht-meta">{g.lastPlayed ? dateOf(g.lastPlayed, { day: 'numeric', month: 'short' }) : ''}{g.minutes2w > 0 && <i>{Math.max(1, Math.round(g.minutes2w / 60))}</i>}</span>
						</button>
					))}
				</aside>
				{sel ? (
					<section className="cht-room" key={sel.appid}>
						<header><span className={'cht-ava' + (sel.installed ? ' online' : '')}><Art g={sel} kind="capsule" /></span><div><b>{sel.name}</b><em>{sel.installed ? 'online · installed' : 'offline · not installed'}</em></div></header>
						<div className="cht-msgs">
							<div className="cht-banner"><Art g={sel} kind="header" /></div>
							{lines(sel).map((m, i) => (
								<div key={i} className={'cht-msg' + (m.me ? ' me' : '')} style={{ animationDelay: i * 70 + 'ms' }}>{m.at && <span className="cht-day">{m.at}</span>}<p>{m.t}</p></div>
							))}
						</div>
						<div className="cht-quick">{cmds.map((c) => <button key={c.id} className={c.primary ? 'p' : ''} onClick={c.run}>{c.primary ? (sel.installed ? '▶ Play' : '⬇ Install') : c.label}</button>)}</div>
						<div className="cht-comp"><span>Message {sel.name}</span><button onClick={cmds[0].run}>➤</button></div>
					</section>
				) : <section className="cht-empty"><span>✦</span><p>Pick a conversation.<br />Your games have been waiting.</p></section>}
			</div>
		</AltPage>
	);
}

export const chatCss = tok('chat', { bg: '#E9EDF2', s1: '#FFFFFF', s2: '#F0F2F5', s3: '#E4E7EB', fg: '#111B21', fg2: '#3B4A54', fg3: '#8696A0', acc: '#2F7CF6', on: '#fff', top: '#2F7CF6', topFg: '#FFFFFF', font: '"Segoe UI", system-ui, sans-serif' }) + `
.cht-brand { display: flex; gap: 9px; align-items: center; font: 700 19px var(--k-text); color: #fff; } .cht-logo { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50% 50% 50% 4px; background: #fff; color: #2F7CF6; font-size: 14px; }
.cht-app { position: absolute; inset: 0; display: grid; grid-template-columns: 380px minmax(0, 1fr); background: #fff; }
.cht-list { overflow-y: auto; border-right: 1px solid #E4E7EB; }
.cht-find { display: block; position: sticky; top: 0; z-index: 1; padding: 10px 12px; background: #fff; } .cht-find input { width: 100%; height: 36px; padding: 0 14px; border-radius: 10px; border: 0; outline: none; background: #F0F2F5; font: 14px var(--k-text); color: #111B21; }
.cht-conv { display: flex; gap: 12px; align-items: center; width: 100%; padding: 10px 14px; text-align: left; } .cht-conv:hover { background: #F5F6F6; } .cht-conv.on { background: #E8F0FE; }
.cht-ava { position: relative; width: 50px; height: 50px; flex: none; border-radius: 50%; } .cht-ava img, .cht-ava .alt-noart { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; font-size: 8px; }
.cht-ava.online::after { content: ""; position: absolute; right: 1px; bottom: 1px; width: 12px; height: 12px; border-radius: 50%; background: #31C553; box-shadow: 0 0 0 2px #fff; }
.cht-tx { flex: 1; min-width: 0; padding-bottom: 10px; border-bottom: 1px solid #F0F2F5; } .cht-tx b { display: block; font: 600 15px var(--k-text); color: #111B21; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .cht-tx em { font: 13.5px var(--k-text); font-style: normal; color: #667781; }
.cht-meta { display: grid; justify-items: end; gap: 4px; align-self: flex-start; padding-top: 4px; font: 12px var(--k-text); color: #8696A0; } .cht-meta i { min-width: 20px; height: 20px; padding: 0 6px; border-radius: 10px; background: #2F7CF6; color: #fff; font: 700 11px/20px var(--k-text); font-style: normal; text-align: center; }
.cht-room { display: grid; grid-template-rows: 60px minmax(0, 1fr) auto 62px; min-height: 0; background: #E8EEF6 repeating-radial-gradient(circle at 20px 20px, rgba(0,0,0,.025) 0 2px, transparent 2px 40px); }
.cht-room > header { display: flex; gap: 12px; align-items: center; padding: 0 16px; background: #F0F2F5; border-bottom: 1px solid #E4E7EB; } .cht-room > header .cht-ava { width: 40px; height: 40px; }
.cht-room > header b { display: block; font: 600 15px var(--k-text); color: #111B21; } .cht-room > header em { font: 13px var(--k-text); font-style: normal; color: #667781; }
.cht-msgs { overflow-y: auto; padding: 20px 8% 10px; display: flex; flex-direction: column; gap: 6px; }
.cht-banner { align-self: center; width: min(460px, 100%); margin-bottom: 14px; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,.12); } .cht-banner img { width: 100%; display: block; }
.cht-msg { display: flex; flex-direction: column; align-items: flex-start; animation: k-rise .4s var(--k-out) both; } .cht-msg.me { align-items: flex-end; }
.cht-day { align-self: center; margin: 10px 0 6px; padding: 4px 12px; border-radius: 8px; background: #fff; font: 12px var(--k-text); color: #54656F; box-shadow: 0 1px 1px rgba(0,0,0,.08); }
.cht-msg p { margin: 0; max-width: 62%; padding: 8px 12px; border-radius: 4px 14px 14px 14px; background: #fff; font: 14.5px/1.4 var(--k-text); color: #111B21; box-shadow: 0 1px 1px rgba(0,0,0,.1); }
.cht-msg.me p { border-radius: 14px 4px 14px 14px; background: #D3E4FF; }
.cht-quick { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; padding: 8px 16px; } .cht-quick button { padding: 8px 14px; border-radius: 99px; background: #fff; border: 1px solid #C9D6E8; font: 600 13px var(--k-text); color: #2F7CF6; } .cht-quick button.p { background: #2F7CF6; color: #fff; border-color: #2F7CF6; }
.cht-comp { display: flex; gap: 10px; align-items: center; padding: 0 16px; background: #F0F2F5; } .cht-comp span { flex: 1; height: 42px; padding: 0 16px; border-radius: 10px; background: #fff; font: 14px/42px var(--k-text); color: #8696A0; }
.cht-comp button { width: 42px; height: 42px; border-radius: 50%; background: #2F7CF6; color: #fff; font-size: 16px; }
.cht-empty { display: grid; place-content: center; justify-items: center; text-align: center; background: #F7F8FA; color: #667781; font: 15px/1.5 var(--k-text); } .cht-empty span { font-size: 60px; color: #2F7CF6; }
`;
