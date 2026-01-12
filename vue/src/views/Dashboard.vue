<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="statistics-row">
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user-icon">
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
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon lab-icon">
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
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon reservation-icon">
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
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending-icon">
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
    
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近预约</span>
              <el-link type="primary" @click="goToReservations">查看更多</el-link>
            </div>
          </template>
          <el-table
            :data="recentReservations"
            style="width: 100%"
            v-loading="loadingReservations"
          >
            <el-table-column prop="userName" label="用户" width="120" />
            <el-table-column prop="labName" label="实验室" />
            <el-table-column prop="reserveDate" label="预约日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getReservationStatusType(row.status)" size="small">
                  {{ getReservationStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>实验室使用情况</span>
            </div>
          </template>
          <el-table
            :data="laboratoryStats"
            style="width: 100%"
            v-loading="loadingLabs"
          >
            <el-table-column prop="labName" label="实验室" />
            <el-table-column prop="capacity" label="容量" width="80" align="center" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getLabStatusType(row.status)" size="small">
                  {{ getLabStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, OfficeBuilding, Calendar, Warning } from '@element-plus/icons-vue'
import { getReservationStatistics, getReservationList } from '@/api/reservation'
import { getLaboratoryList, getLaboratoryStatistics } from '@/api/laboratory'
import { getUserStatistics } from '@/api/user'

const router = useRouter()

const statistics = ref({
  totalUsers: 0,
  totalLaboratories: 0,
  totalReservations: 0,
  pendingApprovals: 0
})

const recentReservations = ref([])
const laboratoryStats = ref([])
const loadingReservations = ref(false)
const loadingLabs = ref(false)

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
  try {
    console.log('=== 开始加载统计数据 ===')
    
    // 加载用户统计
    const userStats = await getUserStatistics()
    console.log('用户统计数据:', userStats)
    statistics.value.totalUsers = userStats.data?.totalCount || 0
    
    // 加载预约统计
    const reservationStats = await getReservationStatistics()
    console.log('预约统计数据:', reservationStats)
    statistics.value.totalReservations = reservationStats.data?.totalCount || 0
    statistics.value.pendingApprovals = reservationStats.data?.pendingCount || 0
    
    // 加载实验室统计
    const labStats = await getLaboratoryStatistics()
    console.log('实验室统计数据:', labStats)
    statistics.value.totalLaboratories = labStats.data?.totalCount || 0
    
    console.log('=== 统计数据加载完成 ===')
    console.log('最终统计值:', statistics.value)
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

const loadRecentReservations = async () => {
  loadingReservations.value = true
  try {
    const res = await getReservationList({
      page: 1,
      pageSize: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    console.log('预约列表响应:', res)
    
    // 根据API文档，预约列表直接返回数组，不是分页对象
    if (Array.isArray(res.data)) {
      recentReservations.value = res.data.slice(0, 5)
    } else if (res.data?.list) {
      recentReservations.value = res.data.list
    } else {
      recentReservations.value = []
    }
    
    console.log('最近预约数据:', recentReservations.value)
  } catch (error) {
    console.error('加载最近预约失败:', error)
    ElMessage.error('加载最近预约失败')
  } finally {
    loadingReservations.value = false
  }
}

const loadLaboratoryStats = async () => {
  loadingLabs.value = true
  try {
    const res = await getLaboratoryList({
      page: 1,
      pageSize: 5
    })
    console.log('实验室列表响应:', res)
    
    // 根据API文档，实验室列表直接返回数组，不是分页对象
    if (Array.isArray(res.data)) {
      laboratoryStats.value = res.data.slice(0, 5)
    } else if (res.data?.list) {
      laboratoryStats.value = res.data.list
    } else {
      laboratoryStats.value = []
    }
    
    console.log('实验室数据:', laboratoryStats.value)
  } catch (error) {
    console.error('加载实验室数据失败:', error)
    ElMessage.error('加载实验室数据失败')
  } finally {
    loadingLabs.value = false
  }
}

const goToReservations = () => {
  router.push('/reservations')
}

onMounted(() => {
  loadStatistics()
  loadRecentReservations()
  loadLaboratoryStats()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.statistics-row {
  margin-bottom: 20px;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  margin-right: 20px;
}

.user-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.lab-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.reservation-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.pending-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.charts-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

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
}
</style>
