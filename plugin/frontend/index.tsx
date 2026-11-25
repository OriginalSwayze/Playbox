import { definePlugin, Field } from 'millennium';

export default definePlugin(() => {
	console.log('[Kestrel] frontend loaded');
	(window as any).__kestrelLoaded = Date.now();
	return {
		title: 'Kestrel',
		icon: <span />,
		content: <Field label="Kestrel is running" />,
	};
});
