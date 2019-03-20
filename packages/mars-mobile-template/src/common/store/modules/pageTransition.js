const pageTransition = {
  namespaced: true,
  state: {
    enable: true,
    type: 'none',
    effect: 'none',
  },
  mutations: {
    setType(state, type) {
      state.type = type;
    },
    setEffect(state, effect) {
      state.effect = effect;
    },
  },
};

export default pageTransition;
