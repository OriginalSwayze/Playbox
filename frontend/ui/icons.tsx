// Kestrel's icon set: original 24px line icons, 1.6px strokes, round joins. One component, named glyphs.
import type { CSSProperties } from 'react';

const P: Record<string, string> = {
	play: 'M8 5.6v12.8c0 .8.9 1.3 1.6.8l9.4-6.4c.6-.4.6-1.2 0-1.6L9.6 4.8C8.9 4.3 8 4.8 8 5.6z',
	discover: 'M12 3.2a8.8 8.8 0 1 0 0 17.6 8.8 8.8 0 0 0 0-17.6zM15.4 8.6l-1.9 4.9-4.9 1.9 1.9-4.9z',
	social: 'M9 11.2a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8zM3 20c.6-3.4 3-5.4 6-5.4s5.4 2 6 5.4M15.8 4.6a3.3 3.3 0 0 1 0 6.3M17.6 14.8c1.8.6 3 2.1 3.4 4.6',
	you: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.6 20.4c.9-3.9 3.8-6.1 7.4-6.1s6.5 2.2 7.4 6.1',
	search: 'M10.8 4.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zM15.6 15.6l4.6 4.6',
	download: 'M12 4v11M7.2 10.6 12 15.4l4.8-4.8M5 19.6h14',
	bell: 'M6.4 16.4V11a5.6 5.6 0 0 1 11.2 0v5.4l1.6 1.6H4.8zM10 20.2a2.2 2.2 0 0 0 4 0',
	back: 'M14.6 5.6 8.2 12l6.4 6.4',
	forward: 'M9.4 5.6 15.8 12l-6.4 6.4',
	minimize: 'M6 12.6h12',
	maximize: 'M6.4 6.4h11.2v11.2H6.4z',
	close: 'M6.6 6.6l10.8 10.8M17.4 6.6 6.6 17.4',
	install: 'M12 3.6v10.6M7.6 9.8 12 14.2l4.4-4.4M4.4 15.4v2.4c0 1 .8 1.8 1.8 1.8h11.6c1 0 1.8-.8 1.8-1.8v-2.4',
	settings: 'M12 9.2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1c.6.5 1.3.9 2 1.2l.4 2.7h4l.4-2.7c.7-.3 1.4-.7 2-1.2l2.3 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z',
	grid: 'M4.4 4.4h6.2v6.2H4.4zM13.4 4.4h6.2v6.2h-6.2zM4.4 13.4h6.2v6.2H4.4zM13.4 13.4h6.2v6.2h-6.2z',
	clock: 'M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2zM12 7.4V12l3.2 2',
	trophy: 'M7.6 4.4h8.8v5a4.4 4.4 0 0 1-8.8 0zM7.6 6.4H4.6c0 2.6 1.4 4.2 3.4 4.4M16.4 6.4h3c0 2.6-1.4 4.2-3.4 4.4M12 13.8v3.4M8.6 19.8h6.8',
	disk: 'M4 7.4c0-1.6 3.6-2.8 8-2.8s8 1.2 8 2.8v9.2c0 1.6-3.6 2.8-8 2.8s-8-1.2-8-2.8zM4 7.4c0 1.6 3.6 2.8 8 2.8s8-1.2 8-2.8',
	external: 'M13.6 4.4h6v6M19.6 4.4l-8 8M17.4 13.6v4.2c0 1-.8 1.8-1.8 1.8H6.2c-1 0-1.8-.8-1.8-1.8V8.4c0-1 .8-1.8 1.8-1.8h4.2',
	chevron: 'M8.6 10 12 13.4 15.4 10',
	plus: 'M12 5v14M5 12h14',
	pause: 'M8.4 5.4v13.2M15.6 5.4v13.2',
	library: 'M5 4.4v15.2M9.4 4.4v15.2M13.4 5.2l4.4 14.4',
	spark: 'M12 3.4l1.8 5.4 5.4 1.8-5.4 1.8-1.8 5.4-1.8-5.4-5.4-1.8 5.4-1.8z',
	chat: 'M20 11.6a7.6 7.6 0 0 1-11 6.8L4 19.8l1.4-4.4A7.6 7.6 0 1 1 20 11.6z',
	menu: 'M4.6 7h14.8M4.6 12h14.8M4.6 17h14.8',
	enter: 'M19.4 5v6.4c0 1-.8 1.8-1.8 1.8H5.4M9 9.4 5.2 13.2 9 17',
};
const FILLED = new Set(['play']);

export function Icon({ name, size = 20, style, className }: { name: keyof typeof P | string; size?: number; style?: CSSProperties; className?: string }) {
	const d = P[name] ?? P.spark;
	const fill = FILLED.has(name);
	return (
		<svg className={className} width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true"
			fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
			<path d={d} />
		</svg>
	);
}

/** The Kestrel mark: a stylised kestrel's wing sweeping into a horizon line. */
export function Mark({ size = 26 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
			<defs>
				<linearGradient id="kmark" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="var(--k-accent-2)" />
					<stop offset="1" stopColor="var(--k-accent)" />
				</linearGradient>
			</defs>
			<path d="M4 20.5C9 11 16.5 6 28 5.5c-5.8 3.1-9.2 7.4-10.6 13.2C13.8 16.4 9.4 17.3 4 20.5z" fill="url(#kmark)" />
			<path d="M4 25.6h24" stroke="var(--k-fg-3)" strokeWidth="1.6" strokeLinecap="round" />
		</svg>
	);
}

/** Original loading indicator: three dots tracing an arc. */
export function Loader({ size = 28 }: { size?: number }) {
	return (
		<span className="k-loader" style={{ width: size, height: size }} aria-label="Loading">
			<i /><i /><i />
		</span>
	);
}
