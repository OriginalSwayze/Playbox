// Game cards shared by the dashboard and the library.
import { useState, type MouseEvent } from 'react';
import { Icon } from '../ui/icons';
import { openGame } from '../state/nav';
import { formatAgo, formatPlaytime, playOrInstall, type Game } from '../steam/library';

/** Landscape card for rails: header art, a quick play button that appears on hover. */
export function WideCard({ g }: { g: Game }) {
	const quick = (e: MouseEvent) => { e.stopPropagation(); playOrInstall(g); };
	return (
		<div className="k-card" data-appid={g.appid} role="button" tabIndex={0} onClick={(e) => openGame(g.appid, e.currentTarget)} onKeyDown={(e) => e.key === 'Enter' && openGame(g.appid, e.currentTarget)}>
			<div className="art">
				<img src={g.header} alt="" loading="lazy" />
				<button className={'quick' + (g.installed ? '' : ' install')} aria-label={g.installed ? `Play ${g.name}` : `Install ${g.name}`} onClick={quick}>
					<Icon name={g.installed ? 'play' : 'install'} size={18} />
				</button>
			</div>
			<div className="cap">
				<div className="tx"><b>{g.name}</b><span>{formatAgo(g.lastPlayed)} · {formatPlaytime(g.minutes)}</span></div>
			</div>
		</div>
	);
}

/** Vertical cover for the library wall. Uninstalled games are greyed until hovered. */
export function Cover({ g }: { g: Game }) {
	const [n, setN] = useState(0); // which of the cover fallbacks is showing
	const src = g.capsules[n];
	const broken = !src;
	const busy = g.busy || g.needsUpdate;
	return (
		<button data-appid={g.appid} className={'k-cover' + (g.installed || busy ? '' : ' dim')} onClick={(e) => openGame(g.appid, e.currentTarget)} title={g.name}>
			<div className="art">
				{broken ? <div className="fallback">{g.name}</div> : <img src={src} alt="" loading="lazy" onError={() => setN(n + 1)} />}
				{busy && <span className="badge busy">{g.progress ? `${Math.round(g.progress)}%` : g.status}</span>}
			</div>
			<div className="name">{g.name}</div>
		</button>
	);
}
