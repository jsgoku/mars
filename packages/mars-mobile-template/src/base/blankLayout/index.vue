<template>
  <!-- blank layout -->
  <transition
    :name="pageTransitionEffect"
    @before-enter="handleBeforeEnter"
    @after-enter="handleAfterEnter"
    @before-leave="handleBeforeLeave">
    <keep-alive
      :include="[...keepAlivePages]">
      <router-view
        :key="routerViewKey"
        :class="['app-view', pageTransitionClass]"
        :data-page-id="$route.fullPath"
      ></router-view>
    </keep-alive>
  </transition>
</template>

<script>
/* eslint no-param-reassign: 0 */
import Vue from 'vue';
import { mapState, mapActions } from 'vuex';
import { keepAlivePages } from '@/router';

const ENABLE_SCROLL_CLASS = 'app-view-scroll-enabled';

export default {
  name: 'blankLayout',
  computed: {
    ...mapState('pageTransition', {
      pageTransitionType: state => state.type,
      pageTransitionEffect: state => state.effect,
    }),
    ...mapState('common', {
      scrollPositionMap: state => state.scrollPositionMap,
    }),
    pageTransitionClass() {
      return `transition-${this.pageTransitionType}`;
    },
    routerViewKey() {
      const { name, params } = this.$route;
      const paramKeys = Object.keys(params);
      if (paramKeys.length) {
        return name + paramKeys.reduce((prev, cur) => prev + params[cur], '');
      }
      return null;
    },
  },
  data() {
    return {
      keepAlivePages,
    };
  },
  methods: {
    ...mapActions('common', [
      'setPageSwitching',
      'savePageScrollPosition',
    ]),
    /**
     * 使当前容器可滚动
     * 存储scroll位置
     */
    restoreContainerScrollPosition(containerEl, scrollTop) {
      containerEl.classList.add(ENABLE_SCROLL_CLASS);
      containerEl.scrollTop = scrollTop;
    },
    /**
     * 使body可滚动
     * 存储body scroll位置
     */
    restoreBodyScrollPosition(containerEl, scrollTop) {
      containerEl.classList.remove(ENABLE_SCROLL_CLASS);
      document.body.scrollTop = scrollTop;
      document.documentElement.scrollTop = scrollTop;
    },
    handleBeforeEnter(el) {
      const pageId = el.dataset.pageId;
      const { y: scrollTop = 0 } = this.scrollPositionMap[pageId] || {};
      this.setPageSwitching(true);
      Vue.nextTick(() => {
        this.restoreContainerScrollPosition(el, scrollTop);
      });
    },
    handleAfterEnter(el) {
      const pageId = el.dataset.pageId;
      const { y: scrollTop = 0 } = this.scrollPositionMap[pageId] || {};
      this.setPageSwitching(false);
      this.restoreBodyScrollPosition(el, scrollTop);
    },
    handleBeforeLeave(el) {
      const pageId = el.dataset.pageId;
      const scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
      this.restoreContainerScrollPosition(el, scrollTop);
      // 存储当前scroll位置到map中
      this.savePageScrollPosition({
        pageId,
        scrollPosition: {
          y: scrollTop,
        },
      });
    },
  },
};
</script>

<style lang="less">
  .app-view {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    -webkit-overflow-scrolling: touch;
    background: white;
    &::-webkit-scrollbar {
      width: 0;
      background: transparent;
    }
    &.transition-slide {
      transition: transform 0.35s cubic-bezier(0, 0, 0.2, 1);
      &.slide-left-enter {
        transform: translate(100%, 0);
      }
      &.slide-left-enter-active {
        box-shadow: 0 0 16px 2px rgba(0, 0, 0, 0.3);
      }
      &.slide-right-enter {
        transform: translate(-30%, 0);
        transition-timing-function: linear;
      }
      &.slide-right-leave-active {
        transform: translate(100%, 0);
        box-shadow: 0 0 16px 2px rgba(0, 0, 0, 0.3);
        z-index: 99;
      }
      &.slide-left-leave-active {
        transform: translate(-30%, 0);
        transition-timing-function: linear;
      }
      &.app-view-scroll-enabled,
      &.slide-left-enter-active,
      &.slide-left-leave-active,
      &.slide-right-enter-active,
      &.slide-right-leave-active {
        overflow-y: auto;
      }
    }
  }
</style>
