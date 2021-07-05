import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import App from './App.vue';
import router from './router';
import store from './store';
import firebase from './services/firebaseConnection';
import AppError from './errors/AppError';

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

Vue.config.productionTip = false;

Vue.config.errorHandler = (err: Error, vm: Vue, info: string) => {
  if (err instanceof AppError) {
    vm.$bvToast.toast(err.message, {
      title: err.title,
      variant: err.variant,
      solid: true,
    });
    return;
  }

  vm.$bvToast.toast(`${info}: ${err.message}`, {
    title: 'Ocorreu um erro',
    variant: 'danger',
    solid: true,
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let app: any;

firebase.auth().onAuthStateChanged(() => {
  if (!app) {
    app = new Vue({
      router,
      store,
      render: (h) => h(App),
    }).$mount('#app');
  }
});
