// A horizontal rail with page buttons that appear on hover and glide one screen at a time.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../ui/icons';

export function Rail({ children }: { children: ReactNode }) {
	const ref = useRef<HTMLDivElement>(null);
	const [edge, setEdge] = useState({ start: true, end: false });
	const check = () => {
		const el = ref.current;
		if (!el) return;
		setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
	};
	useEffect(() => { check(); }, [children]);
	const page = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.85, behavior: 'smooth' });
	return (
		<div className="k-rail-wrap">
			<div className="k-rail" ref={ref} onScroll={check}>{children}</div>
			{!edge.start && <button className="k-rail-btn prev" aria-label="Scroll back" onClick={() => page(-1)}><Icon name="back" size={20} /></button>}
			{!edge.end && <button className="k-rail-btn next" aria-label="Scroll forward" onClick={() => page(1)}><Icon name="forward" size={20} /></button>}
		</div>
	);
}
