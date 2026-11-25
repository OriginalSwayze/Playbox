// Kestrel design tokens. One source for colour, type, space, radius, depth and motion.
export const tokens = `
html.kestrel {
	/* colour: night-sky ink, warm paper text, one warm accent and one cool counterpoint */
	--k-ink: #08090C;
	--k-s1: #0E1015;
	--k-s2: #141720;
	--k-s3: #1C202B;
	--k-s4: #262B38;
	--k-line: rgba(236, 232, 222, .07);
	--k-line-2: rgba(236, 232, 222, .13);
	--k-fg: #F2EFE8;
	--k-fg-2: #A9AAB2;
	--k-fg-3: #6F727D;
	--k-accent: #F0A23B;
	--k-accent-2: #FFCB7A;
	--k-on-accent: #1A1004;
	--k-cool: #8DB4FF;
	--k-ok: #5FD39A;
	--k-warn: #FFC24A;
	--k-a10: rgba(240, 162, 59, .10);
	--k-a20: rgba(240, 162, 59, .20);
	--k-a40: rgba(240, 162, 59, .40);

	/* type */
	--k-display: "Segoe UI Variable Display", "Segoe UI", system-ui, sans-serif;
	--k-text: "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif;
	--k-small: "Segoe UI Variable Small", "Segoe UI", system-ui, sans-serif;

	/* space (4px grid) and shape */
	--k-1: 4px; --k-2: 8px; --k-3: 12px; --k-4: 16px; --k-5: 24px; --k-6: 32px; --k-7: 48px; --k-8: 64px;
	--k-r-sm: 8px; --k-r: 14px; --k-r-lg: 22px; --k-r-pill: 999px;
	--k-top: 56px;

	/* depth */
	--k-edge: inset 0 0 0 1px var(--k-line);
	--k-lift: 0 1px 2px rgba(0,0,0,.35), 0 16px 40px -18px rgba(0,0,0,.8);
	--k-float: 0 2px 8px rgba(0,0,0,.4), 0 40px 90px -30px rgba(0,0,0,.9);

	/* motion */
	--k-out: cubic-bezier(.16, 1, .3, 1);
	--k-spring: cubic-bezier(.34, 1.36, .5, 1);
	--k-in-out: cubic-bezier(.65, 0, .35, 1);
	--k-t1: 140ms; --k-t2: 240ms; --k-t3: 420ms; --k-t4: 700ms;
}
html.kestrel.k-calm { --k-t1: 1ms; --k-t2: 1ms; --k-t3: 1ms; --k-t4: 1ms; }
`;
