import Vue from 'vue';
import { Toast } from 'cube-ui';
import Router from 'vue-router';
import routerConfig from './routerConfig';
import { asideMenuConfig } from './menuConfig';

Vue.use(Router);
Vue.use(Toast);

const vm = new Vue();
const toast = vm.$createToast({
  txt: '',
  mask: true,
});

// 默认路由
const defaultRoutes = [
  {
    path: '/',
    redirect: '/blank',
    meta: {
      keepAlive: false,
    },
  },
];

// 注：路由配置中name必须填，在底部菜单中会通过router.name来处理默认选中
// const routes = [
//   {
//     path: '/',
//     redirect: '/blank',
//     meta: {
//       keepAlive: false,
//     },
//   },
//   {
//     path: '/blank',
//     component: Blank,
//     name: 'Blank',
//     meta: {
//       keepAlive: true, // 首页等第一翻页的页面可以设置keepalive，使得切换页面更加快速，当使用keepalive后，页面切换需要记得使用activated
//     },
//     children: [],
//   },
// ];

const createRouterMap = [];
// 用来快速寻找父级节点的临时对象
// fastFindParentNode[0] 一级路由
// fastFindParentNode[1] 二级路由
// fastFindParentNode[2] 三级路由
// ... 以此类推
// 数组中对象的键-->子级，值-->父级
// 如：
// fastFindParentNode: [
//   {
//     '/home': 'root',
//     '/me': 'root',
//     '/innovation-list': 'root',
//   },
//   {
//     '/innovation-detail': '/innovation-list',
//   },
// ];
const fastFindParentNode = [];
/**
 * 快速插入routes节点
 * @param {Object} routes
 * @param {String} routerLevel 要插入的层级(层级大于2会调用该方法)
 * @param {String} parentPath 准备插入的路由的父级路由
 * @param {Object} readyRouter 准备插入的配置信息
 */
function InsertRouteNode(routerLevel, parentPath, readyRouter) {
  const ROOT = 'root';
  // 用来while循环的fastFindParentNode的数组下标
  let routerLevelForWhile = routerLevel - 1;
  let pathForWhile = parentPath;
  // 每级name值对应数组，第一个值为最后一级name，第二个值为倒数第二级name，存储的为倒序
  const parentNode = [];
  // 将准备插入的路由的父节点path插入到parentNode数组
  parentNode.push(pathForWhile);
  // 将准备插入的路由的子父节点path关系存入fastFindParentNode数组中
  if (!fastFindParentNode[routerLevelForWhile]) fastFindParentNode[routerLevelForWhile] = {};
  fastFindParentNode[routerLevelForWhile][`/${readyRouter.path}`] = readyRouter;
  while (routerLevelForWhile > 0) {
    // 需要过滤掉root值，root只是假设的顶级路由
    if (fastFindParentNode[routerLevelForWhile - 1][pathForWhile] !== ROOT) {
      parentNode.push(fastFindParentNode[routerLevelForWhile - 1][pathForWhile]);
    }
    pathForWhile = fastFindParentNode[routerLevelForWhile - 1][pathForWhile];
    routerLevelForWhile -= 1;
  }
  // 倒序parentNode，因为生成的数组是从子节点往父节点递归遍历
  parentNode.reverse();
  // 记录祖先节点的层级数
  let parentLength = parentNode.length;
  // 用临时变量缓存祖先节点信息
  let tmp = createRouterMap;
  /* eslint no-loop-func: 0 */
  // 通过while遍历parentLength获取正序的数组下标
  while (parentLength > 0) {
    tmp = tmp.find(r => r.path === parentNode[parentLength - 1]);
    tmp.children = tmp.children || [];
    tmp = tmp.children;
    parentLength -= 1;
  }
  tmp.push(readyRouter);
}
/**
 * 创建路由对象
 * @param {Object} router对象
 * @param {Object} menu对象
 * @return {Object} 返回组合而成的路由对象
 */
function createRouteConfig(router, menu) {
  const { path, component, meta, parentPath, routerLevel } = router;
  const { name } = menu;
  const routeConfig = {
    path: parentPath ? path.slice(1) : path,
    name,
    component,
    meta,
    // children: [],
  };
  if (parentPath) {
    // 如何获取父级的父级信息？
    InsertRouteNode(routerLevel, parentPath, routeConfig);
  } else {
    createRouterMap.push(routeConfig);
    if (!fastFindParentNode[0]) fastFindParentNode[0] = {};
    fastFindParentNode[0][path] = 'root';
  }
}

// 对路由配置信息根据routerLevel从低级到高级排序
routerConfig.sort((first, second) => first.routerLevel - second.routerLevel);

routerConfig.forEach((router) => {
  createRouteConfig(router, asideMenuConfig.find(menu => menu.path === router.path));
});

const routes = defaultRoutes.concat(createRouterMap);

// scrollBehavior只在支持history.pushState的浏览器中可用
const scrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    return savedPosition;
  }
  const position = {};
  // 滚动到锚点
  if (to.hash) {
    position.selector = to.hash;
  }
  // 判断route配置中meta是否有scrollToTop选项
  if (to.matched.some(m => m.meta.scrollToTop)) {
    position.x = 0;
    position.y = 0;
  }
  // 如果返回position是falsy或者空对象，不会发生滚动
  return position;
};

let timer = null;
const routerMark = {};

// 判断是否支持history参数
const supportHistory = window.history && 'state' in history;

// to 如果在列表中，始终采用从左向右的滑动效果，首页比较适合用这种方式
const ALWAYS_BACK_PAGE = ['index'];

// to 如果在列表中，始终采用从右向左的滑动效果
const ALWAYS_FORWARD_PAGE = [];

// to 如果在列表中，始终不采用滑动效果
const ALWAYS_NONE_ANIMATE_PAGE = ['Blank'];

// 使用path array记录访问过的页面
let HISTORY_STACK = [];

// 使用history API记录的state数组
let HISTORY_STATE_STACK = [];

// 用于存储历史记录到localhistory的key
const MARS_HISTORY_ARRAY_STACK_LOCAL_KEY = 'MARS_HISTORY_ARRAY_STACK_LOCAL_KEY';

// 用于存储历史state记录到localhistory的key
const MARS_HISTORY_STATE_STACK_LOCAL_KEY = 'MARS_HISTORY_STATE_STACK_LOCAL_KEY';

/**
 * 获取所有keep-alive router
 */
let KEEP_ALIVE_PAGES = [];
function getKeepAlivePages(routesArr) {
  KEEP_ALIVE_PAGES = KEEP_ALIVE_PAGES.concat(routesArr.filter((route) => {
    if (route.keepAlive) return true;
    if (route.meta && route.meta.keepAlive) return true;
    return false;
  }).map(route => route.name));
  routesArr.filter(route => route.children).forEach(route => getKeepAlivePages(route.children));
}
getKeepAlivePages(routes);
export const keepAlivePages = KEEP_ALIVE_PAGES;

/**
 * 返回history的state key
 */
function getHistoryStateKey() {
  return history.state ? history.state.key : '';
}
/**
 * 存储数据到本地
 */
function saveHistoryToLocal(key, data) {
  try {
    localStorage.setItem(key, typeof data === 'object' ? JSON.stringify(data) : data);
  } catch (err) {
    localStorage.setItem(key, '');
  }
}
/**
 * 初始化history state
 */
function initHistoryStateStack() {
  // 如果当前tab有历史条目，那么应该吧之前存储的state list读取
  if (history.length > 1) {
    try {
      const historyState = JSON.parse(localStorage.getItem(MARS_HISTORY_STATE_STACK_LOCAL_KEY));
      if (historyState && historyState.length) {
        // 为了有效控制localStorage大小，每次读取时应只读取当前tab历史条目长度 大于历史条目长度之前的记录都是过期的state，无需读取
        HISTORY_STATE_STACK = historyState.slice(-history.length);
      }
    } catch (err) {
      HISTORY_STATE_STACK = [];
    }
  }

  setTimeout(() => {
    // 首次访问的页面也要加入列表中，但要注意如果当前页面访问（刷新）则应该替换
    if (HISTORY_STATE_STACK.length) {
      HISTORY_STATE_STACK[HISTORY_STATE_STACK.length - 1] = getHistoryStateKey();
    } else {
      HISTORY_STATE_STACK.push(getHistoryStateKey());
    }
  }, 300);
}
/**
 * 初始化 history array
 */
function initHistoryArrayStack(routerBase) {
  const firstPageFullPath = location.href.replace(location.origin + routerBase, '/');

  try {
    // 如果localStorage中有历史访问记录，且最新一条和当前访问的是同一个页面
    // 应该把之前的记录也加进来，主要解决在访问过程中刷新导致history列表丢失的问题
    const historyStack = JSON.parse(localStorage.getItem(MARS_HISTORY_ARRAY_STACK_LOCAL_KEY));
    if (historyStack && historyStack.length && historyStack[historyStack.length - 1] === firstPageFullPath) {
      HISTORY_STACK = historyStack;
    }
  } catch (err) {
    HISTORY_STACK = [];
  }

  // 首次访问的页面也要加入到列表中
  setTimeout(() => {
    // 首次访问的页面也要加入列表中，但要注意如果当前页面访问（刷新）则应该替换
    if (HISTORY_STACK.length) {
      HISTORY_STACK[HISTORY_STACK.length - 1] = firstPageFullPath;
    } else {
      HISTORY_STACK.push(firstPageFullPath);
    }
  }, 300);
}
/**
 * 用path记录判断当前是否是前进，true是前进，false是回退
 * @param {Object} to 目标 route
 * @param {Object} from 源 route
 * @return {boolean} 是否表示返回
 */
function isForwardByArray(to) {
  // 根据fullpath判断当前页面是否访问过，如果访问过，则输入回退
  const index = HISTORY_STACK.indexOf(to.fullPath);
  if (index !== HISTORY_STACK.length - 1 && index !== -1) {
    HISTORY_STACK.length = index + 1;
    return false;
  }

  return true;
}
/**
 * 用history state判断当前是否是前进，true是前进，false回退
 * @return {boolean} 是否表示返回
 */
function isForwardByHistory() {
  // 如果访问的页面state和之前访问过的页面相同，则属于回退
  const index = HISTORY_STATE_STACK.indexOf(getHistoryStateKey());

  if (index !== HISTORY_STATE_STACK.length - 1 && index !== -1) {
    HISTORY_STATE_STACK.length = index + 1;
    return false;
  }

  return true;
}
/**
 * 判断当前路由跳转是前进还是回退，true是前进，false回退
 * @param {Object} to 目标是route
 * @param {Object} from 源是route
 * @return {boolean} 是否表示返回
 */
function isForward(to) {
  let res = true;
  // 使用history判断
  if (supportHistory) {
    res = isForwardByHistory();
    setTimeout(() => {
      // 存储到localStorage
      // 如果页面没访问过则把state加进来
      const pageKey = getHistoryStateKey();
      const index = HISTORY_STATE_STACK.indexOf(pageKey);
      if (res && index === -1) {
        HISTORY_STATE_STACK.push(pageKey);
      }
      saveHistoryToLocal(MARS_HISTORY_STATE_STACK_LOCAL_KEY, HISTORY_STATE_STACK);
    }, 300);
  } else {
    // 使用array判断
    res = isForwardByArray(to);

    if (res) {
      // 将to.fullPath加到栈顶
      HISTORY_STACK.push(to.fullPath);
    }
    saveHistoryToLocal(MARS_HISTORY_ARRAY_STACK_LOCAL_KEY, HISTORY_STACK);
  }
  // 强行更改方向 若to.name在ALWAYS_BACK_PAGE列表中，始终认为是后退
  if (to.name && ALWAYS_BACK_PAGE.indexOf(to.name) !== -1) {
    res = false;
  }
  // 如果在ALWAYS_FORWARD_PAGE列表中，始终认为是前进
  if (to.name && ALWAYS_FORWARD_PAGE.indexOf(to.name) !== -1) {
    res = true;
  }

  return res;
}

export function createRouter() {
  const router = new Router({
    // mode: 'history',
    base: '/',
    scrollBehavior,
    routes,
  });

  if (supportHistory) {
    initHistoryStateStack();
  } else {
    initHistoryArrayStack(router.options.base);
  }

  router.beforeEach((to, from, next) => {
    if (!routerMark[to.path]) { // 以此判断异步加载的组件是否加载过
      routerMark[to.path] = true;
      toast.show();
      timer = setTimeout(() => {
        routerMark[to.path] = false;
        toast.hide();
      }, 15 * 1000);
    }
    if (router.app.$store) {
      if (router.app.$store.state.pageTransition.enable) {
        let effect = isForward(to, from) ? 'slide-left' : 'slide-right';
        if (to.name && ALWAYS_NONE_ANIMATE_PAGE.indexOf(to.name) !== -1 && from.name && ALWAYS_NONE_ANIMATE_PAGE.indexOf(from.name) !== -1) {
          effect = 'none';
        }
        router.app.$store.commit('pageTransition/setType', 'slide');
        router.app.$store.commit('pageTransition/setEffect', effect);
      }
    }
    setTimeout(() => { // 有些ios系统版本拦截时会出现不跳转的情况，故此加setTimeout
      next();
    }, 10);
  });

  router.afterEach(() => {
    clearTimeout(timer);
    toast.hide();
    timer = null;
  });

  return router;
}
