// Gazette: light newsprint, ink and one editorial red. Recolours Kestrel's shared tokens so the shared panels match.
export const gazette = `
html.kestrel[data-ui="gazette"] {
	--k-ink: #E9E3D6; --k-s1: #F5F0E6; --k-s2: #EAE3D5; --k-s3: #DED5C3; --k-s4: #CFC4AE;
	--k-line: rgba(30, 26, 20, .12); --k-line-2: rgba(30, 26, 20, .22);
	--k-fg: #1C1A16; --k-fg-2: #4A453C; --k-fg-3: #7D7566;
	--k-accent: #A8231B; --k-accent-2: #C8382E; --k-on-accent: #FFF8F0;
	--k-a10: rgba(168,35,27,.08); --k-a20: rgba(168,35,27,.14); --k-a40: rgba(168,35,27,.32);
	--gz-serif: Georgia, "Times New Roman", serif;
	--gz-sans: "Segoe UI Variable Small", "Segoe UI", sans-serif;
}
html.kestrel[data-ui="gazette"] .k-top { background: #F1EBDF; }
html.kestrel[data-ui="gazette"] .k-top::after { height: 4px; background: none; border-top: 1px solid #1C1A16; border-bottom: 1px solid #1C1A16; opacity: .7; }
html.kestrel[data-ui="gazette"] .k-scrim { background: rgba(40, 34, 26, .35); }
.gz-brand { font: 700 italic 19px var(--gz-serif) !important; color: #1C1A16 !important; letter-spacing: -.01em; }
.gz-search input { width: min(320px, 26vw); height: 34px; padding: 0 14px; border: 1px solid rgba(30,26,20,.35); border-radius: 2px; background: #FBF8F1; color: #1C1A16; font: italic 14px var(--gz-serif); outline: none; }
.gz-search input:focus { border-color: #A8231B; box-shadow: 0 0 0 2px rgba(168,35,27,.15); }
.gz-stage { background: #D9D1C1; }
.gz-desk { position: absolute; inset: 0; overflow-y: auto; padding: 28px 24px 60px; background: radial-gradient(70% 60% at 50% 0%, #E6DECF, #CFC5B2); }
.gz-sheet { max-width: 1280px; margin: 0 auto; padding: 34px 48px 40px; color: #1C1A16; font-family: var(--gz-serif);
	background: #F7F3EA; background-image: radial-gradient(rgba(60,50,30,.05) 1px, transparent 1.2px); background-size: 3px 3px;
	box-shadow: 0 1px 0 #fff inset, 0 30px 60px -30px rgba(40,30,15,.55), 0 2px 6px rgba(40,30,15,.2);
	animation: gz-print 700ms var(--k-out) both; transform-origin: 50% 0; }
@keyframes gz-print { from { opacity: 0; transform: translateY(24px) rotate(-.6deg); } to { opacity: 1; transform: none; } }
.gz-nameplate { text-align: center; border-bottom: 3px double #1C1A16; padding-bottom: 8px; margin-bottom: 22px; }
.gz-ears { display: flex; justify-content: space-between; font: italic 13px var(--gz-serif); color: #5A5346; }
.gz-name { font: 700 clamp(44px, 6.4vw, 86px)/1 "Times New Roman", Georgia, serif; letter-spacing: -.02em; margin: 6px 0 12px; animation: gz-ink 900ms ease-out both; }
@keyframes gz-ink { from { opacity: 0; filter: blur(3px); letter-spacing: .04em; } to { opacity: 1; filter: none; letter-spacing: -.02em; } }
.gz-dateline { display: flex; justify-content: space-between; gap: 12px; padding: 6px 0; border-top: 1px solid #1C1A16; border-bottom: 1px solid #1C1A16; font: 600 12px var(--gz-sans); letter-spacing: .08em; text-transform: uppercase; }
.gz-front { display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr); gap: 0 34px; }
.gz-lead { position: relative; padding-right: 34px; border-right: 1px solid rgba(30,26,20,.3); }
.gz-kicker { font: 700 12px var(--gz-sans); letter-spacing: .16em; text-transform: uppercase; color: #A8231B; }
.gz-headline { margin: 6px 0 8px; font: 700 clamp(34px, 4vw, 58px)/1.02 "Times New Roman", Georgia, serif; letter-spacing: -.015em; cursor: pointer; text-wrap: balance; }
.gz-headline:hover { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 6px; }
.gz-deck { margin: 0 0 16px; font: italic 19px/1.4 var(--gz-serif); color: #3E392F; }
.gz-photo { margin: 0 0 16px; }
.gz-halftone { position: relative; aspect-ratio: 16/7; overflow: hidden; background: #ccc; }
.gz-photo.tall .gz-halftone { aspect-ratio: 16/6.2; }
.gz-halftone img { width: 100%; height: 100%; object-fit: cover; object-position: center 25%; filter: grayscale(1) contrast(1.35) brightness(1.05); animation: gz-develop 1400ms ease-out both; }
@keyframes gz-develop { from { filter: grayscale(1) contrast(.6) brightness(1.6) blur(2px); } to { filter: grayscale(1) contrast(1.35) brightness(1.05); } }
.gz-halftone::after { content: ""; position: absolute; inset: 0; pointer-events: none; mix-blend-mode: multiply;
	background: radial-gradient(circle, rgba(0,0,0,.55) 30%, transparent 32%) 0 0 / 4px 4px, rgba(247,243,234,.12); }
.gz-photo figcaption { margin-top: 6px; font: italic 13px var(--gz-serif); color: #5A5346; border-bottom: 1px solid rgba(30,26,20,.2); padding-bottom: 6px; }
.gz-body p { margin: 0 0 12px; font: 16px/1.6 var(--gz-serif); text-align: justify; hyphens: auto; }
.gz-body.cols2 { column-count: 2; column-gap: 28px; column-rule: 1px solid rgba(30,26,20,.18); }
.gz-body p.drop::first-letter { float: left; font: 700 62px/.8 "Times New Roman", serif; padding: 6px 8px 0 0; color: #1C1A16; }
.gz-lead-foot { display: flex; align-items: center; gap: 24px; margin: 10px 0 18px; }
.gz-more { font: italic 700 15px var(--gz-serif) !important; color: #A8231B !important; }
.gz-more:hover { text-decoration: underline; }
.gz-stamp { padding: 6px 18px; border: 3px solid #A8231B !important; border-radius: 4px; color: #A8231B !important; font: 800 22px "Times New Roman", serif !important; letter-spacing: .18em; text-transform: uppercase;
	transform: rotate(-6deg); opacity: .9; transition: transform .3s var(--k-spring), background-color .2s;
	background: repeating-linear-gradient(-20deg, transparent 0 6px, rgba(168,35,27,.06) 6px 7px) !important; }
.gz-stamp:hover { transform: rotate(-2deg) scale(1.06); background-color: rgba(168,35,27,.1) !important; }
.gz-wire { margin-top: 8px; padding-top: 10px; border-top: 3px double rgba(30,26,20,.5); }
.gz-wire button { display: block; width: 100%; text-align: left; padding: 8px 0; border-bottom: 1px dotted rgba(30,26,20,.3); }
.gz-wire b { display: block; font: 700 16px/1.25 var(--gz-serif); color: #1C1A16; }
.gz-wire span { font: 13px/1.45 var(--gz-serif); color: #5A5346; }
.gz-wire button:hover b { color: #A8231B; }
.gz-label { margin: 0 0 8px; padding-bottom: 4px; border-bottom: 2px solid #1C1A16; font: 800 12px var(--gz-sans); letter-spacing: .16em; text-transform: uppercase; }
.gz-label.big { font-size: 18px; letter-spacing: .06em; text-transform: none; font-family: var(--gz-serif); }
.gz-right .gz-label:not(:first-child) { margin-top: 22px; }
.gz-brief { display: block; width: 100%; text-align: left; padding: 9px 0; border-bottom: 1px solid rgba(30,26,20,.18); }
.gz-brief b { display: block; font: 700 17px/1.2 var(--gz-serif); color: #1C1A16; }
.gz-brief span { font: 14px/1.4 var(--gz-serif); color: #4A453C; }
.gz-brief:hover b { color: #A8231B; }
.gz-small { margin: 0; font: 14px/1.5 var(--gz-serif); color: #3E392F; }
.gz-section { margin-top: 30px; animation: k-rise 600ms var(--k-out) both; }
.gz-section-head { display: flex; align-items: baseline; gap: 14px; padding: 6px 0; margin-bottom: 10px; border-top: 3px solid #1C1A16; border-bottom: 1px solid #1C1A16; }
.gz-section-head span { font: 700 11px var(--gz-sans); letter-spacing: .14em; text-transform: uppercase; color: #5A5346; }
.gz-section-head b { flex: 1; font: 700 26px var(--gz-serif); }
.gz-index { margin: 0; padding: 0; list-style: none; column-width: 260px; column-gap: 30px; column-rule: 1px solid rgba(30,26,20,.15); }
.gz-index li { break-inside: avoid; }
.gz-index button { display: flex; align-items: baseline; gap: 6px; width: 100%; padding: 3px 0; text-align: left; font: 15px var(--gz-serif) !important; color: #1C1A16 !important; }
.gz-index button span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 75%; }
.gz-index button i { flex: 1; border-bottom: 1px dotted rgba(30,26,20,.45); transform: translateY(-4px); }
.gz-index button em { font: italic 13px var(--gz-serif); color: #5A5346; white-space: nowrap; }
.gz-index button:hover span { color: #A8231B; text-decoration: underline; }
.gz-classifieds { column-width: 220px; column-gap: 16px; }
.gz-classifieds button { display: block; width: 100%; break-inside: avoid; margin-bottom: 10px; padding: 8px 10px; text-align: left; border: 1px solid #1C1A16 !important; font: 13px/1.4 var(--gz-serif) !important; color: #1C1A16 !important; transition: background-color .15s; }
.gz-classifieds button:hover { background: #FFF6D9 !important; }
.gz-colophon { margin-top: 34px; padding-top: 8px; border-top: 3px double #1C1A16; text-align: center; font: italic 13px var(--gz-serif); color: #5A5346; }
.gz-article { animation: k-rise 500ms var(--k-out) both; }
.gz-backlink { font: italic 15px var(--gz-serif) !important; color: #A8231B !important; margin-bottom: 12px; }
.gz-title { margin: 6px 0 8px; font: 700 clamp(40px, 5vw, 72px)/1 "Times New Roman", Georgia, serif; letter-spacing: -.02em; }
.gz-byline { margin: -6px 0 16px; font: 700 12px var(--gz-sans); letter-spacing: .12em; text-transform: uppercase; color: #5A5346; }
.gz-article-grid { display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(0, 1fr); gap: 34px; }
.gz-side { display: flex; flex-direction: column; gap: 18px; }
.gz-box { padding: 14px 16px; border: 1px solid #1C1A16; background: #FBF8F1; }
.gz-box dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 14px; margin: 0 0 14px; font: 15px var(--gz-serif); }
.gz-box dt { color: #5A5346; font-style: italic; }
.gz-box dd { margin: 0; font-weight: 700; text-align: right; }
.gz-honours { margin: 0; padding-left: 20px; font: 14px/1.35 var(--gz-serif); }
.gz-honours li { margin-bottom: 7px; }
.gz-honours b { display: block; font-family: var(--gz-serif); }
.gz-honours span { color: #5A5346; font-size: 13px; }
.gz-notices { display: grid; gap: 2px; }
.gz-notices button { text-align: left; padding: 5px 0; font: 15px var(--gz-serif) !important; color: #1C1A16 !important; border-bottom: 1px dotted rgba(30,26,20,.3); }
.gz-notices button:hover { color: #A8231B !important; }
@media (max-width: 1100px) { .gz-front, .gz-article-grid { grid-template-columns: 1fr; } .gz-lead { border-right: 0; padding-right: 0; } }
`;
