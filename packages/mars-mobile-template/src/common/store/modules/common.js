export const SET_PAGE_SWITCHING = 'SET_PAGE_SWITCHING';
export const SET_PAGE_SCROLL_POSITION = 'SET_PAGE_SCROLL_POSITION';

const common = {
  namespaced: true,
  state: {
    // 多个页面是否处于切换中
    isPageSwitching: false,
    /**
     *  保存页面滚动位置，以`route.fullPath为键
     *  {‘/’: 0, '/detail/1': 100, '/detail/2': 200}
     */
    scrollPositionMap: {},
  },
  mutations: {
    [SET_PAGE_SWITCHING](state, isPageSwitching) {
      state.isPageSwitching = isPageSwitching;
    },
    [SET_PAGE_SCROLL_POSITION](state, { pageId, scrollPosition }) {
      state.scrollPositionMap = {
        ...state.scrollPositionMap,
        [pageId]: scrollPosition,
      };
    },
  },
  actions: {
    /**
     * 设置页面是否处于切换中
     */
    setPageSwitching({ commit }, isPageSwitching) {
      commit(SET_PAGE_SWITCHING, isPageSwitching);
    },
    /**
     * 保存页面滚动位置
     */
    savePageScrollPosition({ commit }, { pageId, scrollPosition }) {
      commit(SET_PAGE_SCROLL_POSITION, { pageId, scrollPosition });
    },
  },
};

export default common;
