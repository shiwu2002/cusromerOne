<template>
  <div class="report-management-container">
    <el-row :gutter="20">
      <!-- 预约报表导出 -->
      <el-col :span="12">
        <el-card class="report-card">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>预约报表导出</span>
            </div>
          </template>

          <el-form :model="reservationForm" label-width="100px">
            <el-form-item label="日期范围">
              <el-date-picker
                v-model="reservationForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="实验室">
              <el-select 
                v-model="reservationForm.laboratoryId" 
                placeholder="请选择实验室（可选）"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="lab in laboratories"
                  :key="lab.id"
                  :label="lab.name"
                  :value="lab.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="预约状态">
              <el-select 
                v-model="reservationForm.status" 
                placeholder="请选择状态（可选）"
                clearable
                style="width: 100%"
              >
                <el-option label="待审核" value="pending" />
                <el-option label="已批准" value="approved" />
                <el-option label="已拒绝" value="rejected" />
                <el-option label="已取消" value="cancelled" />
                <el-option label="已完成" value="completed" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户名">
              <el-input 
                v-model="reservationForm.username" 
                placeholder="请输入用户名（可选）"
                clearable
              />
            </el-form-item>
            <el-form-item label="导出格式">
              <el-radio-group v-model="reservationForm.format">
                <el-radio value="excel">Excel</el-radio>
                <el-radio value="csv">CSV</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button 
                type="primary" 
                @click="handleExportReservations"
                :loading="exportingReservations"
                style="width: 100%"
              >
                <el-icon><Download /></el-icon>
                导出预约报表
              </el-button>
            </el-form-item>
          </el-form>

          <el-alert
            title="说明"
            type="info"
            :closable="false"
            style="margin-top: 20px"
          >
            <template #default>
              <p>导出的预约报表包含以下信息：</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>预约ID、用户信息</li>
                <li>实验室名称、预约日期和时间</li>
                <li>预约目的、状态</li>
                <li>审核信息（审核人、审核时间、拒绝原因）</li>
                <li>创建和更新时间</li>
              </ul>
            </template>
          </el-alert>
        </el-card>
      </el-col>

      <!-- 统计报表导出 -->
      <el-col :span="12">
        <el-card class="report-card">
          <template #header>
            <div class="card-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>统计报表导出</span>
            </div>
          </template>

          <el-form :model="statisticsForm" label-width="100px">
            <el-form-item label="统计维度">
              <el-radio-group v-model="statisticsForm.dimension">
                <el-radio value="laboratory">按实验室</el-radio>
                <el-radio value="user">按用户</el-radio>
                <el-radio value="date">按日期</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="日期范围">
              <el-date-picker
                v-model="statisticsForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="实验室" v-if="statisticsForm.dimension === 'laboratory'">
              <el-select 
                v-model="statisticsForm.laboratoryId" 
                placeholder="请选择实验室（可选）"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="lab in laboratories"
                  :key="lab.id"
                  :label="lab.name"
                  :value="lab.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="用户" v-if="statisticsForm.dimension === 'user'">
              <el-select 
                v-model="statisticsForm.userId" 
                placeholder="请选择用户（可选）"
                clearable
                filterable
                style="width: 100%"
              >
                <el-option
                  v-for="user in users"
                  :key="user.id"
                  :label="`${user.username} (${user.email})`"
                  :value="user.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="导出格式">
              <el-radio-group v-model="statisticsForm.format">
                <el-radio value="excel">Excel</el-radio>
                <el-radio value="csv">CSV</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button 
                type="success" 
                @click="handleExportStatistics"
                :loading="exportingStatistics"
                style="width: 100%"
              >
                <el-icon><Download /></el-icon>
                导出统计报表
              </el-button>
            </el-form-item>
          </el-form>

          <el-alert
            title="说明"
            type="info"
            :closable="false"
            style="margin-top: 20px"
          >
            <template #default>
              <p>导出的统计报表包含以下信息：</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li><strong>按实验室：</strong>各实验室的预约数量、使用率、热门时段等</li>
                <li><strong>按用户：</strong>各用户的预约次数、使用时长、预约状态分布等</li>
                <li><strong>按日期：</strong>每日预约趋势、高峰时段、预约成功率等</li>
              </ul>
            </template>
          </el-alert>
        </el-card>
      </el-col>
    </el-row>

    <!-- 导出历史记录 -->
    <el-card class="history-card">
      <template #header>
        <div class="card-header">
          <span>导出历史记录</span>
          <el-button 
            type="primary" 
            size="small"
            @click="loadExportHistory"
          >
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table :data="exportHistory" v-loading="loadingHistory" stripe>
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="报表类型" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'reservation' ? 'primary' : 'success'">
              {{ scope.row.type === 'reservation' ? '预约报表' : '统计报表' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="filename" label="文件名" show-overflow-tooltip />
        <el-table-column prop="format" label="格式" width="80">
          <template #default="scope">
            <el-tag size="small">{{ scope.row.format.toUpperCase() }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="export_time" label="导出时间" width="180" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === 'success' ? 'success' : 'danger'"
              size="small"
            >
              {{ scope.row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Document, 
  DataAnalysis, 
  Download, 
  Refresh 
} from '@element-plus/icons-vue'
import { exportReservations, exportStatistics } from '@/api/report'
import { getLaboratoryList } from '@/api/laboratory'
import { getUserList } from '@/api/user'
import { useUserStore } from '@/store'

const userStore = useUserStore()

// 实验室和用户列表
const laboratories = ref([])
const users = ref([])

// 预约报表表单
const reservationForm = reactive({
  dateRange: null,
  laboratoryId: null,
  status: '',
  username: '',
  format: 'excel'
})

// 统计报表表单
const statisticsForm = reactive({
  dimension: 'laboratory',
  dateRange: null,
  laboratoryId: null,
  userId: null,
  format: 'excel'
})

// 导出状态
const exportingReservations = ref(false)
const exportingStatistics = ref(false)

// 导出历史
const exportHistory = ref([])
const loadingHistory = ref(false)

// 加载实验室列表
const loadLaboratories = async () => {
  try {
    const res = await getLaboratoryList({ page: 1, page_size: 1000 })
    laboratories.value = res.data.laboratories
  } catch (error) {
    ElMessage.error(error.message || '获取实验室列表失败')
  }
}

// 加载用户列表
const loadUsers = async () => {
  try {
    const res = await getUserList({ page: 1, page_size: 1000 })
    users.value = res.data.users
  } catch (error) {
    ElMessage.error(error.message || '获取用户列表失败')
  }
}

// 下载文件
const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

// 导出预约报表
const handleExportReservations = async () => {
  if (!reservationForm.dateRange || reservationForm.dateRange.length !== 2) {
    ElMessage.warning('请选择日期范围')
    return
  }

  exportingReservations.value = true
  try {
    const params = {
      start_date: reservationForm.dateRange[0],
      end_date: reservationForm.dateRange[1],
      laboratory_id: reservationForm.laboratoryId || undefined,
      status: reservationForm.status || undefined,
      username: reservationForm.username || undefined,
      format: reservationForm.format
    }

    const blob = await exportReservations(params)
    const filename = `预约报表_${reservationForm.dateRange[0]}_${reservationForm.dateRange[1]}.${reservationForm.format === 'excel' ? 'xlsx' : 'csv'}`
    downloadFile(blob, filename)
    
    ElMessage.success('预约报表导出成功')
    
    // 添加到导出历史（模拟数据）
    exportHistory.value.unshift({
      id: Date.now(),
      type: 'reservation',
      filename,
      format: reservationForm.format,
      export_time: new Date().toLocaleString('zh-CN'),
      operator: userStore.userInfo.username,
      status: 'success'
    })
  } catch (error) {
    ElMessage.error(error.message || '导出预约报表失败')
  } finally {
    exportingReservations.value = false
  }
}

// 导出统计报表
const handleExportStatistics = async () => {
  if (!statisticsForm.dateRange || statisticsForm.dateRange.length !== 2) {
    ElMessage.warning('请选择日期范围')
    return
  }

  exportingStatistics.value = true
  try {
    const params = {
      dimension: statisticsForm.dimension,
      start_date: statisticsForm.dateRange[0],
      end_date: statisticsForm.dateRange[1],
      format: statisticsForm.format
    }

    if (statisticsForm.dimension === 'laboratory' && statisticsForm.laboratoryId) {
      params.laboratory_id = statisticsForm.laboratoryId
    }
    if (statisticsForm.dimension === 'user' && statisticsForm.userId) {
      params.user_id = statisticsForm.userId
    }

    const blob = await exportStatistics(params)
    const filename = `统计报表_${statisticsForm.dimension}_${statisticsForm.dateRange[0]}_${statisticsForm.dateRange[1]}.${statisticsForm.format === 'excel' ? 'xlsx' : 'csv'}`
    downloadFile(blob, filename)
    
    ElMessage.success('统计报表导出成功')
    
    // 添加到导出历史（模拟数据）
    exportHistory.value.unshift({
      id: Date.now(),
      type: 'statistics',
      filename,
      format: statisticsForm.format,
      export_time: new Date().toLocaleString('zh-CN'),
      operator: userStore.userInfo.username,
      status: 'success'
    })
  } catch (error) {
    ElMessage.error(error.message || '导出统计报表失败')
  } finally {
    exportingStatistics.value = false
  }
}

// 加载导出历史（模拟数据）
const loadExportHistory = () => {
  loadingHistory.value = true
  setTimeout(() => {
    // 这里应该从后端获取真实的导出历史数据
    // 目前使用本地已有的数据
    loadingHistory.value = false
  }, 500)
}

// 初始化
onMounted(() => {
  loadLaboratories()
  loadUsers()
  loadExportHistory()
})
</script>

<style scoped>
.report-management-container {
  padding: 20px;
}

.report-card {
  margin-bottom: 20px;
  height: 100%;
}

.report-card .card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.history-card {
  margin-top: 20px;
}

.history-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-alert__content) {
  font-size: 13px;
}

:deep(.el-alert__content ul) {
  list-style: disc;
}

:deep(.el-alert__content li) {
  margin: 5px 0;
  color: #606266;
}
</style>
