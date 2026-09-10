import React, { createContext, useContext, useState, useEffect } from 'react';

const RouterContext = createContext({
  path: '/',
  navigate: () => {},
});

export function BrowserRouter({ children }) {
  const [path, setPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to, options) => {
    if (typeof window !== 'undefined') {
      if (options?.replace) {
        window.history.replaceState({}, '', to);
      } else {
        window.history.pushState({}, '', to);
      }
      setPath(to);
      window.scrollTo(0, 0);
    }
  };

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  const context = useContext(RouterContext);
  return context.navigate;
}

export function useLocation() {
  const context = useContext(RouterContext);
  return { pathname: context.path };
}

export function Link({ to, children, className = '', onClick, ...props }) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} className={className} {...props}>
      {children}
    </a>
  );
}

const ParamsContext = createContext({});

export function useParams() {
  return useContext(ParamsContext);
}

function matchPath(pattern, currentPath) {
  if (pattern === currentPath || (pattern === '/' && (currentPath === '' || currentPath === '/'))) {
    return { matches: true, params: {} };
  }
  const patternSegments = (pattern || '').split('/').filter(Boolean);
  const pathSegments = (currentPath || '').split('/').filter(Boolean);

  if (patternSegments.length !== pathSegments.length) {
    return { matches: false, params: {} };
  }

  const params = {};
  for (let i = 0; i < patternSegments.length; i++) {
    const pSeg = patternSegments[i];
    const aSeg = pathSegments[i];
    if (pSeg.startsWith(':')) {
      params[pSeg.slice(1)] = decodeURIComponent(aSeg);
    } else if (pSeg !== aSeg) {
      return { matches: false, params: {} };
    }
  }

  return { matches: true, params };
}

export function Routes({ children }) {
  const { path } = useContext(RouterContext);
  let matchedChild = null;
  let matchedParams = {};
  const currentPath = (path || '/').split('#')[0] || '/';

  React.Children.forEach(children, (child) => {
    if (matchedChild || !React.isValidElement(child)) return;

    const { path: routePath, element } = child.props;
    const { matches, params } = matchPath(routePath, currentPath);

    if (matches) {
      matchedChild = element;
      matchedParams = params;
    }
  });

  if (!matchedChild) return null;

  return (
    <ParamsContext.Provider value={matchedParams}>
      {matchedChild}
    </ParamsContext.Provider>
  );
}

export function Route() {
  return null;
}

export function Navigate({ to, replace = true }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, to, replace]);

  return null;
}


