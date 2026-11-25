// Motion and the pieces added in phase 7: settings sheet, intro, rail arrows, tilt, directional transitions.
export const motion = `
/* ---- Directional page transitions: forward rises in, back slides in from the left ---- */
.k-stage[data-dir="back"] .k-view { animation-name: k-view-back; }
@keyframes k-view-back { from { opacity: 0; transform: translateX(-28px); } to { opacity: 1; transform: none; } }

/* ---- Spotlight cross-fade ---- */
.k-hero-art img.under { animation: none; opacity: 1; z-index: 0; }
.k-hero-art img:not(.under) { z-index: 1; }

/* ---- Rail page buttons ---- */
.k-rail-wrap { position: relative; }
.k-rail-btn { position: absolute; top: calc(50% - 40px); width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; z-index: 2;
	background: rgba(20,23,32,.88); box-shadow: inset 0 0 0 1px var(--k-line-2), var(--k-lift); color: var(--k-fg); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
	opacity: 0; transform: scale(.85); transition: opacity var(--k-t2), transform var(--k-t3) var(--k-spring), background-color var(--k-t1); }
.k-rail-btn.prev { left: -14px; } .k-rail-btn.next { right: -14px; }
.k-rail-wrap:hover .k-rail-btn { opacity: 1; transform: none; }
.k-rail-btn:hover { background: var(--k-s4); }
.k-rail-btn:active { transform: scale(.92); }

/* ---- Cover tilt and light (variables written by ui/motion.ts) ---- */
.k-cover .art, .k-card .art { transform: perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform 500ms var(--k-out), box-shadow var(--k-t3); }
.k-cover .art.k-tilting, .k-card .art.k-tilting { transition: transform 80ms linear, box-shadow var(--k-t3); }
.k-cover .art::before { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; opacity: 0; transition: opacity var(--k-t3);
	background: radial-gradient(70% 55% at var(--gx, 50%) var(--gy, 0%), rgba(255,255,255,.22), transparent 70%); mix-blend-mode: soft-light; }
.k-cover .art.k-tilting::before { opacity: 1; }

/* ---- Settings sheet ---- */
.k-sheet { position: absolute; left: 50%; bottom: 0; width: min(720px, calc(100vw - 32px)); z-index: 22; pointer-events: auto; transform: translateX(-50%);
	border-radius: 26px 26px 0 0; background: var(--k-s1); box-shadow: inset 0 1px 0 var(--k-line-2), inset 0 0 0 1px var(--k-line), var(--k-float);
	animation: k-sheet-in var(--k-t4) var(--k-out) both; }
@keyframes k-sheet-in { from { transform: translateX(-50%) translateY(100%); } to { transform: translateX(-50%); } }
.k-sheet::before { content: ""; position: absolute; left: 50%; top: 8px; width: 40px; height: 4px; margin-left: -20px; border-radius: 4px; background: var(--k-s4); }
.k-sheet header { display: flex; align-items: center; gap: 14px; padding: 26px 24px 10px; }
.k-sheet header h2 { margin: 0; font: 700 20px var(--k-display); }
.k-sheet header span { font-size: 13px; color: var(--k-fg-3); }
.k-sheet header > div { flex: 1; }
.k-sheet-rows { padding: 6px 24px 8px; }
.k-sheet-row { display: flex; align-items: center; gap: 18px; padding: 14px 0; border-top: 1px solid var(--k-line); animation: k-rise var(--k-t3) var(--k-out) both; }
.k-sheet-row .tx { flex: 1; }
.k-sheet-row .tx b { display: block; font: 600 14px var(--k-text); }
.k-sheet-row .tx span { font-size: 12.5px; color: var(--k-fg-3); }
.k-sheet footer { padding: 12px 24px 22px; font-size: 12px; color: var(--k-fg-3); border-top: 1px solid var(--k-line); }

/* ---- Intro ---- */
.k-intro { position: absolute; inset: 0; z-index: 60; pointer-events: auto; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px;
	background: radial-gradient(60% 50% at 50% 45%, #15110A, var(--k-ink) 70%); transition: opacity 600ms var(--k-out); }
.k-intro.out { opacity: 0; }
.k-intro-mark .wing { transform-origin: 4px 20px; animation: k-wing 1100ms var(--k-out) both; }
.k-intro-mark .line { stroke-dasharray: 24; stroke-dashoffset: 24; animation: k-line 900ms var(--k-out) 250ms forwards; }
@keyframes k-wing { from { opacity: 0; transform: translate(-10px, 8px) rotate(-14deg) scale(.6); } to { opacity: 1; transform: none; } }
@keyframes k-line { to { stroke-dashoffset: 0; } }
.k-intro-name { font: 700 34px var(--k-display); letter-spacing: -.02em; color: var(--k-fg); animation: k-rise 800ms var(--k-out) 350ms both; }
`;
