// If anything inside Kestrel throws while rendering, step aside and give the window back to Steam
// rather than leaving a broken interface on screen.
import { Component, type ReactNode } from 'react';

export class Failsafe extends Component<{ children: ReactNode; onCrash: (e: unknown) => void }, { crashed: boolean }> {
	state = { crashed: false };
	static getDerivedStateFromError() { return { crashed: true }; }
	componentDidCatch(error: unknown) {
		console.error('[Kestrel] interface error, handing the window back to Steam', error);
		setTimeout(() => this.props.onCrash(error), 0);
	}
	render() { return this.state.crashed ? null : this.props.children; }
}
