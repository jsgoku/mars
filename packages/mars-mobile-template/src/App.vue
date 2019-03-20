<template>
  <div id="app">
    <blank-layout></blank-layout>
    <!-- <keep-alive>
      <i-toolbar v-show="isShowToolbar"></i-toolbar>
    </keep-alive> -->
  </div>
</template>

<script>
import { mapState } from 'vuex';
// import IToolbar from '@/base/comm/IToolbar';
import blankLayout from '@/base/blankLayout';

export default {
  name: 'App',
  computed: {
    ...mapState('appToolbar', {
      isShowToolbar: state => state.isShowToolbar,
    }),
  },
  components: {
    // 'i-toolbar': IToolbar,
    blankLayout,
  },
};
</script>

<style>
#app {
  font-family: Microsoft Yahei;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
}
/* 布局容器start */
.container {
  position: absolute;
  right: 0;
  left: 0;
  height: 100%;
  top: 0;
  bottom: 0;
  padding-top: 3.6rem;
  overflow-y: auto;
  background: #F1F5F7;
  padding-bottom: 52px;
  -webkit-overflow-scrolling : touch;
}
/* 布局容器end */

/* 路由动画start */
.router-slid-enter-active, .router-slid-leave-active {
  transition: all .4s;
}
.router-slid-enter, .router-slid-leave-active {
  transform: translate3d(2rem, 0, 0);
  opacity: 0;
}
/* 路由动画end */

/* 公共样式start */
.fl {
  float: left;
}
.fr {
  float: right;
}
.clear {
  clear: both;
}
/* 公共样式end */

/*-- 滑动删除样式start */
.swipe-list{
  overflow:hidden;
}
.swipe-list li {
  overflow:hidden;
  width:145%;
}
.swipe-list li a {
  display:flex;
  -webkit-transition:all 0.3s;
  transition:all 0.3s;
}
.swipe-list li .swipe-operate {
  width:30%;
  text-align:center;
  color:#fff;
  background: rgb(242, 135, 113);
  color: rgb(255, 255, 255);
  position: relative;
}
.swipe-list li .swipe-operate i {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%)
}
.swipeleft{
  transform:translateX(-30%);
}
/* 滑动删除样式end */
</style>
