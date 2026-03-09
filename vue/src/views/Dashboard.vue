<template>
  <div class="dashboard-container">
    <!-- 统计卡片行 -->
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card gradient-purple">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalUsers }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card gradient-pink">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><OfficeBuilding /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalLaboratories }}</div>
              <div class="stat-label">实验室总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card gradient-blue">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.totalReservations }}</div>
              <div class="stat-label">预约总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card gradient-orange">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ statistics.pendingApprovals }}</div>
              <div class="stat-label">待审核预约</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <!-- 可视化图表区域 -->
    <div class="charts-section" v-loading="loading">
      <DashboardCharts ref="chartsRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, OfficeBuilding, Calendar, Warning } from '@element-plus/icons-vue'
import { getDashboardData } from '@/api/dashboard'
import DashboardCharts from '@/components/DashboardCharts.vue'

const router = useRouter()
const chartsRef = ref(null)
const loading = ref(false)

const statistics = ref({
  totalUsers: 0,
  totalLaboratories: 0,
  totalReservations: 0,
  pendingApprovals: 0
})

// 预约状态处理函数
const getReservationStatusType = (status) => {
  // status: 0-待审核, 1-已通过, 2-已拒绝, 3-已取消, 4-已完成
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger',
    3: 'info',
    4: ''
  }
  return typeMap[status] || 'info'
}

const getReservationStatusText = (status) => {
  // status: 0-待审核, 1-已通过, 2-已拒绝, 3-已取消, 4-已完成
  const textMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝',
    3: '已取消',
    4: '已完成'
  }
  return textMap[status] || '未知'
}

// 实验室状态处理函数
const getLabStatusType = (status) => {
  // status: 0-维护中, 1-可用, 2-停用
  const typeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return typeMap[status] || 'info'
}

const getLabStatusText = (status) => {
  // status: 0-维护中, 1-可用, 2-停用
  const textMap = {
    0: '维护中',
    1: '可用',
    2: '停用'
  }
  return textMap[status] || '未知'
}

const loadStatistics = async () => {
  loading.value = true
  try {
    console.log('=== 开始加载统计数据 ===')
    
    // 使用数据大屏专用接口一次性获取所有数据
    const dashboardData = await getDashboardData()
    const data = dashboardData.data
    
    if (data) {
      // 核心指标
      const metrics = data.coreMetrics || {}
      statistics.value.totalUsers = metrics.totalUsers || 0
      statistics.value.totalLaboratories = metrics.totalLaboratories || 0
      statistics.value.totalReservations = metrics.totalReservations || 0
      statistics.value.pendingApprovals = metrics.pendingApprovals || 0
    }
    
    console.log('=== 统计数据加载完成 ===')
    console.log('最终统计值:', statistics.value)
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
}

// 不再需要这些函数，数据直接从 dashboard 接口获取
// const loadRecentReservations = async () => {}
// const loadLaboratoryStats = async () => {}

const goToReservations = () => {
  router.push('/reservations')
}

onMounted(() => {
  loadStatistics()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: calc(100vh - 80px);
}

.statistics-row {
  margin-bottom: 30px;
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  overflow: hidden;
  position: relative;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  z-index: 1;
  pointer-events: none;
}

/* 渐变背景 */
.gradient-purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-pink {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.gradient-blue {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.gradient-orange {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-content {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
}

.stat-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  margin-right: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: white;
  line-height: 1;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.charts-section {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

/* 卡片头部样式 */
:deep(.el-card__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: none;
  padding: 16px 20px;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 10px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 24px;
    margin-right: 15px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .charts-section {
    padding: 10px;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeInUp 0.6s ease-out both;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }
</style>
