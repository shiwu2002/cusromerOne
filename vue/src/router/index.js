import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', noAuth: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '工作台', icon: 'DataLine' }
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'laboratories',
        name: 'LaboratoryManagement',
        component: () => import('@/views/LaboratoryManagement.vue'),
        meta: { title: '实验室管理', icon: 'OfficeBuilding' }
      },
      {
        path: 'reservations',
        name: 'ReservationManagement',
        component: () => import('@/views/ReservationManagement.vue'),
        meta: { title: '预约管理', icon: 'Calendar' }
      },
      {
        path: 'reservations/approve',
        name: 'ReservationApproval',
        component: () => import('@/views/ReservationApproval.vue'),
        meta: { title: '预约审核', icon: 'DocumentChecked' }
      },
      {
        path: 'timeslots',
        name: 'TimeslotManagement',
        component: () => import('@/views/TimeslotManagement.vue'),
        meta: { title: '时间段配置', icon: 'Clock' }
      },
      {
        path: 'messages',
        name: 'MessageManagement',
        component: () => import('@/views/MessageManagement.vue'),
        meta: { title: '消息管理', icon: 'ChatDotRound' }
      },
      {
        path: 'reports',
        name: 'ReportManagement',
        component: () => import('@/views/ReportManagement.vue'),
        meta: { title: '报表导出', icon: 'Document' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 实验室预约管理系统` : '实验室预约管理系统'
  
  // 不需要认证的页面直接放行
  if (to.meta.noAuth) {
    next()
    return
  }
  
  // 检查是否登录
  if (!userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  next()
})

export default router
