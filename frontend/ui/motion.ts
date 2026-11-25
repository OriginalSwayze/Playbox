// Pointer-driven card motion: the cover under the pointer leans towards it and a soft light follows.
// One delegated listener, one rAF per frame, only CSS variables are written; nothing runs when idle.
import { getState } from '../state/store';

export function bindTilt(doc: Document): () => void {
	let raf = 0;
	let last: { x: number; y: number; t: EventTarget | null } | null = null;
	let current: HTMLElement | null = null;
	const reset = (el: HTMLElement | null) => {
		if (!el) return;
		el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); el.style.removeProperty('--gx'); el.style.removeProperty('--gy');
		el.classList.remove('k-tilting');
	};
	const frame = () => {
		raf = 0;
		if (!last) return;
		const s = getState();
		const target = (last.t as Element | null)?.closest?.('.k-cover .art, .k-card .art') as HTMLElement | null;
		if (target !== current) { reset(current); current = target; }
		if (!target || !s.settings.tilt || s.calm) return;
		const r = target.getBoundingClientRect();
		const px = (last.x - r.left) / r.width, py = (last.y - r.top) / r.height;
		const max = target.closest('.k-card') ? 4 : 8;
		target.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
		target.style.setProperty('--rx', `${((0.5 - py) * 2 * max).toFixed(2)}deg`);
		target.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
		target.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
		target.classList.add('k-tilting');
	};
	const move = (e: PointerEvent) => { last = { x: e.clientX, y: e.clientY, t: e.target }; if (!raf) raf = doc.defaultView!.requestAnimationFrame(frame); };
	const leave = () => { last = null; reset(current); current = null; };
	doc.addEventListener('pointermove', move, { passive: true });
	doc.addEventListener('pointerleave', leave);
	return () => { doc.removeEventListener('pointermove', move); doc.removeEventListener('pointerleave', leave); if (raf) doc.defaultView?.cancelAnimationFrame(raf); };
}
