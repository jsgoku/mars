import Vue from 'vue';
import Vuex from 'vuex';
import pageTransition from './modules/pageTransition';
import common from './modules/common';
import appToolbar from './modules/app/appToolbar';
import getters from './getters';

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    pageTransition,
    common,
    appToolbar,
  },
  getters,
});

export default store;
