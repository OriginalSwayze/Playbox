// The Kestrel shell: top bar, the stage with Kestrel's views, the command bar and the activity panel.
import { useEffect } from 'react';
import { TopBar } from './TopBar';
import { CommandBar } from './CommandBar';
import { ActivityPanel } from './ActivityPanel';
import { Home } from '../views/Home';
import { Library } from '../views/Library';
import { useKestrel } from '../state/store';

function Stage() {
	const view = useKestrel((s) => s.view);
	const hidden = view.kind === 'native';
	return (
		<main className={'k-stage' + (hidden ? ' is-hidden' : '')} aria-hidden={hidden}>
			{view.kind === 'home' && <Home key="home" />}
			{view.kind === 'library' && <Library key="library" />}
		</main>
	);
}

export function Shell({ onMount }: { onMount?: () => void }) {
	useEffect(() => { onMount?.(); }, []);
	return (
		<>
			<TopBar />
			<Stage />
			<ActivityPanel />
			<CommandBar />
		</>
	);
}
