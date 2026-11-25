// Activity: downloads, friends and quick Steam actions in one panel that slides in from the right.
import { Icon } from '../ui/icons';
import { setState, useKestrel } from '../state/store';
import { goNative } from '../state/nav';
import { openAddGame, openFriendsList } from '../steam/activity';
import { client } from '../steam/env';
import { formatBytes } from '../steam/library';

const header = (appid: number) => `https://shared.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`;
const eta = (s: number) => (s <= 0 ? '' : s < 60 ? `${s}s left` : s < 3600 ? `${Math.round(s / 60)} min left` : `${(s / 3600).toFixed(1)} h left`);

export function ActivityPanel() {
	const open = useKestrel((s) => s.panelOpen);
	const dl = useKestrel((s) => s.downloads);
	const friends = useKestrel((s) => s.friends);
	const online = friends.filter((f) => f.state !== 'offline');
	const close = () => setState({ panelOpen: false });

	return (
		<>
			{open && <div className="k-panel-scrim" onMouseDown={close} />}
			<aside className={'k-panel' + (open ? ' open' : '')} aria-hidden={!open} aria-label="Activity">
				<header>Activity</header>
				<div className="k-scroll">
					<section className="k-sec">
						<h4>Downloads<button onClick={() => { close(); goNative('/library/downloads', 'play'); }}>Open downloads</button></h4>
						{dl.active ? (
							<div className="k-dl">
								<img src={header(dl.active.appid)} alt="" />
								<div className="tx">
									<b>{dl.active.name}</b>
									<span>{dl.rate > 0 ? `${formatBytes(dl.rate)}/s` : dl.active.paused ? 'Paused' : 'Preparing'}{dl.eta > 0 ? ` · ${eta(dl.eta)}` : ''}</span>
									<div className="k-bar"><i style={{ width: `${dl.active.percent.toFixed(1)}%` }} /></div>
								</div>
							</div>
						) : (
							<p className="k-muted">Nothing is downloading.{dl.queue.length ? ` ${dl.queue.length} queued.` : ''}</p>
						)}
						{dl.queue.slice(0, 4).map((r) => (
							<div className="k-friend" key={r.appid}>
								<img src={header(r.appid)} alt="" style={{ width: 56, height: 26, borderRadius: 6, objectFit: 'cover' }} />
								<div className="tx"><b>{r.name}</b><span>{r.paused ? 'Paused' : 'Queued'}</span></div>
							</div>
						))}
					</section>
					<section className="k-sec">
						<h4>Friends · {online.length} online<button onClick={() => { close(); openFriendsList(); }}>Open chat</button></h4>
						{online.length === 0 && <p className="k-muted">None of your friends are online right now.</p>}
						{online.slice(0, 12).map((f) => (
							<div className="k-friend" data-s={f.state} key={f.id}>
								<img src={f.avatar} alt="" />
								<div className="tx"><b>{f.name}</b><span>{f.state === 'ingame' ? `Playing ${f.game}` : f.state === 'away' ? 'Away' : 'Online'}</span></div>
							</div>
						))}
					</section>
					<section className="k-sec">
						<h4>Quick actions</h4>
						<div className="k-quick">
							<button onClick={() => { close(); openAddGame(); }}><Icon name="plus" size={18} />Add a game</button>
							<button onClick={() => { close(); try { client().URL.ExecuteSteamURL('steam://open/settings'); } catch { /* ignore */ } }}><Icon name="settings" size={18} />Settings</button>
							<button onClick={() => { close(); goNative('/media', 'play'); }}><Icon name="spark" size={18} />Screenshots</button>
							<button onClick={() => { close(); goNative('https://store.steampowered.com/wishlist/', 'discover'); }}><Icon name="discover" size={18} />Wishlist</button>
						</div>
					</section>
				</div>
			</aside>
		</>
	);
}
