// Shared styles for the kit in common.tsx (search box, action lists, missing art), recoloured by each interface's tokens.
export const kitCss = `
.alt-search { height: 36px; width: min(360px, 28vw); display: flex; align-items: center; gap: 8px; padding: 0 12px; border-radius: 99px; background: var(--k-s1); box-shadow: var(--k-edge); color: var(--k-fg-3); }
.alt-search:focus-within { box-shadow: inset 0 0 0 1.5px var(--k-accent); }
.alt-search input { flex: 1; min-width: 0; background: none; border: 0; outline: none; color: var(--k-fg); font: 500 13.5px var(--k-text); }
.alt-actions { display: grid; gap: 2px; }
.alt-actions button { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 8px; text-align: left; font: 600 13px var(--k-text) !important; color: var(--k-fg-2) !important; }
.alt-actions button:hover { background: var(--k-s2); color: var(--k-fg) !important; }
.alt-noart { display: grid; place-items: center; width: 100%; height: 100%; padding: 8px; text-align: center; font: 700 13px var(--k-text); color: var(--k-fg-2); background: var(--k-s3); }
.alt-brand { white-space: nowrap; }
`;

/** Kestrel's colour tokens for one interface from a small palette, plus its top strip. Light or dark is the caller's choice. */
export function tok(id: string, p: { bg: string; s1: string; s2: string; s3: string; fg: string; fg2: string; fg3: string; acc: string; on: string; line?: string; top?: string; topFg?: string; font?: string }) {
	const line = p.line ?? 'color-mix(in srgb, ' + p.fg + ' 12%, transparent)';
	const mix = (n: number) => `color-mix(in srgb, ${p.acc} ${n}%, transparent)`;
	const h = `html.kestrel[data-ui="${id}"]`;
	let css = `${h} { --k-ink: ${p.bg}; --k-s1: ${p.s1}; --k-s2: ${p.s2}; --k-s3: ${p.s3}; --k-s4: ${p.s3}; --k-line: ${line}; --k-line-2: color-mix(in srgb, ${p.fg} 24%, transparent);
	--k-fg: ${p.fg}; --k-fg-2: ${p.fg2}; --k-fg-3: ${p.fg3}; --k-accent: ${p.acc}; --k-accent-2: ${p.acc}; --k-on-accent: ${p.on}; --k-a10: ${mix(10)}; --k-a20: ${mix(18)}; --k-a40: ${mix(38)};${p.font ? ` --k-text: ${p.font};` : ''} }
${h} .k-stage { background: ${p.bg}; }
${h} .k-top { background: ${p.top ?? p.bg}; border-bottom: 1px solid ${line}; }\n`;
	if (p.topFg) css += `${h} .k-top { --k-fg: ${p.topFg}; --k-fg-2: color-mix(in srgb, ${p.topFg} 85%, transparent); --k-fg-3: color-mix(in srgb, ${p.topFg} 65%, transparent); --k-s2: color-mix(in srgb, ${p.topFg} 14%, transparent); }
${h} .alt-search { --k-fg: ${p.fg}; --k-fg-3: ${p.fg3}; background: ${p.s1}; }\n`;
	return css;
}
