// DELIVERY — a food-delivery app. Collections are restaurants with ratings and delivery times; a restaurant's menu
// lists its games as dishes (with "popular" and "new" tags); a dish opens as a sheet, and Order now plays it.
import { useState } from 'react';
import { formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, useBrowse, useSelectedGame, type Island } from './common';
import { tok } from './kit';

const rating = (i: Island) => { const s = i.games.filter((g) => g.metacritic); return s.length ? (s.reduce((n, g) => n + g.metacritic, 0) / s.length / 20).toFixed(1) : '4.5'; };
const eta = (i: Island) => `${10 + (i.games.length % 25)}–${20 + (i.games.length % 25)} min`;
const price = (g: Game) => (g.minutes / 600).toFixed(2);

export function Delivery() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [shop, setShop] = useState<Island | null>(null);
	const menu = b.found ?? shop?.games ?? [];
	const Dish = ({ g }: { g: Game }) => (
		<button data-appid={g.appid} className="fd-dish" onClick={() => select(g.appid)}>
			<span className="fd-dtx"><b>{g.name}</b><em>{g.minutes ? `${formatPlaytime(g.minutes)} served so far` : 'Never tried — chef’s recommendation'}</em><strong>£{price(g)}</strong>
				<span className="fd-tags">{g.minutes2w > 0 && <i className="hot">🔥 Popular</i>}{!g.minutes && <i className="new">New</i>}{g.installed && <i>Ready now</i>}</span></span>
			<span className="fd-dimg"><Art g={g} kind="header" /><i>+</i></span>
		</button>
	);
	return (
		<AltPage className="fd" brand={<><span className="fd-logo">🛵</span>Delivery</>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search dishes and restaurants">
			<div className="fd-app">
				{menu.length || shop ? (
					<section className="fd-menu">
						<div className="fd-cover">{(shop?.games[0] ?? menu[0]) && <Art g={(shop?.games[0] ?? menu[0])!} kind="hero" />}<button onClick={() => { setShop(null); b.setQ(''); }}>←</button></div>
						<div className="fd-head"><h1>{shop?.name ?? `Results for “${b.q.trim()}”`}</h1>{shop && <p>★ {rating(shop)} · {eta(shop)} · Free delivery · {shop.games.length} dishes</p>}</div>
						<div className="fd-cats"><span>Popular</span><span>Mains</span><span>New</span><span>Everything</span></div>
						<h3>Popular</h3><div className="fd-dishes">{menu.filter((g) => g.minutes2w).slice(0, 6).map((g) => <Dish key={g.appid} g={g} />)}</div>
						<h3>Full menu</h3><div className="fd-dishes">{menu.slice(0, 120).map((g) => <Dish key={g.appid} g={g} />)}</div>
					</section>
				) : (
					<section className="fd-home">
						<div className="fd-addr">Delivering to <b>Your PC</b> ▾</div>
						<div className="fd-chips">{['🍕', '🍣', '🍔', '🌮', '🍜', '🥗', '🍩', '🍛'].map((e, i) => b.islands[i] && <button key={i} onClick={() => setShop(b.islands[i])}><span>{e}</span>{b.islands[i].name}</button>)}</div>
						<h2>Restaurants near you</h2>
						<div className="fd-rest">{b.islands.map((i) => (
							<button key={i.id} className="fd-r" onClick={() => setShop(i)}>
								<span className="fd-rimg">{i.games[0] && <Art g={i.games[0]} kind="header" />}{i.games.some((g) => g.minutes2w) && <em>Busy right now</em>}</span>
								<b>{i.name}</b><span>★ {rating(i)} · {eta(i)} · {i.games.length} dishes</span>
							</button>
						))}</div>
					</section>
				)}
				{sel && (
					<div className="fd-sheet" onClick={() => select(null)}>
						<div className="fd-item" key={sel.appid} onClick={(e) => e.stopPropagation()}>
							<Art g={sel} kind="hero" /><div className="fd-ib"><h2>{sel.name}</h2><strong>£{price(sel)}</strong><p>{sel.minutes ? `A house favourite: ${formatPlaytime(sel.minutes)} served.` : 'Freshly added to the menu and never ordered.'} {sel.installed ? 'Ready for immediate delivery.' : 'Needs to be prepared first (install).'}</p>
								<PlayBtn g={sel} className="fd-order" label={['Order now · Play', 'Prepare · Install']} /><Actions g={sel} /></div>
						</div>
					</div>
				)}
			</div>
		</AltPage>
	);
}

export const deliveryCss = tok('delivery', { bg: '#FFFFFF', s1: '#F6F6F6', s2: '#EEEEEE', s3: '#E2E2E2', fg: '#121212', fg2: '#3D3D3D', fg3: '#757575', acc: '#00A082', on: '#fff', font: '"Segoe UI", system-ui, sans-serif' }) + `
.fd-brand { display: flex; gap: 8px; align-items: center; font: 800 20px var(--k-text); color: #00A082; letter-spacing: -.02em; }
.fd-app { position: absolute; inset: 0; overflow-y: auto; }
.fd-home, .fd-menu { max-width: 1240px; margin: 0 auto; padding: 16px 30px 60px; }
.fd-addr { font: 15px var(--k-text); color: #3D3D3D; } .fd-addr b { color: #121212; }
.fd-chips { display: flex; gap: 22px; margin: 18px 0 26px; overflow-x: auto; } .fd-chips button { display: grid; justify-items: center; gap: 6px; font: 600 13px var(--k-text); color: #3D3D3D; max-width: 90px; } .fd-chips span { display: grid; place-items: center; width: 64px; height: 64px; border-radius: 50%; background: #F1F8F6; font-size: 30px; }
.fd-home h2 { margin: 0 0 14px; font: 800 24px var(--k-text); }
.fd-rest { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 22px 18px; } .fd-r { display: grid; gap: 4px; text-align: left; } .fd-rimg { position: relative; aspect-ratio: 16/8; border-radius: 14px; overflow: hidden; background: #EEE; }
.fd-rimg img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; } .fd-r:hover img { transform: scale(1.05); } .fd-rimg em { position: absolute; left: 10px; top: 10px; padding: 3px 8px; border-radius: 6px; background: #00A082; color: #fff; font: 700 11px var(--k-text); font-style: normal; }
.fd-r b { font: 700 16px var(--k-text); color: #121212; } .fd-r > span:last-child { font: 13px var(--k-text); color: #757575; }
.fd-cover { position: relative; height: 220px; margin: -16px -30px 0; overflow: hidden; } .fd-cover img { width: 100%; height: 100%; object-fit: cover; } .fd-cover button { position: absolute; left: 20px; top: 16px; width: 40px; height: 40px; border-radius: 50%; background: #fff; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,.2); }
.fd-head { margin: -40px 0 10px; position: relative; padding: 18px 22px; border-radius: 16px; background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,.1); } .fd-head h1 { margin: 0 0 4px; font: 800 28px var(--k-text); } .fd-head p { margin: 0; color: #3D3D3D; font: 14px var(--k-text); }
.fd-cats { position: sticky; top: 0; z-index: 1; display: flex; gap: 26px; padding: 14px 0; background: #fff; border-bottom: 1px solid #EEE; font: 600 14px var(--k-text); color: #757575; } .fd-cats span:first-child { color: #121212; box-shadow: 0 13px 0 -10px #121212; }
.fd-menu h3 { margin: 22px 0 10px; font: 800 20px var(--k-text); }
.fd-dishes { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 12px; }
.fd-dish { display: grid; grid-template-columns: minmax(0, 1fr) 150px; gap: 14px; padding: 14px; border-radius: 14px; text-align: left; box-shadow: inset 0 0 0 1px #EEE; } .fd-dish:hover { box-shadow: inset 0 0 0 1px #C8C8C8; }
.fd-dtx b { display: block; font: 700 15px var(--k-text); color: #121212; } .fd-dtx em { display: block; margin: 4px 0 6px; font: 13px var(--k-text); font-style: normal; color: #757575; } .fd-dtx strong { font: 600 14px var(--k-text); color: #121212; }
.fd-tags { display: flex; gap: 6px; margin-top: 8px; } .fd-tags i { padding: 2px 8px; border-radius: 6px; background: #F1F1F1; font: 600 11px var(--k-text); font-style: normal; color: #3D3D3D; } .fd-tags .hot { background: #FFF0E5; color: #D9480F; } .fd-tags .new { background: #E6F6F2; color: #00A082; }
.fd-dimg { position: relative; } .fd-dimg img, .fd-dimg .alt-noart { width: 150px; height: 100px; object-fit: cover; border-radius: 10px; } .fd-dimg i { position: absolute; right: 6px; bottom: 6px; width: 30px; height: 30px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.2); font: 700 18px/30px var(--k-text); text-align: center; font-style: normal; color: #00A082; }
.fd-sheet { position: absolute; inset: 0; z-index: 5; display: grid; place-items: center; background: rgba(0,0,0,.45); animation: k-fade .2s both; }
.fd-item { width: min(560px, 92%); max-height: 90%; overflow-y: auto; border-radius: 20px; background: #fff; animation: k-rise .3s var(--k-out) both; } .fd-item > img { width: 100%; aspect-ratio: 16/8; object-fit: cover; }
.fd-ib { padding: 18px 22px 22px; } .fd-ib h2 { margin: 0 0 4px; font: 800 24px var(--k-text); } .fd-ib strong { font: 600 16px var(--k-text); } .fd-ib p { color: #3D3D3D; font: 14px/1.5 var(--k-text); }
.fd-order { width: 100%; height: 52px; border-radius: 12px; background: #00A082 !important; color: #fff !important; font: 700 16px var(--k-text) !important; margin-bottom: 8px; }
`;
