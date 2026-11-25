// The Kestrel shell: top bar, the stage with Kestrel's views, the command bar and the activity panel.
import { useEffect } from 'react';
import { TopBar } from './TopBar';
import { CommandBar } from './CommandBar';
import { ActivityPanel } from './ActivityPanel';
import { Home } from '../views/Home';
import { Library } from '../views/Library';
import { GamePage } from '../views/Game';
import { Morph } from './Morph';
import { Intro } from './Intro';
import { SettingsSheet } from './SettingsSheet';
import { GameMenu } from './GameMenu';
import { useKestrel } from '../state/store';

function Stage() {
	const view = useKestrel((s) => s.view);
	const dir = useKestrel((s) => s.dir);
	const hidden = view.kind === 'native';
	return (
		<main className={'k-stage' + (hidden ? ' is-hidden' : '')} data-dir={dir} aria-hidden={hidden}>
			{view.kind === 'home' && <Home key="home" />}
			{view.kind === 'library' && <Library key="library" />}
			{view.kind === 'game' && <GamePage key={'g' + view.appid} appid={view.appid} />}
		</main>
	);
}

export function Shell({ onMount }: { onMount?: () => void }) {
	useEffect(() => { onMount?.(); }, []);
	return (
		<>
			<TopBar />
			<Stage />
			<Morph />
			<ActivityPanel />
			<CommandBar />
			<GameMenu />
			<SettingsSheet />
			<Intro />
		</>
	);
}
