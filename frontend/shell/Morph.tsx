// Carries a card's artwork into the game page: the image flies from the card to the hero, then hands over.
import { useLayoutEffect, useRef } from 'react';
import { setState, useKestrel } from '../state/store';

export function Morph() {
	const m = useKestrel((s) => s.morph);
	const view = useKestrel((s) => s.view);
	const ref = useRef<HTMLImageElement>(null);
	useLayoutEffect(() => {
		const img = ref.current;
		if (!m || !img || view.kind !== 'game' || view.appid !== m.appid) return;
		const doc = img.ownerDocument;
		const hero = doc.querySelector('.k-ghero') as HTMLElement | null;
		const r = hero?.getBoundingClientRect();
		const to = r ? { x: r.left, y: r.top, w: r.width, h: r.height } : { x: 0, y: 56, w: doc.documentElement.clientWidth, h: 400 };
		const anim = img.animate(
			[
				{ left: `${m.x}px`, top: `${m.y}px`, width: `${m.w}px`, height: `${m.h}px`, borderRadius: `${m.radius}px`, opacity: 1 },
				{ left: `${to.x}px`, top: `${to.y}px`, width: `${to.w}px`, height: `${to.h}px`, borderRadius: '0px', opacity: 1, offset: 0.78 },
				{ left: `${to.x}px`, top: `${to.y}px`, width: `${to.w}px`, height: `${to.h}px`, borderRadius: '0px', opacity: 0 },
			],
			{ duration: 620, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'forwards' },
		);
		anim.onfinish = () => setState({ morph: null });
		return () => anim.cancel();
	}, [m, view]);
	if (!m) return null;
	return <img ref={ref} className="k-morph" src={m.src} alt="" style={{ left: m.x, top: m.y, width: m.w, height: m.h }} />;
}
