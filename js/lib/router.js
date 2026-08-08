export function createRouter(routes, { mount, crumbEl }) {
  let currentDestroy = null;

  function renderRoute() {
    const hash = window.location.hash.replace(/^#\/?/, '') || 'home';
    const [id] = hash.split('?');
    const route = routes[id] || routes['home'];

    if (typeof currentDestroy === 'function') { try { currentDestroy(); } catch (e) {} }
    mount.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });

    const result = route.render(mount);
    currentDestroy = result && result.destroy;
    if (crumbEl) crumbEl.textContent = route.crumb || 'Bench overview';
  }

  window.addEventListener('hashchange', renderRoute);
  renderRoute();
  return { go: (id) => { window.location.hash = `#/${id}`; } };
}
