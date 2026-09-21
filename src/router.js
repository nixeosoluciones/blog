const routes = {};
let currentRoute = null;
let notFoundHandler = null;

export function addRoute(path, handler) {
  routes[path] = handler;
}

export function setNotFound(handler) {
  notFoundHandler = handler;
}

function matchRoute(path) {
  for (const pattern of Object.keys(routes)) {
    const regex = patternToRegex(pattern);
    const match = path.match(regex);
    if (match) {
      return { handler: routes[pattern], params: match.groups || {} };
    }
  }
  return null;
}

function patternToRegex(pattern) {
  const regexStr = '^' + pattern.replace(/:([^/]+)/g, '(?<$1>[^/]+)') + '$';
  return new RegExp(regexStr);
}

export function navigate(path) {
  if (path === window.location.pathname + window.location.hash) return;
  history.pushState(null, '', path);
  handleRoute();
}

export function handleRoute() {
  const path = window.location.pathname;
  const result = matchRoute(path);
  if (result) {
    currentRoute = result;
    result.handler(result.params);
  } else if (notFoundHandler) {
    notFoundHandler();
  }
}

export function initRouter() {
  window.addEventListener('popstate', handleRoute);
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return;
    e.preventDefault();
    navigate(href);
  });
  handleRoute();
}

export function getCurrentParams() {
  return currentRoute ? currentRoute.params : {};
}
