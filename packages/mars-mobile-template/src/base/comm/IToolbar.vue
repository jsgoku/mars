<template>
  <div class="itoolbar">
    <div class="items">
      <div class="item" :class="{selected: toolbarSelected === 'Blank'}" @touchstart="goRoute('Blank')">
        <i class="iconfont icon-tab_icon_home_sel tab-icon"></i>
        <div>tab1</div>
      </div>
      <div class="item" :class="{selected: toolbarSelected === 'Blank2'}" @touchstart="goRoute('Blank2')">
        <i class="iconfont icon-tab_icon_idea_sel tab-icon"></i>
        <div>tab2</div>
      </div>
      <div class="item" :class="{selected: toolbarSelected === 'Blank3'}" @touchstart="goRoute('Blank3')">
        <i class="iconfont icon-tab_icon_news_nor tab-icon" style="position:relative;"></i>
        <div>tab3</div>
      </div>
      <div class="item" :class="{selected: toolbarSelected === 'Blank4'}" @touchstart="goRoute('Blank4')">
        <i class="iconfont icon-tab_icon_user_sel tab-icon"></i>
        <div>tab4</div>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import API from '../../api/api';

export default {
  props: {
    count: {
      type: Number,
      default: 1,
    },
  },
  watch: {
    $route(val) {
      this.setToolbarSelected(val.name);
    },
  },
  computed: {
    ...mapState('appToolbar', {
      toolbarSelected: state => state.toolbarSelected,
      isShowPoint: state => state.isShowPoint,
    }),
  },
  name: 'itoolbar',
  methods: {
    ...mapActions('appToolbar', [
      'setToolbarSelected',
    ]),
    goRoute(name) {
      this.$router.push({
        name,
      });
    },
  },
};
</script>
<style scoped>
.itoolbar {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: #FAFAFA;
  border-top: 0.5px solid #e0e0e0;
  height: 3.6rem;
  z-index: 1000;
}
.items {
  display: flex;
  margin-top: 0.5rem;
}
.item {
  flex: 1;
  text-align: center;
  font-size: 0.7rem;
  color: #999;
}
.add {
  width: 4.2rem;
  height: 2.6rem;
}
.tab-icon {
  font-size: 1.6rem;
}
.selected {
  color: #29BF6C;
}
.point {
  position: absolute;
  display: block;
  top: 0;
  right: -10px;
  background: red;
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
</style>
