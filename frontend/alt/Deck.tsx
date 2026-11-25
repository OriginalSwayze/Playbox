// DECK — your library as a collectible card game. Every game is a card whose rarity comes from how much you've
// played it (common to legendary, with foil on the rarest); collections are binder pages. Flip a card to play it.
import { useMemo, useState } from 'react';
import { formatAgo, formatPlaytime, type Game } from '../steam/library';
import { useGameDetails } from '../steam/details';
import { Actions, AltPage, Art, gameCommands, useIslands, useSearch, useSelectedGame } from './common';

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
const rarity = (g: Game): Rarity => { const h = g.minutes / 60; return h >= 200 ? 'legendary' : h >= 50 ? 'epic' : h >= 10 ? 'rare' : h >= 1 ? 'uncommon' : 'common'; };
const RARITIES: Rarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
const LABEL: Record<Rarity, string> = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' };

function Card({ g, onPick }: { g: Game; onPick: () => void }) {
	const r = rarity(g);
	return (
		<button className={'dk-card ' + r + (g.installed ? '' : ' faded')} data-appid={g.appid} onClick={onPick} title={g.name}>
			<div className="dk-name">{g.name}</div>
			<div className="dk-art"><Art g={g} kind="header" /></div>
			<div className="dk-type">{LABEL[r]} · {g.installed ? 'Ready' : 'In the vault'}</div>
			<div className="dk-text">{g.lastPlayed ? `Last drawn ${formatAgo(g.lastPlayed).toLowerCase()}.` : 'Never drawn.'}</div>
			<div className="dk-stats">{g.minutes >= 60 ? `${Math.round(g.minutes / 60)}h` : `${g.minutes}m`}</div>
			<i className="dk-foil" />
		</button>
	);
}

function Flipped({ g, close }: { g: Game; close: () => void }) {
	const d = useGameDetails(g.appid);
	const r = rarity(g);
	const play = gameCommands(g)[0];
	return (
		<div className="dk-table" onMouseDown={(e) => e.target === e.currentTarget && close()}>
			<div className="dk-flip">
				<div className={'dk-card big ' + r}>
					<div className="dk-name">{g.name}</div>
					<div className="dk-art"><Art g={g} kind="hero" /></div>
					<div className="dk-type">{LABEL[r]} {d.developer ? `· ${d.developer}` : ''}</div>
					<div className="dk-text big">{d.description[0] ?? 'A card from your collection.'}</div>
					<div className="dk-stats">{Math.round(g.minutes / 60)}h{d.achievements.total ? ` · ${d.achievements.achieved}★` : ''}</div>
					<i className="dk-foil" />
				</div>
			</div>
			<aside className="dk-rules">
				<div className="dk-rarity">{LABEL[r]}</div>
				<h2>{g.name}</h2>
				<dl>
					<dt>Power (hours)</dt><dd>{formatPlaytime(g.minutes)}</dd>
					<dt>Toughness (achievements)</dt><dd>{d.achievements.total ? `${d.achievements.achieved} of ${d.achievements.total}` : '—'}</dd>
					<dt>Last drawn</dt><dd>{g.lastPlayed ? formatAgo(g.lastPlayed) : 'Never'}</dd>
				</dl>
				<button className="dk-summon" onClick={play.run}>{g.installed ? 'Summon (play)' : 'Unseal (install)'}</button>
				<Actions g={g} className="dk-actions" />
				<button className="dk-back" onClick={close}>Return to binder</button>
			</aside>
		</div>
	);
}

export function Deck() {
	const islands = useIslands();
	const [sel, select] = useSelectedGame();
	const [q, setQ] = useState('');
	const [only, setOnly] = useState<Rarity | null>(null);
	const found = useSearch(q);
	const pages = useMemo(() => {
		const base = found ? [{ id: 'q', name: `Search: ${q.trim()}`, games: found }] : islands;
		return base.map((p) => ({ ...p, games: only ? p.games.filter((g) => rarity(g) === only) : p.games })).filter((p) => p.games.length);
	}, [found, islands, only, q]);
	return (
		<AltPage className="dk" brand="Deck" search={q} onSearch={setQ} searchPlaceholder="Find a card">
			<div className="dk-room">
				<div className="dk-filter">
					<button className={!only ? 'on' : ''} onClick={() => setOnly(null)}>All cards</button>
					{RARITIES.map((r) => <button key={r} className={'r-' + r + (only === r ? ' on' : '')} onClick={() => setOnly(only === r ? null : r)}>{LABEL[r]}</button>)}
				</div>
				{pages.map((p) => (
					<section key={p.id} className="dk-page">
						<h2>{p.name}<span>{p.games.length} cards</span></h2>
						<div className="dk-binder">{p.games.map((g) => <Card key={g.appid} g={g} onPick={() => select(g.appid)} />)}</div>
					</section>
				))}
			</div>
			{sel && <Flipped key={sel.appid} g={sel} close={() => select(null)} />}
		</AltPage>
	);
}

export const deckCss = `
html.kestrel[data-ui="deck"] { --k-ink: #0C2A20; --k-s1: #11362A; --k-s2: #174536; --k-s3: #1E5643; --k-s4: #286B54; --k-line: rgba(220,255,230,.1); --k-line-2: rgba(220,255,230,.2);
	--k-fg: #F2F7EE; --k-fg-2: #B8CEBF; --k-fg-3: #7E9A88; --k-accent: #F2C14E; --k-accent-2: #FFE08A; --k-on-accent: #2A1E02; --k-a10: rgba(242,193,78,.1); --k-a20: rgba(242,193,78,.2); --k-a40: rgba(242,193,78,.4); }
.dk-brand { font: 700 22px Georgia, serif; font-style: italic; color: #FFE08A; letter-spacing: .02em; }
.dk-stage { background: #0C2A20; }
.dk-room { position: absolute; inset: 0; overflow-y: auto; padding: 22px 36px 60px; background: radial-gradient(90% 70% at 50% 30%, #145240, #0A251C); }
.dk-filter { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
.dk-filter button { padding: 7px 14px; border-radius: 99px; font: 700 12.5px var(--k-text) !important; color: #B8CEBF !important; background: rgba(0,0,0,.25); box-shadow: inset 0 0 0 1px rgba(255,255,255,.1); }
.dk-filter button.on { color: #2A1E02 !important; background: #F2C14E; }
.dk-filter .r-legendary { box-shadow: inset 0 0 0 1px #F0A830; } .dk-filter .r-epic { box-shadow: inset 0 0 0 1px #B66BFF; } .dk-filter .r-rare { box-shadow: inset 0 0 0 1px #4BA3FF; }
.dk-page { margin-bottom: 30px; padding: 20px 24px 26px; border-radius: 14px; background: rgba(0,0,0,.18); box-shadow: inset 0 0 0 1px rgba(255,255,255,.06), inset 0 30px 60px -40px rgba(0,0,0,.6); animation: k-rise 600ms var(--k-out) both; }
.dk-page h2 { margin: 0 0 16px; font: 700 20px Georgia, serif; color: #F2F7EE; }
.dk-page h2 span { margin-left: 12px; font: 600 12px var(--k-text); color: #7E9A88; }
.dk-binder { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 18px; }
.dk-card { --rim: #9AA3A0; --glow: transparent; position: relative; aspect-ratio: 63/88; display: flex; flex-direction: column; padding: 8px; border-radius: 10px; overflow: hidden; text-align: left;
	background: linear-gradient(160deg, color-mix(in srgb, var(--rim) 35%, #1A1A1A), #141414); box-shadow: inset 0 0 0 3px var(--rim), 0 10px 20px -10px #000, 0 0 18px var(--glow);
	transition: transform .4s var(--k-spring), box-shadow .3s; color: #F4F1EA; }
.dk-card.uncommon { --rim: #6FBF73; } .dk-card.rare { --rim: #4BA3FF; --glow: rgba(75,163,255,.25); } .dk-card.epic { --rim: #B66BFF; --glow: rgba(182,107,255,.35); } .dk-card.legendary { --rim: #F0A830; --glow: rgba(240,168,48,.45); }
.dk-card.faded { filter: saturate(.5) brightness(.75); }
.dk-card:hover { transform: translateY(-8px) rotate(-1.5deg) scale(1.04); filter: none; z-index: 2; }
.dk-name { padding: 4px 6px; border-radius: 5px; background: rgba(0,0,0,.45); font: 700 11.5px Georgia, serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; box-shadow: inset 0 0 0 1px var(--rim); }
.dk-art { flex: 1; margin: 6px 0; border-radius: 4px; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(0,0,0,.6); min-height: 0; }
.dk-art img, .dk-art .alt-noart { width: 100%; height: 100%; object-fit: cover; }
.dk-type { padding: 3px 6px; border-radius: 4px; background: rgba(0,0,0,.4); font: 700 10px var(--k-text); text-transform: uppercase; letter-spacing: .05em; color: var(--rim); }
.dk-text { margin: 5px 2px 16px; font: italic 10.5px/1.3 Georgia, serif; color: #CFCBC2; }
.dk-text.big { font-size: 13px; max-height: 5.4em; overflow: hidden; }
.dk-stats { position: absolute; right: 8px; bottom: 7px; padding: 2px 8px; border-radius: 6px; background: #EEE6D2; color: #1B1B1B; font: 800 13px Georgia, serif; box-shadow: 0 0 0 2px var(--rim); }
.dk-stats i { margin: 0 2px; font-style: normal; opacity: .6; }
.dk-foil { position: absolute; inset: 0; pointer-events: none; opacity: 0; mix-blend-mode: overlay; transition: opacity .3s; border-radius: inherit;
	background: linear-gradient(115deg, transparent 25%, rgba(255,150,230,.55) 38%, rgba(150,255,240,.55) 48%, rgba(255,240,150,.55) 58%, transparent 72%) 0 0 / 300% 300%; }
.dk-card.epic .dk-foil, .dk-card.legendary .dk-foil { opacity: .5; animation: dk-shine 4s linear infinite; }
.dk-card:hover .dk-foil { opacity: .6; }
@keyframes dk-shine { from { background-position: 0% 0%; } to { background-position: 250% 250%; } }
.dk-table { position: absolute; inset: 0; z-index: 8; display: flex; align-items: center; justify-content: center; gap: 56px; padding: 30px; background: radial-gradient(60% 60% at 40% 50%, rgba(20,82,64,.6), rgba(4,14,10,.94)); animation: k-fade 250ms both; perspective: 1400px; }
.dk-flip { animation: dk-flip 800ms var(--k-out) both; transform-style: preserve-3d; }
@keyframes dk-flip { from { transform: rotateY(180deg) scale(.6); opacity: 0; } 40% { opacity: 1; } to { transform: none; } }
.dk-card.big { width: 360px; aspect-ratio: 63/88; padding: 14px; border-radius: 18px; }
.dk-card.big .dk-name { font-size: 18px; padding: 6px 10px; }
.dk-card.big .dk-type { font-size: 12px; }
.dk-card.big .dk-stats { font-size: 20px; right: 14px; bottom: 12px; }
.dk-rules { width: 380px; padding: 24px 26px; border-radius: 14px; background: #EEE6D2; color: #1B1B1B; box-shadow: 0 30px 70px -20px #000; animation: k-rise 600ms var(--k-out) 200ms both; }
.dk-rarity { font: 800 12px var(--k-text); letter-spacing: .14em; text-transform: uppercase; color: #9A6A10; }
.dk-rules h2 { margin: 6px 0 14px; font: 700 26px/1.1 Georgia, serif; }
.dk-rules dl { display: grid; grid-template-columns: 1fr auto; gap: 6px 14px; margin: 0 0 18px; font: 14px Georgia, serif; }
.dk-rules dt { font-style: italic; color: #5A5346; }
.dk-rules dd { margin: 0; font-weight: 700; }
.dk-summon { width: 100%; height: 48px; border-radius: 10px; background: linear-gradient(180deg, #FFE08A, #F2C14E) !important; color: #2A1E02 !important; font: 800 16px Georgia, serif !important; box-shadow: 0 8px 18px -8px #9A6A10, inset 0 1px 0 rgba(255,255,255,.6); transition: transform .3s var(--k-spring); }
.dk-summon:hover { transform: scale(1.03); }
.dk-actions { margin-top: 12px; }
.dk-actions button { color: #3E392F !important; }
.dk-actions button:hover { background: rgba(0,0,0,.06) !important; color: #1B1B1B !important; }
.dk-back { margin-top: 8px; font: italic 14px Georgia, serif !important; color: #5A5346 !important; text-decoration: underline; }
`;
