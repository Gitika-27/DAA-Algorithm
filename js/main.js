import { createRouter } from './lib/router.js';
import { renderHome } from './pages/home.js';
import * as exp1 from './pages/exp1.js';
import * as exp2 from './pages/exp2.js';
import * as exp3 from './pages/exp3.js';
import * as exp4 from './pages/exp4.js';
import * as exp5 from './pages/exp5.js';
import * as exp6 from './pages/exp6.js';
import * as exp7 from './pages/exp7.js';
import * as exp8 from './pages/exp8.js';
import * as exp9 from './pages/exp9.js';
import * as exp10 from './pages/exp10.js';
import { EXPERIMENTS } from './meta.js';

const mount = document.getElementById('app');
const crumbEl = document.getElementById('crumb');

const navigate = (id) => { window.location.hash = `#/${id}`; };

const pageModules = { exp1, exp2, exp3, exp4, exp5, exp6, exp7, exp8, exp9, exp10 };

const routes = {
  home: {
    crumb: 'Bench overview',
    render: (m) => { renderHome(m, { navigate }); return {}; }
  }
};

EXPERIMENTS.forEach((exp) => {
  const mod = pageModules[exp.id];
  routes[exp.id] = {
    crumb: `Exp ${exp.num} \u00b7 ${exp.title}`,
    render: (m) => mod.render(m, { navigate })
  };
});

createRouter(routes, { mount, crumbEl });

document.getElementById('homeBtn').addEventListener('click', () => navigate('home'));
