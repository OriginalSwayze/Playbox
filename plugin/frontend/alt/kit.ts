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
