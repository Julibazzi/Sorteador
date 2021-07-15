import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

import firebase from 'firebase';
import Home from '../views/Home.vue';
import About from '../views/About.vue';
import Maps from '../views/Maps.vue';
import Players from '../views/Players.vue';
import Sweepstakes from '../views/Sweepstakes.vue';
import SweepstakeNew from '../views/SweepstakeNew.vue';
import Login from '../views/Login.vue';
import EmailConfirmation from '../views/EmailConfirmation.vue';
import Profile from '../views/Profile.vue';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Início',
    component: Home,
  },
  {
    path: '/players',
    name: 'Jogadores',
    component: Players,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/maps',
    name: 'Mapas',
    component: Maps,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/sweepstakes',
    name: 'Sorteios',
    component: Sweepstakes,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/sweepstakes/new',
    name: 'Novo Sorteio',
    component: SweepstakeNew,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/sweepstakes/:id',
    name: 'Sorteio nº',
    component: SweepstakeNew,
    props: true,
  },
  {
    path: '/about',
    name: 'Sobre',
    component: About,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/emailConfirmation',
    name: 'Confirmação de E-mail',
    component: EmailConfirmation,
    meta: {
      emailConfirmation: true,
    },
  },
  {
    path: '/profile',
    name: 'Meu Perfil',
    component: Profile,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.beforeEach((to, from, next) => {
  let documentTitle = to.path === '/' ? `${process.env.VUE_APP_TITLE}` : `${to.name} - ${process.env.VUE_APP_TITLE}`;
  if (to.params.title) {
    documentTitle = `${to.params.title} - ${documentTitle}`;
  }
  document.title = documentTitle;

  const requiresAuth = to.matched.some((page) => page.meta.requiresAuth);
  const user = firebase.auth().currentUser;

  if (requiresAuth && !user) {
    next('/login');
  }

  if (user && !user.emailVerified) {
    const emailConfirmation = to.matched.some((page) => page.meta.emailConfirmation);
    if (!emailConfirmation) {
      next('/emailConfirmation');
    }
  }

  next();
});

export default router;
