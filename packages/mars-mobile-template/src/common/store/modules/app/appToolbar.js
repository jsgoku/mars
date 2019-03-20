export const SET_TOOLBAR_SELECTED = 'SET_TOOLBAR_SELECTED';
export const SET_IS_SHOW_TOOLBAR = 'SET_IS_SHOW_TOOLBAR';
export const SET_IS_SHOW_POINT = 'SET_IS_SHOW_POINT';

const appToolbar = {
  namespaced: true,
  state: {
    toolbarSelected: '',
    // 控制是否隐藏
    isShowToolbar: true,
    // 控制菜单上的红点是否隐藏
    isShowPoint: false,
  },
  mutations: {
    [SET_TOOLBAR_SELECTED](state, toolbarSelected) {
      state.toolbarSelected = toolbarSelected;
    },
    [SET_IS_SHOW_TOOLBAR](state, isShowToolbar) {
      state.isShowToolbar = isShowToolbar;
    },
    [SET_IS_SHOW_POINT](state, isShowPoint) {
      state.isShowPoint = isShowPoint;
    },
  },
  actions: {
    setToolbarSelected({ commit }, toolbarSelected) {
      commit(SET_TOOLBAR_SELECTED, toolbarSelected);
    },
    setIsShowToolbar({ commit }, isShowToolbar) {
      commit(SET_IS_SHOW_TOOLBAR, isShowToolbar);
    },
    setIsShowPoint({ commit }, isShowPoint) {
      commit(SET_IS_SHOW_POINT, isShowPoint);
    },
  },
};

export default appToolbar;
