// JSX compiles to Steam's own JSX runtime (window.SP_JSX_FACTORY).
const J = (window as any).SP_JSX_FACTORY;
export const { Fragment, jsx, jsxs } = J;
export const jsxDEV = J.jsx;
