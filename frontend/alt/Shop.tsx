// SHOP — an online store where everything is already yours. Departments are collections, products are games with
// star ratings from their Metascore, and the product page's "Buy now" is Play. The basket keeps a short list.
import { useState } from 'react';
import { formatBytes, formatPlaytime, type Game } from '../steam/library';
import { Actions, AltPage, Art, PlayBtn, gameCommands, useBrowse, useSelectedGame } from './common';
import { tok } from './kit';

const stars = (g: Game) => (g.metacritic ? Math.round(g.metacritic / 20 * 2) / 2 : 0);
const Stars = ({ g }: { g: Game }) => <span className="shp-stars" style={{ ['--s' as string]: stars(g) }}><i>★★★★★</i>{g.metacritic ? <em>{g.metacritic}</em> : <em>No ratings</em>}</span>;

export function Shop() {
	const b = useBrowse();
	const [sel, select] = useSelectedGame();
	const [cart, setCart] = useState<Game[]>([]);
	const [open, setOpen] = useState(false);
	const has = (g: Game) => cart.some((c) => c.appid === g.appid);
	const add = (g: Game) => !has(g) && setCart([...cart, g]);
	return (
		<AltPage className="shp" brand={<><span className="shp-bag">◫</span>shop<b>.kestrel</b></>} search={b.q} onSearch={b.setQ} searchPlaceholder="Search all departments">
			<div className="shp-app">
				<nav className="shp-dept"><span>☰ All</span>{b.islands.map((i) => <button key={i.id} className={b.cur === i.id && !b.found ? 'on' : ''} onClick={() => { select(null); b.setQ(''); b.setCur(i.id); }}>{i.name}</button>)}<button className="shp-cartbtn" onClick={() => setOpen(!open)}>🛒 Basket <b>{cart.length}</b></button></nav>
				{sel ? (
					<section className="shp-pdp" key={sel.appid}>
						<div className="shp-crumb"><button onClick={() => select(null)}>‹ Back to results</button> · {b.isle?.name}</div>
						<div className="shp-pgrid">
							<div className="shp-gal"><Art g={sel} kind="capsule" /><Art g={sel} kind="header" /></div>
							<div className="shp-pinfo"><h1>{sel.name}</h1><Stars g={sel} /><hr /><div className="shp-price"><sup>£</sup>0<sup>00</sup><span>Already in your library</span></div>
								<ul><li>{sel.minutes ? `${formatPlaytime(sel.minutes)} of use so far` : 'Brand new — never used'}</li><li>{sel.installed ? `Installed${sel.sizeOnDisk ? ` · ${formatBytes(sel.sizeOnDisk)}` : ''}` : 'Ships as a download'}</li><li>App ID {sel.appid}</li></ul></div>
							<div className="shp-buy"><div className="shp-price sm"><sup>£</sup>0<sup>00</sup></div><p className="shp-stock">{sel.installed ? 'In stock' : 'Usually ships in minutes'}</p>
								<button className="shp-add" onClick={() => add(sel)}>{has(sel) ? 'In basket ✓' : 'Add to basket'}</button><PlayBtn g={sel} className="shp-now" label={['Buy now (Play)', 'Buy now (Install)']} /><Actions g={sel} className="shp-act" /></div>
						</div>
					</section>
				) : (
					<section className="shp-res">
						<p className="shp-count">{b.games.length} results for <b>“{b.found ? b.q.trim() : b.isle?.name}”</b></p>
						<div className="shp-grid">{b.games.slice(0, 200).map((g) => (
							<div key={g.appid} className="shp-card"><button data-appid={g.appid} className="shp-img" onClick={() => select(g.appid)}><Art g={g} kind="capsule" /></button>
								<button className="shp-name" onClick={() => select(g.appid)}>{g.name}</button><Stars g={g} />
								<div className="shp-price sm"><sup>£</sup>0<sup>00</sup>{g.minutes2w > 0 && <em className="shp-badge">Popular</em>}</div>
								<p className="shp-ship">{g.installed ? '✓ Installed' : 'FREE delivery (install)'}</p>
								<button className="shp-add sm" onClick={() => add(g)}>{has(g) ? 'In basket ✓' : 'Add to basket'}</button></div>
						))}</div>
					</section>
				)}
				{open && <aside className="shp-cart"><h3>Basket ({cart.length})</h3>{cart.map((g) => <div key={g.appid} className="shp-line"><Art g={g} kind="capsule" /><div><b>{g.name}</b><button onClick={gameCommands(g)[0].run}>{g.installed ? 'Play' : 'Install'}</button><button onClick={() => setCart(cart.filter((c) => c.appid !== g.appid))}>Remove</button></div></div>)}{!cart.length && <p>Your basket is empty.</p>}</aside>}
			</div>
		</AltPage>
	);
}

export const shopCss = tok('shop', { bg: '#FFFFFF', s1: '#FFFFFF', s2: '#F0F2F2', s3: '#D5D9D9', fg: '#0F1111', fg2: '#333', fg3: '#565959', acc: '#FF7A59', on: '#0F1111', top: '#0E3B3F', topFg: '#FFFFFF', font: 'Arial, "Segoe UI", sans-serif' }) + `
html.kestrel[data-ui="shop"] .shp-search { border-radius: 6px; width: min(560px, 40vw); box-shadow: inset 0 0 0 2px #FF7A59; }
.shp-brand { display: flex; align-items: baseline; gap: 2px; font: 700 22px Arial, sans-serif; color: #fff; letter-spacing: -.03em; } .shp-brand b { color: #FF7A59; font-size: 14px; } .shp-bag { color: #FF7A59; margin-right: 4px; }
.shp-app { position: absolute; inset: 0; display: grid; grid-template-rows: 40px minmax(0, 1fr); font: 14px Arial, sans-serif; color: #0F1111; }
.shp-dept { display: flex; gap: 2px; align-items: center; padding: 0 10px; background: #145257; overflow-x: auto; } .shp-dept > span { color: #fff; font-weight: 700; margin-right: 10px; white-space: nowrap; }
.shp-dept button { flex: none; height: 30px; padding: 0 9px; border: 1px solid transparent; color: #fff; font: 14px Arial, sans-serif; } .shp-dept button:hover, .shp-dept button.on { border-color: #fff; }
.shp-cartbtn { margin-left: auto; font-weight: 700 !important; } .shp-cartbtn b { color: #FF7A59; }
.shp-res { overflow-y: auto; padding: 10px 24px 60px; background: #fff; } .shp-count { margin: 0 0 12px; color: #565959; } .shp-count b { color: #D9480F; }
.shp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 14px; }
.shp-card { display: grid; gap: 6px; align-content: start; padding: 12px; border: 1px solid #E3E6E6; border-radius: 6px; }
.shp-img { display: grid; place-items: center; height: 250px; background: #F7F8F8; border-radius: 4px; } .shp-img img, .shp-img .alt-noart { height: 230px; width: auto; max-width: 100%; object-fit: contain; }
.shp-name { text-align: left; font: 15px/1.3 Arial, sans-serif; color: #0F1111; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; } .shp-name:hover { color: #D9480F; }
.shp-stars { display: flex; gap: 6px; align-items: center; } .shp-stars i { font-style: normal; letter-spacing: 1px; background: linear-gradient(90deg, #FF7A59 calc(var(--s) * 20%), #D5D9D9 0); -webkit-background-clip: text; color: transparent; } .shp-stars em { font-style: normal; font-size: 13px; color: #13757B; }
.shp-price { font: 28px Arial, sans-serif; } .shp-price sup { font-size: 13px; vertical-align: 10px; } .shp-price span { display: block; font-size: 14px; color: #565959; } .shp-price.sm { font-size: 22px; }
.shp-badge { margin-left: 8px; padding: 2px 6px; background: #CC0C39; color: #fff; font: 700 11px Arial, sans-serif; font-style: normal; vertical-align: 4px; border-radius: 2px; }
.shp-ship { margin: 0; font-size: 13px; color: #565959; }
.shp-add { height: 32px; border-radius: 16px; background: #FFD3C4; border: 1px solid #FFB59E; font: 13px Arial, sans-serif; color: #0F1111; } .shp-add:hover { background: #FFBCA8; } .shp-add.sm { margin-top: 4px; }
.shp-pdp { overflow-y: auto; padding: 12px 24px 60px; animation: k-fade .25s both; } .shp-crumb { font-size: 13px; color: #565959; margin-bottom: 14px; } .shp-crumb button { color: #13757B; }
.shp-pgrid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1.3fr) 280px; gap: 28px; }
.shp-gal { display: grid; gap: 10px; } .shp-gal img { width: 100%; border-radius: 4px; } .shp-gal img:first-child { max-width: 380px; justify-self: center; }
.shp-pinfo h1 { margin: 0 0 6px; font: 24px/1.3 Arial, sans-serif; } .shp-pinfo hr { border: 0; border-top: 1px solid #E3E6E6; margin: 12px 0; } .shp-pinfo ul { padding-left: 18px; line-height: 1.7; }
.shp-buy { align-self: start; display: grid; gap: 10px; padding: 18px; border: 1px solid #D5D9D9; border-radius: 8px; } .shp-stock { margin: 0; color: #007600; font-size: 18px; }
.shp-now { height: 34px; border-radius: 17px; background: #FF7A59 !important; border: 1px solid #F2603D; color: #0F1111 !important; font: 13px Arial, sans-serif !important; }
.shp-act button { color: #13757B !important; font-weight: 400 !important; }
.shp-cart { position: absolute; right: 0; top: 40px; bottom: 0; width: 340px; overflow-y: auto; padding: 16px; background: #fff; box-shadow: -10px 0 30px -10px rgba(0,0,0,.3); animation: k-fade .2s both; } .shp-cart h3 { margin: 0 0 12px; font: 700 20px Arial, sans-serif; }
.shp-line { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #E3E6E6; } .shp-line img { width: 60px; } .shp-line b { display: block; margin-bottom: 6px; } .shp-line button { margin-right: 12px; color: #13757B; font-size: 13px; }
`;
