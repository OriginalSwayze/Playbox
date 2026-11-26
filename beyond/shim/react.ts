// 'react' is Steam's own React (window.SP_REACT), as under Millennium.
const R = (window as any).SP_REACT;
export default R;
export const {
	Children, Component, Fragment, PureComponent, StrictMode, Suspense, cloneElement, createContext, createElement, createRef,
	forwardRef, isValidElement, lazy, memo, startTransition, use, useCallback, useContext, useDebugValue, useDeferredValue,
	useEffect, useId, useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo, useReducer, useRef, useState,
	useSyncExternalStore, useTransition,
} = R;
