<template>
  <el-container class="main-layout">
    <!-- 侧边栏 -->
    <el-aside :width="sidebarWidth" class="sidebar">
      <div class="logo">
        <h2 v-if="!appStore.sidebarCollapsed">实验室预约系统</h2>
        <h2 v-else>实验室</h2>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :unique-opened="true"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>工作台</template>
        </el-menu-item>
        
        <el-menu-item index="/users">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>
        
        <el-menu-item index="/laboratories">
          <el-icon><OfficeBuilding /></el-icon>
          <template #title>实验室管理</template>
        </el-menu-item>
        
        <el-sub-menu index="/reservations">
          <template #title>
            <el-icon><Calendar /></el-icon>
            <span>预约管理</span>
          </template>
          <el-menu-item index="/reservations">预约列表</el-menu-item>
          <el-menu-item index="/reservations/approve">
            预约审核
            <el-badge v-if="pendingCount > 0" :value="pendingCount" class="badge" />
          </el-menu-item>
        </el-sub-menu>
        
        <el-menu-item index="/timeslots">
          <el-icon><Clock /></el-icon>
          <template #title>时间段配置</template>
        </el-menu-item>
        
        <el-menu-item index="/messages">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>
            消息管理
            <el-badge v-if="appStore.unreadMessageCount > 0" :value="appStore.unreadMessageCount" class="badge" />
          </template>
        </el-menu-item>
        
        <el-menu-item index="/reports">
          <el-icon><Document /></el-icon>
          <template #title>报表导出</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航栏 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="appStore.toggleSidebar">
            <Fold v-if="!appStore.sidebarCollapsed" />
            <Expand v-else />
          </el-icon>
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userInfo?.avatar">
                {{ userStore.realName?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ userStore.realName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  DataLine,
  User,
  OfficeBuilding,
  Calendar,
  Clock,
  ChatDotRound,
  Document,
  Fold,
  Expand,
  ArrowDown
} from '@element-plus/icons-vue'
import { useUserStore, useAppStore } from '@/store'
import { getPendingReservations } from '@/api/reservation'
import { getUnreadCount } from '@/api/message'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

const pendingCount = ref(0)

const sidebarWidth = computed(() => {
  return appStore.sidebarCollapsed ? '64px' : '200px'
})

const activeMenu = computed(() => {
  return route.path
})

// 获取待审核预约数量
const fetchPendingCount = async () => {
  try {
    const res = await getPendingReservations()
    pendingCount.value = res.data?.length || 0
  } catch (error) {
    console.error('获取待审核数量失败:', error)
  }
}

// 获取未读消息数量
const fetchUnreadMessageCount = async () => {
  try {
    const res = await getUnreadCount(userStore.userId)
    appStore.setUnreadMessageCount(res.data || 0)
  } catch (error) {
    console.error('获取未读消息数量失败:', error)
  }
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人信息功能开发中')
      break
    case 'password':
      ElMessage.info('修改密码功能开发中')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    userStore.logout()
    router.push('/login')
    ElMessage.success('已退出登录')
  }).catch(() => {})
}

onMounted(() => {
  fetchPendingCount()
  fetchUnreadMessageCount()
  
  // 定期刷新数据
  setInterval(() => {
    fetchPendingCount()
    fetchUnreadMessageCount()
  }, 30000) // 每30秒刷新一次
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
  overflow-x: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  margin: 0;
  font-size: 16px;
  white-space: nowrap;
}

.el-menu {
  border-right: none;
  background-color: #304156;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  color: #bfcbd9;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #263445 !important;
  color: #fff;
}

:deep(.el-menu-item.is-active) {
  background-color: #409eff !important;
  color: #fff;
}

.badge {
  margin-left: 8px;
}

.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 12px;
}

.username {
  margin: 0 8px;
  font-size: 14px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
