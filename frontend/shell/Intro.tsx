// The opening: the Kestrel wing sweeps in over the horizon line, the name settles, then the shell is revealed.
// Shown once per Steam start; skipped with any click or key, and never shown with reduced motion.
import { useEffect, useState } from 'react';
import { getState } from '../state/store';

let shown = false;

export function Intro() {
	const [phase, setPhase] = useState<'on' | 'out' | 'off'>(() => {
		const s = getState();
		return shown || !s.settings.intro || s.calm ? 'off' : 'on';
	});
	useEffect(() => {
		if (phase !== 'on') return;
		shown = true;
		const t1 = setTimeout(() => setPhase('out'), 1500);
		const t2 = setTimeout(() => setPhase('off'), 2100);
		return () => { clearTimeout(t1); clearTimeout(t2); };
	}, []);
	if (phase === 'off') return null;
	return (
		<div className={'k-intro' + (phase === 'out' ? ' out' : '')} onMouseDown={() => setPhase('off')}>
			<svg className="k-intro-mark" viewBox="0 0 32 32" width="96" height="96" aria-hidden="true">
				<defs>
					<linearGradient id="kintro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFCB7A" /><stop offset="1" stopColor="#F0A23B" /></linearGradient>
				</defs>
				<path className="wing" d="M4 20.5C9 11 16.5 6 28 5.5c-5.8 3.1-9.2 7.4-10.6 13.2C13.8 16.4 9.4 17.3 4 20.5z" fill="url(#kintro)" />
				<path className="line" d="M4 25.6h24" stroke="#6F727D" strokeWidth="1.6" strokeLinecap="round" fill="none" />
			</svg>
			<div className="k-intro-name">Playbox</div>
		</div>
	);
}
