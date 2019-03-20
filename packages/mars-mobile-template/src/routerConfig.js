// 以下文件格式为描述路由的协议格式
// 你可以调整 routerConfig 里的内容
// 变量名 routerConfig 为 iceworks 检测关键字，请不要修改名称
import HeaderAsideLayout from '@/base/blankLayout';

const Blank = () =>
  import(/* webpackChunkName: "group-first" */ '@/pages/blank');

// 配置中的layout不用理会，iceworks会自动生成，但项目中并不需要使用
// meta为自己添加，需要用到keepAlive设置为true，
// parent为自己添加，设置对应的父级路由
// routerLevel为自己添加，设置对应的路由层级信息
const routerConfig = [
  {
    path: '/blank',
    layout: HeaderAsideLayout,
    component: Blank,
    meta: {
      keepAlive: true,
    },
    routerLevel: 1,
  },
];

export default routerConfig;
