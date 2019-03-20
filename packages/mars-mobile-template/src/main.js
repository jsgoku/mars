// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill';
import Vue from 'vue';
/* eslint no-unused-vars: 0 */
import { Toast } from 'cube-ui';
import App from '@/App';
import store from '@/common/store';
import { createRouter } from '@/router';
import util from '@/common/util/util';
import swipe from '@/common/util/swipe';

// 一些各个页面都会用到的建议在此处加载
Vue.prototype.util = util; // demo用到，无需用到可删除
Vue.prototype.swipe = swipe; // 滑动删除
Vue.use(Toast);

Vue.config.productionTip = false;
const router = createRouter();

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');

function zero(s) {
  // 自动补零
  return s < 10 ? `0${s}` : s;
}

const Dateformat = (date, formatter) => {
  let f = formatter || 'yyyy/MM/dd HH:mm:ss';
  const t = {};
  t.yyyy = date.getFullYear();
  t.MM = (zero(date.getMonth() + 1));
  t.dd = zero(date.getDate());
  t.HH = zero(date.getHours());
  t.mm = zero(date.getMinutes());
  t.ss = zero(date.getSeconds());
  ['yyyy', 'MM', 'dd', 'HH', 'mm', 'ss'].forEach((item) => {
    f = f.replace(item, t[item]);
  });
  return f;
};

Vue.filter('timeFilter', (value) => {
  if (!value) return '';
  // 超过1天返回日期，少于60秒返回“刚刚”，其他则返回xxx前
  const now = new Date();
  const v = value.replace(/-/g, '/');
  const t = new Date(v);
  const diff = now - t;
  if (t.getDate() !== now.getDate() || diff > 1000 * 3600 * 24) { // 大于1d
    return Dateformat(t, 'MM-dd');
  } else if (diff > 1000 * 3600 * 1) { // 大于1h
    return Dateformat(t, 'HH:mm');
  } else if (diff > 1000 * 60) { // 大于1minue
    return `${parseInt(diff / 60 / 1000, 10)}分钟前`;
  } else if (diff < 1000 * 60 || diff < 1000) {
    return '刚刚';
  }
  return Dateformat(t, 'MM-dd');
});
