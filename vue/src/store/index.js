import { createPinia } from 'pinia'
import { defineStore } from 'pinia'
import { login as userLogin } from '@/api/user'

// 用户状态store
export const useUserStore = defineStore('user', {
  state: () => {
    let userInfo = null
    try {
      const userInfoStr = localStorage.getItem('userInfo')
      if (userInfoStr && userInfoStr !== 'undefined' && userInfoStr !== 'null') {
        userInfo = JSON.parse(userInfoStr)
      }
    } catch (error) {
      console.warn('解析 userInfo 失败，清除本地存储:', error)
      localStorage.removeItem('userInfo')
    }
    
    return {
      userInfo,
      token: localStorage.getItem('token') || ''
    }
  },

  getters: {
    isLoggedIn: (state) => !!state.token,
    userId: (state) => state.userInfo?.userId || state.userInfo?.id,
    username: (state) => state.userInfo?.username,
    realName: (state) => state.userInfo?.realName,
    userType: (state) => state.userInfo?.userType,
    // 根据新API文档，管理员的userType为1
    isAdmin: (state) => state.userInfo?.userType === 1
  },

  actions: {
    // 设置token
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
    },

    // 设置用户信息
    setUserInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    },

    // 登录
    async login(loginForm) {
      const res = await userLogin(loginForm)
      // 根据新API文档，token和用户信息都在res.data中
      const { token, ...userInfo } = res.data
      this.token = token
      this.userInfo = userInfo
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      return res
    },

    // 登出
    logout() {
      this.userInfo = null
      this.token = ''
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
    },

    // 更新用户信息
    updateUserInfo(userInfo) {
      this.userInfo = userInfo
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    }
  }
})

// 应用状态store
export const useAppStore = defineStore('app', {
  state: () => ({
    sidebarCollapsed: false,
    unreadMessageCount: 0
  }),

  actions: {
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    },

    setUnreadMessageCount(count) {
      this.unreadMessageCount = count
    }
  }
})

export default createPinia()
